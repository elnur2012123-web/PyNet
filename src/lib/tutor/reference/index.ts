import type { GlossaryEntry } from "../glossary";
import { BUILTINS } from "./builtins";
import { METHODS } from "./methods";
import { KEYWORDS } from "./keywords";
import { CONCEPTS } from "./concepts";
import type { RefItem } from "./types";

export const REFERENCE_ITEMS: RefItem[] = [...BUILTINS, ...METHODS, ...KEYWORDS, ...CONCEPTS];

const fence = (code: string, lang = "python") => "```" + lang + "\n" + code + "\n```";

function toAnswer(r: RefItem): string {
  const out = [`**${r.name}**`, "", r.what];
  if (r.code) out.push("", fence(r.code));
  if (r.output) out.push("**Output:**", fence(r.output, "text"));
  if (r.tip) out.push("", `💡 ${r.tip}`);
  return out.join("\n");
}

/** Reference items as glossary entries so PyBuddy can search them. */
export const REFERENCE: GlossaryEntry[] = REFERENCE_ITEMS.map((r) => ({
  id: `ref-${r.id}`,
  title: r.name,
  keywords: r.keywords,
  answer: toAnswer(r),
  lesson: r.lesson,
  compare: r.compare,
}));
