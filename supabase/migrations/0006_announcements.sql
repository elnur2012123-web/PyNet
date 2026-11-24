-- 0006 — "What's new" announcements shown to every visitor.
-- Add rows from the Supabase Table Editor (or SQL). Only published rows are visible.
-- Browsers can read but never write (no insert/update/delete policies).
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  body text not null default '' check (char_length(body) <= 2000),
  link text check (link is null or link ~ '^(/|https://)'),
  kind text not null default 'update' check (kind in ('update', 'feature', 'fix', 'event')),
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists announcements_created_idx on public.announcements (created_at desc);
alter table public.announcements enable row level security;
drop policy if exists "announcements: public read" on public.announcements;
create policy "announcements: public read" on public.announcements for select using (published);
revoke insert, update, delete on public.announcements from anon, authenticated;
grant select on public.announcements to anon, authenticated;
