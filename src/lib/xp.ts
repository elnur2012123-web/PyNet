export const XP_RULES = {
  lesson: 20,
  project: 100,
  quiz: 50,
  exercise: { "very-easy": 5, easy: 10, medium: 20, hard: 40 },
} as const;

export type Difficulty = keyof typeof XP_RULES.exercise;

/** Level n needs 50·n·(n−1) XP. Mirrors public.level_for_xp in SQL. */
export function levelForXp(xp: number): number {
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + (8 * Math.max(xp, 0)) / 100)) / 2));
}
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}
export function levelProgress(xp: number) {
  const level = levelForXp(xp);
  const start = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - start, needed: next - start, pct: Math.round(((xp - start) / (next - start)) * 100) };
}

export const LEAGUES = [
  { name: "Bronze", min: 0, color: "#b4774a" },
  { name: "Silver", min: 100, color: "#9aa4b2" },
  { name: "Gold", min: 250, color: "#d4a72c" },
  { name: "Platinum", min: 500, color: "#5fb3b3" },
  { name: "Diamond", min: 900, color: "#6b8cff" },
  { name: "Master", min: 1500, color: "#a66bff" },
] as const;
export type LeagueName = (typeof LEAGUES)[number]["name"];

export function leagueForWeeklyXp(xp: number) {
  let current: (typeof LEAGUES)[number] = LEAGUES[0];
  for (const l of LEAGUES) if (xp >= l.min) current = l;
  const idx = LEAGUES.findIndex((l) => l.name === current.name);
  const next = LEAGUES[idx + 1];
  return { league: current, next, xpToNext: next ? next.min - xp : 0 };
}

/** Mirrors the streak bonus in public.award_activity. */
export function streakBonus(streak: number) {
  return streak >= 2 ? 5 + Math.min(streak, 10) : 0;
}
