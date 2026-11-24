import "server-only";
import { MODULES } from "@/content/curriculum";
import { PY_ERRORS } from "@/content/errors";
import { EXERCISES } from "@/content/exercises";
import type { Lesson } from "@/content/types";
import type { AiFeature } from "@/lib/plans";
import { GLOSSARY, type GlossaryEntry } from "./glossary";
import { HOWTOS } from "./howtos";
import { analogyFor } from "./analogies";

/**
 * PyBuddy Lite — a free, rule-based Python tutor. No API key, no cost.
 * It answers ONLY Python questions, using PyNest's own lessons, error guides,
 * exercises and a hand-written glossary, plus a line-by-line code explainer
 * and a static bug checker.
 */

// ----------------------------------------------------------------- text utils
const STOP = new Set(
  "whats hows whos wats wat dont didnt cant wont doesnt isnt understand understood explain know want need make get got still thing things mean okay yeah really bro pls plz thanks today a an the is are was were be been do does did i me my you your it its this that these those to of in on at for with and or but how what why when where which who can could should would will please explain tell show give mean means meaning use used using about like just so than then there here some any very much more most also as by from into python pythons programming code".split(" "),
);
const SYNONYMS: Record<string, string[]> = {
  loop: ["loops"], loops: ["loop"], iterate: ["for", "loop"], repeat: ["loop", "for", "while"],
  array: ["list"], arrays: ["list"], lists: ["list"], dictionary: ["dict", "dictionaries"], dictionaries: ["dict", "dictionary"], dict: ["dictionary"], hashmap: ["dict"],
  function: ["def", "functions"], functions: ["def", "function"], method: ["methods", "function"], methods: ["method"],
  variable: ["variables"], variables: ["variable"], string: ["strings", "str", "text"], strings: ["string", "str"], text: ["string"],
  number: ["int", "float", "integers"], numbers: ["int", "float"], integer: ["int", "integers"], decimal: ["float", "floats"],
  condition: ["if", "conditions"], conditions: ["if", "condition"], ifelse: ["if", "else"], class: ["classes", "oop"], classes: ["class", "oop"], object: ["objects", "oop"], objects: ["object", "oop"],
  error: ["errors", "exception"], errors: ["error"], exception: ["exceptions", "try", "except"], exceptions: ["exception", "try"], bug: ["debugging", "errors"],
  file: ["files", "open"], files: ["file", "open"], import: ["modules", "module"], module: ["modules", "import"], library: ["libraries", "modules"],
  tuple: ["tuples"], tuples: ["tuple"], set: ["sets"], sets: ["set"], fstring: ["f-strings", "formatting"], format: ["formatting", "f-strings"],
  input: ["input()"], print: ["print()"], comment: ["comments"], comments: ["comment"], recursion: ["recursive"], recursive: ["recursion"],
  comprehension: ["comprehensions"], comprehensions: ["comprehension"], lambda: ["lambda"], decorator: ["decorators"], generator: ["generators", "yield"],
};

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9_()%*/=<>!.+-]+/g, " ").split(/\s+/).map((w) => w.replace(/^[.]+|[.]+$/g, "")).filter(Boolean);
}
/** Each meaningful word with its spelling variants/synonyms (a "group"). */
function termGroups(s: string): string[][] {
  const groups: string[][] = [];
  const seen = new Set<string>();
  const ws = words(s);
  ws.forEach((w, i) => {
    if ((w === "for" || w === "while") && /^loops?$/.test(ws[i + 1] ?? "")) groups.push(w === "for" ? ["for", "range"] : ["while"]);
  });
  for (const w of ws) {
    const base = w.replace(/\(\)$/, "");
    if (STOP.has(base) || (base.length < 2 && !/[%*/=<>]/.test(base)) || seen.has(base)) continue;
    seen.add(base);
    const g = new Set([base]);
    if (base.endsWith("s") && base.length > 3) g.add(base.slice(0, -1));
    for (const syn of SYNONYMS[base] ?? []) g.add(syn);
    groups.push([...g]);
  }
  return groups;
}
const terms = (s: string) => [...new Set(termGroups(s).flat())];

// ----------------------------------------------------------------- index
interface Doc {
  kind: "lesson" | "error" | "glossary";
  id: string;
  title: string;
  head: string; // high-weight text (title, keywords)
  body: string; // low-weight text
  lesson?: Lesson;
  moduleTitle?: string;
  glossary?: GlossaryEntry;
}

const DOCS: Doc[] = [
  ...HOWTOS.map((g) => ({ kind: "glossary" as const, id: g.id, title: g.title, head: `${g.title} ${g.keywords.join(" ")}`.toLowerCase(), body: g.answer.toLowerCase(), glossary: g })),
  ...GLOSSARY.map((g) => ({ kind: "glossary" as const, id: g.id, title: g.title, head: `${g.title} ${g.keywords.join(" ")}`.toLowerCase(), body: g.answer.toLowerCase(), glossary: g })),
  ...MODULES.flatMap((m) =>
    m.lessons.filter((l) => l.kind !== "project").map((l) => ({
      kind: "lesson" as const, id: l.id, title: l.title, lesson: l, moduleTitle: m.title,
      head: `${l.title} ${l.syntax ?? ""}`.toLowerCase(),
      body: `${m.title} ${l.intro} ${l.examples.map((e) => e.title).join(" ")}`.toLowerCase(),
    })),
  ),
  ...PY_ERRORS.map((e) => ({ kind: "error" as const, id: e.slug, title: e.name, head: `${e.name} ${e.summary}`.toLowerCase(), body: `${e.meaning} ${e.why.join(" ")}`.toLowerCase() })),
];

