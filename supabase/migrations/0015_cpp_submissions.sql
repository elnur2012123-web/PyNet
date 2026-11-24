-- =====================================================================
-- 0015: C++ submissions. Each submission records its language.
-- =====================================================================
alter table public.submissions add column if not exists language text not null default 'python'
  check (language in ('python','cpp'));
grant select (language) on public.submissions to anon, authenticated;

drop function if exists public.get_status(text, integer, integer, integer);
create or replace function public.get_status(p_username text default null, p_problem integer default null,
                                             p_contest integer default null, p_limit integer default 100)
returns table (id bigint, created_at timestamptz, username text, rating integer, problem_id integer, problem_title text,
               contest_id integer, letter text, verdict text, failed_test integer, time_ms integer, language text)
language sql stable security definer set search_path = public as $$
  select s.id, s.created_at, p.username::text, p.rating, s.problem_id, pr.title, s.contest_id, cp.letter,
         s.verdict, s.failed_test, s.time_ms, s.language
  from public.submissions s
  join public.profiles p on p.id = s.user_id
  join public.problems pr on pr.id = s.problem_id
  left join public.contest_problems cp on cp.contest_id = s.contest_id and cp.problem_id = s.problem_id
  where public.problem_readable(pr.id, pr.visibility)
    and (p_username is null or p.username = p_username::citext)
    and (p_problem is null or s.problem_id = p_problem)
    and (p_contest is null or s.contest_id = p_contest)
    and (p.is_public or p.id = auth.uid() or public.is_staff(auth.uid()))
    and not public.is_banned(p.id)
  order by s.id desc
  limit least(greatest(p_limit, 1), 200);
$$;
grant execute on function public.get_status(text, integer, integer, integer) to anon, authenticated;

drop function if exists public.get_submission(bigint);
create or replace function public.get_submission(p_id bigint)
returns table (id bigint, user_id uuid, username text, rating integer, problem_id integer, problem_title text, contest_id integer,
               verdict text, failed_test integer, tests_total integer, time_ms integer, created_at timestamptz,
               code text, can_view_code boolean, language text)
language sql stable security definer set search_path = public as $$
  select s.id, s.user_id, p.username::text, p.rating, s.problem_id, pr.title, s.contest_id, s.verdict, s.failed_test,
    s.tests_total, s.time_ms, s.created_at,
    case when v.ok then s.code end, v.ok, s.language
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
