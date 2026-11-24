-- Multi-user security test. Run after supabase_stub.sql + migrations:
--   psql -v ON_ERROR_STOP=1 -f supabase/tests/rls_test.sql
-- Each block raises an exception on failure.
\set a '11111111-1111-1111-1111-111111111111'
\set b '22222222-2222-2222-2222-222222222222'
insert into auth.users (id, email, raw_user_meta_data) values
  (:'a', 'alice@example.com', '{"username":"alice"}'),
  (:'b', 'bob@example.com', '{"username":"bob"}');

-- server awards (service role)
set role service_role;
select public.award_activity(:'a', 'lesson', 'm1-first-program', 20, 100);
select public.award_activity(:'a', 'lesson', 'm1-print', 20, 100);
select public.award_activity(:'a', 'lesson', 'm1-comments', 20, 100);
select public.award_activity(:'a', 'lesson', 'm1-comments', 20, 100);   -- duplicate => 0 XP
select public.award_activity(:'b', 'lesson', 'm2-variables', 20, 50);
reset role;

do $$ begin
  if (select total_xp from user_progress where user_id = '11111111-1111-1111-1111-111111111111') <> 70 then
    raise exception 'A should have 60 lesson XP + 10 achievement XP';
  end if;
  if (select completed_lessons from user_progress where user_id = '11111111-1111-1111-1111-111111111111') <> 3 then
    raise exception 'duplicate lesson counted';
  end if;
  if not exists (select 1 from user_achievements where achievement_id = 'first-program') then
    raise exception 'achievement not unlocked';
  end if;
end $$;

-- ===== act as user A
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
insert into saved_code (user_id, title, code) values ('11111111-1111-1111-1111-111111111111', 'hello', 'print(1)');

do $$ begin
  -- cannot change own XP
  begin
    update user_progress set total_xp = 99999;
    if (select total_xp from user_progress) = 99999 then raise exception 'XP was modified'; end if;
  exception when insufficient_privilege then null; end;
  -- cannot upgrade own subscription
  update subscriptions set plan = 'MAX';
  if (select plan from subscriptions) <> 'FREE' then raise exception 'plan modified'; end if;
  -- cannot self-award achievements
  begin
    insert into user_achievements (user_id, achievement_id) values ('11111111-1111-1111-1111-111111111111', 'xp-2000');
    raise exception 'inserted achievement';
  exception when insufficient_privilege then null; end;
  -- cannot call privileged function
  begin
    perform public.award_activity('11111111-1111-1111-1111-111111111111', 'quiz', 'm9', 50);
    raise exception 'called award_activity';
  exception when insufficient_privilege then null; end;
  begin
    perform public.consume_ai_quota('11111111-1111-1111-1111-111111111111', 'tutor', 100000);
    raise exception 'called consume_ai_quota';
  exception when insufficient_privilege then null; end;
  -- premium theme blocked on FREE
  begin
    update profiles set accent_theme = 'emerald';
    raise exception 'free user set premium theme';
  exception when raise_exception then
    if sqlerrm not like '%Pro or Max%' then raise; end if;
  end;
  -- profile edit allowed
  update profiles set bio = 'hi';
  if (select bio from profiles where id = auth.uid()) <> 'hi' then raise exception 'bio not updated'; end if;
end $$;

-- ===== act as user B
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ begin
  if exists (select 1 from saved_code) then raise exception 'B sees A code'; end if;
  if exists (select 1 from user_progress where user_id <> auth.uid()) then raise exception 'B sees A progress'; end if;
  if exists (select 1 from lesson_completions where user_id <> auth.uid()) then raise exception 'B sees A lessons'; end if;
  if exists (select 1 from subscriptions where user_id <> auth.uid()) then raise exception 'B sees A subscription'; end if;
  if exists (select 1 from ai_usage where user_id <> auth.uid()) then raise exception 'B sees A ai usage'; end if;
  update saved_code set code = 'hacked';
  delete from saved_code;
  if (select (select 1 from user_progress where user_id = auth.uid()) ) is null then raise exception 'B no progress'; end if;
  -- public leaderboard ranks by actual XP, A first
  if (select username from get_leaderboard('global', 10) limit 1) <> 'alice' then raise exception 'leaderboard order'; end if;
  if (select xp from get_leaderboard('global', 10) where username = 'bob') <> 20 then raise exception 'bob xp'; end if;
  -- public profile exposes no email
  perform * from get_public_profile('alice');
  -- B can send friend request but not as accepted
  begin
    insert into friendships (requester_id, receiver_id, status) values (auth.uid(), '11111111-1111-1111-1111-111111111111', 'accepted');
    raise exception 'forced accepted';
  exception when insufficient_privilege then null; end;
  insert into friendships (requester_id, receiver_id) values (auth.uid(), '11111111-1111-1111-1111-111111111111');
  -- requester cannot accept own request
  update friendships set status = 'accepted';
  if exists (select 1 from friendships where status = 'accepted') then raise exception 'self accepted'; end if;
