import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/**
 * Test INPUTS for a problem the user can read. Expected outputs never leave the
 * server: the browser runs the code on these inputs and /api/arena/submit grades it.
 */
export async function GET(req: Request) {
  const ctx = await getUserContext();
  if (!ctx) return error("Sign in to submit solutions.", 401, { signIn: true });
  const id = Number(new URL(req.url).searchParams.get("problem"));
  if (!Number.isInteger(id)) return error("Bad problem id");
  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
  const { data: banned } = await admin.rpc("is_banned", { p_user: ctx.user.id });
  if (banned) return error("Your account is suspended.", 403);
  // Read through the user's own session, so hidden problems stay hidden.
  const { data: problem } = await ctx.supabase.from("problems").select("id, time_limit_ms").eq("id", id).maybeSingle();
  if (!problem) return error("Problem not found", 404);
  const { data: tests, error: e } = await admin.from("problem_tests").select("input").eq("problem_id", id).order("idx");
  if (e) return error("Could not load tests", 500);
  return json({ timeLimitMs: problem.time_limit_ms, inputs: (tests ?? []).map((t) => t.input) });
}
