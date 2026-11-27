import { getStaff } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

const LETTERS = "ABCDEFGHIJ";
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const LANGS = ["en", "uz", "uz-Cyrl", "ru"] as const;
type Lang = (typeof LANGS)[number];
const asLang = (v: unknown): Lang => (LANGS.includes(v as Lang) ? (v as Lang) : "en");

/** Versions of the problem in other languages, as typed in the admin form. */
function cleanTranslations(v: unknown, base: Lang) {
  const list = Array.isArray(v) ? v : [];
  const seen = new Set<string>();
  const out: { locale: Lang; title: string; statement: string; input_spec: string; output_spec: string; notes: string }[] = [];
  for (const t of list as Record<string, unknown>[]) {
    const locale = asLang(t?.locale);
    if (locale === base || seen.has(locale) || !LANGS.includes(t?.locale as Lang)) continue;
    const title = str(t.title, 80).trim();
    if (!title) continue;
    seen.add(locale);
    out.push({ locale, title, statement: str(t.statement, 8000), input_spec: str(t.inputSpec, 3000), output_spec: str(t.outputSpec, 3000), notes: str(t.notes, 3000) });
  }
  return out;
}
const LANG_NAMES: Record<Lang, string> = { en: "English", uz: "Oʻzbekcha", "uz-Cyrl": "Ўзбекча", ru: "Русский" };

function cleanTests(v: unknown) {
  return (Array.isArray(v) ? v : []).slice(0, 100).map((t) => ({ input: str((t as { input?: unknown }).input, 200000), expected: str((t as { expected?: unknown }).expected, 200000) }));
}
function cleanExamples(v: unknown) {
  return (Array.isArray(v) ? v : []).slice(0, 5).map((x) => ({ input: str((x as { input?: unknown }).input, 3000), output: str((x as { output?: unknown }).output, 3000) }));
}
const cleanTags = (v: unknown) => (Array.isArray(v) ? v.map((t) => str(t, 30).trim().toLowerCase()).filter(Boolean).slice(0, 8) : []);

