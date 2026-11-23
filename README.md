# PyNest — learn Python from zero

PyNest is a Python learning platform for complete beginners. It has interactive lessons, a real Python editor that runs in the browser, automatically checked exercises, quizzes, an AI tutor (PyBuddy), XP and leagues, a leaderboard, friends, and Free/Pro/Max subscriptions.

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · CodeMirror 6 · Pyodide (CPython 3.14 in WebAssembly) · Supabase (Postgres, Auth, Storage, RLS) · Anthropic Claude API · Lemon Squeezy · Vercel.

## What's inside

| Area | Details |
|---|---|
| Curriculum | 15 modules, 107 lessons (10 of them guided projects). Each lesson has an explanation, syntax, worked examples, a real-world note, common mistakes, a "Try it yourself" editor, 3 auto-graded practice tasks and a knowledge check. |
| Python editor | Real CPython via Pyodide, running in a Web Worker. Has syntax highlighting, line numbers, Run/Stop/Reset/Clear/Copy, an Input box for `input()`, beginner-friendly error help, a 10-second limit that stops infinite loops, and Ctrl/⌘+Enter to run. The runtime is served from `/public/pyodide`, so it doesn't depend on a CDN. |
| Practice | 25 challenges (Very Easy → Hard). Hidden and visible test cases compare the program's **actual stdout**. Includes hints, the solution and an explanation. |
| Quizzes | One quiz per module, with five question types: MCQ, predict the output, find the error, fill in the blank and small coding challenges. Answer keys stay on the server; `/api/quiz/[moduleId]` grades the answers. |
| Error Explorer | 13 errors. Each has meaning, causes, broken and fixed code, a runnable example, ways to prevent it, a practice drill and a quiz. Search and filters included. |
| PyBuddy | Streaming Claude tutor with Ask, Explain code, Debug, Code review (Max) and Make exercises (Max) modes. It has a floating button on every page and "Ask PyBuddy" buttons on errors and exercises. Per-plan daily quotas are enforced in Postgres. |
| Gamification | XP (lesson 20, exercise 5/10/20/40, quiz 50, project 100, streak bonus), levels, 18 achievements, daily streaks, and leagues from Bronze to Master based on weekly XP. |
| Social | Global, weekly, monthly, friends and country leaderboards; daily rank snapshots ("best rank"); public profiles with privacy controls; friend requests; an achievement feed. |
| Accounts | Sign up (username check, strength meter, terms checkbox, optional avatar), sign in with email **or** username (with remember me), Google OAuth (optional), forgot/reset password, email verification, onboarding, settings, data export, account deletion, and sign out of all devices. |
| Plans | Free / Pro ($5 or $50/yr) / Max ($20 or $200/yr). Checkout, upgrade/downgrade, cancel/resume, billing history and a customer portal through Lemon Squeezy. Paid features activate **only** from verified webhooks. |

### Modes

- **Full mode** (Supabase configured): real accounts, synced progress, leaderboard, subscriptions.
- **Local mode** (no Supabase env vars): everything educational works and progress is saved in `localStorage`. The UI says clearly that progress isn't synced. Leaderboards, friends and payments are shown as unavailable instead of being faked.
- **PyBuddy without `ANTHROPIC_API_KEY`:** the tutor runs as **PyBuddy Lite**, a free rule-based tutor (`src/lib/tutor/`). It answers from PyNest's lessons, error guides, exercises and a Python glossary. It explains error messages, walks through pasted code line by line, flags common bugs, gives practice questions and exercise hints, and refuses non-Python questions. It needs no API key, costs nothing and has no daily limit. Add a key later and PyBuddy switches to Claude automatically.
- **Payments without Lemon Squeezy credentials:** the pricing and billing pages show a "Demo mode" notice, and upgrade buttons are disabled. Nothing is simulated.

## Quick start (local)

```bash
npm install          # also copies the Pyodide runtime into public/pyodide
cp .env.example .env.local   # fill in what you have; everything is optional for local mode
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example`. None of these are exposed to the browser except the `NEXT_PUBLIC_*` ones.

| Variable | Required for |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Accounts and everything database-backed |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only: XP awards, quotas, webhooks, username sign-in, account deletion |
| `ANTHROPIC_API_KEY` | Optional. Claude-powered PyBuddy; without it, the free PyBuddy Lite runs (`ANTHROPIC_MODEL` is optional; the default is `claude-sonnet-5-5`) |
| `NEXT_PUBLIC_SITE_URL` | Auth redirect links and checkout return URL |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Set to `true` after enabling Google in Supabase Auth |
| `LEMONSQUEEZY_*` | Payments (see `docs/PAYMENTS.md`) |
| `CRON_SECRET` | Protects `/api/cron/snapshot` (daily leaderboard snapshot via `vercel.json`) |

## Database

All SQL is in `supabase/migrations/`. Setup instructions are in **[`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)**.

Security model in one paragraph: every user table has RLS enabled. Browsers can only read their own private rows, and can only write `saved_code`, `favorite_lessons`, friend requests and an allow-listed set of profile columns. XP, achievements, streaks, quiz/lesson completions, AI usage, subscriptions and leaderboard snapshots are written only by `SECURITY DEFINER` functions that are executable by `service_role`. Server routes call those functions after authenticating the user and validating the request. `xp_ledger` has a unique key per activity, so rewards can't be farmed. Premium profile themes and the Free-plan snippet limit are enforced by database triggers.

## Testing

```bash
npm run typecheck      # TypeScript
npm run test:content   # runs every reference solution against its tests in real Pyodide (491 tests)
npm run test:db        # migrations + multi-user RLS/security tests on a throwaway Postgres
```

`test:db` needs a local Postgres (`PGHOST`/`PGPORT`/`PGUSER`). It loads `supabase/tests/supabase_stub.sql` to emulate Supabase's `auth`/`storage` schemas and roles.

These suites were also run against a real Supabase stack (Supabase Postgres + GoTrue + PostgREST) in a browser:

- Two accounts were created. Their progress, snippets, subscriptions, AI quotas and data exports stayed independent.
- XP was idempotent. The leaderboard ordering matched real XP.
- Direct REST attempts to edit XP or plan, self-grant achievements, call privileged RPCs or read others' rows were all blocked.
- Signing out and back in (with username) and refreshing kept progress.
- The signed-webhook upgrade/cancel/expire flow, plan gating and AI quota limits all behaved as intended.

## Deploying to Vercel

1. Push the repo and import it into Vercel. The framework preset is detected automatically.
2. Add the environment variables in Project → Settings → Environment Variables.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain, e.g. `https://pynest.vercel.app`.
4. Add that domain to Supabase Auth → URL Configuration (Site URL plus the redirect `https://<domain>/auth/callback`).
5. Deploy. `vercel.json` registers the daily leaderboard snapshot cron.

## Known limitations

- **Exercise results are reported by the browser.** Code runs in the learner's own browser, so the server can't re-run it. The server decides XP amounts, enforces plan limits and awards each exercise once. A determined user could still claim an exercise without solving it, which is worth at most that exercise's XP once. Quiz and lesson knowledge checks are graded on the server, except a quiz's "coding challenge" items, which are also run in the browser.
- **Browser runtime limits.** The editor includes only the standard library (no `pip`). `input()` reads from the Input box, files live in a temporary in-browser filesystem, and programs stop after 10 seconds.
- **Burst rate limiting is per instance.** The AI tutor's per-minute burst limiter is in memory, so it applies per serverless instance. The daily quota is enforced in Postgres and is global.
- **Leagues update live.** Leagues are computed from the current week's XP, with no end-of-week promotion ceremony.
