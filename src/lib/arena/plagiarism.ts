/**
 * Code-similarity for Python solutions.
 * Copies are usually disguised by renaming variables, changing spacing, adding
 * comments or swapping string text, so all of those are normalised away before
 * comparing. What's left is the "shape" of the program.
 */
const KEYWORDS = new Set(("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case " +
  // builtins and common methods keep their names: they are part of the program's shape
  "print input int str float list dict set tuple len range sum min max sorted reversed enumerate zip map filter abs open any all round divmod pow ord chr bin hex " +
  "append extend pop insert remove sort split join strip rstrip lstrip read readline readlines write get items keys values add update count index find replace " +
  "sys stdin stdout buffer math gcd sqrt collections deque Counter defaultdict heapq heappush heappop bisect bisect_left bisect_right itertools functools reduce lru_cache cache").split(" "));

const TOKEN = /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|#[^\n]*|[A-Za-z_][A-Za-z_0-9]*|\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?|\*\*=?|\/\/=?|==|!=|<=|>=|->|[-+*/%&|^<>]=?|:=|[()[\]{}:,.;=@~])/g;

/** Normalised token list (comments dropped, names → ID, strings → S, numbers → N). */
export function normalize(code: string): string[] {
  const out: string[] = [];
  for (const m of code.matchAll(TOKEN)) {
    const t = m[0];
    if (t.startsWith("#")) continue;
    if (t[0] === '"' || t[0] === "'") out.push("S");
    else if (/^\d/.test(t)) out.push("N");
    else if (/^[A-Za-z_]/.test(t)) out.push(KEYWORDS.has(t) ? t : "ID");
    else out.push(t);
  }
  return out;
}

const K = 5;
function grams(tokens: string[]) {
  const s = new Set<string>();
  for (let i = 0; i + K <= tokens.length; i++) s.add(tokens.slice(i, i + K).join(" "));
  return s;
}

export interface Fingerprint { tokens: number; grams: Set<string>; flat: string }
export function fingerprint(code: string): Fingerprint {
  const t = normalize(code);
  return { tokens: t.length, grams: grams(t), flat: t.join(" ") };
}

/** 0–100. 100 = the same program apart from names, spacing and comments. */
export function similarity(a: Fingerprint, b: Fingerprint) {
  if (a.flat === b.flat) return 100;
  if (!a.grams.size || !b.grams.size) return 0;
  let common = 0;
  for (const g of a.grams) if (b.grams.has(g)) common++;
  return Math.round((100 * common) / (a.grams.size + b.grams.size - common));
}

/** Programs shorter than this are too small to judge (everyone writes `print(a + b)` the same way). */
export const MIN_TOKENS = 30;
export const SIMILAR_AT = 85;
