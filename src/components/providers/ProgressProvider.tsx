"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Catalog } from "@/content/catalog";
import { ACHIEVEMENTS, achievementById, isAchievementMet } from "@/lib/achievements";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import { AI_DAILY_LIMIT, type Plan } from "@/lib/plans";
import { XP_RULES, leagueForWeeklyXp, levelForXp, streakBonus } from "@/lib/xp";
import { useToast } from "@/components/ui/Toast";

// ---------------------------------------------------------------- catalog
const CatalogCtx = createContext<Catalog | null>(null);
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: React.ReactNode }) {
  return <CatalogCtx.Provider value={catalog}>{children}</CatalogCtx.Provider>;
}
export function useCatalog() {
  const c = useContext(CatalogCtx);
  if (!c) throw new Error("CatalogProvider missing");
  return c;
}

// ---------------------------------------------------------------- types
export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  experience_level: string | null;
  learning_goal: string | null;
  daily_goal_minutes: number | null;
  is_public: boolean;
  show_stats: boolean;
  accent_theme: string;
  onboarded: boolean;
  created_at: string;
  special_title?: string | null;
  hidden_from_weekly?: boolean;
}
export interface DayActivity { date: string; xp: number; lessons: number; exercises: number; minutes: number }
export interface Stats { global_rank: number | null; weekly_rank: number | null; weekly_xp: number; monthly_xp: number; league: string; best_rank: number | null }
export interface Subscription {
  plan: Plan; status: string; billing_interval: "month" | "year" | null; current_period_end: string | null;
  cancel_at_period_end: boolean; provider_subscription_id: string | null; portal_url: string | null; update_payment_url: string | null;
}
export interface RecentItem { kind: "lesson" | "exercise" | "quiz"; id: string; at: string }

export interface ProgressState {
  ready: boolean;
  mode: "guest" | "account";
  authConfigured: boolean;
  email: string | null;
  emailConfirmed: boolean;
  profile: Profile | null;
  plan: Plan;
  subscription: Subscription | null;
  lessons: Set<string>;
  exercises: Set<string>;
  quizzes: Set<string>;
  bestQuiz: Record<string, number>;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  projects: number;
  achievements: { id: string; at: string }[];
  ai: { used: number; limit: number };
  activity: DayActivity[];
  stats: Stats | null;
  recent: RecentItem[];
}

export interface AwardResult {
  xp: number;
  already?: boolean;
  streakBonus?: number;
  achievements: string[];
}

interface Actions {
  refresh: () => Promise<void>;
  completeLesson: (lessonId: string, answers: number[]) => Promise<{ ok: boolean; graded?: GradedResponse; error?: string; award?: AwardResult }>;
  recordExercise: (exerciseId: string, code: string, passed: boolean) => Promise<{ ok: boolean; error?: string; award?: AwardResult; limit?: boolean }>;
  submitQuiz: (moduleId: string, answers: (number | string | boolean | null)[]) => Promise<{ ok: boolean; graded?: GradedResponse; passed?: boolean; error?: string; award?: AwardResult }>;
  setAiUsage: (used: number, limit: number) => void;
  signOut: (everywhere?: boolean) => Promise<void>;
}
export interface GradedResponse {
  results: { correct: boolean; explain: string; correctAnswer: string }[];
  score: number;
  total: number;
  percent: number;
}

const Ctx = createContext<(ProgressState & Actions) | null>(null);
export function useProgress() {
  const c = useContext(Ctx);
  if (!c) throw new Error("ProgressProvider missing");
  return c;
}

// ---------------------------------------------------------------- guest storage
const GUEST_KEY = "pynest-guest-v1";
interface GuestData {
  lessons: Record<string, string>;
  exercises: Record<string, string>;
  quizzes: Record<string, { best: number; passedAt?: string }>;
  xp: number;
  streak: number;
  longest: number;
  lastDate: string | null;
  achievements: Record<string, string>;
  activity: Record<string, DayActivity>;
  projects: number;
  ai: { date: string; used: number };
}
const emptyGuest = (): GuestData => ({ lessons: {}, exercises: {}, quizzes: {}, xp: 0, streak: 0, longest: 0, lastDate: null, achievements: {}, activity: {}, projects: 0, ai: { date: "", used: 0 } });
const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86400_000).toISOString().slice(0, 10);

