export type Locale = "en" | "uz" | "uz-Cyrl" | "ru";

export const LOCALES: { id: Locale; label: string; short: string; htmlLang: string; note?: string }[] = [
  { id: "en", label: "English", short: "EN", htmlLang: "en" },
  { id: "uz", label: "Oʻzbekcha", short: "UZ", htmlLang: "uz-Latn", note: "lotin" },
  { id: "uz-Cyrl", label: "Ўзбекча", short: "ЎЗ", htmlLang: "uz-Cyrl", note: "кирилл" },
  { id: "ru", label: "Русский", short: "RU", htmlLang: "ru" },
];
export const LOCALE_COOKIE = "pynest-lang";
export const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.id === v);
