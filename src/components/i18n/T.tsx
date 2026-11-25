"use client";
import { useT } from "./LocaleProvider";

/** Translated text: <T k="Start learning" />. Works inside server and client components. */
export function T({ k, vars }: { k: string; vars?: Record<string, string | number> }) {
  const t = useT();
  return <>{t(k, vars)}</>;
}
