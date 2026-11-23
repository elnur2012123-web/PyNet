-- =====================================================================
-- PyNest — initial schema
-- Run on a fresh Supabase project (SQL editor or `supabase db push`).
-- Privileged values (XP, achievements, subscriptions, AI usage,
-- leaderboard) are only ever written by SECURITY DEFINER functions that
-- are executable by the service_role, never by browser clients.
-- =====================================================================

create extension if not exists citext;

-- ---------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- level n needs 50 * n * (n - 1) XP  (L2 = 100, L3 = 300, L4 = 600 ...)
create or replace function public.level_for_xp(p_xp integer)
returns integer language sql immutable as $$
  select greatest(1, floor((1 + sqrt(1 + 8.0 * greatest(p_xp, 0) / 100.0)) / 2)::int);
$$;

create or replace function public.league_for_weekly_xp(p_xp integer)
returns text language sql immutable as $$
  select case
    when p_xp >= 1500 then 'Master'
    when p_xp >= 900  then 'Diamond'
    when p_xp >= 500  then 'Platinum'
    when p_xp >= 250  then 'Gold'
    when p_xp >= 100  then 'Silver'
    else 'Bronze' end;
$$;

-- ---------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique
    check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  display_name text check (char_length(display_name) <= 50),
  avatar_url text,
  bio text check (char_length(bio) <= 280),
  country text check (char_length(country) <= 56),
  experience_level text check (experience_level in ('beginner','some_python','other_language')),
  learning_goal text check (learning_goal in ('school','ai','games','web','competitive','personal')),
  daily_goal_minutes integer default 20 check (daily_goal_minutes between 5 and 240),
  is_public boolean not null default true,
  show_stats boolean not null default true,
  accent_theme text not null default 'default'
    check (accent_theme in ('default','emerald','amber','rose','violet','cyan')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 2. user_progress
-- ---------------------------------------------------------------------
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  completed_lessons integer not null default 0,
  completed_exercises integer not null default 0,
  completed_quizzes integer not null default 0,
  completed_projects integer not null default 0,
  total_xp integer not null default 0,
  current_level integer not null default 1,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  updated_at timestamptz not null default now()
);
create index user_progress_xp_idx on public.user_progress (total_xp desc);

-- ---------------------------------------------------------------------
-- 3. lesson_completions
-- ---------------------------------------------------------------------
create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completed_at timestamptz not null default now(),
  score integer check (score between 0 and 100),
  unique (user_id, lesson_id)
);

-- ---------------------------------------------------------------------
-- 4. exercise_submissions
-- ---------------------------------------------------------------------
create table public.exercise_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  submitted_code text not null check (char_length(submitted_code) <= 20000),
  passed boolean not null default false,
  score integer check (score between 0 and 100),
  submitted_at timestamptz not null default now()
);
create index exercise_submissions_user_idx on public.exercise_submissions (user_id, exercise_id);
-- only one *passed* record per exercise -> no XP farming
create unique index exercise_submissions_passed_once
  on public.exercise_submissions (user_id, exercise_id) where passed;

-- ---------------------------------------------------------------------
-- 5. quiz_results
-- ---------------------------------------------------------------------
create table public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_id text not null,
  score integer not null,
  total_questions integer not null,
  completed_at timestamptz not null default now()
);
create index quiz_results_user_idx on public.quiz_results (user_id, quiz_id);

-- ---------------------------------------------------------------------
-- 6. achievements / 7. user_achievements
-- ---------------------------------------------------------------------
create table public.achievements (
  id text primary key,
  name text not null,
  description text not null,
  icon text not null,
  xp_reward integer not null default 0,
  requirement_type text not null,
  requirement_value integer not null default 1,
  requirement_ref text
);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

