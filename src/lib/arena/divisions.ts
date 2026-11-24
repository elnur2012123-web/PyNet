/**
 * PyNest round types, named after how a young bird learns to fly.
 * A round only changes the rating of contestants below its limit; stronger
 * players may still join "out of competition" (shown with *).
 */
export type DivisionId = "hatchling" | "fledgling" | "soaring";

export interface Division { id: DivisionId; name: string; emoji: string; ratedBelow: number | null; who: string; className: string }

export const DIVISIONS: Division[] = [
  { id: "hatchling", name: "Hatchling", emoji: "🐣", ratedBelow: 1600, who: "beginners — rated for everyone below 1600", className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  { id: "fledgling", name: "Fledgling", emoji: "🐦", ratedBelow: 2100, who: "intermediate — rated for everyone below 2100", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  { id: "soaring", name: "Soaring", emoji: "🦅", ratedBelow: null, who: "open — rated for everyone", className: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
];

export const divisionOf = (id: string | null | undefined) => DIVISIONS.find((d) => d.id === id) ?? DIVISIONS[2];

/** Does this round change the rating of someone with this rating? (Unrated players count as 1400.) */
export function isEligible(divisionId: string | null | undefined, rating: number | null | undefined) {
  const d = divisionOf(divisionId);
  return d.ratedBelow === null || (rating ?? 1400) < d.ratedBelow;
}
