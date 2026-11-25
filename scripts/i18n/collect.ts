/** Collects every English UI string that needs a translation into scripts/i18n/all-keys.json. */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODULES } from "../../src/content/curriculum";
import { EXERCISES } from "../../src/content/exercises";
const files: string[] = [];
const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.tsx?$/.test(p)) files.push(p); } };
["src/app", "src/components"].forEach(walk);
const keys = new Set<string>();
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const m of s.matchAll(/<T k="([^"]*)"/g)) keys.add(m[1]);
  for (const m of s.matchAll(/<T k=\{("(?:[^"\\]|\\.)*")\}/g)) keys.add(JSON.parse(m[1]));
  for (const m of s.matchAll(/\btx\(("(?:[^"\\]|\\.)*")/g)) keys.add(JSON.parse(m[1]));
}
// module-level labels rendered through <T k={...}>
for (const line of readFileSync("scripts/i18n/manual.txt", "utf8").split("\n")) { const k = line.split(": ").slice(1).join(": "); if (k) keys.add(k); }
for (const m of MODULES) { keys.add(m.title); keys.add(m.description); for (const l of m.lessons) keys.add(l.title); }
for (const e of EXERCISES) keys.add(e.title);
["Shift+Enter for a new line", "Hatchling", "Fledgling", "Soaring"].forEach((k) => keys.add(k));
const list = [...keys].filter((k) => /[A-Za-z]/.test(k)).sort();
writeFileSync("scripts/i18n/all-keys.json", JSON.stringify(list, null, 1));
console.log(list.length, "keys,", list.reduce((a, k) => a + k.split(/\s+/).length, 0), "words");