-- ---------------------------------------------------------------------
-- 8. subscriptions
-- ---------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'FREE' check (plan in ('FREE','PRO','MAX')),
  status text not null default 'active',
  billing_interval text check (billing_interval in ('month','year')),
  payment_provider text,
  provider_customer_id text,
  provider_subscription_id text unique,
  provider_variant_id text,
  cancel_at_period_end boolean not null default false,
  portal_url text,
  update_payment_url text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create table public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_event_id text unique,
  description text not null,
  amount_formatted text,
  status text,
  invoice_url text,
  created_at timestamptz not null default now()
);
create index billing_events_user_idx on public.billing_events (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 9. ai_usage
-- ---------------------------------------------------------------------
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null default 'tutor',
  request_count integer not null default 0,
  tokens_used integer not null default 0,
  usage_date date not null default (now() at time zone 'utc')::date,
  unique (user_id, feature, usage_date)
);

-- ---------------------------------------------------------------------
-- 10. saved_code
-- ---------------------------------------------------------------------
create table public.saved_code (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 300),
  code text not null check (char_length(code) <= 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index saved_code_user_idx on public.saved_code (user_id, updated_at desc);
create trigger saved_code_touch before update on public.saved_code
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 11. daily_activity
-- ---------------------------------------------------------------------
create table public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default (now() at time zone 'utc')::date,
  xp_earned integer not null default 0,
  lessons_completed integer not null default 0,
  exercises_completed integer not null default 0,
  minutes_studied integer not null default 0,
  unique (user_id, activity_date)
);
create index daily_activity_date_idx on public.daily_activity (activity_date, user_id);

-- ---------------------------------------------------------------------
-- 12. friendships
-- ---------------------------------------------------------------------
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  check (requester_id <> receiver_id)
);
create unique index friendships_pair_idx on public.friendships
  (least(requester_id, receiver_id), greatest(requester_id, receiver_id));
create index friendships_receiver_idx on public.friendships (receiver_id, status);

-- ---------------------------------------------------------------------
-- 13. leaderboard_snapshots
-- ---------------------------------------------------------------------
create table public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('global','weekly','monthly')),
  period_start date not null,
  xp_earned integer not null,
  rank integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, period_type, period_start)
);
create index leaderboard_snapshots_user_idx on public.leaderboard_snapshots (user_id, rank);

-- ---------------------------------------------------------------------
-- XP ledger: one row per rewarded activity => idempotent rewards
-- ---------------------------------------------------------------------
create table public.xp_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  xp integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, source_type, source_id)
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.exercise_submissions enable row level security;
alter table public.quiz_results enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;
alter table public.ai_usage enable row level security;
alter table public.saved_code enable row level security;
alter table public.daily_activity enable row level security;
alter table public.friendships enable row level security;
alter table public.leaderboard_snapshots enable row level security;
alter table public.xp_ledger enable row level security;

-- profiles: owner reads/updates own row; public profiles readable by signed-in users
create policy "profiles: read own" on public.profiles for select
  using (auth.uid() = id);
create policy "profiles: read public" on public.profiles for select
  to authenticated using (is_public);
create policy "profiles: update own" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
-- (insert happens through the auth trigger; no direct insert policy)

-- Column-level protection: browser roles may only update these columns.
revoke update on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_url, bio, country, experience_level,
              learning_goal, daily_goal_minutes, is_public, show_stats,
              accent_theme, onboarded)
  on public.profiles to authenticated;

-- Premium customisation is enforced in the database, not just the UI.
create or replace function public.enforce_profile_plan()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text;
begin
  if new.accent_theme is distinct from old.accent_theme and new.accent_theme <> 'default' then
    select plan into v_plan from public.subscriptions
      where user_id = new.id and status in ('active','on_trial','cancelled','past_due');
    if coalesce(v_plan, 'FREE') = 'FREE' then
      raise exception 'Profile themes require a Pro or Max plan';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_plan_guard before update on public.profiles
  for each row execute function public.enforce_profile_plan();

