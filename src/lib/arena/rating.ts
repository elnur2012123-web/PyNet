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

/**
 * Rating for SMALL rounds (fewer than SMALL_ROUND contestants).
 * The big-round formula assumes a crowd; with 2–7 people one place is worth a
 * huge jump. Here every pair of contestants plays a mini "match" instead:
 *   - solved more problems                → full win   (1.0)
 *   - same problems, lower penalty        → narrow win (0.6) — speed matters, but less
 *   - identical result                    → draw       (0.5)
 * Change = K × average over opponents of (result − expected), where expected
 * comes from the rating difference (standard Elo). New players (fewer than 5
 * rated rounds) move faster (K = 60) so they reach their level quickly; others use K = 32.
 */
export const SMALL_ROUND = 8;

export interface SmallInput { userId: string; rank: number; rating: number | null; solved: number; penalty: number; rounds: number }

export function computeSmallRoundChanges(rows: SmallInput[]): RatingChange[] {
  const n = rows.length;
  const cur = rows.map((r) => r.rating ?? START_RATING);
  if (n < 2) return rows.map((r, i) => ({ user_id: r.userId, rank: r.rank, old_rating: cur[i], new_rating: cur[i] }));
  return rows.map((r, i) => {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const o = rows[j];
      const score = r.solved > o.solved ? 1 : r.solved < o.solved ? 0
        : r.penalty < o.penalty ? 0.6 : r.penalty > o.penalty ? 0.4 : 0.5;
      sum += score - winProb(cur[i], cur[j]);
    }
    const k = r.rounds < 5 ? 60 : 32;
    return { user_id: r.userId, rank: r.rank, old_rating: cur[i], new_rating: Math.max(1, Math.round(cur[i] + (k * sum) / (n - 1))) };
  });
}
