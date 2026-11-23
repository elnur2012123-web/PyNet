import { getUserContext } from "@/lib/server/user";
import { error, json } from "@/lib/server/http";
import { AI_DAILY_LIMIT } from "@/lib/plans";

export const dynamic = "force-dynamic";

/** Everything the client needs to render the signed-in learner's state. */
export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) return error("Not signed in", 401);
  const { supabase, user, plan, subscription } = ctx;
  const today = new Date().toISOString().slice(0, 10);
  const since = new Date(Date.now() - 34 * 86400_000).toISOString().slice(0, 10);

  const [profile, progress, lessons, exercises, quizLedger, quizResults, achievements, usage, activity, stats] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_progress").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("lesson_completions").select("lesson_id,completed_at,score").eq("user_id", user.id).order("completed_at", { ascending: false }),
    supabase.from("exercise_submissions").select("exercise_id,submitted_at").eq("user_id", user.id).eq("passed", true).order("submitted_at", { ascending: false }),
    supabase.from("xp_ledger").select("source_id,created_at").eq("user_id", user.id).eq("source_type", "quiz"),
    supabase.from("quiz_results").select("quiz_id,score,total_questions,completed_at").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(200),
    supabase.from("user_achievements").select("achievement_id,unlocked_at").eq("user_id", user.id),
    supabase.from("ai_usage").select("request_count").eq("user_id", user.id).eq("usage_date", today),
    supabase.from("daily_activity").select("activity_date,xp_earned,lessons_completed,exercises_completed,minutes_studied").eq("user_id", user.id).gte("activity_date", since).order("activity_date"),
    supabase.rpc("get_my_stats"),
  ]);

  const aiUsed = (usage.data ?? []).reduce((s, r) => s + (r.request_count as number), 0);
  const bestQuiz: Record<string, number> = {};
  for (const r of quizResults.data ?? []) {
    const pct = Math.round((r.score / Math.max(r.total_questions, 1)) * 100);
    bestQuiz[r.quiz_id] = Math.max(bestQuiz[r.quiz_id] ?? 0, pct);
  }

  return json({
    user: { id: user.id, email: user.email, emailConfirmed: Boolean(user.email_confirmed_at) },
    profile: profile.data,
    progress: progress.data,
    plan,
    subscription,
    lessons: lessons.data ?? [],
    exercises: exercises.data ?? [],
    passedQuizzes: (quizLedger.data ?? []).map((q) => q.source_id),
    quizAttempts: (quizResults.data ?? []).slice(0, 20),
    bestQuiz,
    achievements: achievements.data ?? [],
    ai: { used: aiUsed, limit: AI_DAILY_LIMIT[plan] },
    activity: activity.data ?? [],
    stats: Array.isArray(stats.data) ? stats.data[0] ?? null : stats.data ?? null,
  });
}
