-- =====================================================================
-- 0007 — Staff roles, bans and a moderation log
--   profiles.role: 'user' | 'admin' | 'co_founder' | 'founder'
--   Rank: founder (3) > co_founder (2) > admin (1) > user (0)
--   * Staff can ban users of LOWER rank only; the founder can never be banned.
--   * Only the founder can change roles (or the dashboard / SQL).
--   * All moderation goes through SECURITY DEFINER functions executed by the
--     server (service_role) after it has verified the signed-in user.
-- =====================================================================

alter table public.profiles
  add column if not exists role text not null default 'user'
  check (role in ('user', 'admin', 'co_founder', 'founder'));
-- role is NOT in the column grants for browser roles, so users can't change it.

create table if not exists public.bans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  banned_by uuid references auth.users(id) on delete set null,
  reason text not null default '' check (char_length(reason) <= 300),
  created_at timestamptz not null default now(),
  expires_at timestamptz,               -- null = permanent
  lifted_at timestamptz,
  lifted_by uuid references auth.users(id) on delete set null
);
create index if not exists bans_user_idx on public.bans (user_id, created_at desc);

create table if not exists public.moderation_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_id uuid references auth.users(id) on delete set null,
  details text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists moderation_log_created_idx on public.moderation_log (created_at desc);

alter table public.bans enable row level security;
alter table public.moderation_log enable row level security;
-- No browser policies: everything is read and written through the functions below.
revoke all on public.bans from anon, authenticated;
revoke all on public.moderation_log from anon, authenticated;

create or replace function public.role_rank(p_role text) returns int language sql immutable as $$
  select case p_role when 'founder' then 3 when 'co_founder' then 2 when 'admin' then 1 else 0 end;
$$;

create or replace function public.is_banned(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bans b where b.user_id = p_user and b.lifted_at is null
                 and (b.expires_at is null or b.expires_at > now()));
$$;

create or replace function public.is_staff(p_user uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role <> 'user' from public.profiles where id = p_user), false);
$$;

