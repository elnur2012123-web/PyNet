// Lists the visible JSX text in the app (dry run) or wraps it in <T>…</T> (--write).
import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const WRITE = process.argv.includes("--write");
const ROOTS = ["src/app", "src/components"];
const SKIP = [/\/api\//, /components\/admin\//, /app\/\(app\)\/admin\//, /\/terms\//, /\/privacy\//, /components\/i18n\//, /SuggestBot/];
const SKIP_PARENTS = new Set(["code", "pre", "kbd", "T", "title", "style", "script"]);

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } };
ROOTS.forEach(walk);

const decode = (s) => s.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&rarr;/g, "→").replace(/&larr;/g, "←").replace(/&middot;/g, "·").replace(/&hellip;/g, "…").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–");
/** React's JSX whitespace rule: lines are trimmed; lines are joined with one space; empty lines vanish. */
function normalize(raw) {
  const lines = raw.split(/\r?\n/);
  if (lines.length === 1) return raw;
  return lines.map((l, i) => {
    let t = l;
    if (i > 0) t = t.replace(/^[ \t]+/, "");
    if (i < lines.length - 1) t = t.replace(/[ \t]+$/, "");
    return t;
  }).filter((l) => l.length).join(" ");
}

const keys = new Map();
let changed = 0;
for (const file of files) {
  if (SKIP.some((r) => r.test(file))) continue;
  const src = readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const raw = node.getText(sf);
      const norm = normalize(raw);
      const text = norm.trim();
      const parent = node.parent;
      const tag = ts.isJsxElement(parent) ? parent.openingElement.tagName.getText(sf) : "";
      if ((text.match(/[A-Za-z]/g) ?? []).length >= 2 && !SKIP_PARENTS.has(tag)) {
        const lead = norm.match(/^\s*/)[0], trail = norm.match(/\s*$/)[0];
        const key = decode(text);
        keys.set(key, (keys.get(key) ?? new Set()).add(file));
        const attr = /["\\{}<>]/.test(key) ? `{${JSON.stringify(key)}}` : `"${key}"`;
        edits.push({ start: node.getStart(sf), end: node.getEnd(), text: `${lead ? '{" "}' : ""}<T k=${attr} />${trail ? '{" "}' : ""}` });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (WRITE && edits.length) {
    let out = src;
    for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    const imp = 'import { T } from "@/components/i18n/T";\n';
    if (/^["']use client["'];?\s*\n/.test(out)) out = out.replace(/^(["']use client["'];?\s*\n)/, `$1${imp}`);
    else out = imp + out;
    writeFileSync(file, out);
    changed++;
  }
}
if (WRITE) console.log(`wrapped text in ${changed} files`);
const list = [...keys.keys()].sort();
writeFileSync("scripts/i18n/keys.json", JSON.stringify(list, null, 1));
console.log(`${list.length} unique strings, ${[...keys.keys()].reduce((a, k) => a + k.split(/\s+/).length, 0)} words`);
