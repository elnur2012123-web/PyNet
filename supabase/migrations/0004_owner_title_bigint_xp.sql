-- =====================================================================
-- 0004 — Owner/special titles, big XP values, hide from weekly board
--   * profiles.special_title    e.g. 'Founder' — unique badge, shown instead of a league
--   * profiles.hidden_from_weekly  exclude a user from the weekly leaderboard
--   Both columns are NOT granted to browser roles, so only the dashboard /
--   service role can set them.
--   * XP columns widened to bigint (up to ~9.2 quintillion)
-- =====================================================================

alter table public.profiles
  add column if not exists special_title text check (char_length(special_title) <= 24),
  add column if not exists hidden_from_weekly boolean not null default false;

alter table public.user_progress alter column total_xp type bigint;
alter table public.leaderboard_snapshots alter column xp_earned type bigint;

drop function if exists public.level_for_xp(integer);
create or replace function public.level_for_xp(p_xp bigint)
returns integer language sql immutable as $$
  select least(2147483647, greatest(1, floor((1 + sqrt(1 + 8.0 * greatest(p_xp, 0) / 100.0)) / 2)))::int;
$$;

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
  )
  select rank() over (order by b.xp desc, b.username) as rank, b.id, b.username, b.display_name,
         b.avatar_url, b.country, b.xp, b.current_level, b.completed_lessons,
         b.completed_exercises, b.current_streak, b.plan, b.league, b.special_title
  from base b
  where (p_period <> 'friends' or b.id in (select uid from friends))
    and not (p_period = 'weekly' and b.hidden_from_weekly)
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
               achievements jsonb, special_title text)
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
    p.special_title
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
  where p.username = p_username::citext and (p.is_public or p.id = auth.uid());
$$;
grant execute on function public.get_public_profile(text) to anon, authenticated;

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
