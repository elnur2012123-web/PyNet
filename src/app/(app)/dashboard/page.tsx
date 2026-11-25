"use client";

import { useT, useTp } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Award, Bot, CheckCircle2, Code2, Crown, Flame, ListChecks, Medal, Target, Trophy, Zap } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { ProgressBar, Ring } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { Icon } from "@/components/ui/Icon";
import { Skeleton } from "@/components/ui/States";
import { formatXp, leagueForWeeklyXp, levelProgress } from "@/lib/xp";
import { SpecialBadge, SpecialChip } from "@/components/ui/SpecialBadge";
import { planAtLeast } from "@/lib/plans";
import { achievementById, displayBadge } from "@/lib/achievements";
import { BadgeChip, BadgeMedal } from "@/components/ui/AchievementBadge";
import { ArenaStrip } from "@/components/arena/ArenaStrip";

const GOAL_TIPS: Record<string, string> = {
  ai: "For AI, focus on lists & dictionaries (Module 8), functions (Module 9) and comprehensions (Module 14) — they are everywhere in data science.",
  games: "For games, loops (Module 7), OOP (Module 13) and the projects in Module 15 are your best friends.",
  web: "For web development, master functions (Module 9), modules (Module 12) and OOP (Module 13) — frameworks like Django build on them.",
  competitive: "For competitive programming, practise input parsing (Module 5), loops and the Hard challenges in Practice.",
  school: "For school, steady daily practice beats cramming — keep your streak alive and take every module quiz.",
  personal: "Learning for fun is the best reason! Try building the projects in Module 15 as soon as you reach them.",
};

