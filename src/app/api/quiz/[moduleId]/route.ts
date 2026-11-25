import { findQuiz, gradeQuestions, type QuizAnswer } from "@/content/server";
import { QUIZ_PASS_PERCENT } from "@/content/quizzes";
import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { XP_RULES } from "@/lib/xp";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocale } from "@/i18n/server";
import { localizeGraded } from "@/i18n/content";

/** Server-side grading for module quizzes. Answer keys never reach the browser. */
export async function POST(req: Request, { params }: { params: Promise<{ moduleId: string }> }) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const { moduleId } = await params;
  const quiz = findQuiz(moduleId);
  if (!quiz) return error("Quiz not found", 404);
  const body = await readJson<{ answers?: QuizAnswer[] }>(req);
  if (!body || !Array.isArray(body.answers)) return error("Invalid request");

  const graded = gradeQuestions(quiz.questions, body.answers.slice(0, quiz.questions.length));
  graded.results = await localizeGraded(await getLocale(), graded.results);
  const passed = graded.percent >= QUIZ_PASS_PERCENT;
  const ctx = isSupabaseConfigured ? await getUserContext() : null;
  if (!ctx) return json({ graded, passed, mode: "guest" });

  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
  if (passed) {
    const { data, error: e } = await admin.rpc("award_activity", {
      p_user: ctx.user.id, p_kind: "quiz", p_ref: moduleId, p_xp: XP_RULES.quiz,
      p_score: graded.score, p_total: graded.total,
    });
    if (e) return error("Could not save your result. Please try again.", 500);
    return json({ graded, passed, mode: "account", award: data });
  }
  await admin.from("quiz_results").insert({ user_id: ctx.user.id, quiz_id: moduleId, score: graded.score, total_questions: graded.total });
  return json({ graded, passed, mode: "account" });
}