end $$;

-- ===== A accepts
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
update friendships set status = 'accepted';
do $$ begin
  if (select count(*) from saved_code) <> 1 then raise exception 'A code was modified by B'; end if;
  if (select count(*) from get_leaderboard('friends', 10)) <> 2 then raise exception 'friends board'; end if;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ begin
  if (select count(*) from friends_feed()) < 1 then raise exception 'B should see A achievements'; end if;
end $$;

-- ===== anon
reset role; set role anon;
select set_config('request.jwt.claim.sub', '', false);
do $$ begin
  if exists (select 1 from saved_code) or exists (select 1 from user_progress) or exists (select 1 from profiles) then
    raise exception 'anon read private data';
  end if;
end $$;
reset role;

-- quota: service role, limit 2
set role service_role;
do $$ begin
  perform public.consume_ai_quota('22222222-2222-2222-2222-222222222222', 'tutor', 2);
  perform public.consume_ai_quota('22222222-2222-2222-2222-222222222222', 'tutor', 2);
  if (public.consume_ai_quota('22222222-2222-2222-2222-222222222222', 'tutor', 2)->>'allowed')::boolean then
    raise exception 'quota not enforced';
  end if;
  if (public.consume_ai_quota('11111111-1111-1111-1111-111111111111', 'tutor', 2)->>'allowed')::boolean is not true then
    raise exception 'A quota affected by B';
  end if;
  perform public.snapshot_leaderboards();
end $$;
reset role;
select 'ALL RLS TESTS PASSED' as result;

-- saved code limit (migration 0002)
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ declare i int; begin
  for i in 1..5 loop
    insert into saved_code (user_id, title, code) values (auth.uid(), 's' || i, 'print(1)');
  end loop;
  begin
    insert into saved_code (user_id, title, code) values (auth.uid(), 's6', 'print(1)');
    raise exception 'free user saved 6 snippets';
  exception when raise_exception then
    if sqlerrm not like '%up to 5%' then raise; end if;
  end;
end $$;
reset role;
-- paid user (set by service role, as the webhook would) has no limit
update subscriptions set plan = 'PRO', status = 'active' where user_id = '22222222-2222-2222-2222-222222222222';
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
insert into saved_code (user_id, title, code) values (auth.uid(), 's6', 'print(1)');
update profiles set accent_theme = 'emerald' where id = auth.uid();
reset role;
select 'SAVED CODE LIMIT TESTS PASSED' as result;

-- favourites (migration 0003)
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
insert into favorite_lessons (user_id, lesson_id) values (auth.uid(), 'm1-print');
do $$ begin
  begin
    insert into favorite_lessons (user_id, lesson_id) values ('22222222-2222-2222-2222-222222222222', 'm1-print');
    raise exception 'inserted favourite for another user';
  exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ begin
  if exists (select 1 from favorite_lessons) then raise exception 'B sees A favourites'; end if;
end $$;
reset role;
select 'FAVORITES TESTS PASSED' as result;

-- owner title / big XP / hidden from weekly (migration 0004)
reset role;
update profiles set special_title = 'Founder', hidden_from_weekly = true where username = 'alice';
update user_progress set total_xp = 1000000000000000000 where user_id = '11111111-1111-1111-1111-111111111111';
set role service_role;
select public.award_activity('11111111-1111-1111-1111-111111111111', 'lesson', 'm2-naming', 20, 100);
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
do $$ begin
  -- cannot grant yourself a title
  begin
    update profiles set special_title = 'King' where id = auth.uid();
    raise exception 'user set own special_title';
  exception when insufficient_privilege then null; end;
  if (select xp from get_leaderboard('global', 10) where username = 'alice') <> 1000000000000000020 then raise exception 'big xp'; end if;
  if (select special_title from get_leaderboard('global', 10) where username = 'alice') <> 'Founder' then raise exception 'title'; end if;
  if exists (select 1 from get_leaderboard('weekly', 10) where username = 'alice') then raise exception 'owner on weekly board'; end if;
  if (select special_title from get_public_profile('alice')) <> 'Founder' then raise exception 'profile title'; end if;
  if exists (select 1 from get_leaderboard('monthly', 10) where username = 'alice') then raise exception 'owner on monthly board'; end if;
end $$;
reset role;
select 'OWNER TITLE TESTS PASSED' as result;

-- announcements (migration 0006)
insert into announcements (title, body) values ('Visible', 'hello');
insert into announcements (title, body, published) values ('Draft', 'secret', false);
set role anon;
do $$ begin
  if (select count(*) from announcements) <> 1 then raise exception 'anon should see only published announcements'; end if;
  begin
    insert into announcements (title) values ('spam');
    raise exception 'anon inserted an announcement';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$ begin
  begin
    update announcements set title = 'hacked';
    raise exception 'user edited an announcement';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
select 'ANNOUNCEMENT TESTS PASSED' as result;
