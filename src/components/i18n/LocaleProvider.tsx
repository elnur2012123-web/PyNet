"use client";
import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/i18n/locales";
import { makeT, plural, type TFunction } from "@/i18n/translate";

const Ctx = createContext<{ locale: Locale; t: TFunction }>({ locale: "en", t: makeT("en") });

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: makeT(locale) }), [locale]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useLocale = () => useContext(Ctx).locale;
/** For client components: `const tx = useT();` */
export const useT = () => useContext(Ctx).t;
/** Countable words: `tp("day", 3)` → "3 days" / "3 дня" / "3 kun". */
export const useTp = () => {
  const locale = useLocale();
  return (word: string, n: number) => plural(locale, word, n);
};
