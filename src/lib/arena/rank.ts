/** Rating ranks: a bird grows from an Egg into a Phoenix. Names are coloured by rank everywhere on PyNest. */
export interface Rank {
  name: string;
  min: number;
  /** Tailwind classes for the username. */
  className: string;
  /** Background band colour for the rating graph. */
  band: string;
}

export const RANKS: Rank[] = [
  { name: "Egg", min: -Infinity, className: "text-zinc-500 dark:text-zinc-400", band: "#d4d4d8" },
  { name: "Chick", min: 1200, className: "text-green-600 dark:text-green-400", band: "#86efac" },
  { name: "Sparrow", min: 1400, className: "text-teal-600 dark:text-teal-300", band: "#5eead4" },
  { name: "Kestrel", min: 1600, className: "text-blue-600 dark:text-blue-400", band: "#93c5fd" },
  { name: "Falcon", min: 1900, className: "text-purple-600 dark:text-purple-400", band: "#d8b4fe" },
  { name: "Hawk", min: 2100, className: "text-orange-500 dark:text-orange-400", band: "#fdba74" },
  { name: "Eagle", min: 2300, className: "text-orange-600 dark:text-orange-400", band: "#fb923c" },
  { name: "Golden Eagle", min: 2400, className: "text-red-600 dark:text-red-400", band: "#fca5a5" },
  { name: "Thunderbird", min: 2600, className: "text-red-600 dark:text-red-400", band: "#f87171" },
  { name: "Phoenix", min: 3000, className: "text-red-700 dark:text-red-400", band: "#ef4444" },
];

export const UNRATED: Rank = { name: "Unrated", min: -Infinity, className: "text-fg", band: "transparent" };

export function rankFor(rating: number | null | undefined): Rank {
  if (rating === null || rating === undefined) return UNRATED;
  let r = RANKS[0];
  for (const x of RANKS) if (rating >= x.min) r = x;
  return r;
}

/** Problem difficulty colour (same scale as ranks). */
export function difficultyClass(rating: number) {
  return rankFor(rating).className;
}

/** The first contest is computed from this rating. */
export const START_RATING = 1400;
