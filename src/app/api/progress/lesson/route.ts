import { findLesson, gradeQuestions, type QuizAnswer } from "@/content/server";
import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { planAtLeast } from "@/lib/plans";
import { XP_RULES } from "@/lib/xp";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocale } from "@/i18n/server";
import { localizeGraded } from "@/i18n/content";

const PASS = 50;

/**
 * Grade a lesson knowledge check on the server. When signed in and passed,
 * record the completion and award XP exactly once (public.award_activity).
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const body = await readJson<{ lessonId?: string; answers?: QuizAnswer[] }>(req);
  if (!body?.lessonId || !Array.isArray(body.answers)) return error("Invalid request");
  const found = findLesson(body.lessonId);
  if (!found) return error("Lesson not found", 404);
  const { lesson } = found;

  const ctx = isSupabaseConfigured ? await getUserContext() : null;
  if (lesson.minPlan && !planAtLeast(ctx?.plan ?? "FREE", lesson.minPlan)) {
    return error(`This project requires the ${lesson.minPlan} plan`, 403);
  }

  const graded = gradeQuestions(lesson.quiz.map((q) => ({ type: "mcq" as const, ...q })), body.answers.slice(0, lesson.quiz.length));
  graded.results = await localizeGraded(await getLocale(), graded.results);
  const passed = graded.percent >= PASS;
  if (!passed || !ctx) return json({ graded, passed, mode: ctx ? "account" : "guest" });

  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
  const kind = lesson.kind === "project" ? "project" : "lesson";
  const { data, error: e } = await admin.rpc("award_activity", {
    p_user: ctx.user.id,
    p_kind: kind,
    p_ref: lesson.id,
    p_xp: kind === "project" ? XP_RULES.project : XP_RULES.lesson,
    p_score: graded.percent,
  });
  if (e) return error("Could not save progress. Please try again.", 500);
  return json({ graded, passed, mode: "account", award: data });
}
