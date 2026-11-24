# Supabase setup

This sets up PyNest's database, auth and storage on a new Supabase project. It takes about 10 minutes.

## 1. Create the project

1. Go to https://supabase.com/dashboard and choose **New project**.
2. Pick a region close to your learners (e.g. Frankfurt for Central Asia and Europe).
3. Once it's ready, open **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (**server only, never commit or expose it**)

## 2. Run the migrations

Run them in order. Either paste each file into **SQL Editor → New query**, or use the CLI:

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

| File | Creates |
|---|---|
| `0001_init.sql` | All tables and indexes, RLS policies, the new-user trigger (profile + progress + FREE subscription), leaderboard/profile/friends functions, privileged XP/quota/snapshot functions, achievement seed data and the `avatars` storage bucket with policies |
| `0002_saved_code_limit.sql` | Free-plan limit of 5 snippets, plus the premium theme guard (enforced by triggers) |
| `0003_favorites.sql` | Bookmarked lessons |
| `0004`–`0008` | Owner title, monthly hiding, announcements, roles & bans, badges |
| `0009_arena.sql` | Arena: problems, hidden tests, submissions, contests, registrations, rating changes and their functions |
| `0010_problemset_seed.sql` | 24 public problems with their hidden tests (≈1.1 MB — paste it on its own) |
| `0011_contests_seed.sql` | 12 contest problems + PyNest Round #1 and #2 (next Saturday 14:00 UTC, then a week later) |

### Tables

`profiles`, `user_progress`, `lesson_completions`, `exercise_submissions`, `quiz_results`, `achievements`, `user_achievements`, `subscriptions`, `billing_events`, `ai_usage`, `saved_code`, `daily_activity`, `friendships`, `leaderboard_snapshots`, `xp_ledger`, `favorite_lessons`.

### Functions

| Function | Who can call it | Purpose |
|---|---|---|
| `award_activity` | service_role | Records a completion, awards XP **once** (via `xp_ledger`), updates the streak and daily activity, unlocks achievements, recalculates the level |
| `record_failed_submission` | service_role | Stores a failed exercise attempt |
| `consume_ai_quota`, `record_ai_tokens` | service_role | Atomic daily AI allowance |
| `snapshot_leaderboards` | service_role | Daily rank history ("best rank") |
| `get_leaderboard`, `get_public_profile`, `username_available` | anon, authenticated | Read-only, returns public columns only, respects privacy settings |
| `get_my_stats`, `search_users`, `get_friends`, `friends_feed` | authenticated | Read-only views scoped to `auth.uid()` |

## 3. Authentication

**Authentication → URL Configuration**
- Site URL: `https://your-domain` (or `http://localhost:3000` for development)
- Redirect URLs: `https://your-domain/auth/callback` and `http://localhost:3000/auth/callback`

**Authentication → Providers → Email**
- Keep **Confirm email** enabled. New users are sent to `/verify-email`, and the link returns them to `/auth/callback?next=/onboarding`.
- Minimum password length 8. The app also requires a strength score of 3 or more.

**Authentication → Emails → SMTP**
- The built-in mailer is rate limited. For production, configure a real SMTP provider (Resend, Postmark, SES…).

**Google sign-in (optional)**
1. Create an OAuth client in Google Cloud Console with the redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Enable **Google** under Authentication → Providers and paste the client ID and secret.
3. Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.

**Sessions**
- Sessions refresh automatically in `src/middleware.ts`.
- "Remember me" off → session cookies end when the browser closes.
- "Sign out of all devices" (Settings) revokes every refresh token.

## 4. Storage

`0001_init.sql` creates a public `avatars` bucket (2 MB, png/jpeg/webp/gif). Users can only write inside their own folder `avatars/<user-id>/…`. If the insert into `storage.buckets` fails on your project, create the bucket in **Storage** with those settings and re-run the four `avatars:` policies at the end of the file.

## 5. Verify

```sql
select count(*) from public.achievements;           -- 18
select tablename, rowsecurity from pg_tables where schemaname = 'public';  -- all true
```

Then sign up in the app and confirm that a row appears in `profiles`, `user_progress` and `subscriptions` (plan `FREE`).

## 6. Local security tests (optional)

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres npm run test:db
```

This runs all migrations on a throwaway database with a Supabase stub and checks that:

- two users can't read or modify each other's data;
- XP, plans, achievements and quotas can't be changed from the browser role;
- rewards are idempotent;
- the leaderboard order matches XP;
- the Free-plan limits are enforced.