-- What the signed-in user needs to know about themselves.
create or replace function public.my_moderation()
returns table (role text, banned boolean, reason text, expires_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.role, b.id is not null, b.reason, b.expires_at
  from public.profiles p
  left join lateral (select * from public.bans x where x.user_id = p.id and x.lifted_at is null
                     and (x.expires_at is null or x.expires_at > now()) order by x.created_at desc limit 1) b on true
  where p.id = auth.uid();
$$;
grant execute on function public.my_moderation() to authenticated;
grant execute on function public.is_banned(uuid) to anon, authenticated;
grant execute on function public.is_staff(uuid) to anon, authenticated;

-- ---------------------------------------------------------------- privileged actions (service_role)
create or replace function public.mod_ban(p_actor uuid, p_username text, p_reason text, p_until timestamptz)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor text; v_target uuid; v_target_role text;
begin
  select role into v_actor from public.profiles where id = p_actor;
  if public.role_rank(coalesce(v_actor, 'user')) < 1 then raise exception 'You are not allowed to ban users.'; end if;
  if public.is_banned(p_actor) then raise exception 'Your account is banned.'; end if;
  select id, role into v_target, v_target_role from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  if v_target = p_actor then raise exception 'You can''t ban yourself.'; end if;
  if v_target_role = 'founder' then raise exception 'The founder can''t be banned.'; end if;
  if public.role_rank(v_target_role) >= public.role_rank(v_actor) then
    raise exception 'You can only ban users with a lower rank than yours.';
  end if;
  if p_until is not null and p_until <= now() then raise exception 'The ban end time must be in the future.'; end if;
  -- replace any active ban
  update public.bans set lifted_at = now(), lifted_by = p_actor
    where user_id = v_target and lifted_at is null and (expires_at is null or expires_at > now());
  insert into public.bans (user_id, banned_by, reason, expires_at) values (v_target, p_actor, coalesce(p_reason, ''), p_until);
  insert into public.moderation_log (actor_id, action, target_id, details)
    values (p_actor, 'ban', v_target, coalesce(p_reason, '') || case when p_until is null then ' (permanent)' else ' (until ' || to_char(p_until at time zone 'utc', 'YYYY-MM-DD HH24:MI') || ' UTC)' end);
  return 'ok';
end $$;

create or replace function public.mod_unban(p_actor uuid, p_username text)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor text; v_target uuid; v_n int;
begin
  select role into v_actor from public.profiles where id = p_actor;
  if public.role_rank(coalesce(v_actor, 'user')) < 1 then raise exception 'You are not allowed to unban users.'; end if;
  select id into v_target from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  update public.bans set lifted_at = now(), lifted_by = p_actor
    where user_id = v_target and lifted_at is null and (expires_at is null or expires_at > now());
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception '@% is not banned.', p_username; end if;
  insert into public.moderation_log (actor_id, action, target_id, details) values (p_actor, 'unban', v_target, '');
  return 'ok';
end $$;

create or replace function public.mod_set_role(p_actor uuid, p_username text, p_role text)
returns text language plpgsql security definer set search_path = public as $$
declare v_actor text; v_target uuid; v_old text;
begin
  select role into v_actor from public.profiles where id = p_actor;
  if v_actor <> 'founder' then raise exception 'Only the founder can change roles.'; end if;
  if p_role not in ('user', 'admin', 'co_founder') then raise exception 'Role must be user, admin or co_founder.'; end if;
  select id, role into v_target, v_old from public.profiles where username = p_username::citext;
  if v_target is null then raise exception 'No user called @%.', p_username; end if;
  if v_old = 'founder' then raise exception 'The founder''s role can''t be changed here.'; end if;
  update public.profiles set role = p_role,
    special_title = case
      when p_role = 'admin' then 'Admin'
      when p_role = 'co_founder' then 'Co-Founder'
      when special_title in ('Admin', 'Co-Founder') then null
      else special_title end
  where id = v_target;
  insert into public.moderation_log (actor_id, action, target_id, details) values (p_actor, 'role', v_target, coalesce(v_old, 'user') || ' -> ' || p_role);
  return 'ok';
end $$;

create or replace function public.mod_list_bans()
returns table (username text, reason text, created_at timestamptz, expires_at timestamptz, banned_by text)
language sql stable security definer set search_path = public as $$
  select p.username::text, b.reason, b.created_at, b.expires_at, a.username::text
  from public.bans b join public.profiles p on p.id = b.user_id left join public.profiles a on a.id = b.banned_by
  where b.lifted_at is null and (b.expires_at is null or b.expires_at > now())
  order by b.created_at desc limit 100;
$$;

create or replace function public.mod_log(p_limit int default 30)
returns table (created_at timestamptz, actor text, action text, target text, details text)
language sql stable security definer set search_path = public as $$
  select l.created_at, a.username::text, l.action, t.username::text, l.details
  from public.moderation_log l left join public.profiles a on a.id = l.actor_id left join public.profiles t on t.id = l.target_id
  order by l.created_at desc limit least(greatest(p_limit, 1), 200);
$$;

create or replace function public.mod_staff()
returns table (username text, role text)
language sql stable security definer set search_path = public as $$
  select username::text, role from public.profiles where role <> 'user' order by public.role_rank(role) desc, username;
$$;

revoke all on function public.mod_ban(uuid, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.mod_unban(uuid, text) from public, anon, authenticated;
revoke all on function public.mod_set_role(uuid, text, text) from public, anon, authenticated;
revoke all on function public.mod_list_bans() from public, anon, authenticated;
revoke all on function public.mod_log(int) from public, anon, authenticated;
revoke all on function public.mod_staff() from public, anon, authenticated;
grant execute on function public.mod_ban(uuid, text, text, timestamptz) to service_role;
grant execute on function public.mod_unban(uuid, text) to service_role;
grant execute on function public.mod_set_role(uuid, text, text) to service_role;
grant execute on function public.mod_list_bans() to service_role;
grant execute on function public.mod_log(int) to service_role;
grant execute on function public.mod_staff() to service_role;

-- ---------------------------------------------------------------- banned users can't write
drop policy if exists "code: insert own" on public.saved_code;
create policy "code: insert own" on public.saved_code for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));
drop policy if exists "code: update own" on public.saved_code;
create policy "code: update own" on public.saved_code for update using (auth.uid() = user_id) with check (auth.uid() = user_id and not public.is_banned(auth.uid()));
drop policy if exists "friends: send request" on public.friendships;
create policy "friends: send request" on public.friendships for insert with check (auth.uid() = requester_id and status = 'pending' and not public.is_banned(auth.uid()));
drop policy if exists "favorites: add own" on public.favorite_lessons;
create policy "favorites: add own" on public.favorite_lessons for insert with check (auth.uid() = user_id and not public.is_banned(auth.uid()));
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and not public.is_banned(auth.uid()));