-- read-only (for owner) tables; all writes go through service-role functions
create policy "progress: read own" on public.user_progress for select using (auth.uid() = user_id);
create policy "lessons: read own" on public.lesson_completions for select using (auth.uid() = user_id);
create policy "submissions: read own" on public.exercise_submissions for select using (auth.uid() = user_id);
create policy "quiz: read own" on public.quiz_results for select using (auth.uid() = user_id);
create policy "achievements: read all" on public.achievements for select using (true);
create policy "user_achievements: read own" on public.user_achievements for select using (auth.uid() = user_id);
create policy "subscriptions: read own" on public.subscriptions for select using (auth.uid() = user_id);
create policy "billing: read own" on public.billing_events for select using (auth.uid() = user_id);
create policy "ai_usage: read own" on public.ai_usage for select using (auth.uid() = user_id);
create policy "daily: read own" on public.daily_activity for select using (auth.uid() = user_id);
create policy "snapshots: read own" on public.leaderboard_snapshots for select using (auth.uid() = user_id);
create policy "ledger: read own" on public.xp_ledger for select using (auth.uid() = user_id);

-- saved_code: full CRUD on own rows only
create policy "code: read own" on public.saved_code for select using (auth.uid() = user_id);
create policy "code: insert own" on public.saved_code for insert with check (auth.uid() = user_id);
create policy "code: update own" on public.saved_code for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "code: delete own" on public.saved_code for delete using (auth.uid() = user_id);

-- friendships
create policy "friends: read mine" on public.friendships for select
  using (auth.uid() in (requester_id, receiver_id));
create policy "friends: send request" on public.friendships for insert
  with check (auth.uid() = requester_id and status = 'pending');
create policy "friends: accept" on public.friendships for update
  using (auth.uid() = receiver_id) with check (auth.uid() = receiver_id and status = 'accepted');
create policy "friends: remove" on public.friendships for delete
  using (auth.uid() in (requester_id, receiver_id));
revoke update on public.friendships from anon, authenticated;
grant update (status) on public.friendships to authenticated;

-- =====================================================================
-- NEW USER BOOTSTRAP
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text := nullif(new.raw_user_meta_data->>'username', '');
  v_base text;
  v_try int := 0;
begin
  if v_username is null or v_username !~ '^[A-Za-z0-9_]{3,20}$' then
    v_base := regexp_replace(coalesce(split_part(new.email, '@', 1), 'learner'), '[^A-Za-z0-9_]', '', 'g');
    v_base := left(coalesce(nullif(v_base, ''), 'learner'), 14);
    if char_length(v_base) < 3 then v_base := v_base || 'py'; end if;
    v_username := v_base;
    while exists (select 1 from public.profiles where username = v_username) and v_try < 20 loop
      v_username := v_base || floor(random() * 100000)::int;
      v_try := v_try + 1;
    end loop;
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, v_username,
          coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', v_username),
          new.raw_user_meta_data->>'avatar_url');
  insert into public.user_progress (user_id) values (new.id);
  insert into public.subscriptions (user_id, plan, status) values (new.id, 'FREE', 'active');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- PUBLIC READ FUNCTIONS (safe columns only)
-- =====================================================================
create or replace function public.username_available(p_username text)
returns boolean language sql stable security definer set search_path = public as $$
  select p_username ~ '^[A-Za-z0-9_]{3,20}$'
     and not exists (select 1 from public.profiles where username = p_username::citext);
$$;
grant execute on function public.username_available(text) to anon, authenticated;

create or replace function public.week_start() returns date language sql stable as $$
  select date_trunc('week', (now() at time zone 'utc'))::date;
$$;
create or replace function public.month_start() returns date language sql stable as $$
  select date_trunc('month', (now() at time zone 'utc'))::date;
$$;

-- Leaderboard. period: global | weekly | monthly | friends
create or replace function public.get_leaderboard(p_period text default 'global', p_limit int default 50)
returns table (
  rank bigint, user_id uuid, username text, display_name text, avatar_url text,
  country text, xp integer, level integer, lessons integer, exercises integer,
  streak integer, plan text, league text
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
      case p_period when 'weekly' then coalesce(w.xp,0) when 'monthly' then coalesce(m.xp,0) else up.total_xp end as xp,
      up.current_level, up.completed_lessons, up.completed_exercises, (case when up.last_activity_date >= (now() at time zone 'utc')::date - 1 then up.current_streak else 0 end) as current_streak,
      coalesce(s.plan,'FREE') as plan, public.league_for_weekly_xp(coalesce(w.xp,0)) as league
    from public.profiles p
    join public.user_progress up on up.user_id = p.id
    left join weekly w on w.user_id = p.id
    left join monthly m on m.user_id = p.id
    left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
    where ((p.is_public and p.show_stats) or p.id = auth.uid())
  )
  select rank() over (order by b.xp desc, b.username) as rank, b.id, b.username, b.display_name,
         b.avatar_url, b.country, b.xp, b.current_level, b.completed_lessons,
         b.completed_exercises, b.current_streak, b.plan, b.league
  from base b
  where (p_period <> 'friends' or b.id in (select uid from friends))
    and (p_period in ('global','friends') or b.xp > 0 or b.id = auth.uid())
  order by b.xp desc, b.username
  limit least(greatest(p_limit, 1), 200);
