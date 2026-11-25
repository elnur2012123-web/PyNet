import ts from "typescript";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const ROOTS = ["src/app", "src/components"];
const SKIP = [/\/api\//, /components\/admin\//, /app\/\(app\)\/admin\//, /\/terms\//, /\/privacy\//];
const ATTRS = new Set(["placeholder", "aria-label", "title", "alt", "label", "body", "hint", "description", "sub", "text", "message", "cta", "subtitle"]);
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } }; ROOTS.forEach(walk);
const out = new Map();
for (const file of files) {
  if (SKIP.some((r) => r.test(file))) continue;
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const v = (n) => {
    let name = null, lit = null;
    if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer)) { name = n.name.getText(sf); lit = n.initializer.text; }
    if (ts.isPropertyAssignment(n) && (ts.isStringLiteral(n.initializer) || ts.isNoSubstitutionTemplateLiteral(n.initializer))) { name = n.name.getText(sf); lit = n.initializer.text; }
    if (name && ATTRS.has(name) && lit && /[A-Za-z]{2}/.test(lit) && !/^(\/|https?:|[a-z]+-[a-z-]+$)/.test(lit)) out.set(lit, file.replace("src/", ""));
    ts.forEachChild(n, v);
  };
  v(sf);
}
console.log(out.size, "attribute/property strings");
for (const [k, f] of [...out].slice(0, 400)) console.log(`${f}\t${k}`);
