// Wraps UI strings in attributes/properties with tx("…") and adds `const tx = useT()` (client)
// or `const tx = await getT()` (async server component) to the enclosing component.
import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const WRITE = process.argv.includes("--write");
const ROOTS = ["src/app", "src/components"];
const SKIP = [/\/api\//, /components\/admin\//, /app\/\(app\)\/admin\//, /\/terms\//, /\/privacy\//, /components\/i18n\//];
const JSX_ATTRS = new Set(["placeholder", "aria-label", "title", "alt"]);
const PROPS = new Set(["label", "title", "body", "hint", "description", "sub", "text", "message", "cta", "subtitle"]);
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } }; ROOTS.forEach(walk);

const isUi = (s) => /[A-Za-z]{2}/.test(s) && !/^(\/|https?:|#|[a-z0-9]+(-[a-z0-9]+)+$|[a-z_]+$)/.test(s);
const manual = [];
let total = 0, changedFiles = 0;
for (const file of files) {
  if (SKIP.some((r) => r.test(file))) continue;
  const src = readFileSync(file, "utf8");
  const client = /^["']use client["']/.test(src);
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const hooks = new Map(); // fn node -> kind
  const componentOf = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isFunctionDeclaration(p) || ts.isArrowFunction(p) || ts.isFunctionExpression(p)) {
        let name = p.name?.getText(sf);
        if (!name && ts.isVariableDeclaration(p.parent)) name = p.parent.name.getText(sf);
        if (name === "generateMetadata") return "skip";
        if (name && /^[A-Z]/.test(name)) return p;
        if (ts.isFunctionDeclaration(p) && p.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) return p;
      }
      if (ts.isVariableDeclaration(p) && p.name.getText(sf) === "metadata") return "skip";
    }
    return null;
  };
  const visit = (n) => {
    let lit = null;
    if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer) && JSX_ATTRS.has(n.name.getText(sf))) lit = { node: n.initializer, jsx: true };
    if (ts.isPropertyAssignment(n) && PROPS.has(n.name.getText(sf)) && (ts.isStringLiteral(n.initializer) || ts.isNoSubstitutionTemplateLiteral(n.initializer))) lit = { node: n.initializer, jsx: false };
    if (lit && isUi(lit.node.text)) {
      const comp = componentOf(lit.node);
      if (comp === "skip") { /* metadata */ }
      else if (!comp) manual.push(`${file}: ${lit.node.text}`);
      else {
        const async = comp.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
        const kind = client ? "client" : async ? "server" : null;
        if (!kind) manual.push(`${file} (sync server component): ${lit.node.text}`);
        else {
          hooks.set(comp, kind);
          const call = `tx(${JSON.stringify(lit.node.text)})`;
          edits.push({ start: lit.node.getStart(sf), end: lit.node.getEnd(), text: lit.jsx ? `{${call}}` : call });
          total++;
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!edits.length) continue;
  for (const [fn, kind] of hooks) {
    const stmt = kind === "client" ? "const tx = useT();" : "const tx = await getT();";
    if (ts.isBlock(fn.body)) {
      if (fn.body.getText(sf).includes("const tx =")) continue;
      edits.push({ start: fn.body.getStart(sf) + 1, end: fn.body.getStart(sf) + 1, text: `\n  ${stmt}` });
    } else {
      edits.push({ start: fn.body.getStart(sf), end: fn.body.getStart(sf), text: `{\n  ${stmt}\n  return ` });
      edits.push({ start: fn.body.getEnd(), end: fn.body.getEnd(), text: `;\n}` });
    }
  }
  if (WRITE) {
    let out = src;
    for (const e of edits.sort((a, b) => b.start - a.start || b.end - a.end)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    const kinds = new Set(hooks.values());
    const imps = (kinds.has("client") ? 'import { useT } from "@/components/i18n/LocaleProvider";\n' : "") + (kinds.has("server") ? 'import { getT } from "@/i18n/server";\n' : "");
    if (/^["']use client["'];?\s*\n/.test(out)) out = out.replace(/^(["']use client["'];?\s*\n)/, `$1${imps}`);
    else out = imps + out;
    writeFileSync(file, out);
    changedFiles++;
  }
}
console.log(`${total} strings ${WRITE ? `wrapped in ${changedFiles} files` : "found"}; ${manual.length} need manual handling`);
writeFileSync("scripts/i18n/manual.txt", manual.join("\n") + "\n");