$$;
grant execute on function public.get_leaderboard(text, int) to anon, authenticated;

-- Rank + league stats for the signed-in user
create or replace function public.get_my_stats()
returns table (global_rank bigint, weekly_rank bigint, weekly_xp integer, monthly_xp integer,
               league text, best_rank integer)
language plpgsql stable security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_week int; v_month int;
begin
  if v_uid is null then return; end if;
  select coalesce(sum(xp_earned),0)::int into v_week from public.daily_activity
    where user_id = v_uid and activity_date >= public.week_start();
  select coalesce(sum(xp_earned),0)::int into v_month from public.daily_activity
    where user_id = v_uid and activity_date >= public.month_start();
  return query
  select
    (select count(*) + 1 from public.user_progress up
       where up.total_xp > (select total_xp from public.user_progress where user_id = v_uid)),
    (select count(*) + 1 from (
       select da.user_id, sum(da.xp_earned) as x from public.daily_activity da
       where da.activity_date >= public.week_start() group by da.user_id) t
     where t.x > v_week),
    v_week, v_month, public.league_for_weekly_xp(v_week),
    (select min(ls.rank) from public.leaderboard_snapshots ls
       where ls.user_id = v_uid and ls.period_type = 'global');
end $$;
grant execute on function public.get_my_stats() to authenticated;

-- Public profile by username (respects privacy settings, never exposes email)
create or replace function public.get_public_profile(p_username text)
returns table (id uuid, username text, display_name text, avatar_url text, bio text, country text,
               created_at timestamptz, show_stats boolean, total_xp integer, level integer,
               lessons integer, exercises integer, quizzes integer, projects integer,
               streak integer, longest_streak integer, plan text, league text, accent_theme text,
               achievements jsonb)
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
               order by ua.unlocked_at) from public.user_achievements ua where ua.user_id = p.id), '[]'::jsonb)
  from public.profiles p
  join public.user_progress up on up.user_id = p.id
  left join public.subscriptions s on s.user_id = p.id and s.status in ('active','on_trial','cancelled','past_due')
  where p.username = p_username::citext and (p.is_public or p.id = auth.uid());
$$;
grant execute on function public.get_public_profile(text) to anon, authenticated;

create or replace function public.search_users(p_query text)
returns table (id uuid, username text, display_name text, avatar_url text, level integer)
language sql stable security definer set search_path = public as $$
  select p.id, p.username::text, p.display_name, p.avatar_url, up.current_level
  from public.profiles p join public.user_progress up on up.user_id = p.id
  where p.is_public and p.id <> auth.uid()
    and char_length(p_query) >= 2
    and (p.username ilike '%' || replace(replace(p_query, '%', ''), '_', '\_') || '%'
         or p.display_name ilike '%' || replace(p_query, '%', '') || '%')
  order by up.total_xp desc limit 20;
$$;
grant execute on function public.search_users(text) to authenticated;

-- Friend list with public info only
create or replace function public.get_friends()
returns table (friendship_id uuid, user_id uuid, username text, display_name text, avatar_url text,
               level integer, status text, direction text)
language sql stable security definer set search_path = public as $$
  select f.id, p.id, p.username::text, p.display_name, p.avatar_url, up.current_level, f.status,
         case when f.requester_id = auth.uid() then 'outgoing' else 'incoming' end
  from public.friendships f
  join public.profiles p on p.id = case when f.requester_id = auth.uid() then f.receiver_id else f.requester_id end
  join public.user_progress up on up.user_id = p.id
  where auth.uid() in (f.requester_id, f.receiver_id);
