import type { Locale } from "./locales";
import { latinToCyrillic } from "./translit";
import { UZ } from "./dict/uz";
import { RU } from "./dict/ru";

const cyrCache = new Map<string, string>();

/** Translate an English UI string. Unknown strings fall back to English. `{name}` placeholders are filled from `vars`. */
export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  let s = key;
  if (locale === "uz") s = UZ[key] ?? key;
  else if (locale === "ru") s = RU[key] ?? key;
  else if (locale === "uz-Cyrl") {
    const src = UZ[key];
    if (src) {
      let c = cyrCache.get(src);
      if (c === undefined) { c = latinToCyrillic(src); cyrCache.set(src, c); }
      s = c;
    }
  }
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export type TFunction = (key: string, vars?: Record<string, string | number>) => string;
export const makeT = (locale: Locale): TFunction => (key, vars) => translate(locale, key, vars);

/** Countable words: English one/other, Russian one/few/many, Uzbek has one form after numbers. */
const PLURALS: Record<string, { en: [string, string]; uz: string; ru: [string, string, string] }> = {
  day: { en: ["{n} day", "{n} days"], uz: "{n} kun", ru: ["{n} день", "{n} дня", "{n} дней"] },
  "quiz passed": { en: ["{n} quiz passed", "{n} quizzes passed"], uz: "{n} ta test topshirildi", ru: ["{n} тест пройден", "{n} теста пройдено", "{n} тестов пройдено"] },
  lesson: { en: ["{n} lesson", "{n} lessons"], uz: "{n} ta dars", ru: ["{n} урок", "{n} урока", "{n} уроков"] },
  member: { en: ["{n} member", "{n} members"], uz: "{n} aʼzo", ru: ["{n} участник", "{n} участника", "{n} участников"] },
};
function ruForm(n: number) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return 2;
  if (b === 1) return 0;
  if (b >= 2 && b <= 4) return 1;
  return 2;
}
export function plural(locale: Locale, word: string, n: number) {
  const p = PLURALS[word];
  if (!p) return `${n} ${word}`;
  const tpl = locale === "ru" ? p.ru[ruForm(n)] : locale === "en" ? p.en[n === 1 ? 0 : 1] : locale === "uz-Cyrl" ? latinToCyrillic(p.uz) : p.uz;
  return tpl.replace("{n}", n.toLocaleString(locale === "en" ? "en-US" : locale === "ru" ? "ru-RU" : "uz"));
}
/** BCP-47 code for dates and numbers. */
export const intlLocale = (l: Locale) => ({ en: "en-US", uz: "uz-Latn-UZ", "uz-Cyrl": "uz-Cyrl-UZ", ru: "ru-RU" })[l];