function loadGuest(): GuestData {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? { ...emptyGuest(), ...JSON.parse(raw) } : emptyGuest();
  } catch {
    return emptyGuest();
  }
}
function saveGuest(g: GuestData) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(g));
  } catch {
    /* storage unavailable (private mode) — progress lives for this tab only */
  }
}

function guestToState(g: GuestData, base: Partial<ProgressState>): ProgressState {
  const recent: RecentItem[] = [
    ...Object.entries(g.lessons).map(([id, at]) => ({ kind: "lesson" as const, id, at })),
    ...Object.entries(g.exercises).map(([id, at]) => ({ kind: "exercise" as const, id, at })),
    ...Object.entries(g.quizzes).filter(([, q]) => q.passedAt).map(([id, q]) => ({ kind: "quiz" as const, id, at: q.passedAt! })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
  const streak = g.lastDate === today() || g.lastDate === yesterday() ? g.streak : 0;
  const weekStart = (() => { const d = new Date(); const day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day); return d.toISOString().slice(0, 10); })();
  const monthStart = today().slice(0, 8) + "01";
  const acts = Object.values(g.activity).sort((a, b) => a.date.localeCompare(b.date));
  const weekly = acts.filter((a) => a.date >= weekStart).reduce((s, a) => s + a.xp, 0);
  const monthly = acts.filter((a) => a.date >= monthStart).reduce((s, a) => s + a.xp, 0);
  return {
    ready: true,
    mode: "guest",
    authConfigured: isSupabaseConfigured,
    email: null,
    emailConfirmed: false,
    profile: null,
    plan: "FREE",
    subscription: null,
    lessons: new Set(Object.keys(g.lessons)),
    exercises: new Set(Object.keys(g.exercises)),
    quizzes: new Set(Object.entries(g.quizzes).filter(([, q]) => q.passedAt).map(([k]) => k)),
    bestQuiz: Object.fromEntries(Object.entries(g.quizzes).map(([k, q]) => [k, q.best])),
    xp: g.xp,
    level: levelForXp(g.xp),
    streak,
    longestStreak: g.longest,
    projects: g.projects,
    achievements: Object.entries(g.achievements).map(([id, at]) => ({ id, at })),
    ai: { used: g.ai.date === today() ? g.ai.used : 0, limit: 10 },
    activity: acts,
    stats: { global_rank: null, weekly_rank: null, weekly_xp: weekly, monthly_xp: monthly, league: leagueForWeeklyXp(weekly).league.name, best_rank: null },
    recent,
    ...base,
  };
}

/** Award XP locally (guest mode). Mirrors public.award_activity. */
function guestAward(g: GuestData, kind: "lesson" | "project" | "exercise" | "quiz", id: string, xp: number): AwardResult {
  const now = new Date().toISOString();
  const store = kind === "exercise" ? g.exercises : kind === "quiz" ? null : g.lessons;
  if (store && store[id]) return { xp: 0, already: true, achievements: [] };
  if (kind === "quiz" && g.quizzes[id]?.passedAt) return { xp: 0, already: true, achievements: [] };
  if (store) store[id] = now;
  if (kind === "quiz") g.quizzes[id] = { ...(g.quizzes[id] ?? { best: 0 }), passedAt: now };
  if (kind === "project") g.projects += 1;

  const t = today();
  let bonus = 0;
  if (g.lastDate !== t) {
    g.streak = g.lastDate === yesterday() ? g.streak + 1 : 1;
    bonus = g.lastDate === yesterday() ? streakBonus(g.streak) : 0;
    g.lastDate = t;
  }
  g.longest = Math.max(g.longest, g.streak);
  const day = g.activity[t] ?? { date: t, xp: 0, lessons: 0, exercises: 0, minutes: 0 };
  day.xp += xp + bonus;
  if (kind === "lesson" || kind === "project") day.lessons += 1;
  if (kind === "exercise") day.exercises += 1;
  day.minutes += kind === "lesson" ? 8 : kind === "project" ? 25 : kind === "exercise" ? 5 : 6;
  g.activity[t] = day;
  g.xp += xp + bonus;

  const unlocked: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (g.achievements[a.id]) continue;
    const state = {
      lessons: new Set(Object.keys(g.lessons)),
      quizzes: new Set(Object.entries(g.quizzes).filter(([, q]) => q.passedAt).map(([k]) => k)),
      exercises: Object.keys(g.exercises).length,
      projects: g.projects,
      streak: g.streak,
      xp: g.xp,
    };
    if (isAchievementMet(a, state)) {
      g.achievements[a.id] = now;
      unlocked.push(a.id);
      g.xp += a.xp;
      day.xp += a.xp;
    }
  }
  return { xp, streakBonus: bonus, achievements: unlocked };
}

