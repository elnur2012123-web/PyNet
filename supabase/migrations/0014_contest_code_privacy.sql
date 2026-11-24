-- =====================================================================
-- 0014: While a round is running, only staff (Founder, Co-Founder, Admin)
-- can read other people's code for ANY of that round's problems —
-- including older practice solutions to a problem the round reuses.
-- Everyone can always read their own code.
-- =====================================================================
create or replace function public.get_submission(p_id bigint)
returns table (id bigint, user_id uuid, username text, rating integer, problem_id integer, problem_title text, contest_id integer,
               verdict text, failed_test integer, tests_total integer, time_ms integer, created_at timestamptz,
               code text, can_view_code boolean)
language sql stable security definer set search_path = public as $$
  select s.id, s.user_id, p.username::text, p.rating, s.problem_id, pr.title, s.contest_id, s.verdict, s.failed_test,
    s.tests_total, s.time_ms, s.created_at,
    case when v.ok then s.code end, v.ok
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  join public.problems pr on pr.id = s.problem_id
  cross join lateral (select (
      -- your own code
      s.user_id = auth.uid()
      -- staff: Founder, Co-Founder, Admin (and not banned)
      or (public.is_staff(auth.uid()) and not public.is_banned(auth.uid()))
      -- everyone else: only after solving the problem yourself, and never while
      -- a round that contains this problem is running
      or (exists (select 1 from public.submissions m where m.user_id = auth.uid() and m.problem_id = s.problem_id and m.verdict = 'OK')
          and not exists (select 1 from public.contest_problems cp join public.contests c on c.id = cp.contest_id
                          where cp.problem_id = s.problem_id
                            and c.starts_at <= now()
                            and c.starts_at + make_interval(mins => c.duration_minutes) > now())
          and not exists (select 1 from public.contests c where c.id = s.contest_id
                          and c.starts_at + make_interval(mins => c.duration_minutes) > now()))
    ) as ok) v
  where s.id = p_id and public.problem_readable(pr.id, pr.visibility);
$$;
grant execute on function public.get_submission(bigint) to anon, authenticated;