-- ---------------------------------------------------------------- hide banned users, block rewards
drop function if exists public.get_leaderboard(text, int);
create or replace function public.get_leaderboard(p_period text default 'global', p_limit int default 50)
returns table (
  rank bigint, user_id uuid, username text, display_name text, avatar_url text,
  country text, xp bigint, level integer, lessons integer, exercises integer,
  streak integer, plan text, league text, special_title text
) language sql stable security definer set search_path = public as $$
  with weekly as (
    select da.user_id, sum(da.xp_earned)::int as xp from public.daily_activity da
    where da.activity_date >= public.week_start() group by da.user_id
  ), monthly as (
    select da.user_id, sum(da.xp_earned)::int as xp from public.daily_activity da
    where da.activity_date >= public.month_start() group by da.user_id
  ), friends as (
    select case when f.requester_id = auth.uid() then f.receiver_id else f.requester_id end as uid
    from public.friendships f
    where f.status = 'accepted' and auth.uid() in (f.requester_id, f.receiver_id)
    union select auth.uid()
  ), base as (
    select p.id, p.username::text, p.display_name, p.avatar_url, p.country,
      (case p_period when 'weekly' then coalesce(w.xp,0) when 'monthly' then coalesce(m.xp,0) else up.total_xp end)::bigint as xp,
      up.current_level, up.completed_lessons, up.completed_exercises, (case when up.last_activity_date >= (now() at time zone 'utc')::date - 1 then up.current_streak else 0 end) as current_streak,
      coalesce(s.plan,'FREE') as plan, public.league_for_weekly_xp(coalesce(w.xp,0)) as league,
      p.special_title, p.hidden_from_weekly
    from public.profiles p
    join public.user_progress up on up.user_id = p.id
    left join weekly w on w.user_id = p.id
    left join monthly m on m.user_id = p.id
    left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
    where ((p.is_public and p.show_stats) or p.id = auth.uid())
      and not public.is_banned(p.id)
  )
  select rank() over (order by b.xp desc, b.username) as rank, b.id, b.username, b.display_name,
         b.avatar_url, b.country, b.xp, b.current_level, b.completed_lessons,
         b.completed_exercises, b.current_streak, b.plan, b.league, b.special_title
  from base b
  where (p_period <> 'friends' or b.id in (select uid from friends))
    and not (p_period in ('weekly', 'monthly') and b.hidden_from_weekly)
    and (p_period in ('global','friends') or b.xp > 0 or b.id = auth.uid())
  order by b.xp desc, b.username
  limit least(greatest(p_limit, 1), 200);
$$;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;

drop function if exists public.get_public_profile(text);
create or replace function public.get_public_profile(p_username text)
returns table (id uuid, username text, display_name text, avatar_url text, bio text, country text,
               created_at timestamptz, show_stats boolean, total_xp bigint, level integer,
               lessons integer, exercises integer, quizzes integer, projects integer,
               streak integer, longest_streak integer, plan text, league text, accent_theme text,
               achievements jsonb, special_title text, role text, banned boolean)
language sql stable security definer set search_path = public as $$
  select p.id, p.username::text, p.display_name, p.avatar_url, p.bio, p.country, p.created_at, p.show_stats,
    case when p.show_stats or p.id = auth.uid() then up.total_xp end,
    up.current_level,
    case when p.show_stats or p.id = auth.uid() then up.completed_lessons end,
    case when p.show_stats or p.id = auth.uid() then up.completed_exercises end,
    case when p.show_stats or p.id = auth.uid() then up.completed_quizzes end,
    case when p.show_stats or p.id = auth.uid() then up.completed_projects end,
    case when p.show_stats or p.id = auth.uid() then (case when up.last_activity_date >= (now() at time zone 'utc')::date - 1 then up.current_streak else 0 end) end,
    case when p.show_stats or p.id = auth.uid() then up.longest_streak end,
    coalesce(s.plan, 'FREE'),
    public.league_for_weekly_xp(coalesce((select sum(xp_earned)::int from public.daily_activity d
      where d.user_id = p.id and d.activity_date >= public.week_start()), 0)),
    p.accent_theme,
    coalesce((select jsonb_agg(jsonb_build_object('id', ua.achievement_id, 'unlocked_at', ua.unlocked_at)
               order by ua.unlocked_at) from public.user_achievements ua where ua.user_id = p.id), '[]'::jsonb),
    p.special_title, p.role, public.is_banned(p.id)
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
  where p.username = p_username::citext and (p.is_public or p.id = auth.uid() or public.is_staff(auth.uid()));
