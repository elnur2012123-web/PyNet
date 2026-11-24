-- =====================================================================
-- 0008 — Achievement badges
--   achievements.tier: bronze < silver < gold < legendary
--   profiles.featured_badge: the badge a user chose to show (must be earned).
--   badge_for(user): their chosen badge, or their rarest earned badge.
-- =====================================================================
alter table public.achievements add column if not exists tier text not null default 'bronze'
  check (tier in ('bronze', 'silver', 'gold', 'legendary'));
update public.achievements set tier = 'silver' where id in ('variable-master', 'loop-explorer', 'quizzes-5', 'first-project', 'streak-7');
update public.achievements set tier = 'gold' where id in ('function-builder', 'debugging-beginner', 'oop-architect', 'lessons-50', 'exercises-20', 'xp-2000');
update public.achievements set tier = 'legendary' where id in ('python-intermediate', 'streak-30');

alter table public.profiles add column if not exists featured_badge text references public.achievements(id) on delete set null;
grant update (featured_badge) on public.profiles to authenticated;

create or replace function public.tier_rank(p_tier text) returns int language sql immutable as $$
  select case p_tier when 'legendary' then 4 when 'gold' then 3 when 'silver' then 2 else 1 end;
$$;

-- You can only show a badge you have earned.
create or replace function public.enforce_featured_badge()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.featured_badge is distinct from old.featured_badge and new.featured_badge is not null
     and not exists (select 1 from public.user_achievements where user_id = new.id and achievement_id = new.featured_badge) then
    raise exception 'You haven''t earned that badge yet.';
  end if;
  return new;
end $$;
drop trigger if exists profiles_badge_guard on public.profiles;
create trigger profiles_badge_guard before update on public.profiles
  for each row execute function public.enforce_featured_badge();

create or replace function public.badge_for(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select p.featured_badge from public.profiles p
       where p.id = p_user and exists (select 1 from public.user_achievements ua where ua.user_id = p_user and ua.achievement_id = p.featured_badge)),
    (select ua.achievement_id from public.user_achievements ua join public.achievements a on a.id = ua.achievement_id
       where ua.user_id = p_user order by public.tier_rank(a.tier) desc, a.xp_reward desc, ua.unlocked_at desc limit 1));
$$;
grant execute on function public.badge_for(uuid) to anon, authenticated;

drop function if exists public.get_leaderboard(text, int);
create or replace function public.get_leaderboard(p_period text default 'global', p_limit int default 50)
returns table (
  rank bigint, user_id uuid, username text, display_name text, avatar_url text,
  country text, xp bigint, level integer, lessons integer, exercises integer,
  streak integer, plan text, league text, special_title text, badge text
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
      p.special_title, p.hidden_from_weekly, public.badge_for(p.id) as badge
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
         b.completed_exercises, b.current_streak, b.plan, b.league, b.special_title, b.badge
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
               achievements jsonb, special_title text, role text, banned boolean, badge text)
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
    p.special_title, p.role, public.is_banned(p.id), public.badge_for(p.id)
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
  where p.username = p_username::citext and (p.is_public or p.id = auth.uid() or public.is_staff(auth.uid()));
$$;
grant execute on function public.get_public_profile(text) to anon, authenticated;
