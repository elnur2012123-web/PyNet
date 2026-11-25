import { TRIPLES } from "./all";
/** Oʻzbekcha (lotin). Cyrillic is generated from this with latinToCyrillic(). */
export const UZ: Record<string, string> = Object.fromEntries(TRIPLES.map(([en, uz]) => [en, uz]));
