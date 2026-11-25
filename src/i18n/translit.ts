/**
 * Uzbek Latin → Uzbek Cyrillic (the "old" alphabet, still used by many schools).
 * Brand names, code and abbreviations (Python, PyBuddy, XP, print()) are left as they are.
 */
const PROTECT = new Set(["Python", "PyNest", "PyBuddy", "Lite", "XP", "Pro", "Max", "Free", "Pyodide", "CPython", "WebAssembly", "Clang", "LLVM",
  "Google", "Telegram", "Supabase", "GitHub", "Elo", "ICPC", "UTC", "AI", "OK", "C", "Enter", "Ctrl", "Cmd", "Shift", "Tab", "Esc", "Lemon", "Squeezy", "Hatchling", "Fledgling", "Soaring",
  // words shown on buttons / printed by example programs
  "Run", "Submit", "Install", "Hello", "World", "Alex", "Ada", "Done", "Start", "End", "Stop", "Reset", "Clear", "Copy", "Save", "VS", "Code", "PyCharm", "Thonny", "IDLE", "Homebrew", "PATH",
  // product and library names
  "Java", "JavaScript", "Excel", "Windows", "Mac", "Linux", "Instagram", "Todoist", "Bitwarden", "Zork", "YNAB", "PayPal",
  "Django", "Flask", "FastAPI", "pandas", "numpy", "requests", "pygame", "matplotlib", "PyTorch", "PyPI", "JSON", "CSV", "Quickstart",
  "Spock", "Paris", "Oslo", "Cairo", "Lima", "Tashkent", "Uzbekistan", "Ana", "Ben", "Cy", "Sam", "Kai", "Mia", "Grace", "Hopper", "Luna", "Rex"]);
// Python keywords, built-ins and common methods/modules: code stays code.
const CODE_WORDS = new Set(("if elif else for while def return import from as try except finally raise with class lambda yield True False None " +
  "and or not in is break continue pass global nonlocal assert del async await print input len range int str float bool list dict set tuple " +
  "type open map filter zip enumerate sorted reversed sum min max abs round append insert remove pop sort reverse upper lower strip lstrip rstrip " +
  "split replace find join format items keys values get update count index csv json os sys math random datetime pip self init main " +
  "stdin stdout cin cout scanf printf std vector string include bits stdc cpp f-string").split(" "));
const VOWELS = "aeiouAEIOUўЎоОаАэЭиИуУеЕ";
const APOS = "['ʻ‘’`ʼ]";

const PAIRS: [RegExp, string][] = [
  [new RegExp(`O${APOS}`, "g"), "Ў"], [new RegExp(`o${APOS}`, "g"), "ў"],
  [new RegExp(`G${APOS}`, "g"), "Ғ"], [new RegExp(`g${APOS}`, "g"), "ғ"],
  [/Sh/g, "Ш"], [/SH/g, "Ш"], [/sh/g, "ш"],
  [/Ch/g, "Ч"], [/CH/g, "Ч"], [/ch/g, "ч"],
  [/Yo/g, "Ё"], [/YO/g, "Ё"], [/yo/g, "ё"],
  [/Yu/g, "Ю"], [/YU/g, "Ю"], [/yu/g, "ю"],
  [/Ya/g, "Я"], [/YA/g, "Я"], [/ya/g, "я"],
  [/Ye/g, "Е"], [/YE/g, "Е"], [/ye/g, "е"],
];
const SINGLE: Record<string, string> = {
  a: "а", b: "б", d: "д", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ",
  r: "р", s: "с", t: "т", u: "у", v: "в", x: "х", y: "й", z: "з", c: "ц", w: "в",
};

// Loanwords whose Cyrillic spelling isn't a letter-by-letter copy.
const STEMS: [RegExp, string][] = [
  [/^([Ff])unksiya/, "$1ункция"], [/^([Kk])ompyuter/, "$1омпьютер"], [/^([Ss])entabr/, "$1ентябрь"], [/^([Oo])ktabr/, "$1ктябрь"],
  [/^([Nn])oyabr/, "$1оябрь"], [/^([Dd])ekabr/, "$1екабрь"], [/^([Aa])ksiya/, "$1кция"], [/^([Ss])eksiya/, "$1екция"],
];

function word(w: string): string {
  // "Python’ni", "PyBuddy’dan": keep the brand, convert only the suffix
  const brand = /^([A-Za-z+]+)(['ʻ‘’`ʼ])(.+)$/.exec(w);
  if (brand && (PROTECT.has(brand[1]) || /^[A-Z]{2,}$/.test(brand[1]))) return brand[1] + brand[2] + word(brand[3]);
  for (const [re, to] of STEMS) {
    if (re.test(w)) {
      const m = w.match(re)!;
      const head = (m[1] === m[1].toUpperCase() ? { F: "Ф", K: "К", S: "С", O: "О", N: "Н", D: "Д", A: "А" } : { f: "ф", k: "к", s: "с", o: "о", n: "н", d: "д", a: "а" } as Record<string, string>)[m[1] as "F"];
      return head + to.slice(2) + word(w.slice(m[0].length) || "").replace(/^$/, "");
    }
  }
  if (CODE_WORDS.has(w) ||
      PROTECT.has(w) || /[0-9_()=+#/<>{}[\]\\.:@*]/.test(w) || /^[A-Z]{2,}$/.test(w)) return w;
  let s = w;
  for (const [re, to] of PAIRS) s = s.replace(re, to);
  // tutuq belgisi (ʼ) → ъ
  s = s.replace(new RegExp(APOS, "g"), "ъ");
  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const lower = ch.toLowerCase();
    if (lower === "e") {
      // word-initial or after a vowel: э; otherwise е
      const prev = out[out.length - 1];
      const e = i === 0 || (prev && VOWELS.includes(prev)) ? "э" : "е";
      out += ch === lower ? e : e.toUpperCase();
      continue;
    }
    const m = SINGLE[lower];
    out += m ? (ch === lower ? m : m.toUpperCase()) : ch;
  }
  return out;
}

export function latinToCyrillic(text: string) {
  // keep `code`, URLs and {placeholders} untouched
  return text.split(/(```[\s\S]*?```|`[^`]*`|"[^"\n]*"|https?:\/\/\S+|\{[a-zA-Z0-9_]+\})/g).map((part, i) =>
    i % 2 ? part : part.replace(/[A-Za-z'ʻ‘’`ʼ]+/g, (w, off: number, str: string) => (looksLikeCodeToken(w, str, off) ? w : word(w)))).join("");
}

// Names that are code even outside backticks: calls, dotted names (math.sqrt, .isdigit),
// snake_case and a_i, CamelCase error names (TypeError), and one-letter variables (n, x, a).
function looksLikeCodeToken(w: string, str: string, off: number) {
  const prev = str[off - 1] ?? "", next = str[off + w.length] ?? "", next2 = str[off + w.length + 1] ?? "";
  if (next === "(" || prev === "_" || next === "_") return true;
  if (/[0-9]/.test(prev) || /[0-9]/.test(next)) return true;
  if (next === "." && /[A-Za-z_]/.test(next2)) return true;
  if (prev === "." && /[A-Za-z_)\]]/.test(str[off - 2] ?? "")) return true;
  if (/[a-z][A-Z]/.test(w)) return true;
  return /^[A-Za-z]$/.test(w) && w !== "u" && w !== "U";
}
