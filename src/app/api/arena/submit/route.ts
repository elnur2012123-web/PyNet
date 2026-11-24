import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { sameOutput, type Verdict } from "@/lib/arena/verdict";
import { contestPhase, type ContestRow } from "@/lib/server/arena";

export const dynamic = "force-dynamic";

interface TestRun { stdout?: unknown; error?: unknown; timedOut?: unknown; ms?: unknown }
const SYNTAX = new Set(["SyntaxError", "IndentationError", "TabError", "CompilationError"]);

export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const ctx = await getUserContext();
  if (!ctx) return error("Sign in to submit solutions.", 401, { signIn: true });
  const body = await readJson<{ problemId?: unknown; contestId?: unknown; code?: unknown; results?: unknown; language?: unknown }>(req, 4_000_000);
  if (!body) return error("Request too large or invalid");
  const problemId = Number(body.problemId);
  const code = typeof body.code === "string" ? body.code : "";
  if (!Number.isInteger(problemId)) return error("Bad problem id");
  if (!code.trim() || code.length > 65536) return error("Code must be between 1 and 65 536 characters.");
  if (!Array.isArray(body.results)) return error("Missing test results");
  const language = body.language === "cpp" ? "cpp" : "python";

  const burst = rateLimit(`submit:${ctx.user.id}`, 1, 4_000);
  const hourly = rateLimit(`submit-h:${ctx.user.id}`, 60, 3_600_000);
  if (!burst.ok || !hourly.ok) return error(`Please wait ${Math.max(burst.retryAfter, hourly.retryAfter)}s before submitting again.`, 429);

  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
  const { data: banned } = await admin.rpc("is_banned", { p_user: ctx.user.id });
  if (banned) return error("Your account is suspended.", 403);

  const { data: problem } = await ctx.supabase.from("problems").select("id, rating, time_limit_ms").eq("id", problemId).maybeSingle();
  if (!problem) return error("Problem not found", 404);
  const { data: tests } = await admin.from("problem_tests").select("expected").eq("problem_id", problemId).order("idx");
  const expected = (tests ?? []).map((t) => t.expected as string);
  if (!expected.length) return error("This problem has no tests yet.", 500);

  // ---- grade: first failing test decides the verdict
  const results = body.results as TestRun[];
  let verdict: Verdict = "OK";
  let failedTest: number | null = null;
  let timeMs = 0;
  for (let i = 0; i < expected.length; i++) {
    const r = results[i];
    if (!r) return error("Some tests were not run. Please submit again.");
    const ce = r.error && typeof r.error === "object" && (r.error as { type?: unknown }).type === "CompilationError";
    if (ce) { verdict = "CE"; failedTest = null; break; }
    timeMs = Math.max(timeMs, Math.min(60_000, Math.round(Number(r.ms) || 0)));
    const errType = r.error && typeof r.error === "object" ? String((r.error as { type?: unknown }).type ?? "Error") : null;
    if (r.timedOut || Number(r.ms) > problem.time_limit_ms) { verdict = "TLE"; failedTest = i + 1; break; }
    if (errType) { verdict = SYNTAX.has(errType) ? "CE" : "RE"; failedTest = i + 1; break; }
    if (typeof r.stdout !== "string" || !sameOutput(r.stdout, expected[i])) { verdict = "WA"; failedTest = i + 1; break; }
  }

  // ---- contest attempt? (only while the round is running and the problem belongs to it)
  let contestId: number | null = null;
  if (body.contestId !== undefined && body.contestId !== null) {
    const cid = Number(body.contestId);
    const { data: c } = await admin.from("contests").select("id, starts_at, duration_minutes").eq("id", cid).maybeSingle();
    const { data: cp } = await admin.from("contest_problems").select("letter").eq("contest_id", cid).eq("problem_id", problemId).maybeSingle();
    if (c && cp && contestPhase(c as ContestRow) === "running") {
      contestId = cid;
      await admin.from("contest_registrations").upsert({ contest_id: cid, user_id: ctx.user.id }, { onConflict: "contest_id,user_id", ignoreDuplicates: true });
    }
  }

  const { data: sub, error: e } = await admin.from("submissions").insert({
    user_id: ctx.user.id, problem_id: problemId, contest_id: contestId, code, verdict, language,
    failed_test: failedTest, tests_total: expected.length, time_ms: timeMs,
  }).select("id").single();
  if (e || !sub) return error("Could not save the submission.", 500);

  let xp = 0;
  let achievements: unknown[] = [];
  if (verdict === "OK") {
    const { data } = await admin.rpc("award_activity", {
      p_user: ctx.user.id, p_kind: "exercise", p_ref: `problem-${problemId}`,
      p_xp: Math.min(200, Math.round(problem.rating / 40)), p_code: code.slice(0, 20000),
    });
    xp = Number(data?.xp ?? 0);
    achievements = data?.achievements ?? [];
  }
  return json({ id: sub.id, verdict, failedTest, testsTotal: expected.length, timeMs, contestId, xp, achievements });
}
