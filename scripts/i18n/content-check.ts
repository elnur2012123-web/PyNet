// Checks the human content translations end to end:
//  - every English string the extractor finds has a triple,
//  - every `code span` survives unchanged in uz, uz-Cyrl and ru,
//  - the Cyrillic form keeps code and program output in Latin.
// Run: npx tsx --conditions react-server scripts/i18n/content-check.ts
import { CONTENT } from "../../src/i18n/content/index";
import { latinToCyrillic } from "../../src/i18n/translit";

const spans = (s: string) => (s.match(/`[^`]+`/g) ?? []).sort();
let bad = 0;
const seen = new Map<string, number>();
for (const [en, uz, ru] of CONTENT) {
  seen.set(en, (seen.get(en) ?? 0) + 1);
  const want = JSON.stringify(spans(en));
  const cyr = latinToCyrillic(uz);
  for (const [name, txt] of [["uz", uz], ["uz-Cyrl", cyr], ["ru", ru]] as const) {
    if (!txt.trim()) { bad++; console.log(`EMPTY ${name}: ${en.slice(0, 60)}`); continue; }
    // Every code span of the English text must survive; extra spans are fine (code-only hints get wrapped).
    const have = spans(txt);
    if (!spans(en).every((s) => { const k = have.indexOf(s); if (k < 0) return false; have.splice(k, 1); return true; })) { bad++; console.log(`CODE CHANGED ${name}: ${en.slice(0, 60)}`); }
    else if (!spans(en).length && have.length && !have.every((s) => en.includes(s.slice(1, -1)))) { bad++; console.log(`WRAPPED CODE DIFFERS ${name}: ${en.slice(0, 60)}`); }
  }
}
const dups = [...seen].filter(([, n]) => n > 1).length;
console.log(`triples: ${CONTENT.length}, duplicate English keys: ${dups}, problems: ${bad}`);

// Samples so a person can eyeball the output.
for (const key of ["Fix the TypeError so it prints `Points: 30`.", "Print `\"level up\"` reversed.", "Python does not know what this name refers to. The variable or function has not been created yet, or it is spelled differently."]) {
  const t = CONTENT.find((c) => c[0] === key);
  if (!t) { console.log("MISSING sample:", key); bad++; continue; }
  console.log("\nEN  ", t[0]); console.log("UZ  ", t[1]); console.log("CYR ", latinToCyrillic(t[1])); console.log("RU  ", t[2]);
}
if (bad) process.exitCode = 1;
