-- =====================================================================
-- 0018: Cache for machine-translated learning content (lessons, questions,
-- problems written later by staff…). Each English text is translated once per
-- language and reused. Only the server (service role) reads and writes it.
-- =====================================================================
create table if not exists public.content_translations (
  hash text not null,                 -- sha256 of the English text
  locale text not null check (locale in ('uz', 'ru')),
  source text not null,
  translation text not null,
  provider text not null,
  created_at timestamptz not null default now(),
  primary key (hash, locale)
);
alter table public.content_translations enable row level security;
revoke all on public.content_translations from anon, authenticated;
