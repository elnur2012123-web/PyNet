import { exerciseMinPlan, findExercise } from "@/content/server";
import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { FREE_DAILY_EXERCISE_LIMIT, planAtLeast } from "@/lib/plans";
import { XP_RULES } from "@/lib/xp";

/**
 * Record an exercise submission. Tests run in the learner's browser (real
 * Python via WebAssembly), so the "passed" flag is reported by the client;
 * the server decides XP, enforces plan limits and awards each exercise once.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const body = await readJson<{ exerciseId?: string; code?: string; passed?: boolean }>(req, 40_000);
  if (!body?.exerciseId || typeof body.code !== "string" || typeof body.passed !== "boolean") return error("Invalid request");
  if (body.code.trim().length === 0 || body.code.length > 20_000) return error("Invalid code");
  const ex = findExercise(body.exerciseId);
  if (!ex) return error("Exercise not found", 404);

  const ctx = await getUserContext();
  if (!ctx) return error("Sign in to save exercise progress", 401);
  if (!planAtLeast(ctx.plan, exerciseMinPlan(ex))) return error("Hard challenges require the Pro plan", 403, { upgrade: true });

  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);

  if (!body.passed) {
    await admin.rpc("record_failed_submission", { p_user: ctx.user.id, p_ref: ex.id, p_code: body.code });
    return json({ recorded: true, xp: 0 });
  }

  if (ctx.plan === "FREE") {
    const today = new Date().toISOString().slice(0, 10);
    const { data: day } = await admin.from("daily_activity").select("exercises_completed").eq("user_id", ctx.user.id).eq("activity_date", today).maybeSingle();
    const { count } = await admin.from("exercise_submissions").select("id", { count: "exact", head: true }).eq("user_id", ctx.user.id).eq("exercise_id", ex.id).eq("passed", true);
    if (!count && (day?.exercises_completed ?? 0) >= FREE_DAILY_EXERCISE_LIMIT) {
      return error(`Free plan credits ${FREE_DAILY_EXERCISE_LIMIT} new exercises per day. Your code still works — come back tomorrow or upgrade to Pro.`, 429, { limit: true });
    }
  }

  const { data, error: e } = await admin.rpc("award_activity", {
    p_user: ctx.user.id,
    p_kind: "exercise",
    p_ref: ex.id,
    p_xp: XP_RULES.exercise[ex.difficulty],
    p_code: body.code,
  });
  if (e) return error("Could not save progress. Please try again.", 500);
  return json({ award: data });
}