/** Words that make a question count as "about Python". */
const PY_VOCAB = new Set<string>([
  ..."python code coding program programming script syntax error errors bug debug traceback exception variable variables value string strings int integer float boolean bool list lists tuple set dict dictionary key keys value values loop loops for while if elif else def function functions return parameter argument arguments class classes object objects method methods self init import module modules package pip library file files open read write print input range len type str index slicing slice append insert remove pop sort sorted reverse split join replace strip upper lower find format fstring f-string lambda map filter zip enumerate comprehension generator yield iterator recursion decorator try except finally raise assert indentation indent colon bracket brackets quotes comment comments operator operators modulus modulo exponent division floor true false none and or not in is break continue pass global local scope pyodide pycharm vscode ide interpreter terminal oop inheritance encapsulation polymorphism json csv random math datetime os sys exercise exercises practice quiz algorithm algorithms nameerror typeerror valueerror indexerror keyerror zerodivisionerror attributeerror syntaxerror indentationerror importerror modulenotfounderror filenotfounderror recursionerror".split(" "),
  ...DOCS.filter((d) => !d.id.startsWith("howto-")).flatMap((d) => terms(d.title)),
  ...GLOSSARY.flatMap((g) => g.keywords.map((k) => k.toLowerCase())),
]);

const escapeRe = (t: string) => t.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
function score(d: Doc, groups: string[][]) {
  let s = 0;
  const flat = groups.flat();
  for (const g of groups) {
    let best = 0;
    for (const t of g) {
      const re = new RegExp(`(^|[^a-z0-9_])${escapeRe(t)}([^a-z0-9_]|$)`);
      if (re.test(d.head)) best = Math.max(best, d.kind === "glossary" ? 6 : 5);
      else if (re.test(d.body)) best = Math.max(best, 1);
    }
    s += best;
  }
  if (d.title.toLowerCase().split(/\W+/).every((w) => !w || flat.includes(w) || STOP.has(w))) s += 3;
  return s;
}

function search(q: string, kinds?: Doc["kind"][], limit = 3, min = 5) {
  const groups = termGroups(q);
  return DOCS.filter((d) => !kinds || kinds.includes(d.kind))
    .map((d) => ({ d, s: score(d, groups) }))
    .filter((r) => r.s >= min)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
}

// ----------------------------------------------------------------- typo correction
const VOCAB_WORDS = [...new Set(DOCS.flatMap((d) => d.head.split(/[^a-z_]+/)).concat([...PY_VOCAB]).filter((w) => w.length >= 4))];
function editDistance(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] ? dp[i - 2][j - 2] + 1 : 99);
  return dp[a.length][b.length];
}
/** Fix common misspellings ("lamda" -> "lambda", "dictonary" -> "dictionary"). */
function correctTypos(msg: string): string {
  return msg.replace(/[A-Za-z]{4,}/g, (w) => {
    const lw = w.toLowerCase();
    if (STOP.has(lw) || VOCAB_WORDS.includes(lw)) return w;
    const max = lw.length >= 7 ? 2 : 1;
    let best: string | null = null, bestD = max + 1;
    for (const v of VOCAB_WORDS) {
      const d = editDistance(lw, v);
      if (d < bestD) { best = v; bestD = d; }
    }
    return best ?? w;
  });
}

// ----------------------------------------------------------------- helpers
const firstParagraphs = (text: string, n = 2) => {
  const ps = text.trim().split(/\n\s*\n/);
  let k = n;
  while (k < ps.length && ps[k - 1].trim().endsWith(":")) k++;
  return ps.slice(0, k).join("\n\n");
};
const lessonLink = (l: Lesson) => `👉 Full lesson: **${l.title}** — open it at \`/learn/${l.id}\``;
const fence = (code: string) => "```python\n" + code + "\n```";

