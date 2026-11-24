import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { computeRatingChanges, computeSmallRoundChanges, placesFromRanks, SMALL_ROUND } from "@/lib/arena/rating";
import { isEligible } from "@/lib/arena/divisions";

export interface ContestRow {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  duration_minutes: number;
  rated: boolean;
  rating_applied: boolean;
  division?: string;
}

export const endsAt = (c: Pick<ContestRow, "starts_at" | "duration_minutes">) =>
  new Date(new Date(c.starts_at).getTime() + c.duration_minutes * 60_000);

export function contestPhase(c: Pick<ContestRow, "starts_at" | "duration_minutes">, now = Date.now()) {
  if (now < new Date(c.starts_at).getTime()) return "upcoming" as const;
  if (now < endsAt(c).getTime()) return "running" as const;
  return "finished" as const;
}

/** A rated round needs at least this many eligible contestants to change anyone's rating. */
export const MIN_RATED_CONTESTANTS = 2;

/** Rounds with unreviewed cheat flags wait this long before ratings are applied anyway. */
const REVIEW_WINDOW_MS = 48 * 3600e3;

/**
 * Runs after a round ends: scans it for cheating once, then applies rating changes
 * (right away if nothing was flagged, otherwise after staff review or 48 hours).
 * Safe to call on every page view: the database applies each round exactly once.
 */
export async function finalizeFinishedContests() {
  const admin = getAdminSupabase();
  if (!admin) return;
  const { data } = await admin.from("contests").select("id, starts_at, duration_minutes, rated, rating_applied, checked_at, division")
    .or("checked_at.is.null,and(rated.eq.true,rating_applied.eq.false)");
  for (const c of (data ?? []) as (ContestRow & { checked_at: string | null })[]) {
    if (contestPhase(c) !== "finished") continue;
    if (!c.checked_at) {
      const { scanContest } = await import("./cheat");
      await scanContest(admin, c.id, true);
    }
    if (!c.rated || c.rating_applied) continue;
    const { count } = await admin.from("cheat_flags").select("id", { count: "exact", head: true }).eq("contest_id", c.id).eq("status", "open").neq("severity", "low");
    if ((count ?? 0) > 0 && Date.now() < endsAt(c).getTime() + REVIEW_WINDOW_MS) continue;
    const { data: rows } = await admin.rpc("get_contest_standings", { p_contest: c.id });
    // Only contestants inside the division's rating limit are rated; re-rank among them.
    const all = (rows ?? []) as { rank: number; user_id: string; rating: number | null; solved: number; penalty: number }[];
    const standings = all.filter((r) => isEligible(c.division, r.rating));
    let prev = "", rank = 0;
    standings.forEach((r, i) => { const key = `${r.solved}:${r.penalty}`; if (key !== prev) { rank = i + 1; prev = key; } r.rank = rank; });
    // A round with a single rated contestant can't move anyone's rating.
    if (standings.length < MIN_RATED_CONTESTANTS) {
      await admin.rpc("apply_contest_ratings", { p_contest: c.id, p_changes: [] });
      continue;
    }
    let changes;
    if (standings.length < SMALL_ROUND) {
      // Small round: pairwise Elo that is gentle about speed-only differences.
      const ids = standings.map((r) => r.user_id);
      const { data: past } = ids.length ? await admin.from("rating_changes").select("user_id").in("user_id", ids) : { data: [] };
      const rounds = new Map<string, number>();
      for (const p of (past ?? []) as { user_id: string }[]) rounds.set(p.user_id, (rounds.get(p.user_id) ?? 0) + 1);
      changes = computeSmallRoundChanges(standings.map((r) => ({ userId: r.user_id, rank: Number(r.rank), rating: r.rating, solved: r.solved, penalty: r.penalty, rounds: rounds.get(r.user_id) ?? 0 })));
    } else {
      const places = placesFromRanks(standings.map((r) => Number(r.rank)));
      changes = computeRatingChanges(standings.map((r, i) => ({ userId: r.user_id, place: places[i], rating: r.rating })))
        .map((ch, i) => ({ ...ch, rank: Number(standings[i].rank) }));
    }
    await admin.rpc("apply_contest_ratings", { p_contest: c.id, p_changes: changes });
  }
}

export interface ContestListRow extends ContestRow { participants: number; registered: boolean; authors: string[] }

export async function listContests(): Promise<ContestListRow[]> {
  const { getServerSupabase } = await import("@/lib/supabase/server");
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb.rpc("get_contests");
  return ((data ?? []) as ContestListRow[]).map((c) => ({ ...c, participants: Number(c.participants) }));
}

export async function topRated(limit = 10) {
  const { getServerSupabase } = await import("@/lib/supabase/server");
  const sb = await getServerSupabase();
  if (!sb) return [];
  const { data } = await sb.rpc("get_rating_list", { p_limit: limit });
  return (data ?? []) as { rank: number; username: string; country: string | null; rating: number; max_rating: number; contests: number }[];
}
