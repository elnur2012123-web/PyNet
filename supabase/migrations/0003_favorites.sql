-- Favourite (bookmarked) lessons — private to each learner.
create table public.favorite_lessons (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
alter table public.favorite_lessons enable row level security;
create policy "favorites: read own" on public.favorite_lessons for select using (auth.uid() = user_id);
create policy "favorites: add own" on public.favorite_lessons for insert with check (auth.uid() = user_id);
create policy "favorites: remove own" on public.favorite_lessons for delete using (auth.uid() = user_id);
