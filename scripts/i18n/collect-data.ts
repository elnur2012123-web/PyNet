/** Data strings shown through <T k={...}> / tx(var): appended to all-keys.json. */
import { readFileSync, writeFileSync } from "node:fs";
import ts from "typescript";
import { ACHIEVEMENTS } from "../../src/lib/achievements";
import { LEAGUES } from "../../src/lib/xp";
import { RANKS } from "../../src/lib/arena/rank";
import { DIVISIONS } from "../../src/lib/arena/divisions";
import { EXERCISE_LEVELS } from "../../src/lib/exercise-levels";
import { EXERCISES } from "../../src/content/exercises";
import { PY_ERRORS } from "../../src/content/errors";
import { PLANS, COMPARISON } from "../../src/lib/plans";
import { PROBLEMS } from "../problems/data";

const keys = new Set<string>(JSON.parse(readFileSync("scripts/i18n/all-keys.json", "utf8")));
const add = (s?: string | null) => { if (s && /[A-Za-z]{2}/.test(s)) keys.add(s); };
ACHIEVEMENTS.forEach((a) => { add(a.name); add(a.description); });
LEAGUES.forEach((l) => add(l.name));
RANKS.forEach((r) => add(r.name));
DIVISIONS.forEach((d) => { add(d.name); add(d.who); });
EXERCISE_LEVELS.forEach((l) => add(l.label));
EXERCISES.forEach((e) => add(e.topic));
PY_ERRORS.forEach((e) => { add(e.summary); add(e.category); add(e.difficulty); });
PLANS.forEach((p) => { add(p.tagline); p.features.forEach(add); });
COMPARISON.forEach((c) => { add(c.feature); c.values.forEach(add); });
PROBLEMS.forEach((p) => p.tags.forEach(add));
// string literals inside specific constants of TSX files
const consts: [string, string[]][] = [
  ["src/app/(marketing)/page.tsx", ["STAGES", "FAQ"]],
  ["src/app/(marketing)/pricing/page.tsx", ["FAQ"]],
  ["src/components/tutor/TutorChat.tsx", ["SUGGESTIONS"]],
];
for (const [file, names] of consts) {
  const sf = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (n: ts.Node, inside: boolean) => {
    if (ts.isVariableDeclaration(n) && names.includes(n.name.getText(sf))) inside = true;
    if (inside && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && !(ts.isPropertyAssignment(n.parent) && n.parent.name.getText(sf) === "range")) add(n.text);
    ts.forEachChild(n, (c) => visit(c, inside));
  };
  visit(sf, false);
}
// inline arrays on the home page + runtime status labels
["Free to start", "Nothing to install", "Works on your phone", "Read a short explanation", "One idea at a time, with an everyday comparison and a real-world example.",
 "Run the examples", "Press Run and see what happens. Change a number and run it again.", "Make it break, then fix it",
 "Each lesson shows the mistakes beginners make most, so you recognise them when they happen to you.", "Solve three small tasks",
 "Your code is run and checked against the expected output automatically.", "Answer two quick questions", "Get them right to finish the lesson and earn XP.",
 "Python loads on first run", "Loading Python…", "Python failed to load", "Check solution",
 "forever", "/ month", "/ year", "Save ${amount} ({pct}%) vs monthly · ${perMonth}/mo", "or ${yearly}/year", "Switch to {plan}", "Upgrade to {plan}", "Get {plan}",
 "Welcome back, {name}", "Best: {n}", "{n} this week", "{league} League", "{n} XP to {league}", "{n} XP this week"].forEach(add);
const list = [...keys].sort();
writeFileSync("scripts/i18n/all-keys.json", JSON.stringify(list, null, 1));
console.log(list.length, "keys");
