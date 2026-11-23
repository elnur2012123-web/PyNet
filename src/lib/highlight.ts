/** Tiny, dependency-free Python highlighter for read-only code blocks. */
const KEYWORDS = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield".split(" "));
const BUILTINS = new Set("print input len range int float str bool list dict set tuple type sum min max sorted enumerate zip map filter open abs round any all isinstance super self".split(" "));

export interface Token { t: "kw" | "str" | "num" | "com" | "fn" | "bi" | "txt"; v: string }

const RE = /(#[^\n]*)|([rbfRBF]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)(?=\s*\()|([A-Za-z_][A-Za-z0-9_]*)/g;

export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(RE)) {
    if (m.index! > last) out.push({ t: "txt", v: code.slice(last, m.index) });
    const [full, com, str, num, call, word] = m;
    if (com) out.push({ t: "com", v: com });
    else if (str) out.push({ t: "str", v: str });
    else if (num) out.push({ t: "num", v: num });
    else if (call) out.push({ t: KEYWORDS.has(call) ? "kw" : BUILTINS.has(call) ? "bi" : "fn", v: call });
    else if (word) out.push({ t: KEYWORDS.has(word) ? "kw" : BUILTINS.has(word) ? "bi" : "txt", v: word });
    else out.push({ t: "txt", v: full });
    last = m.index! + full.length;
  }
  if (last < code.length) out.push({ t: "txt", v: code.slice(last) });
  return out;
}