$$;
grant execute on function public.get_public_profile(text) to anon, authenticated;

create or replace function public.search_users(p_query text)
returns table (id uuid, username text, display_name text, avatar_url text, level integer)
language sql stable security definer set search_path = public as $$
  select p.id, p.username::text, p.display_name, p.avatar_url, up.current_level
  from public.profiles p join public.user_progress up on up.user_id = p.id
  where p.is_public and p.id <> auth.uid() and not public.is_banned(p.id)
    and char_length(p_query) >= 2
    and (p.username ilike '%' || replace(replace(p_query, '%', ''), '_', '\_') || '%'
         or p.display_name ilike '%' || replace(p_query, '%', '') || '%')
  order by up.total_xp desc limit 20;
$$;
grant execute on function public.search_users(text) to authenticated;

create or replace function public.friends_feed()
returns table (username text, display_name text, avatar_url text, achievement_id text, unlocked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.username::text, p.display_name, p.avatar_url, ua.achievement_id, ua.unlocked_at
  from public.user_achievements ua
  join public.profiles p on p.id = ua.user_id
  where p.is_public and p.show_stats and not public.is_banned(p.id) and ua.user_id in (
    select case when f.requester_id = auth.uid() then f.receiver_id else f.requester_id end
    from public.friendships f where f.status = 'accepted' and auth.uid() in (f.requester_id, f.receiver_id))
  order by ua.unlocked_at desc limit 30;
$$;
grant execute on function public.friends_feed() to authenticated;

create or replace function public.award_activity(
  p_user uuid, p_kind text, p_ref text, p_xp integer, p_score integer default null,
  p_code text default null, p_total integer default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_inserted int := 0;
  v_prog public.user_progress;
  v_bonus int := 0;
  v_streak int;
  v_new_achievements jsonb := '[]'::jsonb;
  v_ach record;
  v_met boolean;
  v_total_xp bigint;
begin
  if public.is_banned(p_user) then raise exception 'account is banned'; end if;
  if p_kind not in ('lesson','project','exercise','quiz') then
    raise exception 'invalid activity kind';
  end if;
  if p_xp < 0 or p_xp > 200 then raise exception 'invalid xp'; end if;

  -- record the attempt
  if p_kind = 'quiz' then
    insert into public.quiz_results (user_id, quiz_id, score, total_questions)
    values (p_user, p_ref, coalesce(p_score,0), coalesce(p_total,0));
  elsif p_kind = 'exercise' then
    insert into public.exercise_submissions (user_id, exercise_id, submitted_code, passed, score)
    values (p_user, p_ref, coalesce(p_code,''), true, 100)
    on conflict (user_id, exercise_id) where passed do nothing;
  else
    insert into public.lesson_completions (user_id, lesson_id, score)
    values (p_user, p_ref, p_score) on conflict (user_id, lesson_id) do nothing;
  end if;

  -- idempotent reward
  insert into public.xp_ledger (user_id, source_type, source_id, xp)
  values (p_user, p_kind, p_ref, p_xp) on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return jsonb_build_object('xp', 0, 'already', true, 'achievements', '[]'::jsonb);
  end if;

  select * into v_prog from public.user_progress where user_id = p_user for update;

  -- streak
  if v_prog.last_activity_date = v_today then
    v_streak := v_prog.current_streak;
  elsif v_prog.last_activity_date = v_today - 1 then
    v_streak := v_prog.current_streak + 1;
    v_bonus := 5 + least(v_streak, 10);
  else
    v_streak := 1;
  end if;

  if v_bonus > 0 then
    insert into public.xp_ledger (user_id, source_type, source_id, xp)
    values (p_user, 'streak', v_today::text, v_bonus) on conflict do nothing;
    if not found then v_bonus := 0; end if;
  end if;

  update public.user_progress set
    completed_lessons = completed_lessons + (case when p_kind in ('lesson','project') then 1 else 0 end),
    completed_projects = completed_projects + (case when p_kind = 'project' then 1 else 0 end),
    completed_exercises = completed_exercises + (case when p_kind = 'exercise' then 1 else 0 end),
    completed_quizzes = completed_quizzes + (case when p_kind = 'quiz' then 1 else 0 end),
    total_xp = total_xp + p_xp + v_bonus,
    current_streak = v_streak,
    longest_streak = greatest(longest_streak, v_streak),
    last_activity_date = v_today,
    updated_at = now()
  where user_id = p_user;

  insert into public.daily_activity (user_id, activity_date, xp_earned, lessons_completed, exercises_completed, minutes_studied)
  values (p_user, v_today, p_xp + v_bonus,
          case when p_kind in ('lesson','project') then 1 else 0 end,
          case when p_kind = 'exercise' then 1 else 0 end,
          case p_kind when 'lesson' then 8 when 'project' then 25 when 'exercise' then 5 else 6 end)
  on conflict (user_id, activity_date) do update set
    xp_earned = daily_activity.xp_earned + excluded.xp_earned,
    lessons_completed = daily_activity.lessons_completed + excluded.lessons_completed,
    exercises_completed = daily_activity.exercises_completed + excluded.exercises_completed,
    minutes_studied = daily_activity.minutes_studied + excluded.minutes_studied;

  select * into v_prog from public.user_progress where user_id = p_user;

  -- achievements
  for v_ach in select a.* from public.achievements a
    where not exists (select 1 from public.user_achievements ua where ua.user_id = p_user and ua.achievement_id = a.id)
  loop
    v_met := case v_ach.requirement_type
      when 'lessons' then v_prog.completed_lessons >= v_ach.requirement_value
      when 'exercises' then v_prog.completed_exercises >= v_ach.requirement_value
      when 'quizzes' then v_prog.completed_quizzes >= v_ach.requirement_value
      when 'projects' then v_prog.completed_projects >= v_ach.requirement_value
      when 'xp' then v_prog.total_xp >= v_ach.requirement_value
      when 'streak' then v_prog.current_streak >= v_ach.requirement_value
      when 'lesson' then exists (select 1 from public.lesson_completions where user_id = p_user and lesson_id = v_ach.requirement_ref)
      when 'quiz' then exists (select 1 from public.xp_ledger where user_id = p_user and source_type = 'quiz' and source_id = v_ach.requirement_ref)
      else false end;
    if v_met then
      insert into public.user_achievements (user_id, achievement_id) values (p_user, v_ach.id)
        on conflict do nothing;
      if found then
        v_new_achievements := v_new_achievements || to_jsonb(v_ach.id);
        if v_ach.xp_reward > 0 then
          insert into public.xp_ledger (user_id, source_type, source_id, xp)
          values (p_user, 'achievement', v_ach.id, v_ach.xp_reward) on conflict do nothing;
          update public.user_progress set total_xp = total_xp + v_ach.xp_reward where user_id = p_user;
          update public.daily_activity set xp_earned = xp_earned + v_ach.xp_reward
            where user_id = p_user and activity_date = v_today;
        end if;
      end if;
    end if;
  end loop;

  select total_xp into v_total_xp from public.user_progress where user_id = p_user;
  update public.user_progress set current_level = public.level_for_xp(v_total_xp) where user_id = p_user;

  return jsonb_build_object('xp', p_xp, 'streak_bonus', v_bonus, 'streak', v_streak,
                            'already', false, 'achievements', v_new_achievements,
                            'total_xp', v_total_xp);
end $$;
revoke all on function public.award_activity(uuid, text, text, integer, integer, text, integer) from public, anon, authenticated;
grant execute on function public.award_activity(uuid, text, text, integer, integer, text, integer) to service_role;

create or replace function public.consume_ai_quota(p_user uuid, p_feature text, p_limit int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_today date := (now() at time zone 'utc')::date; v_used int;
begin
  if public.is_banned(p_user) then
    return jsonb_build_object('allowed', false, 'used', 0, 'limit', p_limit, 'banned', true);
  end if;
  select coalesce(sum(request_count),0) into v_used from public.ai_usage
    where user_id = p_user and usage_date = v_today;
  if v_used >= p_limit then
    return jsonb_build_object('allowed', false, 'used', v_used, 'limit', p_limit);
  end if;
  insert into public.ai_usage (user_id, feature, request_count, usage_date)
  values (p_user, p_feature, 1, v_today)
  on conflict (user_id, feature, usage_date) do update set request_count = ai_usage.request_count + 1;
  return jsonb_build_object('allowed', true, 'used', v_used + 1, 'limit', p_limit);
end $$;
revoke all on function public.consume_ai_quota(uuid, text, int) from public, anon, authenticated;
grant execute on function public.consume_ai_quota(uuid, text, int) to service_role;