export default function Dashboard() {
  const tx = useT();
  const tp = useTp();
  const p = useProgress();
  const catalog = useCatalog();

  const lessons = useMemo(() => catalog.modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m }))), [catalog]);
  const total = lessons.length;
  const done = lessons.filter((l) => p.lessons.has(l.id)).length;

  const next = useMemo(() => {
    const skipIntro = p.profile?.experience_level === "other_language" && p.lessons.size < 3;
    const pool = skipIntro ? lessons.filter((l) => l.module.number >= 2) : lessons;
    return pool.find((l) => !p.lessons.has(l.id) && planAtLeast(p.plan, l.minPlan)) ?? null;
  }, [lessons, p.lessons, p.plan, p.profile?.experience_level]);

  const currentModule = next?.module ?? catalog.modules[catalog.modules.length - 1];
  const lvl = levelProgress(p.xp);
  const weekly = p.stats?.weekly_xp ?? 0;
  const league = leagueForWeeklyXp(weekly);
  const quizCount = Object.keys(p.bestQuiz).length;
  const avgQuiz = quizCount ? Math.round(Object.values(p.bestQuiz).reduce((a, b) => a + b, 0) / quizCount) : null;

  const today = new Date().toISOString().slice(0, 10);
  const todayMinutes = p.activity.find((a) => a.date === today)?.minutes ?? 0;
  const goal = p.profile?.daily_goal_minutes ?? 20;

  const days = useMemo(() => {
    const map = new Map(p.activity.map((a) => [a.date, a]));
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400_000).toISOString().slice(0, 10);
      return { date: d, xp: map.get(d)?.xp ?? 0 };
    });
  }, [p.activity]);
  const maxXp = Math.max(20, ...days.map((d) => d.xp));

  if (!p.ready) {
    return <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40 md:col-span-2" /><Skeleton className="h-40" /><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>;
  }

  const name = p.profile?.display_name || p.profile?.username;

  return (
    <div className="animate-fade-up space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center gap-4">
        {p.mode === "account" && <Avatar src={p.profile?.avatar_url} name={name} size={52} />}
        <div className="flex-1">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            {name ? tx("Welcome back, {name}", { name }) : tx("Welcome to PyNest")} <PlanBadge plan={p.plan} />{p.profile?.special_title && <SpecialChip title={p.profile.special_title} />}<BadgeChip id={displayBadge(p.achievements.map((a) => a.id), p.profile?.featured_badge)} />
          </h1>
          <p className="text-sm text-muted">
            {done === 0 ? tx("Let's write your first line of Python today.") : `You've completed ${done} of ${total} lessons. Keep going!`}
          </p>
        </div>
        {p.mode === "account" && p.profile && !p.profile.onboarded && <Link href="/onboarding" className="btn-secondary btn-sm"><T k="Personalise my path" /></Link>}
      </div>

      {p.mode === "account" && !p.emailConfirmed && (
        <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm"><T k="Please verify your email address — check your inbox for the confirmation link." /></div>
      )}

      {/* hero row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card relative overflow-hidden p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
          <p className="eyebrow">{done === 0 ? tx("Start here") : tx("Recommended next lesson")}</p>
          {next ? (
            <>
              <h2 className="mt-2 text-xl font-semibold"><T k={next.title} /></h2>
              <p className="mt-1 text-sm text-muted"><T k="Module" />{" "}{next.module.number} · <T k={next.module.title} /> · {next.minutes} <T k="min" /></p>
              <Link href={`/learn/${next.id}`} className="btn-primary mt-5">{done === 0 ? tx("Start learning") : tx("Continue")} <ArrowRight className="h-4 w-4" /></Link>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-xl font-semibold"><T k="You've finished every available lesson 🎉" /></h2>
              <p className="mt-1 text-sm text-muted"><T k="Take the remaining quizzes, tackle Hard challenges, or build a project." /></p>
              <Link href="/practice" className="btn-primary mt-5"><T k="Practice" />{" "}<ArrowRight className="h-4 w-4" /></Link>
            </>
          )}
          {p.profile?.learning_goal && GOAL_TIPS[p.profile.learning_goal] && (
            <p className="mt-5 rounded-xl bg-elevated/70 px-3.5 py-2.5 text-sm text-fg/90"><Target className="mr-1.5 inline h-4 w-4 text-accent" />{GOAL_TIPS[p.profile.learning_goal]}</p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <Ring value={(done / total) * 100} size={76} stroke={7}><span className="text-sm">{Math.round((done / total) * 100)}%</span></Ring>
            <div>
              <p className="text-sm text-muted"><T k="Course completion" /></p>
              <p className="text-lg font-semibold">{done}/{total} <T k="lessons" /></p>
              <p className="text-xs text-muted"><T k="Current: Module" />{" "}{currentModule.number}</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium"><T k="Level" />{" "}{lvl.level}</span><span className="text-muted">{lvl.current}/{lvl.needed} <T k="XP" /></span></div>
            <ProgressBar value={lvl.pct} label={tx("Level progress")} />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium"><T k="Today's goal" /></span><span className="text-muted">{todayMinutes}/{goal} <T k="min" /></span></div>
            <ProgressBar value={(todayMinutes / goal) * 100} label={tx("Daily goal")} />
          </div>
        </div>
      </div>

      <ArenaStrip />

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat icon={<Flame className="h-4 w-4 text-warn" />} label={tx("Learning streak")} value={tp("day", p.streak)} sub={tx("Best: {n}", { n: p.longestStreak })} />
        <Stat icon={<Zap className="h-4 w-4 text-accent" />} label={tx("Total XP")} value={formatXp(p.xp)} sub={tx("{n} this week", { n: weekly })} />
        <Stat icon={<Code2 className="h-4 w-4 text-accent2" />} label={tx("Challenges solved")} value={String(p.exercises.size)} sub={`of ${catalog.exercises.length}`} />
        <Stat icon={<ListChecks className="h-4 w-4 text-success" />} label={tx("Quiz performance")} value={avgQuiz == null ? "—" : `${avgQuiz}%`} sub={tp("quiz passed", p.quizzes.size)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* league & rank */}
        <div className="card p-6">
          <div className="flex items-center justify-between"><h3 className="font-semibold"><T k="League" /></h3><Link href="/leaderboard" className="text-xs text-accent"><T k="Leaderboard →" /></Link></div>
          <div className="mt-4 flex items-center gap-4">
            {p.profile?.special_title ? <SpecialBadge title={p.profile.special_title} size={52} /> : <LeagueBadge league={league.league.name} size={52} />}
            <div>
              <p className="text-lg font-semibold">{p.profile?.special_title ?? tx("{league} League", { league: tx(league.league.name) })}</p>
              <p className="text-sm text-muted">{p.profile?.special_title ? tx("A one-of-a-kind rank") : league.next ? tx("{n} XP to {league}", { n: league.xpToNext, league: tx(league.next.name) }) : tx("Top league — amazing!")}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-elevated/70 p-3"><dt className="text-xs text-muted"><T k="Global rank" /></dt><dd className="font-semibold">{p.stats?.global_rank ? `#${p.stats.global_rank}` : p.mode === "account" ? "—" : tx("Sign in")}</dd></div>
            <div className="rounded-xl bg-elevated/70 p-3"><dt className="text-xs text-muted"><T k="Weekly rank" /></dt><dd className="font-semibold">{p.profile?.hidden_from_weekly ? tx("Hidden") : p.stats?.weekly_rank && weekly > 0 ? `#${p.stats.weekly_rank}` : "—"}</dd></div>
          </dl>
        </div>

        {/* activity */}
        <div className="card p-6">
          <h3 className="font-semibold"><T k="Last 14 days" /></h3>
          <p className="text-xs text-muted"><T k="XP earned per day" /></p>
          <div className="mt-4 flex h-28 items-end gap-1.5" role="img" aria-label={`XP per day for the last 14 days: ${days.map((d) => d.xp).join(", ")}`}>
            {days.map((d) => (
              <div key={d.date} className="group relative flex h-full flex-1 items-end">
                <div className={`w-full rounded-t-md ${d.xp ? "bg-gradient-to-t from-accent to-accent2" : "bg-elevated"}`} style={{ height: `${Math.max(6, (d.xp / maxXp) * 100)}%` }} />
                <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-fg px-1.5 py-0.5 text-[10px] text-bg group-hover:block">{d.date.slice(5)}: {d.xp} <T k="XP" /></span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted"><span>{days[0].date.slice(5)}</span><span><T k="Today" /></span></div>
        </div>

        {/* plan & AI */}
        <div className="card p-6">
          <div className="flex items-center justify-between"><h3 className="font-semibold"><T k="Your plan" /></h3><PlanBadge plan={p.plan} /></div>
          <p className="mt-1 text-sm text-muted">{p.plan === "FREE" ? tx("Free forever") : `${p.plan === "PRO" ? "Pro" : "Max"} · ${p.subscription?.billing_interval === "year" ? "yearly" : "monthly"}`}</p>
          <div className="mt-4 rounded-xl bg-elevated/70 p-3">
            <p className="flex items-center gap-1.5 text-xs text-muted"><Bot className="h-3.5 w-3.5" /> <T k="PyBuddy messages today" /></p>
            {p.mode === "account" ? (
              <>
                <p className="mt-1 font-semibold">{Math.max(0, p.ai.limit - p.ai.used)} <T k="of" />{" "}{p.ai.limit} <T k="left" /></p>
                <ProgressBar value={(p.ai.used / Math.max(p.ai.limit, 1)) * 100} className="mt-2" label={tx("AI usage")} />
                <p className="mt-1.5 text-[11px] text-muted"><T k="Resets daily at 00:00 UTC" /></p>
              </>
            ) : (
              <p className="mt-1 text-sm">{p.authConfigured ? <><Link href="/signup" className="link"><T k="Create an account" /></Link> <T k="to use PyBuddy." /></> : tx("Demo mode")}</p>
            )}
          </div>
          {p.plan !== "MAX" && <Link href="/pricing" className="btn-secondary btn-sm mt-4 w-full"><Crown className="h-3.5 w-3.5 text-accent2" /> {p.plan === "FREE" ? tx("Upgrade to Pro") : tx("Upgrade to Max")}</Link>}
        </div>
      </div>

      {/* roadmap */}
      <div className="card p-6">
        <div className="flex items-center justify-between"><h3 className="font-semibold"><T k="Your roadmap" /></h3><Link href="/learn" className="text-xs text-accent"><T k="Full curriculum →" /></Link></div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {catalog.modules.map((m) => {
            const md = m.lessons.filter((l) => p.lessons.has(l.id)).length;
            const pct = (md / m.lessons.length) * 100;
            const isCurrent = m.id === currentModule.id;
            return (
              <li key={m.id}>
                <Link href={`/learn#m${m.number}`} className={`block rounded-xl border p-3 transition hover:border-accent/50 ${isCurrent ? "border-accent/60 bg-accent/5" : "border-border"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-7 w-7 place-items-center rounded-lg ${pct === 100 ? "bg-success/15 text-success" : "bg-elevated text-accent"}`}>{pct === 100 ? <CheckCircle2 className="h-4 w-4" /> : <Icon name={m.icon} className="h-4 w-4" />}</span>
                    <span className="text-xs text-muted">M{m.number}</span>
                    {p.quizzes.has(m.id) && <Medal className="ml-auto h-3.5 w-3.5 text-warn" aria-label={tx("Quiz passed")} />}
                  </div>
                  <p className="mt-2 truncate text-sm font-medium"><T k={m.title} /></p>
                  <ProgressBar value={pct} className="mt-2 h-1.5" label={`${m.title}`} />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>

      {/* recent + achievements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold"><T k="Recent activity" /></h3>
          {p.recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted"><T k="Nothing yet — complete a lesson and it will show up here." /></p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {p.recent.slice(0, 6).map((r, i) => {
                const title = r.kind === "lesson" ? lessons.find((l) => l.id === r.id)?.title : r.kind === "exercise" ? catalog.exercises.find((e) => e.id === r.id)?.title : `${catalog.modules.find((m) => m.id === r.id)?.title} quiz`;
                return (
                  <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="chip w-20 justify-center capitalize">{r.kind}</span>
                    <span className="flex-1 truncate">{title ?? r.id}</span>
                    <time className="text-xs text-muted" dateTime={r.at}>{new Date(r.at).toLocaleDateString()}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between"><h3 className="font-semibold"><T k="Achievements" /></h3><Link href="/achievements" className="text-xs text-accent"><T k="All →" /></Link></div>
          {p.achievements.length === 0 ? (
            <p className="mt-4 text-sm text-muted"><T k="Complete “Your first Python program” to unlock your first badge." /></p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {p.achievements.slice(-6).reverse().map((a) => {
                const def = achievementById(a.id);
                return (
                  <li key={a.id} className="rounded-xl border border-border p-3 text-center">
                    <span className="flex justify-center"><BadgeMedal id={a.id} size={44} /></span>
                    <p className="mt-2 truncate text-xs font-medium">{def?.name ?? a.id}</p>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted"><Award className="h-3.5 w-3.5" /> {p.achievements.length} <T k="unlocked ·" />{" "}<Trophy className="h-3.5 w-3.5" /> <T k="Level" />{" "}{p.level}</p>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted">{icon} {label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </div>
  );
}
