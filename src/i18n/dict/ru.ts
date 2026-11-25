import { TRIPLES } from "./all";
export const RU: Record<string, string> = Object.fromEntries(TRIPLES.map(([en, , ru]) => [en, ru]));
