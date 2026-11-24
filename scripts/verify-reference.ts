/** Runs every PyBuddy reference example in real Python and checks its printed output. */
import { loadPyodide } from "pyodide";
import { REFERENCE_ITEMS } from "../src/lib/tutor/reference";

const norm = (s: string) => s.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
(async () => {
  const py = await loadPyodide();
  let out = "";
  py.setStdout({ write: (b: Uint8Array) => { out += new TextDecoder().decode(b); return b.length; } });
  let fails = 0, n = 0;
  for (const r of REFERENCE_ITEMS) {
    if (!r.code || r.output === undefined) continue;
    n++; out = "";
    const ns = py.globals.get("dict")();
    try { py.runPython(r.code, { globals: ns }); } catch (e) { out += `\n!! ${String((e as Error).message).split("\n").filter(Boolean).pop()}`; }
    ns.destroy();
    if (norm(out) !== norm(r.output)) { fails++; console.log(`✗ ${r.id}\n  expected: ${JSON.stringify(norm(r.output))}\n  actual:   ${JSON.stringify(norm(out))}`); }
  }
  console.log(`${REFERENCE_ITEMS.length} reference items, ${n} examples checked, ${fails} failures`);
  process.exit(fails ? 1 : 0);
})();