function extractCode(msg: string): string | null {
  const m = /```(?:python|py)?\n?([\s\S]*?)```/.exec(msg);
  if (m && m[1].trim()) return m[1].replace(/\s+$/, "");
  const lines = msg.split("\n");
  const codeLike = lines.filter((l) => /^\s*(def |class |for |while |if |elif |else:|import |from |print\(|return\b|[A-Za-z_][A-Za-z0-9_]*\s*(=|\+=|-=)\s*\S|[A-Za-z_][A-Za-z0-9_.]*\(.*\)\s*$)/.test(l));
  if (codeLike.length >= 2 || (codeLike.length === 1 && lines.length === 1 && /[=(]/.test(lines[0]) && !/\?\s*$/.test(lines[0]))) {
    return lines.filter((l) => !/^\s*(Error|Traceback|My code|Can you|Please|Why|What)/i.test(l)).join("\n").trim();
  }
  return null;
}

// ----------------------------------------------------------------- code explainer
function explainLine(raw: string): string | null {
  const line = raw.trim();
  if (!line) return null;
  let m: RegExpExecArray | null;
  if (line.startsWith("#")) return "A **comment** — Python ignores it. It's a note for humans.";
  if ((m = /^import\s+([\w., ]+)(?:\s+as\s+(\w+))?$/.exec(line))) return `Loads the module${m[1].includes(",") ? "s" : ""} \`${m[1]}\` so you can use its tools${m[2] ? `, nicknamed \`${m[2]}\`` : ""}.`;
  if ((m = /^from\s+([\w.]+)\s+import\s+(.+)$/.exec(line))) return `Takes \`${m[2]}\` out of the \`${m[1]}\` module so you can use it directly.`;
  if ((m = /^def\s+(\w+)\s*\((.*)\)\s*:$/.exec(line))) return `Defines a **function** named \`${m[1]}\`${m[2].trim() ? ` that takes ${m[2].split(",").map((p) => `\`${p.trim()}\``).join(", ")}` : " with no inputs"}. The indented lines below are its body; they run only when the function is called.`;
  if ((m = /^class\s+(\w+)(?:\((\w+)\))?\s*:$/.exec(line))) return `Defines a **class** (a blueprint) called \`${m[1]}\`${m[2] ? ` that inherits from \`${m[2]}\`` : ""}.`;
  if ((m = /^for\s+(.+?)\s+in\s+(.+):$/.exec(line))) {
    const r = /^range\((.*)\)$/.exec(m[2].trim());
    return `A **for loop**: repeats the indented lines once for each item in \`${m[2]}\`, storing the current item in \`${m[1]}\`.${r ? ` \`range(${r[1]})\` produces a sequence of numbers (the stop value is not included).` : ""}`;
  }
  if ((m = /^while\s+(.+):$/.exec(line))) return m[1] === "True" ? "An endless **while loop** — it runs until a `break` stops it." : `A **while loop**: keeps repeating the indented lines as long as \`${m[1]}\` is True.`;
  if ((m = /^if\s+(.+):$/.exec(line))) return `Checks the condition \`${m[1]}\`. The indented lines run only if it is **True**.`;
  if ((m = /^elif\s+(.+):$/.exec(line))) return `"Else if": checked only when the conditions above were False. Runs its block if \`${m[1]}\` is True.`;
  if (/^else\s*:$/.test(line)) return "Runs its indented block when none of the conditions above were True.";
  if (/^try\s*:$/.test(line)) return "Starts a **try** block: Python attempts the indented code and watches for errors.";
  if ((m = /^except\s*(\w+)?(?:\s+as\s+(\w+))?\s*:$/.exec(line))) return `Runs if ${m[1] ? `a \`${m[1]}\`` : "any error"} happens in the try block${m[2] ? ` (the error is stored in \`${m[2]}\`)` : ""}.`;
  if (/^finally\s*:$/.test(line)) return "The **finally** block always runs — error or not.";
  if ((m = /^with\s+open\((.+)\)\s+as\s+(\w+)\s*:$/.exec(line))) return `Opens a file (\`open(${m[1]})\`) and calls it \`${m[2]}\`. The file is closed automatically when the indented block ends.`;
  if ((m = /^return\s*(.*)$/.exec(line))) return m[1] ? `Sends the value of \`${m[1]}\` back to whoever called the function, and ends the function.` : "Ends the function (returns `None`).";
  if (line === "break") return "**break** — leaves the loop immediately.";
  if (line === "continue") return "**continue** — skips the rest of this loop round and goes to the next one.";
  if (line === "pass") return "**pass** — does nothing; a placeholder where Python requires a line.";
  if ((m = /^raise\s+(\w+)/.exec(line))) return `Deliberately creates a \`${m[1]}\` error to stop the program with a message.`;
  if ((m = /^print\((.*)\)$/.exec(line))) return `Shows \`${m[1] || "an empty line"}\` on the screen.${/^f["']/.test(m[1]) ? " The `f` before the quotes makes it an **f-string**: values inside `{ }` are filled in." : ""}`;
  if ((m = /^(\w[\w, ]*?)\s*=\s*int\(input\((.*)\)\)$/.exec(line))) return `Asks the user ${m[2] ? `\`${m[2]}\`` : "for input"}, converts the answer to a whole number with \`int()\`, and stores it in \`${m[1]}\`.`;
  if ((m = /^(\w+)\s*=\s*float\(input\((.*)\)\)$/.exec(line))) return `Asks the user ${m[2] ? `\`${m[2]}\`` : "for input"}, converts the answer to a decimal number, and stores it in \`${m[1]}\`.`;
  if ((m = /^(\w+)\s*=\s*input\((.*)\)$/.exec(line))) return `Asks the user ${m[2] ? `\`${m[2]}\`` : "to type something"} and stores their answer (always text/a string) in \`${m[1]}\`.`;
  if ((m = /^(\w+)\s*(\+|-|\*|\/|\/\/|%|\*\*)=\s*(.+)$/.exec(line))) return `Updates \`${m[1]}\`: it becomes \`${m[1]} ${m[2]} ${m[3]}\`.`;
  if ((m = /^([\w.]+)\.(append|insert|remove|pop|sort|reverse|extend|clear)\((.*)\)$/.exec(line))) {
    const what: Record<string, string> = { append: `adds \`${m[3]}\` to the end of`, insert: `inserts (${m[3]}) into`, remove: `removes the first \`${m[3]}\` from`, pop: "removes (and gives back) an item from", sort: "sorts", reverse: "reverses the order of", extend: `adds all items of \`${m[3]}\` to`, clear: "empties" };
    return `${what[m[2]][0].toUpperCase()}${what[m[2]].slice(1)} the list \`${m[1]}\`.`;
  }
  if ((m = /^([\w, ]+?)\s*=\s*(.+)$/.exec(line)) && !line.includes("==")) {
    const names = m[1].split(",").map((s) => s.trim());
    const v = m[2].trim();
    const kind = /^["'f]/.test(v) ? " (text / a string)" : /^\d+$/.test(v) ? " (a whole number)" : /^\d*\.\d+$/.test(v) ? " (a decimal number)" : /^\[/.test(v) ? " (a list)" : /^\{/.test(v) ? (/:/.test(v) || v === "{}" ? " (a dictionary)" : " (a set)") : /^\(/.test(v) ? " (a tuple)" : /^(True|False)$/.test(v) ? " (a boolean)" : "";
    return names.length > 1 ? `Stores several values at once: ${names.map((n) => `\`${n}\``).join(", ")} get the values from \`${v}\`.` : `Creates/updates the variable \`${names[0]}\` and stores \`${v}\`${kind} in it.`;
  }
  if ((m = /^(\w+)\((.*)\)$/.exec(line))) return `Calls (runs) the function \`${m[1]}\`${m[2] ? ` with \`${m[2]}\`` : ""}.`;
  return null;
}

function explainCode(code: string): string {
  const lines = code.split("\n");
  const out: string[] = ["Here's what your code does, line by line:", ""];
  let n = 0;
  lines.forEach((l, i) => {
    const e = explainLine(l);
    if (!l.trim()) return;
    n++;
    out.push(`${i + 1}. \`${l.trim().slice(0, 70)}\` — ${e ?? "Runs this statement."}`);
  });
  if (!n) return "I couldn't find any code in your message. Paste it inside the box and I'll explain it.";
  const issues = findIssues(code);
  if (issues.length) out.push("", "**Things to double-check:**", ...issues.map((x) => `- ${x}`));
  out.push("", "Tip: paste this into the **Playground** and press Run to see it in action.");
  return out.join("\n");
}

