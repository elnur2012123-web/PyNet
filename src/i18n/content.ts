import "server-only";
import { createHash } from "node:crypto";
import type { Locale } from "./locales";
import { latinToCyrillic } from "./translit";
import { CONTENT } from "./content/index";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { machineTranslate, mtProvider } from "@/lib/server/mt";

const UZ = new Map<string, string>(), RU = new Map<string, string>();
/** Text typed into forms picks up stray spaces, Windows line breaks and curly quotes; match it anyway. */
const norm = (s: string) => s.replace(/\r\n?/g, "\n").replace(/[ \t\u00a0]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[‘’]/g, "'").trim();
for (const [en, uz, ru] of CONTENT) { if (uz) UZ.set(norm(en), uz); if (ru) RU.set(norm(en), ru); }

/** Whole text first; otherwise paragraph by paragraph (a statement may mix known and new paragraphs). */
function humanLookup(dict: Map<string, string>, text: string): string | undefined {
  const whole = dict.get(norm(text));
  if (whole) return whole;
  const paras = norm(text).split(/\n\n/);
  if (paras.length < 2) return undefined;
  const out = paras.map((p) => dict.get(p));
  return out.every(Boolean) ? out.join("\n\n") : undefined;
}

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
/** Program output / code shown as an answer option must never be translated. */
export const looksLikeCode = (s: string) =>
  /^[\s\S]*(\w\(|\)$|=|\[|\]|\{|\}|^["'`]|["']$|^\d[\d\s.,-]*$|Error\b|^#|->|\\n|^[a-z_]+$|^[A-Z_]+$|\btrue\b|\bfalse\b|True|False|None)/.test(s.trim()) && !/\s[a-z]{3,}\s[a-z]{3,}\s/.test(s);

/**
 * Translate many English strings at once. Order: shipped human translations →
 * database cache → machine translation (if configured, then cached) → English.
 */
export async function translateTexts(locale: Locale, texts: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (locale === "en") { texts.forEach((t) => out.set(t, t)); return out; }
  const base = locale === "ru" ? "ru" : "uz";
  const dict = base === "ru" ? RU : UZ;
  const missing: string[] = [];
  for (const t of new Set(texts)) {
    if (!t || !/[A-Za-z]/.test(t)) { out.set(t, t); continue; }
    const hit = humanLookup(dict, t);
    if (hit) out.set(t, hit); else missing.push(t);
  }
  if (missing.length) {
    const admin = getAdminSupabase();
    const hashes = new Map(missing.map((t) => [sha(t), t]));
    if (admin) {
      const { data } = await admin.from("content_translations").select("hash, translation").eq("locale", base).in("hash", [...hashes.keys()]);
      for (const r of (data ?? []) as { hash: string; translation: string }[]) {
        const src = hashes.get(r.hash);
        if (src) { out.set(src, r.translation); hashes.delete(r.hash); }
      }
    }
    const still = [...hashes.values()];
    if (still.length && mtProvider() !== "none") {
      const res = await machineTranslate(still, base);
      const rows: { hash: string; locale: string; source: string; translation: string; provider: string }[] = [];
      still.forEach((t, i) => {
        const tr = res[i];
        if (tr) { out.set(t, tr); rows.push({ hash: sha(t), locale: base, source: t, translation: tr, provider: mtProvider() }); }
      });
      if (admin && rows.length) await admin.from("content_translations").upsert(rows, { onConflict: "hash,locale", ignoreDuplicates: true });
    }
    for (const t of missing) if (!out.has(t)) out.set(t, t);
  }
  if (locale === "uz-Cyrl") for (const [k, v] of out) out.set(k, v === k ? v : latinToCyrillic(v));
  return out;
}

/** Collect strings → translate once → write back. `pick` lists the prose fields of an object. */
async function apply<T>(locale: Locale, items: T[], pick: (item: T, take: (s: string | undefined | null, set: (v: string) => void) => void) => void) {
  if (locale === "en") return;
  const jobs: { s: string; set: (v: string) => void }[] = [];
  for (const it of items) pick(it, (s, set) => { if (s) jobs.push({ s, set }); });
  const map = await translateTexts(locale, jobs.map((j) => j.s));
  for (const j of jobs) j.set(map.get(j.s) ?? j.s);
}

type Mcq = { q: string; options?: string[]; explain?: string; type?: string };
const mcqFields = (q: Mcq, take: (s: string | undefined | null, set: (v: string) => void) => void) => {
  take(q.q, (v) => { q.q = v; });
  if (q.explain !== undefined) take(q.explain, (v) => { q.explain = v; });
  if (q.options && q.type !== "output") q.options.forEach((o, i) => { if (!looksLikeCode(o)) take(o, (v) => { q.options![i] = v; }); });
};

export async function localizeLesson<L extends { intro: string; realWorld: string; examples: { title: string; note?: string }[]; mistakes: { why: string }[]; practice: { prompt: string; hint: string }[]; quiz: Mcq[] }>(locale: Locale, lesson: L): Promise<L> {
  const l = structuredClone(lesson);
  await apply(locale, [l], (x, take) => {
    take(x.intro, (v) => { x.intro = v; });
    take(x.realWorld, (v) => { x.realWorld = v; });
    x.examples.forEach((e) => { take(e.title, (v) => { e.title = v; }); take(e.note, (v) => { e.note = v; }); });
    x.mistakes.forEach((m) => take(m.why, (v) => { m.why = v; }));
    x.practice.forEach((p) => { take(p.prompt, (v) => { p.prompt = v; }); take(p.hint, (v) => { p.hint = v; }); });
    x.quiz.forEach((q) => mcqFields(q, take));
  });
  return l;
}

export async function localizeQuestions<Q extends Mcq>(locale: Locale, qs: Q[]): Promise<Q[]> {
  const copy = structuredClone(qs);
  await apply(locale, copy, (q, take) => mcqFields(q, take));
  return copy;
}

/** Graded answers: explanation and (prose) correct answer. */
export async function localizeGraded<G extends { explain: string; correctAnswer: string }>(locale: Locale, graded: G[]): Promise<G[]> {
  const copy = structuredClone(graded);
  await apply(locale, copy, (g, take) => {
    take(g.explain, (v) => { g.explain = v; });
    if (!looksLikeCode(g.correctAnswer)) take(g.correctAnswer, (v) => { g.correctAnswer = v; });
  });
  return copy;
}

export async function localizeExercise<E extends { description: string; constraints?: string[]; hints: string[]; explanation: string }>(locale: Locale, ex: E): Promise<E> {
  const e = structuredClone(ex);
  await apply(locale, [e], (x, take) => {
    take(x.description, (v) => { x.description = v; });
    x.constraints?.forEach((c, i) => take(c, (v) => { x.constraints![i] = v; }));
    x.hints.forEach((h, i) => take(h, (v) => { x.hints[i] = v; }));
    take(x.explanation, (v) => { x.explanation = v; });
  });
  return e;
}

export async function localizeError<E extends { summary: string; meaning: string; why: string[]; prevent: string[]; exercise: { prompt: string; hint: string }; quiz: Mcq[] }>(locale: Locale, err: E): Promise<E> {
  const e = structuredClone(err);
  await apply(locale, [e], (x, take) => {
    take(x.summary, (v) => { x.summary = v; });
    take(x.meaning, (v) => { x.meaning = v; });
    x.why.forEach((w, i) => take(w, (v) => { x.why[i] = v; }));
    x.prevent.forEach((w, i) => take(w, (v) => { x.prevent[i] = v; }));
    take(x.exercise.prompt, (v) => { x.exercise.prompt = v; });
    take(x.exercise.hint, (v) => { x.exercise.hint = v; });
    x.quiz.forEach((q) => mcqFields(q, take));
  });
  return e;
}

type ProblemText = { title: string; statement: string; input_spec: string; output_spec: string; notes: string };
const TEXT_FIELDS = ["title", "statement", "input_spec", "output_spec", "notes"] as const;
interface ProblemLangs { lang: Locale; tr: Partial<Record<Locale, ProblemText>> }

/** The language a problem was written in, plus the versions its author wrote in other languages. */
async function loadProblemLangs(ids: number[], titlesOnly = false): Promise<Map<number, ProblemLangs>> {
  const out = new Map<number, ProblemLangs>();
  const admin = getAdminSupabase();
  const uniq = [...new Set(ids)].filter(Number.isInteger);
  if (!admin || !uniq.length) return out;
  const [langs, trs] = await Promise.all([
    admin.from("problems").select("id, lang").in("id", uniq),
    admin.from("problem_translations").select(titlesOnly ? "problem_id, locale, title" : "problem_id, locale, title, statement, input_spec, output_spec, notes").in("problem_id", uniq),
  ]);
  if (langs.error) return out; // migration 0020 not run yet: everything is English
  for (const r of (langs.data ?? []) as { id: number; lang: Locale }[]) out.set(r.id, { lang: r.lang ?? "en", tr: {} });
  for (const r of (trs.data ?? []) as unknown as (ProblemText & { problem_id: number; locale: Locale })[]) {
    const info = out.get(r.problem_id);
    if (info) info.tr[r.locale] = { title: r.title, statement: r.statement ?? "", input_spec: r.input_spec ?? "", output_spec: r.output_spec ?? "", notes: r.notes ?? "" };
  }
  return out;
}

const fill = (t: ProblemText, base: ProblemText): ProblemText =>
  Object.fromEntries(TEXT_FIELDS.map((f) => [f, t[f]?.trim() ? t[f] : base[f]])) as ProblemText;
const toCyrillic = (t: ProblemText): ProblemText =>
  Object.fromEntries(TEXT_FIELDS.map((f) => [f, t[f] ? latinToCyrillic(t[f]) : t[f]])) as ProblemText;

/**
 * Which text a reader in `locale` sees:
 *  1. the author's own version in that language;
 *  2. the original, if it was written in that language;
 *  3. Uzbek Cyrillic is made from the Uzbek Latin version;
 *  4. English text (original or the author's English version) is translated automatically;
 *  5. otherwise the problem is shown in the language it was written in.
 */
export function pickProblemText(locale: Locale, base: ProblemText, info?: ProblemLangs): { text: ProblemText; translate: boolean } {
  if (!info) return { text: base, translate: locale !== "en" };
  const own = info.tr[locale];
  if (own) return { text: fill(own, base), translate: false };
  if (info.lang === locale) return { text: base, translate: false };
  if (locale === "uz-Cyrl") {
    const latin = info.tr.uz ? fill(info.tr.uz, base) : info.lang === "uz" ? base : null;
    if (latin) return { text: toCyrillic(latin), translate: false };
  }
  const english = info.lang === "en" ? base : info.tr.en ? fill(info.tr.en, base) : null;
  if (english) return { text: english, translate: locale !== "en" };
  return { text: base, translate: false };
}

export async function localizeProblem<P extends ProblemText & { id?: number }>(locale: Locale, p: P): Promise<P> {
  const info = typeof p.id === "number" ? (await loadProblemLangs([p.id])).get(p.id) : undefined;
  const picked = pickProblemText(locale, p, info);
  const x = { ...structuredClone(p), ...picked.text } as P;
  if (!picked.translate) return x;
  await apply(locale, [x], (o, take) => {
    for (const f of TEXT_FIELDS) take(o[f], (v) => { (o as ProblemText)[f] = v; });
  });
  return x;
}

/** Problem titles for lists (problemset, contests, status), by problem id. */
export async function localizeProblemTitles(locale: Locale, rows: { id: number; title: string }[]): Promise<Map<number, string>> {
  const out = new Map<number, string>();
  if (!rows.length) return out;
  const infos = await loadProblemLangs(rows.map((r) => r.id), true);
  const viaEnglish: { id: number; title: string }[] = [];
  for (const r of rows) {
    const base = { title: r.title, statement: "", input_spec: "", output_spec: "", notes: "" };
    const picked = pickProblemText(locale, base, infos.get(r.id));
    if (picked.translate) viaEnglish.push({ id: r.id, title: picked.text.title });
    else out.set(r.id, picked.text.title);
  }
  if (viaEnglish.length) {
    const tr = await translateTexts(locale, viaEnglish.map((r) => r.title));
    for (const r of viaEnglish) out.set(r.id, tr.get(r.title) ?? r.title);
  }
  return out;
}
