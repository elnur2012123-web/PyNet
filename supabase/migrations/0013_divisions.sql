-- =====================================================================
-- 0013: PyNest divisions (instead of "Div. 1/2/3").
--   hatchling  beginners      rated for everyone below 1600
--   fledgling  intermediate   rated for everyone below 2100
--   soaring    open           rated for everyone
-- Stronger players may still take part "out of competition".
-- =====================================================================

alter table public.contests add column if not exists division text not null default 'soaring'
  check (division in ('hatchling','fledgling','soaring'));

-- Rename the first two rounds.
update public.contests set title = 'PyNest Hatchling Round #1', division = 'hatchling'
 where title in ('PyNest Round #1 (Div. 3)', 'PyNest Hatchling Round #1');
update public.contests set title = 'PyNest Hatchling Round #2', division = 'hatchling'
 where title in ('PyNest Round #2 (Div. 3)', 'PyNest Hatchling Round #2');

drop function if exists public.get_contests();
create or replace function public.get_contests()
returns table (id integer, title text, description text, starts_at timestamptz, duration_minutes integer,
               rated boolean, rating_applied boolean, division text, participants bigint, registered boolean, authors text[])
language sql stable security definer set search_path = public as $$
  select c.id, c.title, c.description, c.starts_at, c.duration_minutes, c.rated, c.rating_applied, c.division,
    (select count(*) from public.contest_registrations r where r.contest_id = c.id),
    exists (select 1 from public.contest_registrations r where r.contest_id = c.id and r.user_id = auth.uid()),
    array(select pr.username::text from public.profiles pr where pr.id = c.created_by)
  from public.contests c
  order by c.starts_at desc;
$$;
grant execute on function public.get_contests() to anon, authenticated;
