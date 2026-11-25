import { getStaff } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const LETTERS = "ABCDEFGHIJ";
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Staff tools for the Arena: create rounds, delete unstarted rounds, add problems. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const staff = await getStaff();
  if (!staff) return error("Staff only", 403);
  const { admin, user } = staff;
  const body = await readJson<Record<string, unknown>>(req, 3_000_000);
  if (!body) return error("Invalid request");

  const need = body.action === "create_problem" ? "create_problems" : "host_contests";
  if (!staff.can(need)) return error(need === "create_problems" ? "Your role can't create problems." : "Your role can't host contests.", 403);

  if (body.action === "create_contest") {
    const title = str(body.title, 100).trim();
    const starts = new Date(String(body.startsAt));
    const duration = Number(body.durationMinutes);
    const problems = Array.isArray(body.problems) ? body.problems.map(Number).filter(Number.isInteger) : [];
    if (title.length < 3) return error("Give the round a title.");
    if (isNaN(starts.getTime()) || starts.getTime() < Date.now() + 60_000) return error("The start time must be in the future.");
    if (!(duration >= 10 && duration <= 10080)) return error("Duration must be between 10 minutes and 7 days.");
    if (problems.length < 1 || problems.length > 10 || new Set(problems).size !== problems.length) return error("Pick 1–10 different problems.");
    const { count } = await admin.from("problems").select("id", { count: "exact", head: true }).in("id", problems);
    if (count !== problems.length) return error("Some problems don't exist.");
    const { data: c, error: e } = await admin.from("contests").insert({
      title, description: str(body.description, 4000), starts_at: starts.toISOString(), duration_minutes: duration,
      rated: body.rated !== false, created_by: user.id,
      division: ["hatchling", "fledgling", "soaring"].includes(String(body.division)) ? body.division : "soaring",
    }).select("id").single();
    if (e || !c) return error("Could not create the round.", 500);
    const { error: e2 } = await admin.from("contest_problems").insert(problems.map((pid, i) => ({ contest_id: c.id, letter: LETTERS[i], problem_id: pid })));
    if (e2) { await admin.from("contests").delete().eq("id", c.id); return error("Could not add the problems.", 500); }
    await admin.from("moderation_log").insert({ actor_id: user.id, action: "contest_create", details: `#${c.id} ${title}` }).then(() => null, () => null);
    return json({ id: c.id });
  }

  if (body.action === "delete_contest") {
    const id = Number(body.id);
    const { data: c } = await admin.from("contests").select("starts_at").eq("id", id).maybeSingle();
    if (!c) return error("Round not found", 404);
    if (new Date(c.starts_at).getTime() <= Date.now()) return error("A round that has started can't be deleted.");
    await admin.from("contests").delete().eq("id", id);
    return json({ ok: true });
  }

  if (body.action === "create_problem") {
    const title = str(body.title, 80).trim();
    const rating = Number(body.rating);
    const tl = Number(body.timeLimitMs ?? 2000);
    const examples = Array.isArray(body.examples) ? body.examples : [];
    const tests = Array.isArray(body.tests) ? body.tests : [];
    if (title.length < 3) return error("Title is too short.");
    if (!str(body.statement, 8000).trim()) return error("Write a statement.");
    if (!(rating >= 800 && rating <= 3500 && rating % 100 === 0)) return error("Difficulty must be 800–3500 in steps of 100.");
    if (!(tl >= 500 && tl <= 10000)) return error("Time limit must be 500–10000 ms.");
    const cleanTests = tests.slice(0, 100).map((t) => ({ input: str((t as { input?: unknown }).input, 200000), expected: str((t as { expected?: unknown }).expected, 200000) }));
    if (cleanTests.length < 1) return error("Add at least one test.");
    const tags = Array.isArray(body.tags) ? body.tags.map((t) => str(t, 30).trim().toLowerCase()).filter(Boolean).slice(0, 8) : [];
    const { data: p, error: e } = await admin.from("problems").insert({
      title, statement: str(body.statement, 8000), input_spec: str(body.inputSpec, 3000), output_spec: str(body.outputSpec, 3000),
      notes: str(body.notes, 3000), tags, rating, time_limit_ms: tl, visibility: body.visibility === "public" ? "public" : "hidden",
      examples: examples.slice(0, 5).map((x) => ({ input: str((x as { input?: unknown }).input, 3000), output: str((x as { output?: unknown }).output, 3000) })),
      author_id: user.id,
    }).select("id").single();
    if (e || !p) return error("Could not save the problem.", 500);
    const { error: e2 } = await admin.from("problem_tests").insert(cleanTests.map((t, i) => ({ problem_id: p.id, idx: i + 1, ...t })));
    if (e2) { await admin.from("problems").delete().eq("id", p.id); return error("Could not save the tests.", 500); }
    return json({ id: p.id });
  }

  return error("Unknown action");
}
