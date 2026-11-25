// Code and program output must stay exactly as written: remove <T k="…"/> inside
// elements whose className contains "font-mono" (and the known output/example strings).
import ts from "typescript";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const KEEP = new Set(["Aziza is 14", "RuntimeError", "NameError: name 'page' is not defined", 'can only concatenate str (not "int") to str']);
const files = []; const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith(".tsx")) files.push(p); } }; ["src/app", "src/components"].forEach(walk);
let n = 0;
for (const file of files) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("<T k=")) continue;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const edits = [];
  const inMono = (node) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isJsxElement(p)) {
        const cls = p.openingElement.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "className");
        if (cls && /font-mono/.test(cls.getText(sf))) return true;
      }
    }
    return false;
  };
  const visit = (node) => {
    if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(sf) === "T") {
      const k = node.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "k");
      const init = k?.initializer;
      let text = null;
      if (init && ts.isStringLiteral(init)) text = init.text;
      else if (init && ts.isJsxExpression(init) && init.expression && ts.isStringLiteral(init.expression)) text = init.expression.text;
      if (text !== null && (inMono(node) || KEEP.has(text))) {
        const safe = /[{}<>"]/.test(text) ? `{${JSON.stringify(text)}}` : text.replace(/'/g, "&apos;");
        edits.push({ s: node.getStart(sf), e: node.getEnd(), t: safe });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  if (!edits.length) continue;
  let out = src;
  for (const x of edits.sort((a, b) => b.s - a.s)) out = out.slice(0, x.s) + x.t + out.slice(x.e);
  writeFileSync(file, out); n += edits.length;
  console.log(file, edits.length);
}
console.log("unwrapped", n);
