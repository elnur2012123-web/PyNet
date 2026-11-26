-- Problems in several languages + an "Edit problems" permission.
--  * problems.lang: the language the problem was written in (en, uz, uz-Cyrl, ru).
--  * problem_translations: the same problem written by its author in other languages.
--    Readers get their own language when it exists; otherwise English problems are
--    translated automatically, and others are shown in the language they were written in.
--  * edit_problems: change any problem's text, translations, limits and tests.

alter table public.problems add column if not exists lang text not null default 'en';
do $$ begin
  alter table public.problems add constraint problems_lang_check check (lang in ('en', 'uz', 'uz-Cyrl', 'ru'));
exception when duplicate_object then null; end $$;
alter table public.problems add column if not exists updated_at timestamptz;
alter table public.problems add column if not exists updated_by uuid references auth.users(id) on delete set null;

create table if not exists public.problem_translations (
  problem_id  integer not null references public.problems(id) on delete cascade,
  locale      text not null check (locale in ('en', 'uz', 'uz-Cyrl', 'ru')),
  title       text not null check (char_length(title) between 1 and 80),
  statement   text not null default '' check (char_length(statement) <= 8000),
  input_spec  text not null default '' check (char_length(input_spec) <= 3000),
  output_spec text not null default '' check (char_length(output_spec) <= 3000),
  notes       text not null default '' check (char_length(notes) <= 3000),
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (problem_id, locale)
);
alter table public.problem_translations enable row level security;
-- Readable exactly when the problem itself is readable (hidden round problems stay hidden).
revoke all on public.problem_translations from anon, authenticated;
grant select on public.problem_translations to anon, authenticated;
drop policy if exists problem_translations_read on public.problem_translations;
create policy problem_translations_read on public.problem_translations for select to anon, authenticated
  using (exists (select 1 from public.problems p where p.id = problem_id and public.problem_readable(p.id, p.visibility)));
-- Writes only through the server (service role) after a permission check.

-- ---------------------------------------------------------------- permission
create or replace function public.all_permissions() returns text[] language sql immutable as $$
  select array['ban_users','view_logs','view_code','host_contests','create_problems','edit_problems','review_cheating','manage_roles','read_suggestions'];
$$;
-- Co-Founder, Admin and any role called "Coordinator" can edit problems; Founder has everything.
update public.roles set permissions = permissions || array['edit_problems']
 where (id in ('co_founder', 'admin') or name ilike 'coordinator%') and not ('edit_problems' = any(permissions));
update public.roles set permissions = public.all_permissions() where id = 'founder';

-- Editors need to see hidden problems too.
create or replace function public.problem_readable(p_problem integer, p_visibility text) returns boolean
language sql stable security definer set search_path = public as $$
  select p_visibility = 'public'
      or public.has_perm(auth.uid(), 'create_problems') or public.has_perm(auth.uid(), 'edit_problems')
      or public.has_perm(auth.uid(), 'host_contests')
      or exists (select 1 from public.contest_problems cp join public.contests c on c.id = cp.contest_id
                 where cp.problem_id = p_problem and c.starts_at <= now());
$$;