$$;
grant execute on function public.get_friends() to authenticated;

-- Public achievement feed of accepted friends
create or replace function public.friends_feed()
returns table (username text, display_name text, avatar_url text, achievement_id text, unlocked_at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.username::text, p.display_name, p.avatar_url, ua.achievement_id, ua.unlocked_at
  from public.user_achievements ua
  join public.profiles p on p.id = ua.user_id
  where p.is_public and p.show_stats and ua.user_id in (
    select case when f.requester_id = auth.uid() then f.receiver_id else f.requester_id end
    from public.friendships f where f.status = 'accepted' and auth.uid() in (f.requester_id, f.receiver_id))
  order by ua.unlocked_at desc limit 30;
$$;
grant execute on function public.friends_feed() to authenticated;

-- =====================================================================
-- PRIVILEGED FUNCTIONS (service_role only)
-- =====================================================================

-- Award an activity exactly once. Returns xp awarded (0 when already done),
-- streak info and newly unlocked achievements.
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
  v_total_xp int;
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

-- Record a failed exercise attempt (no XP)
create or replace function public.record_failed_submission(p_user uuid, p_ref text, p_code text)
returns void language sql security definer set search_path = public as $$
  insert into public.exercise_submissions (user_id, exercise_id, submitted_code, passed, score)
  values (p_user, p_ref, left(p_code, 20000), false, 0);
$$;

-- Atomically consume one AI request if under the daily limit.
create or replace function public.consume_ai_quota(p_user uuid, p_feature text, p_limit int)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_today date := (now() at time zone 'utc')::date; v_used int;
begin
  select coalesce(sum(request_count),0) into v_used from public.ai_usage
    where user_id = p_user and usage_date = v_today;
  if v_used >= p_limit then
    return jsonb_build_object('allowed', false, 'used', v_used, 'limit', p_limit);
  end if;
  insert into public.ai_usage (user_id, feature, request_count, usage_date)
  values (p_user, p_feature, 1, v_today)
  on conflict (user_id, feature, usage_date) do update set request_count = ai_usage.request_count + 1;
  return jsonb_build_object('allowed', true, 'used', v_used + 1, 'limit', p_limit);
end $$;

create or replace function public.record_ai_tokens(p_user uuid, p_feature text, p_tokens int)
returns void language sql security definer set search_path = public as $$
  update public.ai_usage set tokens_used = tokens_used + greatest(p_tokens, 0)
  where user_id = p_user and feature = p_feature and usage_date = (now() at time zone 'utc')::date;
$$;

-- Leaderboard snapshots (run daily by /api/cron/snapshot)
create or replace function public.snapshot_leaderboards()
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.leaderboard_snapshots (user_id, period_type, period_start, xp_earned, rank)
  select up.user_id, 'global', (now() at time zone 'utc')::date, up.total_xp,
         rank() over (order by up.total_xp desc)
  from public.user_progress up where up.total_xp > 0
  on conflict (user_id, period_type, period_start) do update
    set xp_earned = excluded.xp_earned, rank = excluded.rank, created_at = now();

  insert into public.leaderboard_snapshots (user_id, period_type, period_start, xp_earned, rank)
  select t.user_id, 'weekly', public.week_start(), t.x, rank() over (order by t.x desc)
  from (select user_id, sum(xp_earned)::int x from public.daily_activity
        where activity_date >= public.week_start() group by user_id) t where t.x > 0
  on conflict (user_id, period_type, period_start) do update
    set xp_earned = excluded.xp_earned, rank = excluded.rank, created_at = now();

  insert into public.leaderboard_snapshots (user_id, period_type, period_start, xp_earned, rank)
  select t.user_id, 'monthly', public.month_start(), t.x, rank() over (order by t.x desc)
  from (select user_id, sum(xp_earned)::int x from public.daily_activity
        where activity_date >= public.month_start() group by user_id) t where t.x > 0
  on conflict (user_id, period_type, period_start) do update
    set xp_earned = excluded.xp_earned, rank = excluded.rank, created_at = now();
end $$;

-- Lock privileged functions down to the service role.
revoke all on function public.award_activity(uuid, text, text, integer, integer, text, integer) from public, anon, authenticated;
revoke all on function public.record_failed_submission(uuid, text, text) from public, anon, authenticated;
revoke all on function public.consume_ai_quota(uuid, text, int) from public, anon, authenticated;
revoke all on function public.record_ai_tokens(uuid, text, int) from public, anon, authenticated;
revoke all on function public.snapshot_leaderboards() from public, anon, authenticated;
grant execute on function public.award_activity(uuid, text, text, integer, integer, text, integer) to service_role;
grant execute on function public.record_failed_submission(uuid, text, text) to service_role;
grant execute on function public.consume_ai_quota(uuid, text, int) to service_role;
grant execute on function public.record_ai_tokens(uuid, text, int) to service_role;
grant execute on function public.snapshot_leaderboards() to service_role;

-- =====================================================================
-- SEED: achievements
-- =====================================================================
insert into public.achievements (id, name, description, icon, xp_reward, requirement_type, requirement_value, requirement_ref) values
  ('first-program',   'First Python Program', 'Complete the "Your first Python program" lesson.', 'terminal', 10, 'lesson', 1, 'm1-first-program'),
  ('lessons-10',      'Getting Serious',      'Complete 10 lessons.',                    'book-open', 15, 'lessons', 10, null),
  ('lessons-50',      'Bookworm',             'Complete 50 lessons.',                    'library',   40, 'lessons', 50, null),
  ('variable-master', 'Variable Master',      'Pass the Variables & Data Types quiz.',   'box',       15, 'quiz', 1, 'm2'),
  ('loop-explorer',   'Loop Explorer',        'Pass the Loops quiz.',                    'repeat',    15, 'quiz', 1, 'm7'),
  ('function-builder','Function Builder',     'Pass the Functions quiz.',                'braces',    20, 'quiz', 1, 'm9'),
  ('debugging-beginner','Debugging Beginner', 'Pass the Error Handling quiz.',           'bug',       20, 'quiz', 1, 'm10'),
  ('oop-architect',   'Object Architect',     'Pass the Object-Oriented Programming quiz.','shapes',  25, 'quiz', 1, 'm13'),
  ('python-intermediate','Python Intermediate','Pass the Intermediate Python quiz.',     'graduation-cap', 40, 'quiz', 1, 'm14'),
  ('exercises-5',     'Problem Solver',       'Solve 5 coding exercises.',               'code',      10, 'exercises', 5, null),
  ('exercises-20',    'Challenge Hunter',     'Solve 20 coding exercises.',              'target',    30, 'exercises', 20, null),
  ('quizzes-5',       'Quiz Whiz',            'Pass 5 module quizzes.',                  'list-checks', 20, 'quizzes', 5, null),
  ('first-project',   'Builder',              'Complete your first project.',            'hammer',    20, 'projects', 1, null),
  ('streak-3',        'On a Roll',            'Learn 3 days in a row.',                  'flame',     10, 'streak', 3, null),
  ('streak-7',        'Week Warrior',         'Learn 7 days in a row.',                  'flame',     25, 'streak', 7, null),
  ('streak-30',       'Unstoppable',          'Learn 30 days in a row.',                 'flame',     75, 'streak', 30, null),
  ('xp-500',          'Rising Star',          'Earn 500 XP.',                            'star',      0, 'xp', 500, null),
  ('xp-2000',         'Pythonista',           'Earn 2,000 XP.',                          'trophy',    0, 'xp', 2000, null)
on conflict (id) do update set name = excluded.name, description = excluded.description,
  icon = excluded.icon, xp_reward = excluded.xp_reward, requirement_type = excluded.requirement_type,
  requirement_value = excluded.requirement_value, requirement_ref = excluded.requirement_ref;

-- =====================================================================
-- STORAGE: avatars bucket (public read, owner write into own folder)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

create policy "avatars: public read" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "avatars: owner upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
