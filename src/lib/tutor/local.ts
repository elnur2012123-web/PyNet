import "server-only";
import { MODULES } from "@/content/curriculum";
import { PY_ERRORS } from "@/content/errors";
import { EXERCISES } from "@/content/exercises";
import type { Lesson } from "@/content/types";
import type { AiFeature } from "@/lib/plans";
import { GLOSSARY, type GlossaryEntry } from "./glossary";

/**
 * PyBuddy Lite — a free, rule-based Python tutor. No API key, no cost.
 * It answers ONLY Python questions, using PyNest's own lessons, error guides,
 * exercises and a hand-written glossary, plus a line-by-line code explainer
 * and a static bug checker.
 */

// ----------------------------------------------------------------- text utils
const STOP = new Set(
  "a an the is are was were be been do does did i me my you your it its this that these those to of in on at for with and or but how what why when where which who can could should would will please explain tell show give mean means meaning use used using about like just so than then there here some any very much more most also as by from into python pythons programming code".split(" "),
);
const SYNONYMS: Record<string, string[]> = {
  loop: ["for", "while", "loops"], loops: ["for", "while", "loop"], iterate: ["for", "loop"], repeat: ["loop", "for", "while"],
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
  for (const w of words(s)) {
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
  ...DOCS.flatMap((d) => terms(d.title)),
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

function search(q: string, kinds?: Doc["kind"][], limit = 3) {
  const groups = termGroups(q);
  return DOCS.filter((d) => !kinds || kinds.includes(d.kind))
    .map((d) => ({ d, s: score(d, groups) }))
    .filter((r) => r.s >= 5)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit);
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

function lessonAnswer(l: Lesson, moduleTitle: string, brief = false): string {
  const out = [`### ${l.title}`, "", firstParagraphs(l.intro, brief ? 1 : 2)];
  if (l.syntax && !brief) out.push("", "**Syntax:**", fence(l.syntax));
  const ex = l.examples[0];
  if (ex) out.push("", `**Example — ${ex.title}:**`, fence(ex.code), ...(ex.note ? [ex.note] : []));
  if (!brief && l.mistakes[0] && /\n|[=(]/.test(l.mistakes[0].wrong)) out.push("", `**Common mistake:** ${l.mistakes[0].why}`);
  out.push("", `${lessonLink(l)} (Module: ${moduleTitle}).`);
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

const OFF_TOPIC =
  "I'm PyBuddy Lite, and I can only help with **Python and programming** questions. 🐍\n\nTry asking things like:\n- What is a variable?\n- How does a for loop work?\n- Why do I get `NameError`?\n- Explain this code (paste it in)\n- Give me practice questions about lists";

// ----------------------------------------------------------------- main
export function localTutorAnswer(messages: { role: string; content: string }[], feature: AiFeature): string {
  const msg = messages[messages.length - 1].content.trim();
  const lower = msg.toLowerCase();
  const code = extractCode(msg);

  if (/^(hi|hello|hey|salom|assalomu|privet|good (morning|evening|afternoon))\b/.test(lower) && msg.length < 40) {
    return "Hi! I'm **PyBuddy Lite**, your free Python helper. 👋\n\nAsk me what any Python word or symbol means, paste an error message, or paste code and I'll explain it line by line.";
  }
  if (/^(thanks|thank you|thx|rahmat|ok|okay)\b/.test(lower) && msg.length < 30) return "You're welcome! Keep going — every bug you fix makes you a better programmer. 🚀";

  // 1. error messages
  const err = /\b[A-Z][A-Za-z]*(Error|Exception)\b/.test(msg) ? errorAnswer(msg, code) : null;
  if (err) return err;

  // 2. hints for exercises (from the "Ask PyBuddy for a hint" button)
  if (/hint/.test(lower)) {
    const h = hintAnswer(msg);
    if (h) return h;
  }

  // 3. code: explain / debug / review
  if (code) {
    if (feature === "debug" || /(not working|doesn'?t work|wrong|bug|fix|broken|error)/.test(lower)) {
      const issues = findIssues(code);
      return issues.length
        ? ["I checked your code. Here's what looks wrong:", "", ...issues.map((x) => `- ${x}`), "", "Fix these one at a time, then press **Run** again. If there's still an error, paste the **full error message** and I'll explain it."].join("\n")
        : "I couldn't spot an obvious mistake by reading it. 🔍\n\nPlease run it and paste the **exact error message** (the last line is the most important). If there's no error but the output is wrong, tell me what you **expected** and what you **got** — then add `print()` lines to see your variables' values step by step.";
    }
    return explainCode(code);
  }

  // 4. practice questions
  if (/(practice|exercise|questions?|quiz me|task|challenge)s?\b/.test(lower) && /(give|make|create|generate|some|more|\d)/.test(lower)) return practiceAnswer(msg);

  // 5. comparisons
  const cmp = compareAnswer(msg);
  if (cmp) return cmp;

  // 6. topic gate
  const qt = terms(msg);
  const pythonish = qt.some((t) => PY_VOCAB.has(t)) || /[%*/=<>]{1,2}|\w+\(\)|`[^`]+`/.test(msg);
  const results = search(msg);
  if (!pythonish || results.length === 0) {
    return pythonish
      ? `I'm not sure about that one yet. 🤔 Try rephrasing with the Python word you're asking about (for example "what is a dictionary" or "how does range work"), or browse the **Course** and **Error Explorer** pages.`
      : OFF_TOPIC;
  }

  // 7. best match
  const best = results[0].d;
  if (best.glossary) {
    const related = results.slice(1).find((r) => r.d.lesson)?.d;
    return best.glossary.answer + (related?.lesson ? `\n\n${lessonLink(related.lesson)}` : best.glossary.lesson ? `\n\n👉 Learn more: open \`/learn/${best.glossary.lesson}\`` : "");
  }
  if (best.kind === "error") return errorAnswer(best.title, null)!;
  const answer = lessonAnswer(best.lesson!, best.moduleTitle!);
  const also = results.slice(1).filter((r) => r.d.lesson).map((r) => `\`/learn/${r.d.id}\` (${r.d.title})`);
  return answer + (also.length ? `\n\nRelated lessons: ${also.join(", ")}` : "");
}
