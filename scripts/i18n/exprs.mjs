// Pass 3: string literals shown through JSX expressions ({ok ? "Yes" : "No"}, {x && "Text"})
// and text props on custom components (<Stat label="Total XP" />).
import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const WRITE = process.argv.includes("--write");
const SKIP = [/\/api\//, /components\/admin\//, /app\/\(app\)\/admin\//, /\/terms\//, /\/privacy\//, /components\/i18n\//, /ui\/Logo/];
const TEXT_PROPS = new Set(["label", "sub", "body", "description", "hint", "text", "heading", "subtitle", "cta", "caption", "message", "title", "emptyText", "action", "value"]);
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } }; ["src/app", "src/components"].forEach(walk);
const isUi = (s) => /[A-Za-z]{2}/.test(s) && /\s|^[A-Z][a-z]/.test(s) && !/^(\/|https?:|#|[a-z0-9]+(-[a-z0-9]+)+$|[a-z_]+$)/.test(s) && !/^[a-z]+(\s[a-z-]+:?[a-z0-9-/[\].]*)+$/.test(s);
let total = 0, filesChanged = 0; const manual = [];
for (const file of files) {
  if (SKIP.some((r) => r.test(file))) continue;
  const src = readFileSync(file, "utf8");
  const client = /^["']use client["']/.test(src);
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = []; const hooks = new Map();
  const componentOf = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isFunctionDeclaration(p) || ts.isArrowFunction(p) || ts.isFunctionExpression(p)) {
        let name = p.name?.getText(sf);
        if (!name && ts.isVariableDeclaration(p.parent)) name = p.parent.name.getText(sf);
        if (name === "generateMetadata") return "skip";
        if (name && /^[A-Z]/.test(name)) return p;
        if (ts.isFunctionDeclaration(p) && p.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) return p;
      }
    }
    return null;
  };
  const wrap = (lit) => {
    if (!isUi(lit.text)) return;
    const comp = componentOf(lit);
    if (!comp || comp === "skip") { manual.push(`${file}: ${lit.text}`); return; }
    const async = comp.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);
    const kind = client ? "client" : async ? "server" : null;
    if (!kind) { manual.push(`${file} (sync server): ${lit.text}`); return; }
    hooks.set(comp, kind);
    edits.push({ start: lit.getStart(sf), end: lit.getEnd(), text: `tx(${JSON.stringify(lit.text)})`, attr: ts.isJsxAttribute(lit.parent) });
    total++;
  };
  // literals in "value position" of an expression
  const valuePos = (e) => {
    if (!e) return;
    if (ts.isParenthesizedExpression(e)) return valuePos(e.expression);
    if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) return wrap(e);
    if (ts.isConditionalExpression(e)) { valuePos(e.whenTrue); valuePos(e.whenFalse); return; }
    if (ts.isBinaryExpression(e) && [ts.SyntaxKind.AmpersandAmpersandToken, ts.SyntaxKind.BarBarToken, ts.SyntaxKind.QuestionQuestionToken].includes(e.operatorToken.kind)) { valuePos(e.right); if (e.operatorToken.kind !== ts.SyntaxKind.AmpersandAmpersandToken) valuePos(e.left); }
  };
  const visit = (n) => {
    if (ts.isJsxExpression(n) && n.expression) {
      const parentIsAttr = ts.isJsxAttribute(n.parent);
      if (!parentIsAttr) valuePos(n.expression);
      else {
        const attr = n.parent.name.getText(sf);
        if (TEXT_PROPS.has(attr) || ["placeholder", "aria-label", "title", "alt"].includes(attr)) valuePos(n.expression);
      }
    }
    if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer)) {
      const tag = n.parent.parent.tagName?.getText(sf) ?? "";
      if (/^[A-Z]/.test(tag) && TEXT_PROPS.has(n.name.getText(sf)) && tag !== "T") {
        const lit = n.initializer;
        if (isUi(lit.text)) {
          const before = edits.length;
          wrap(lit);
          if (edits.length > before) edits[edits.length - 1].text = `{${edits[edits.length - 1].text}}`;
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
    let imps = "";
    if (kinds.has("client") && !out.includes('import { useT }') && !out.includes("useT }")) imps += 'import { useT } from "@/components/i18n/LocaleProvider";\n';
    if (kinds.has("server") && !out.includes("getT }")) imps += 'import { getT } from "@/i18n/server";\n';
    if (/^["']use client["'];?\s*\n/.test(out)) out = out.replace(/^(["']use client["'];?\s*\n)/, `$1${imps}`);
    else out = imps + out;
    writeFileSync(file, out); filesChanged++;
  }
}
console.log(`${total} strings ${WRITE ? `wrapped in ${filesChanged} files` : "found"}; ${manual.length} manual`);
writeFileSync("scripts/i18n/manual3.txt", manual.join("\n") + "\n");