// ---------------------------------------------------------------- provider
export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const catalog = useCatalog();
  const toast = useToast();
  const router = useRouter();
  const [state, setState] = useState<ProgressState>(() => guestToState(emptyGuest(), { ready: false }));
  const wasAccount = useRef(false);

  const lessonKind = useCallback(
    (id: string) => catalog.modules.flatMap((m) => m.lessons).find((l) => l.id === id)?.kind ?? "lesson",
    [catalog],
  );

  const announce = useCallback(
    (award?: AwardResult | null) => {
      if (!award || award.already) return;
      if (award.xp > 0) toast({ kind: "success", title: `+${award.xp} XP`, body: award.streakBonus ? `Includes a +${award.streakBonus} streak bonus` : undefined });
      for (const id of award.achievements ?? []) {
        const a = achievementById(id);
        if (a) toast({ kind: "achievement", title: a.name, body: a.description + (a.xp ? ` (+${a.xp} XP)` : "") });
      }
    },
    [toast],
  );

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setState(guestToState(loadGuest(), {}));
      return;
    }
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 401) {
        if (wasAccount.current) toast({ kind: "info", title: "You've been signed out", body: "Your session ended. Sign in again to keep saving progress." });
        wasAccount.current = false;
        setState(guestToState(loadGuest(), {}));
        return;
      }
      if (!res.ok) throw new Error("load failed");
      const d = await res.json();
      wasAccount.current = true;
      const p = d.progress ?? {};
      const recent: RecentItem[] = [
        ...d.lessons.map((l: { lesson_id: string; completed_at: string }) => ({ kind: "lesson", id: l.lesson_id, at: l.completed_at })),
        ...d.exercises.map((e: { exercise_id: string; submitted_at: string }) => ({ kind: "exercise", id: e.exercise_id, at: e.submitted_at })),
        ...d.quizAttempts.map((q: { quiz_id: string; completed_at: string }) => ({ kind: "quiz", id: q.quiz_id, at: q.completed_at })),
      ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12) as RecentItem[];
      setState({
        ready: true,
        mode: "account",
        authConfigured: true,
        email: d.user.email,
        emailConfirmed: d.user.emailConfirmed,
        profile: d.profile,
        plan: d.plan,
        subscription: d.subscription,
        lessons: new Set(d.lessons.map((l: { lesson_id: string }) => l.lesson_id)),
        exercises: new Set(d.exercises.map((e: { exercise_id: string }) => e.exercise_id)),
        quizzes: new Set(d.passedQuizzes),
        bestQuiz: d.bestQuiz,
        xp: p.total_xp ?? 0,
        level: p.current_level ?? levelForXp(p.total_xp ?? 0),
        streak: p.last_activity_date === today() || p.last_activity_date === yesterday() ? p.current_streak ?? 0 : 0,
        longestStreak: p.longest_streak ?? 0,
        projects: p.completed_projects ?? 0,
        achievements: d.achievements.map((a: { achievement_id: string; unlocked_at: string }) => ({ id: a.achievement_id, at: a.unlocked_at })),
        ai: d.ai,
        activity: d.activity.map((a: { activity_date: string; xp_earned: number; lessons_completed: number; exercises_completed: number; minutes_studied: number }) => ({
          date: a.activity_date, xp: a.xp_earned, lessons: a.lessons_completed, exercises: a.exercises_completed, minutes: a.minutes_studied,
        })),
        stats: d.stats,
        recent,
      });
    } catch {
      setState((s) => ({ ...s, ready: true }));
    }
  }, [toast]);

  useEffect(() => {
    refresh();
    const sb = getBrowserSupabase();
    if (!sb) return;
    const { data } = sb.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") refresh();
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const completeLesson: Actions["completeLesson"] = useCallback(async (lessonId, answers) => {
    const res = await fetch("/api/progress/lesson", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, answers }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: d.error ?? "Something went wrong" };
    if (!d.passed) return { ok: true, graded: d.graded };
    let award: AwardResult | undefined;
    if (d.mode === "account") {
      award = d.award ? { xp: d.award.xp, already: d.award.already, streakBonus: d.award.streak_bonus, achievements: d.award.achievements ?? [] } : undefined;
      await refresh();
    } else {
      const g = loadGuest();
      const kind = lessonKind(lessonId);
      award = guestAward(g, kind, lessonId, kind === "project" ? XP_RULES.project : XP_RULES.lesson);
      saveGuest(g);
      setState(guestToState(g, {}));
    }
    announce(award);
    return { ok: true, graded: d.graded, award };
  }, [announce, lessonKind, refresh]);

  const recordExercise: Actions["recordExercise"] = useCallback(async (exerciseId, code, passed) => {
    const ex = catalog.exercises.find((e) => e.id === exerciseId);
    if (!ex) return { ok: false, error: "Unknown exercise" };
    if (state.mode === "account") {
      const res = await fetch("/api/progress/exercise", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exerciseId, code, passed }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: d.error, limit: d.limit };
      const award = d.award ? { xp: d.award.xp, already: d.award.already, streakBonus: d.award.streak_bonus, achievements: d.award.achievements ?? [] } : undefined;
      if (passed) await refresh();
      announce(award);
      return { ok: true, award };
    }
    if (!passed) return { ok: true };
    if (ex.minPlan !== "FREE") return { ok: false, error: "Hard challenges require a Pro account." };
    const g = loadGuest();
    const award = guestAward(g, "exercise", exerciseId, XP_RULES.exercise[ex.difficulty]);
    saveGuest(g);
    setState(guestToState(g, {}));
    announce(award);
    return { ok: true, award };
  }, [announce, catalog.exercises, refresh, state.mode]);

  const submitQuiz: Actions["submitQuiz"] = useCallback(async (moduleId, answers) => {
    const res = await fetch(`/api/quiz/${moduleId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: d.error ?? "Could not grade the quiz" };
    let award: AwardResult | undefined;
    if (d.mode === "account") {
      if (d.award) award = { xp: d.award.xp, already: d.award.already, streakBonus: d.award.streak_bonus, achievements: d.award.achievements ?? [] };
      await refresh();
    } else {
      const g = loadGuest();
      g.quizzes[moduleId] = { ...(g.quizzes[moduleId] ?? { best: 0 }), best: Math.max(g.quizzes[moduleId]?.best ?? 0, d.graded.percent) };
      if (d.passed) award = guestAward(g, "quiz", moduleId, XP_RULES.quiz);
      saveGuest(g);
      setState(guestToState(g, {}));
    }
    announce(award);
    return { ok: true, graded: d.graded, passed: d.passed, award };
  }, [announce, refresh]);

  const setAiUsage = useCallback((used: number, limit: number) => {
    setState((s) => ({ ...s, ai: { used, limit } }));
    if (!isSupabaseConfigured) {
      const g = loadGuest();
      g.ai = { date: today(), used };
      saveGuest(g);
    }
  }, []);

  const signOut = useCallback(async (everywhere = false) => {
    const sb = getBrowserSupabase();
    await sb?.auth.signOut({ scope: everywhere ? "global" : "local" });
    wasAccount.current = false;
    setState(guestToState(loadGuest(), {}));
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(() => ({ ...state, ai: state.mode === "account" ? state.ai : { ...state.ai, limit: isSupabaseConfigured ? 0 : 10 }, refresh, completeLesson, recordExercise, submitQuiz, setAiUsage, signOut }), [state, refresh, completeLesson, recordExercise, submitQuiz, setAiUsage, signOut]);

  useEffect(() => {
    const accent = state.plan !== "FREE" ? state.profile?.accent_theme : "default";
    if (accent && accent !== "default") document.documentElement.dataset.accent = accent;
    else delete document.documentElement.dataset.accent;
  }, [state.plan, state.profile?.accent_theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const aiLimitFor = (plan: Plan) => AI_DAILY_LIMIT[plan];