// ----------------------------------------------------------------- static bug checker
function findIssues(code: string): string[] {
  const issues: string[] = [];
  const lines = code.split("\n");
  const defined = new Set<string>(["print", "input", "len", "range", "int", "float", "str", "bool", "list", "dict", "set", "tuple", "type", "sum", "min", "max", "abs", "round", "sorted", "enumerate", "zip", "map", "filter", "open", "isinstance", "super", "self", "True", "False", "None", "any", "all", "reversed", "chr", "ord", "id", "help", "dir", "iter", "next", "object", "Exception", "ValueError", "TypeError", "KeyError", "IndexError", "ZeroDivisionError", "NameError", "FileNotFoundError", "__name__"]);
  lines.forEach((raw, i) => {
    const n = i + 1;
    const line = raw.replace(/#.*$/, "");
    const t = line.trim();
    if (!t) return;
    if (/^(if|elif|else|for|while|def|class|try|except|finally|with)\b/.test(t) && !t.endsWith(":")) issues.push(`Line ${n}: lines starting with \`${t.split(/[\s(:]/)[0]}\` must end with a colon \`:\` (otherwise: SyntaxError).`);
    if (/^(if|elif|while)\b[^=!<>]*[^=!<>]=[^=]/.test(t)) issues.push(`Line ${n}: a single \`=\` stores a value. To **compare**, use \`==\`.`);
    if (/^print\s+["'\w]/.test(t)) issues.push(`Line ${n}: in Python 3, print needs brackets: \`print(...)\`.`);
    if (/^(Print|PRINT|Input|Def|If|For|While|Return)\b/.test(t)) issues.push(`Line ${n}: Python is case-sensitive — use lowercase \`${t.split(/\W/)[0].toLowerCase()}\`.`);
    if (/\b(true|false|none|null)\b/.test(t.replace(/(["']).*?\1/g, ""))) issues.push(`Line ${n}: Python writes \`True\`, \`False\` and \`None\` with a capital letter (and there is no \`null\`).`);
    const opens = (t.match(/[([{]/g) ?? []).length, closes = (t.match(/[)\]}]/g) ?? []).length;
    if (opens !== closes) issues.push(`Line ${n}: brackets don't match (${opens} opening vs ${closes} closing).`);
    if (((t.replace(/\\["']/g, "").match(/"/g) ?? []).length % 2) === 1) issues.push(`Line ${n}: a double quote \`"\` is not closed.`);
    if (/["']\s*\+\s*[a-z_]\w*\s*($|\+|\))/i.test(t) && /(int\(|len\(|\d)/.test(code) && !/str\(/.test(t)) issues.push(`Line ${n}: if you're joining text with a number using \`+\`, convert the number with \`str()\` or use an f-string — otherwise TypeError.`);
    if (/\.(push|length|size|add)\(/.test(t) && /\[/.test(code)) issues.push(`Line ${n}: lists don't have \`${/\.(push|length|size|add)\(/.exec(t)![1]}()\`. Use \`.append()\` to add, \`len(x)\` for the length.`);
    if (/\/\s*0(?!\.\d)\b/.test(t)) issues.push(`Line ${n}: dividing by 0 raises ZeroDivisionError.`);
    if (/^while\s+True\s*:/.test(t) && !/\bbreak\b|\breturn\b/.test(code)) issues.push(`Line ${n}: \`while True\` with no \`break\` runs forever (infinite loop).`);
    if (i > 0 && /:\s*$/.test(lines[i - 1].replace(/#.*$/, "")) && raw.search(/\S/) <= lines[i - 1].search(/\S/)) issues.push(`Line ${n}: should be indented (4 spaces) because line ${n - 1} ends with a colon — otherwise IndentationError.`);
    if (/\t/.test(raw.match(/^\s*/)![0]) && / /.test(raw.match(/^\s*/)![0])) issues.push(`Line ${n}: mixes tabs and spaces for indentation. Use 4 spaces.`);
    // simple NameError detection
    let m: RegExpExecArray | null;
    const assign = /^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*(?:=|\+=|-=)(?!=)/.exec(t);
    if ((m = /^(?:def|class)\s+(\w+)/.exec(t))) defined.add(m[1]);
    if ((m = /^def\s+\w+\((.*)\)/.exec(t))) m[1].split(",").forEach((p) => defined.add(p.split("=")[0].replace("*", "").trim()));
    if ((m = /^for\s+(.+?)\s+in\b/.exec(t))) m[1].split(",").forEach((v) => defined.add(v.replace(/[()]/g, "").trim()));
    if ((m = /^(?:import|from)\s+([\w.]+)(?:.*\bimport\s+(.+))?/.exec(t))) { defined.add(m[1].split(".")[0]); m[2]?.split(",").forEach((x) => defined.add(x.split(" as ").pop()!.trim())); }
    if ((m = /\bas\s+(\w+)\s*:?\s*$/.exec(t))) defined.add(m[1]);
    if ((m = /^except\s+\w+\s+as\s+(\w+)/.exec(t))) defined.add(m[1]);
    const rhs = assign ? t.slice(assign[0].length) : t;
    const used = rhs.replace(/(?:\b[rbfRBF]{1,2})?(["'])(?:\\.|(?!\1).)*\1/g, "").replace(/\.\w+/g, "").match(/\b[A-Za-z_]\w*\b(?!\s*=[^=])/g) ?? [];
    const KW = new Set("and or not in is if elif else for while def class return import from as try except finally with lambda pass break continue raise global nonlocal yield assert del print".split(" "));
    for (const u of used) {
      if (!defined.has(u) && !KW.has(u) && !/^[A-Z][a-z]+Error$/.test(u) && !/^(def|class|for)\b/.test(t)) {
        issues.push(`Line ${n}: \`${u}\` is used but I can't see where it was created — if it's a typo or created later, you'll get **NameError**.`);
        defined.add(u);
      }
    }
    if (assign) assign[1].split(",").forEach((v) => defined.add(v.trim()));
  });
  return [...new Set(issues)].slice(0, 8);
}

// ----------------------------------------------------------------- answers
function errorAnswer(msg: string, code: string | null): string | null {
  const m = /\b([A-Z][A-Za-z]*(?:Error|Exception))\b(?::\s*(.+))?/.exec(msg);
  if (!m) return null;
  const name = m[1];
  const detail = (m[2] ?? "").split("\n")[0].trim();
  const e = PY_ERRORS.find((x) => x.name.toLowerCase() === name.toLowerCase());
  const lineNo = [...msg.matchAll(/line (\d+)/g)].pop()?.[1];
  const out: string[] = [];
  if (e) {
    out.push(`**${e.name}** — ${e.summary}`, "", e.meaning);
    let specific = "";
    let mm: RegExpExecArray | null;
    if ((mm = /name '(\w+)' is not defined/.exec(detail))) specific = `Python doesn't know \`${mm[1]}\`. Check the spelling (capital letters matter), make sure you created \`${mm[1]}\` **before** this line, or add quotes if it's meant to be text: \`"${mm[1]}"\`.`;
    else if (/can only concatenate str/.test(detail)) specific = "You're joining text and a number with `+`. Wrap the number in `str()` — or, easier, use an f-string: `f\"Age: {age}\"`.";
    else if (/unsupported operand type/.test(detail)) specific = "You're doing math with values of different types (often a string from `input()`). Convert with `int()` or `float()` first.";
    else if ((mm = /invalid literal for int\(\) with base 10: '(.*)'/.exec(detail))) specific = `\`int()\` can't turn \`'${mm[1]}'\` into a whole number. Check what was typed, or use \`float()\` for decimals.`;
    else if (/list index out of range|string index out of range/.test(detail)) specific = "You asked for a position that doesn't exist. Indexes start at 0 and the last one is `len(...) - 1` (or use `[-1]`).";
    else if ((mm = /has no attribute '(\w+)'/.exec(detail))) specific = `That value has no \`.${mm[1]}\`. Check the spelling of the method, and the type of the value (it might be \`None\`).`;
    else if (/expected ':'/.test(detail)) specific = "Add a colon `:` at the end of the `if`/`for`/`while`/`def` line.";
    else if (/expected an indented block/.test(detail)) specific = "The line after a colon must be indented by 4 spaces.";
    else if (/missing \d+ required positional argument/.test(detail)) specific = "You called a function with fewer arguments than it needs. Compare the call with the `def` line.";
    else if (/division by zero/.test(detail)) specific = "Check the number you divide by before dividing: `if count != 0:`.";
    if (specific || lineNo) out.push("", `**In your case:** ${lineNo ? `the problem is on **line ${lineNo}**. ` : ""}${specific}`);
    out.push("", "**Common causes:**", ...e.why.map((w) => `- ${w}`));
    out.push("", "**Example — broken:**", fence(e.badCode), "**Fixed:**", fence(e.fixedCode));
    out.push("", "**How to avoid it:**", ...e.prevent.map((w) => `- ${w}`));
    out.push("", `👉 More practice: open \`/errors/${e.slug}\` in the Error Explorer.`);
  } else {
    out.push(`**${name}**${detail ? `: ${detail}` : ""}`, "", "Read the last line of the error: it names the problem. The `line N` part shows where it happened. Check that line and the one before it.");
  }
  if (code) {
    const issues = findIssues(code);
    if (issues.length) out.push("", "**I also noticed in your code:**", ...issues.map((x) => `- ${x}`));
  }
  return out.join("\n");
}

function practiceAnswer(q: string): string {
  const hit = search(q, ["lesson"], 1)[0]?.d;
  const lesson = hit?.lesson ?? MODULES[0].lessons[4];
  const tasks = lesson.practice.slice(0, 3);
  return [
    `Here are 3 practice questions about **${lesson.title}**:`,
    "",
    ...tasks.map((t, i) => `${i + 1}. ${t.prompt}${t.tests[0]?.input ? ` (example input: \`${t.tests[0].input.join(" / ")}\`)` : ""} — expected output: \`${t.tests[0]?.expected.split("\n").join(" ⏎ ") || "(nothing)"}\``),
    "",
    `Try them in the **Practice** section of the lesson \`/learn/${lesson.id}\` — it checks your answers automatically. Stuck? Ask me for a **hint** on question 1, 2 or 3.`,
  ].join("\n");
}

function hintAnswer(msg: string): string | null {
  const ex = EXERCISES.find((e) => msg.toLowerCase().includes(`"${e.title.toLowerCase()}"`) || msg.toLowerCase().includes(e.title.toLowerCase()));
  if (!ex) return null;
  return [
    `Let's work through **${ex.title}** together — I'll give hints, not the answer. 🙂`,
    "",
    `**Hint 1:** ${ex.hints[0]}`,
    ex.hints[1] ? `\n**Hint 2 (only if you're still stuck):** ${ex.hints[1]}` : "",
    "",
    "Plan it in small steps: 1) read the input, 2) do the calculation, 3) print exactly the expected output. Press **Run** often to check each step.",
  ].join("\n");
}

function compareAnswer(q: string): string | null {
  const m = /(?:difference|differences|compare|vs\.?|versus)\s+(?:between\s+)?(.+?)\s+(?:and|vs\.?|versus|or)\s+(.+?)[?.!]*$/i.exec(q) ?? /^(.+?)\s+(?:vs\.?|versus)\s+(.+?)[?.!]*$/i.exec(q);
  if (!m) return null;
  const special = GLOSSARY.find((g) => g.compare && g.compare.every((c) => new RegExp(`\\b${c}\\b`, "i").test(q)));
  if (special) return special.answer;
  const a = search(m[1], undefined, 1)[0]?.d, b = search(m[2], undefined, 1)[0]?.d;
  if (!a || !b || a.id === b.id) return null;
  const brief = (d: Doc) => d.glossary ? d.glossary.answer : d.lesson ? lessonAnswer(d.lesson, d.moduleTitle!, true) : `**${d.title}**`;
  return [`Good question! Let's compare them one at a time.`, "", brief(a), "", "---", "", brief(b)].join("\n");
}

// ----------------------------------------------------------------- rich lesson answers
type Turn = { role: string; content: string };

const LESSON_INDEX = MODULES.flatMap((m) => m.lessons.map((l, i) => ({ l, m, i })));
const lessonById = (id: string) => LESSON_INDEX.find((x) => x.l.id === id);

const SUGGEST = (topic: string) =>
  `\n\n---\n**What next?** You can reply with:\n- "explain it simpler" — if something wasn't clear\n- "another example"\n- "why would I use this?"\n- "give me practice on ${topic.toLowerCase()}"`;

/** Split a paragraph into sentences for step-by-step explanations. */
const sentences = (t: string) => t.replace(/\n/g, " ").split(/(?<=[.!?])\s+(?=[A-Z`*])/).map((x) => x.trim()).filter(Boolean);

function codeWalkthrough(code: string, limit = 8) {
  return code.split("\n").filter((l) => l.trim()).slice(0, limit)
    .map((l, i) => `${i + 1}. \`${l.trim()}\` — ${explainLine(l) ?? "runs this statement."}`).join("\n");
}

function mistakeBlock(l: Lesson, n = 2) {
  const out: string[] = [];
  for (const mk of l.mistakes.slice(0, n)) {
    const code = /\n|[=(]/.test(mk.wrong) && !/[.!?]$/.test(mk.wrong.trim());
    if (code) out.push("❌ Wrong:", fence(mk.wrong), "✅ Right:", fence(mk.right), mk.why, "");
    else out.push(`- ❌ ${mk.wrong}\n  ✅ ${mk.right} — ${mk.why}`);
  }
  return out.join("\n").trim();
}

function lessonAnswer(l: Lesson, moduleTitle: string, brief = false): string {
  if (brief) {
    const ex = l.examples[0];
    return [`### ${l.title}`, "", firstParagraphs(l.intro, 1), ...(ex ? ["", fence(ex.code)] : [])].join("\n");
  }
  const analogy = analogyFor(l.id);
  const out = [`### ${l.title}`, "", l.intro.trim()];
  if (analogy) out.push("", `💡 **Think of it like this:** ${analogy}`);
  if (l.syntax) out.push("", "**The basic pattern:**", fence(l.syntax));
  l.examples.slice(0, 2).forEach((ex, i) => {
    out.push("", `**Example ${i + 1} — ${ex.title}:**`, fence(ex.code));
    if (ex.note) out.push(ex.note);
  });
  out.push("", `**Where you'll see this in real life:** ${l.realWorld}`);
  if (l.mistakes.length) out.push("", "**A mistake almost everyone makes at first:**", mistakeBlock(l, 1));
  out.push("", "**Try it yourself** — paste this into the Playground, run it, then change something and run it again:", fence(l.tryIt));
  out.push("", `${lessonLink(l)} · Module: ${moduleTitle}`);
  return out.join("\n") + SUGGEST(l.title);
}

function simplerAnswer(l: Lesson): string {
  const analogy = analogyFor(l.id);
  const first = sentences(firstParagraphs(l.intro, 1));
  const ex = l.examples[0];
  const out = [`No problem — let's slow down and go step by step through **${l.title}**. 🙂`, ""];
  if (analogy) out.push(`💡 **Picture it like this:** ${analogy}`, "");
  out.push("**The idea in small steps:**");
  first.slice(0, 5).forEach((sn, i) => out.push(`${i + 1}. ${sn}`));
  if (ex) {
    out.push("", "**Now a tiny example, one line at a time:**", fence(ex.code), codeWalkthrough(ex.code));
    if (ex.note) out.push("", `**What you'll see:** ${ex.note}`);
  }
  out.push("", `**In one sentence:** ${first[0] ?? l.title}`);
  out.push("", "Still fuzzy? Tell me **which word or line** confuses you (for example \"what does the `=` do here?\") and I'll explain just that part.");
  return out.join("\n");
}

function moreAnswer(l: Lesson, moduleTitle: string): string {
  const out = [`Let's go deeper into **${l.title}**.`, ""];
  const paras = l.intro.trim().split(/\n\s*\n/);
  if (paras.length > 2) out.push(paras.slice(2).join("\n\n"), "");
  const extra = l.examples.slice(1);
  extra.forEach((ex) => { out.push(`**${ex.title}:**`, fence(ex.code), ...(ex.note ? [ex.note] : []), ""); });
  if (l.mistakes.length) out.push("**Common mistakes to watch for:**", mistakeBlock(l, 3), "");
  const idx = LESSON_INDEX.findIndex((x) => x.l.id === l.id);
  const next = LESSON_INDEX[idx + 1];
  if (next) out.push(`**What comes next:** after this, learners usually study **${next.l.title}** (\`/learn/${next.l.id}\`).`);
  out.push(`Module: ${moduleTitle}`);
  return out.join("\n") + SUGGEST(l.title);
}

function exampleAnswer(l: Lesson): string {
  const out = [`Here are more examples of **${l.title}** — run each one and look at the output.`, ""];
  [...l.examples].reverse().forEach((ex) => out.push(`**${ex.title}:**`, fence(ex.code), ...(ex.note ? [ex.note] : []), ""));
  out.push("**And one to play with:**", fence(l.tryIt), "Change a value, run it again, and see what changes — that's the fastest way to learn.");
  return out.join("\n") + SUGGEST(l.title);
}

function whyAnswer(l: Lesson): string {
  const analogy = analogyFor(l.id);
  return [
    `Good question — knowing **why** makes it stick. Here's why **${l.title.toLowerCase()}** matters:`, "",
    l.realWorld, "",
    ...(analogy ? [`💡 ${analogy}`, ""] : []),
    "Without it, you'd have to repeat yourself, write much longer code, or your program would break in situations it doesn't expect.",
    ...(l.mistakes[0] ? ["", `It also helps you avoid problems like this: ${l.mistakes[0].why}`] : []),
  ].join("\n") + SUGGEST(l.title);
}

function lessonPractice(l: Lesson): string {
  return [
    `Here's some practice on **${l.title}**. Try each one before looking anything up:`, "",
    ...l.practice.map((t, i) => `**${i + 1}.** ${t.prompt}${t.tests[0]?.input?.length ? `\n   Example input: \`${t.tests[0].input.join(" / ")}\`` : ""}\n   Expected output: \`${t.tests[0]?.expected.split("\n").join(" ⏎ ") || "(nothing)"}\``),
    "",
    ...l.quiz.map((q, i) => `**Quick check ${i + 1}:** ${q.q}${q.code ? "\n" + fence(q.code) : ""}\n${q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}) ${o}`).join("\n")}`),
    "",
    `The practice tasks are checked automatically in the lesson: \`/learn/${l.id}\`. Stuck on one? Say **"hint for question 1"**.`,
  ].join("\n");
}

function practiceHint(l: Lesson, n: number): string {
  const t = l.practice[Math.min(Math.max(n - 1, 0), l.practice.length - 1)];
  return `**Hint for question ${n}:** ${t.hint}\n\nTry it now. If it still doesn't work, paste your code here and I'll check it with you.`;
}

// ----------------------------------------------------------------- follow-ups & context
type Follow = "simpler" | "more" | "example" | "why" | "practice" | "mistakes" | "hint" | null;
function followUpType(msg: string): Follow {
  const m = msg.toLowerCase().trim();
  if (/\b(didn'?t|did not|dont|don'?t|do not|cant|can'?t|still not)\s+(really\s+)?(understand|get|follow)|not (clear|understand)|confus|simpler|easier|simple(r)? words|explain (it )?(again|differently|better|slower)|i'?m lost|lost me|^what\?*$|^huh|^again|tushunmadim|tushunarsiz|не понял|непонятно|eli5|like i'?m (5|five|10|ten)/.test(m)) return "simpler";
  if (/\bhint\b/.test(m)) return "hint";
  if (/(another|more|other|one more|second)\s+example|^examples?\??$|show me (an )?example|give (me )?(an )?example/.test(m)) return "example";
  if (/^why\b|why (do|would|should) (i|we)|what('?s| is) (it|this) (for|used for)|when (do|should|would) i use|use case|why (is|does) (it|this) (matter|useful)/.test(m)) return "why";
  if (/(practice|exercise|task|quiz me|test me|questions)/.test(m)) return "practice";
  if (/(mistake|avoid|careful|common error|pitfall)/.test(m)) return "mistakes";
  if (/^(more|tell me more|go on|continue|go deeper|deeper|details?|next|and\??|keep going|what else)\b|explain more|more detail|in detail/.test(m)) return "more";
  if (/^(yes|yeah|yep|yup|sure|ok(ay)?|please|go ahead|ha|xa)\b[.!]*$/.test(m)) return "more";
  return null;
}

interface Topic { kind: "lesson"; lesson: Lesson; moduleTitle: string } 
function topicOf(text: string): { doc: Doc; score: number } | null {
  const r = search(text, undefined, 1)[0];
  return r ? { doc: r.d, score: r.s } : null;
}
function docToLesson(d: Doc): Topic | null {
  if (d.lesson) return { kind: "lesson", lesson: d.lesson, moduleTitle: d.moduleTitle! };
  const id = d.glossary?.lesson;
  const hit = id ? lessonById(id) : null;
  return hit ? { kind: "lesson", lesson: hit.l, moduleTitle: hit.m.title } : null;
}
/** The topic of the conversation so far (newest first), used for follow-ups. */
function historyTopic(messages: Turn[]): Topic | null {
  for (let i = messages.length - 2; i >= 0; i--) {
    const t = messages[i];
    if (t.role === "assistant") {
      const m = /\/learn\/(m\d+-[a-z0-9-]+)/.exec(t.content);
      if (m && lessonById(m[1])) { const h = lessonById(m[1])!; return { kind: "lesson", lesson: h.l, moduleTitle: h.m.title }; }
      continue;
    }
    if (followUpType(t.content)) continue;
    const found = topicOf(t.content);
    const lt = found ? docToLesson(found.doc) : null;
    if (lt) return lt;
  }
  return null;
}

const OFF_TOPIC =
  "I'm your Python tutor, so I stick to **Python and programming** — that's where I can really help. 🐍\n\nHere are some things you can ask me:\n- \"What is a variable?\"\n- \"How does a for loop work?\"\n- \"Why do I get NameError?\"\n- \"How do I reverse a string?\"\n- Paste your code and ask \"explain this\" or \"why doesn't this work?\"\n- \"Give me practice questions about lists\"";

const CAPABILITIES =
  "I'm **PyBuddy**, your Python tutor. Here's how I can help:\n\n- **Explain any topic** — \"what is a dictionary?\", \"how does `range()` work?\"\n- **Go at your pace** — say \"I didn't understand\" or \"explain it simpler\" and I'll slow down; say \"another example\" or \"more\" to go deeper\n- **Read your errors** — paste the error message and I'll tell you what it means and how to fix it\n- **Read your code** — paste it and I'll explain it line by line, or say \"it doesn't work\" and I'll look for bugs\n- **How-to questions** — \"how do I sort a list?\", \"how do I read a file?\"\n- **Practice** — \"give me practice on loops\", and I'll give hints instead of answers\n\nWhat would you like to learn first?";

function styleReview(code: string): string[] {
  const tips: string[] = [];
  if (/^\s*[a-z]\s*=/m.test(code)) tips.push("Use descriptive variable names (`total_price` instead of `t`) — your future self will thank you.");
  if (/"\s*\+\s*str\(/.test(code)) tips.push("Joining text with `+ str(...)` works, but an f-string is cleaner: `f\"Total: {total}\"`.");
  if (/for \w+ in range\(len\((\w+)\)\)/.test(code)) tips.push("`for i in range(len(items))` can usually be `for item in items` (or `enumerate(items)` if you need the index).");
  if (/==\s*True|==\s*False/.test(code)) tips.push("You can write `if done:` instead of `if done == True:`.");
  if (!/^\s*#/m.test(code) && code.split("\n").length > 8) tips.push("Add a short comment above tricky parts to explain *why* the code does something.");
  if (/except\s*:/.test(code)) tips.push("Catch a specific error (`except ValueError:`) instead of a bare `except:` so real bugs aren't hidden.");
  if (/open\(/.test(code) && !/with open/.test(code)) tips.push("Use `with open(...) as f:` so the file closes automatically.");
  return tips;
}

// ----------------------------------------------------------------- main
export function localTutorAnswer(messages: Turn[], feature: AiFeature): string {
  const raw = messages[messages.length - 1].content.trim();
  const msg = extractCode(raw) || /\b[A-Z][A-Za-z]*(Error|Exception)\b/.test(raw) ? raw : correctTypos(raw);
  const lower = raw.toLowerCase();
  const code = extractCode(raw);
  const follow = followUpType(raw);
  const prev = messages.length > 1 ? historyTopic(messages) : null;

  if (/^(hi|hello|hey|salom|assalomu|privet|good (morning|evening|afternoon))\b/.test(lower) && msg.length < 40) {
    return "Hi! 👋 I'm **PyBuddy**, your Python tutor.\n\nYou can ask me about any Python topic, paste an error message, or paste your code and I'll walk through it with you. If anything I say isn't clear, just tell me \"I didn't understand\" and I'll explain it another way.\n\nWhat are you learning right now?";
  }
  if (/^(thanks|thank you|thx|rahmat|спасибо)\b/.test(lower) && msg.length < 40) return "You're welcome! 😊 Keep going — every bug you fix makes you a better programmer. Ask me anything else whenever you're ready.";
  if (/(what can you do|how can you help|who are you|what are you|help me|^help\b)/.test(lower) && !code && msg.length < 60) return CAPABILITIES;

  // 1. error messages
  const err = /\b[A-Z][A-Za-z]*(Error|Exception)\b/.test(msg) ? errorAnswer(msg, code) : null;
  if (err) return err;

  // 2. hints: for exercises by name, or for practice questions of the current topic
  if (/hint/.test(lower)) {
    const h = hintAnswer(msg);
    if (h) return h;
    const n = Number(/(\d)/.exec(lower)?.[1] ?? 1);
    if (prev) return practiceHint(prev.lesson, n);
  }

  // 3. code: explain / debug / review
  if (code) {
    if (feature === "debug" || /(not working|doesn'?t work|wrong|bug|fix|broken|error|why .*(not|wrong))/.test(lower)) {
      const issues = findIssues(code);
      return issues.length
        ? ["I went through your code carefully. Here's what looks wrong:", "", ...issues.map((x) => `- ${x}`), "", "Fix them **one at a time** and press **Run** after each fix — that way you'll know exactly which change helped.", "", "If there's still an error, paste the **full error message** (especially the last line) and I'll explain it."].join("\n")
        : "I read your code line by line and couldn't spot an obvious mistake. 🔍\n\nTo find it together:\n1. Run it and paste the **exact error message** here, if there is one.\n2. If there's no error but the result is wrong, tell me what you **expected** and what you **got**.\n3. Add `print()` lines to see the values of your variables at each step — most bugs show up immediately that way.\n\nHere's what your code does, so you can compare it with what you intended:\n\n" + codeWalkthrough(code, 15);
    }
    const out = explainCode(code);
    if (feature === "review") {
      const tips = styleReview(code);
      return out + (tips.length ? "\n\n**Ways to make it even better:**\n" + tips.map((t) => `- ${t}`).join("\n") : "\n\n**Style:** this already looks clean and readable — nice work! ✨");
    }
    return out;
  }

  // 4. follow-ups that refer to the previous topic ("I didn't understand", "another example", …)
  const own = topicOf(msg);
  const ownIsWeak = !own || own.score < 6 || msg.split(/\s+/).length <= 6;
  if (follow && prev && ownIsWeak) {
    const { lesson: l, moduleTitle } = prev;
    switch (follow) {
      case "simpler": return simplerAnswer(l);
      case "more": return moreAnswer(l, moduleTitle);
      case "example": return exampleAnswer(l);
      case "why": return whyAnswer(l);
      case "practice": return lessonPractice(l);
      case "mistakes": return `Here are the mistakes beginners make most often with **${l.title}**:\n\n${mistakeBlock(l, 3)}` + SUGGEST(l.title);
      case "hint": return practiceHint(l, 1);
    }
  }
  if (follow === "simpler" && !prev) return "No worries! Tell me **which topic** you'd like me to explain more simply — for example \"variables\", \"for loops\" or \"functions\" — and I'll take it step by step.";

  // 5. practice questions on a named topic
  if ((follow === "practice" || feature === "generate") && /(give|make|create|generate|some|more|\d|on|about)/.test(lower)) {
    const t = own ? docToLesson(own.doc) : prev;
    if (t) return lessonPractice(t.lesson);
    return practiceAnswer(msg);
  }

  // 6. comparisons
  const cmp = compareAnswer(msg);
  if (cmp) return cmp;

  // 7. topic gate
  const qt = terms(msg);
  const pythonish = qt.some((t) => PY_VOCAB.has(t)) || /[%*/=<>]{1,2}|\w+\(\)|`[^`]+`/.test(msg);
  const results = pythonish || prev ? search(msg) : [];
  if (results.length === 0) {
    const near = search(msg, ["lesson"], 3, 1);
    if (pythonish) {
      return near.length
        ? `I want to make sure I answer the right thing. 🤔 Did you mean one of these?\n\n${near.map((r) => `- **${r.d.title}** — ask me "explain ${r.d.title.toLowerCase().replace(/[?]/g, "")}"`).join("\n")}\n\nOr rephrase your question with the Python word you're curious about (for example "how does a while loop stop?").`
        : `I'm not sure I understood that question. Could you rephrase it with the Python word you're asking about? For example: "what is a list", "how do I use input()", or paste your code and I'll take a look.`;
    }
    return OFF_TOPIC;
  }

  // 8. best match — give the full, rich answer
  const best = results[0].d;
  if (best.glossary) {
    const lessonHit = search(msg, ["lesson"], 1)[0];
    const lt = lessonHit && lessonHit.s >= 5 ? docToLesson(lessonHit.d) : docToLesson(best);
    if (!lt) return best.glossary.answer;
    const l = lt.lesson;
    const analogy = analogyFor(l.id);
    const out = [best.glossary.answer];
    if (analogy && !best.id.startsWith("howto-")) out.push("", `💡 **Think of it like this:** ${analogy}`);
    const ex = l.examples.find((e) => !best.glossary!.answer.includes(e.code.split("\n")[0]));
    if (ex) out.push("", `**Another example — ${ex.title}:**`, fence(ex.code), ...(ex.note ? [ex.note] : []));
    if (l.mistakes.length) out.push("", "**Watch out for this common mistake:**", mistakeBlock(l, 1));
    out.push("", "**Try it yourself:**", fence(l.tryIt));
    out.push("", `${lessonLink(l)} · Module: ${lt.moduleTitle}`);
    return out.join("\n") + SUGGEST(l.title);
  }
  if (best.kind === "error") return errorAnswer(best.title, null)!;
  const answer = lessonAnswer(best.lesson!, best.moduleTitle!);
  const also = results.slice(1).filter((r) => r.d.lesson).map((r) => `**${r.d.title}** (\`/learn/${r.d.id}\`)`);
  return answer + (also.length ? `\n\nRelated: ${also.join(", ")}` : "");
}
