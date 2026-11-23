/**
 * Runs every reference solution in the course against its automatic tests
 * using the real Pyodide runtime, and checks quiz answer keys are valid.
 *   npm run test:content
 */
import { loadPyodide } from "pyodide";
import { MODULES } from "../src/content/curriculum";
import { EXERCISES } from "../src/content/exercises";
import { PY_ERRORS } from "../src/content/errors";
import { MODULE_QUIZZES } from "../src/content/quizzes";
import type { McqQuestion, TestCase } from "../src/content/types";

const norm = (s: string) => s.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");

async function main() {
  const py = await loadPyodide();
  let buf = "";
  py.setStdout({ write: (b: Uint8Array) => { buf += new TextDecoder().decode(b); return b.length; } });
  py.setStderr({ write: (b: Uint8Array) => b.length });
  py.runPython(`
import builtins
_q = []
def _inp(prompt=""):
    if not _q: raise EOFError("no input")
    return _q.pop(0)
builtins.input = _inp
def _set(v):
    _q.clear(); _q.extend(v)
`);
  const set = py.globals.get("_set");
  let fails = 0, count = 0;

  const run = (code: string, t: TestCase) => {
    buf = "";
    set(py.toPy(t.input ?? []));
    const ns = py.globals.get("dict")();
    ns.set("__name__", "__main__");
    let err = "";
    try { py.runPython(code + (t.append ? "\n" + t.append : ""), { globals: ns }); }
    catch (e) { err = String((e as Error).message).split("\n").filter(Boolean).pop() ?? "error"; }
    ns.destroy();
    return { out: norm(buf), err };
  };
  const check = (label: string, code: string, tests: TestCase[]) => {
    for (const [i, t] of tests.entries()) {
      count++;
      const r = run(code, t);
      if (r.err || r.out !== norm(t.expected)) {
        fails++;
        console.log(`✗ ${label} test#${i + 1}\n  expected: ${JSON.stringify(norm(t.expected))}\n  actual:   ${JSON.stringify(r.out)} ${r.err}`);
      }
    }
  };
  const checkMcq = (label: string, qs: McqQuestion[]) => {
    for (const q of qs) if (q.answer < 0 || q.answer >= q.options.length) { fails++; console.log(`✗ ${label} bad answer index: ${q.q}`); }
  };

  const ids = new Set<string>();
  let lessons = 0;
  for (const m of MODULES) {
    for (const l of m.lessons) {
      lessons++;
      if (ids.has(l.id)) { fails++; console.log(`✗ duplicate id ${l.id}`); }
      ids.add(l.id);
      if (l.practice.length < 3) { fails++; console.log(`✗ ${l.id} has < 3 practice tasks`); }
      if (l.quiz.length < 2) { fails++; console.log(`✗ ${l.id} has < 2 quiz questions`); }
      l.practice.forEach((p, i) => check(`${l.id} practice#${i + 1}`, p.solution, p.tests));
      checkMcq(l.id, l.quiz);
    }
  }
  for (const e of EXERCISES) check(`exercise ${e.id}`, e.solution, e.tests);
  for (const e of PY_ERRORS) { check(`error ${e.slug}`, e.exercise.solution, e.exercise.tests); checkMcq(e.slug, e.quiz);
    // the "bad" example must actually raise the named error (except logic examples)
    buf = ""; const ns = py.globals.get("dict")();
    try { py.runPython(e.badCode, { globals: ns }); fails++; console.log(`✗ error ${e.slug}: badCode did not raise`); }
    catch (err) { if (!String((err as Error).message).includes(e.name)) { fails++; console.log(`✗ error ${e.slug}: raised something else: ${String((err as Error).message).split("\n").filter(Boolean).pop()}`); } }
    ns.destroy();
    buf = ""; const ns2 = py.globals.get("dict")();
    try { py.runPython(e.fixedCode, { globals: ns2 }); } catch (err) { if (!e.fixedCode.includes("try")) { fails++; console.log(`✗ error ${e.slug}: fixedCode raised`); } }
    ns2.destroy();
  }
  for (const q of MODULE_QUIZZES) {
    q.questions.forEach((qq, i) => {
      if (qq.type === "code") check(`quiz ${q.moduleId} q${i + 1}`, qq.solution, qq.tests);
      else if (qq.type !== "blank") checkMcq(`quiz ${q.moduleId}`, [qq]);
    });
  }
  console.log(`\n${MODULES.length} modules, ${lessons} lessons, ${EXERCISES.length} exercises, ${PY_ERRORS.length} errors, ${MODULE_QUIZZES.length} quizzes`);
  console.log(`${count} tests run, ${fails} failures`);
  process.exit(fails ? 1 : 0);
}
main();
