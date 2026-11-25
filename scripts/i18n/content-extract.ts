/**
 * Lists learning-content strings that still need a human translation, grouped
 * (m01…m15, exercises, errors, problems), into scripts/i18n/content-todo/<group>.json.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { MODULES } from "../../src/content/curriculum";
import { MODULE_QUIZZES } from "../../src/content/quizzes";
import { EXERCISES } from "../../src/content/exercises";
import { PY_ERRORS } from "../../src/content/errors";
import { PROBLEMS } from "../problems/data";
import { CONTENT } from "../../src/i18n/content/index";

const have = new Set(CONTENT.map((t) => t[0]));
const codeish = (s: string) =>
  /^[\s\S]*(\w\(|\)$|=|\[|\]|\{|\}|^["'`]|["']$|^\d[\d\s.,-]*$|Error\b|^#|->|\\n|^[a-z_]+$|^[A-Z_]+$|\btrue\b|\bfalse\b|True|False|None)/.test(s.trim()) && !/\s[a-z]{3,}\s[a-z]{3,}\s/.test(s);
const groups: Record<string, Set<string>> = {};
const add = (g: string, s?: string | null) => { if (s && /[A-Za-z]{2}/.test(s) && !have.has(s)) (groups[g] ??= new Set()).add(s); };
type Q = { q: string; options?: string[]; explain?: string; type?: string };
const mcq = (g: string, q: Q) => { add(g, q.q); add(g, q.explain); if (q.options && q.type !== "output") q.options.forEach((o) => { if (!codeish(o)) add(g, o); }); };

for (const m of MODULES) {
  const g = `m${String(m.number).padStart(2, "0")}`;
  for (const l of m.lessons) {
    add(g, l.intro); add(g, l.realWorld);
    l.examples.forEach((e) => { add(g, e.title); add(g, e.note); });
    l.mistakes.forEach((x) => add(g, x.why));
    l.practice.forEach((p) => { add(g, p.prompt); add(g, p.hint); });
    l.quiz.forEach((q) => mcq(g, q));
  }
  MODULE_QUIZZES.find((q) => q.moduleId === m.id)?.questions.forEach((q) => mcq(g, q as Q));
}
EXERCISES.forEach((e) => { add("exercises", e.description); e.constraints?.forEach((c) => add("exercises", c)); e.hints.forEach((h) => add("exercises", h)); add("exercises", e.explanation); });
PY_ERRORS.forEach((e) => { add("errors", e.meaning); e.why.forEach((w) => add("errors", w)); e.prevent.forEach((w) => add("errors", w)); add("errors", e.exercise.prompt); add("errors", e.exercise.hint); e.quiz.forEach((q) => mcq("errors", q)); });
PROBLEMS.forEach((p) => { add("problems", p.title); add("problems", p.statement); add("problems", p.input); add("problems", p.output); add("problems", p.notes); });

mkdirSync("scripts/i18n/content-todo", { recursive: true });
let total = 0;
for (const [g, set] of Object.entries(groups)) {
  const list = [...set];
  total += list.reduce((a, s) => a + s.split(/\s+/).length, 0);
  writeFileSync(`scripts/i18n/content-todo/${g}.json`, JSON.stringify(list, null, 1));
  console.log(g.padEnd(10), list.length, "strings,", list.reduce((a, s) => a + s.split(/\s+/).length, 0), "words");
}
console.log("total words", total);
