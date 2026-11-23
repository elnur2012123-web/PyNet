-- 0005 — hidden_from_weekly now hides the user from BOTH the weekly and monthly boards.
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
    and not (p_period in ('weekly', 'monthly') and b.hidden_from_weekly)
    and (p_period in ('global','friends') or b.xp > 0 or b.id = auth.uid())
  order by b.xp desc, b.username
  limit least(greatest(p_limit, 1), 200);
$$;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;
