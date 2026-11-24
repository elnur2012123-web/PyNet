/**
 * Elo-style contest rating.
 * 1. Expected place ("seed") of each contestant from everyone's current rating.
 * 2. Target place = geometric mean of the seed and the real place.
 * 3. Find the rating that would have that seed; move halfway towards it.
 * 4. Small correction so ratings don't inflate over time.
 */
import { START_RATING } from "./rank";

export interface RatingInput { userId: string; place: number; rating: number | null }
export interface RatingChange { user_id: string; rank: number; old_rating: number; new_rating: number }

const winProb = (ra: number, rb: number) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

export function computeRatingChanges(rows: RatingInput[]): RatingChange[] {
  const n = rows.length;
  const cur = rows.map((r) => r.rating ?? START_RATING);
  if (n < 2) return rows.map((r, i) => ({ user_id: r.userId, rank: r.place, old_rating: cur[i], new_rating: cur[i] }));

  const seedAt = (rating: number, skip: number) => {
    let s = 1;
    for (let j = 0; j < n; j++) if (j !== skip) s += winProb(cur[j], rating);
    return s;
  };
  const delta = rows.map((r, i) => {
    const seed = seedAt(cur[i], i);
    const target = Math.sqrt(seed * r.place);
    let lo = 1, hi = 8000;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (seedAt(mid, i) < target) hi = mid; else lo = mid;
    }
    return (lo - cur[i]) / 2;
  });
  // Keep the total roughly zero (slightly negative to fight inflation).
  const inc = -delta.reduce((a, b) => a + b, 0) / n - 1;
  for (let i = 0; i < n; i++) delta[i] += inc;
  // The strongest contestants shouldn't gain from the correction.
  const top = [...cur.keys()].sort((a, b) => cur[b] - cur[a]).slice(0, Math.min(n, 4 * Math.round(Math.sqrt(n))));
  const topSum = top.reduce((a, i) => a + delta[i], 0);
  const inc2 = Math.min(Math.max(-topSum / top.length, -10), 0);
  return rows.map((r, i) => ({
    user_id: r.userId,
    rank: r.place,
    old_rating: cur[i],
    new_rating: Math.max(1, Math.round(cur[i] + delta[i] + inc2)),
  }));
}

/** Shared places for ties: everyone tied for places 3–5 gets place 4. */
export function placesFromRanks(ranks: number[]): number[] {
  return ranks.map((r) => {
    const tied = ranks.filter((x) => x === r).length;
    return r + (tied - 1) / 2;
  });
}