/** Staff tools for the Arena: create rounds, delete unstarted rounds, add problems. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const staff = await getStaff();
  if (!staff) return error("Staff only", 403);
  const { admin, user } = staff;
  const body = await readJson<Record<string, unknown>>(req, 3_000_000);
  if (!body) return error("Invalid request");

  const need = body.action === "create_problem" ? "create_problems"
    : body.action === "get_problem" || body.action === "update_problem" ? "edit_problems" : "host_contests";
  if (!staff.can(need)) return error(need === "create_problems" ? "Your role can't create problems." : need === "edit_problems" ? "Your role can't edit problems." : "Your role can't host contests.", 403);

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

  if (body.action === "update_contest") {
    const id = Number(body.id);
    const { data: c } = await admin.from("contests").select("id, title, starts_at, duration_minutes, rated, rating_applied, division").eq("id", id).maybeSingle();
    if (!c) return error("Round not found", 404);
    const now = Date.now();
    const oldStart = new Date(c.starts_at).getTime();
    const started = oldStart <= now;
    const ended = oldStart + c.duration_minutes * 60_000 <= now;

    const title = str(body.title, 100).trim();
    if (title.length < 3) return error("Give the round a title.");
    const patch: Record<string, unknown> = { title, description: str(body.description, 4000) };
    const changes: string[] = [];
    if (title !== c.title) changes.push("title");

    let problems: number[] | null = null;
    if (!started) {
      // Not started yet: everything can change.
      const starts = new Date(String(body.startsAt));
      const duration = Number(body.durationMinutes);
      if (isNaN(starts.getTime()) || starts.getTime() < now + 60_000) return error("The start time must be in the future.");
      if (!(duration >= 10 && duration <= 10080)) return error("Duration must be between 10 minutes and 7 days.");
      problems = Array.isArray(body.problems) ? body.problems.map(Number).filter(Number.isInteger) : [];
      if (problems.length < 1 || problems.length > 10 || new Set(problems).size !== problems.length) return error("Pick 1–10 different problems.");
      const { count } = await admin.from("problems").select("id", { count: "exact", head: true }).in("id", problems);
      if (count !== problems.length) return error("Some problems don't exist.");
      Object.assign(patch, {
        starts_at: starts.toISOString(), duration_minutes: duration, rated: body.rated !== false,
        division: ["hatchling", "fledgling", "soaring"].includes(String(body.division)) ? body.division : c.division,
      });
      if (starts.getTime() !== oldStart) changes.push("start");
      if (duration !== c.duration_minutes) changes.push("length");
    } else if (!ended) {
      // Running: only the length can change, and the round must still end in the future.
      const duration = Number(body.durationMinutes);
      if (!(duration >= 10 && duration <= 10080)) return error("Duration must be between 10 minutes and 7 days.");
      if (oldStart + duration * 60_000 <= now + 60_000) return error("The round is running: the new length must end at least a minute from now.");
      patch.duration_minutes = duration;
      if (duration !== c.duration_minutes) changes.push("length");
    }
    // Ended: only the title and description change.

    const { error: e } = await admin.from("contests").update(patch).eq("id", id);
    if (e) return error("Could not save the round.", 500);
    if (problems) {
      const { data: oldProblems } = await admin.from("contest_problems").select("letter, problem_id").eq("contest_id", id).order("letter");
      const same = (oldProblems ?? []).map((r) => r.problem_id).join(",") === problems.join(",");
      if (!same) {
        await admin.from("contest_problems").delete().eq("contest_id", id);
        const { error: e2 } = await admin.from("contest_problems").insert(problems.map((pid, i) => ({ contest_id: id, letter: LETTERS[i], problem_id: pid })));
        if (e2) {
          if (oldProblems?.length) await admin.from("contest_problems").insert(oldProblems.map((r) => ({ contest_id: id, ...r })));
          return error("Could not change the problems.", 500);
        }
        changes.push("problems");
      }
    }
    await admin.from("moderation_log").insert({ actor_id: user.id, action: "contest_edit", details: `#${id} ${title}${changes.length ? ` (${changes.join(", ")})` : ""}` }).then(() => null, () => null);
    return json({ id, phase: !started ? "upcoming" : !ended ? "running" : "ended" });
  }

  if (body.action === "delete_contest") {
    const id = Number(body.id);
    const { data: c } = await admin.from("contests").select("starts_at").eq("id", id).maybeSingle();
    if (!c) return error("Round not found", 404);
    if (new Date(c.starts_at).getTime() <= Date.now()) return error("A round that has started can't be deleted.");
    await admin.from("contests").delete().eq("id", id);
    return json({ ok: true });
  }

  if (body.action === "create_problem" || body.action === "update_problem") {
    const editing = body.action === "update_problem";
    const id = Number(body.id);
    const title = str(body.title, 80).trim();
    const rating = Number(body.rating);
    const tl = Number(body.timeLimitMs ?? 2000);
    const lang = asLang(body.lang);
    if (title.length < 3) return error("Title is too short.");
    if (!str(body.statement, 8000).trim()) return error("Write a statement.");
    if (!(rating >= 800 && rating <= 3500 && rating % 100 === 0)) return error("Difficulty must be 800–3500 in steps of 100.");
    if (!(tl >= 500 && tl <= 10000)) return error("Time limit must be 500–10000 ms.");
    const translations = cleanTranslations(body.translations, lang);
    const tests = cleanTests(body.tests);
    const replaceTests = !editing || tests.length > 0;
    if (replaceTests && tests.length < 1) return error("Add at least one test.");
    const row: Record<string, unknown> = {
      title, statement: str(body.statement, 8000), input_spec: str(body.inputSpec, 3000), output_spec: str(body.outputSpec, 3000),
      notes: str(body.notes, 3000), tags: cleanTags(body.tags), rating, time_limit_ms: tl, visibility: body.visibility === "public" ? "public" : "hidden",
    };
    if (replaceTests) row.examples = cleanExamples(body.examples);

    let pid: number;
    if (editing) {
      const { data: old } = await admin.from("problems").select("id, title").eq("id", id).maybeSingle();
      if (!old) return error("Problem not found", 404);
      const { error: e } = await admin.from("problems").update({ ...row, lang, updated_at: new Date().toISOString(), updated_by: user.id }).eq("id", id);
      if (e) return error(/lang|updated_/.test(e.message) ? "Run migration 0020_problem_languages.sql first." : "Could not save the problem.", 500);
      pid = id;
      if (replaceTests) {
        await admin.from("problem_tests").delete().eq("problem_id", pid);
        const { error: e2 } = await admin.from("problem_tests").insert(tests.map((t, i) => ({ problem_id: pid, idx: i + 1, ...t })));
        if (e2) return error("The text was saved, but the tests could not be. Try saving again.", 500);
      }
    } else {
      let ins = await admin.from("problems").insert({ ...row, lang, author_id: user.id }).select("id").single();
      if (ins.error && /lang/.test(ins.error.message)) {
        if (lang !== "en" || translations.length) return error("Run migration 0020_problem_languages.sql first to save problems in other languages.", 500);
        ins = await admin.from("problems").insert({ ...row, author_id: user.id }).select("id").single();
      }
      if (ins.error || !ins.data) return error("Could not save the problem.", 500);
      pid = ins.data.id;
      const { error: e2 } = await admin.from("problem_tests").insert(tests.map((t, i) => ({ problem_id: pid, idx: i + 1, ...t })));
      if (e2) { await admin.from("problems").delete().eq("id", pid); return error("Could not save the tests.", 500); }
    }

    // Languages: keep exactly the versions sent with the form.
    const keep = translations.map((t) => t.locale);
    const del = admin.from("problem_translations").delete().eq("problem_id", pid);
    await (keep.length ? del.not("locale", "in", `(${keep.map((k) => `"${k}"`).join(",")})`) : del);
    if (translations.length) {
      const { error: e3 } = await admin.from("problem_translations").upsert(translations.map((t) => ({ problem_id: pid, ...t, updated_at: new Date().toISOString(), updated_by: user.id })));
      if (e3) return error("The problem was saved, but its other languages could not be. Run migration 0020_problem_languages.sql and save again.", 500);
    }
    await admin.from("moderation_log").insert({
      actor_id: user.id, action: editing ? "problem_edit" : "problem_create",
      details: `#${pid} ${title} [${[lang, ...keep].map((l) => LANG_NAMES[l]).join(", ")}]${editing && replaceTests ? `, ${tests.length} new tests` : ""}`,
    }).then(() => null, () => null);
    return json({ id: pid, tests: replaceTests ? tests.length : null });
  }

  if (body.action === "get_problem") {
    const id = Number(body.id);
    const { data: p } = await admin.from("problems").select("*").eq("id", id).maybeSingle();
    if (!p) return error("Problem not found", 404);
    const [{ data: tr }, { count }] = await Promise.all([
      admin.from("problem_translations").select("locale, title, statement, input_spec, output_spec, notes").eq("problem_id", id),
      admin.from("problem_tests").select("idx", { count: "exact", head: true }).eq("problem_id", id),
    ]);
    return json({ problem: { ...p, lang: p.lang ?? "en" }, translations: tr ?? [], testCount: count ?? 0 });
  }

  return error("Unknown action");
}
