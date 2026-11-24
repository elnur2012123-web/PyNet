import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { computeRatingChanges, placesFromRanks } from "@/lib/arena/rating";

export interface ContestRow {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  duration_minutes: number;
  rated: boolean;
  rating_applied: boolean;
}

export const endsAt = (c: Pick<ContestRow, "starts_at" | "duration_minutes">) =>
  new Date(new Date(c.starts_at).getTime() + c.duration_minutes * 60_000);

export function contestPhase(c: Pick<ContestRow, "starts_at" | "duration_minutes">, now = Date.now()) {
  if (now < new Date(c.starts_at).getTime()) return "upcoming" as const;
  if (now < endsAt(c).getTime()) return "running" as const;
  return "finished" as const;
}

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
  const { data } = await admin.from("contests").select("id, starts_at, duration_minutes, rated, rating_applied, checked_at")
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
    const standings = (rows ?? []) as { rank: number; user_id: string; rating: number | null }[];
    const places = placesFromRanks(standings.map((r) => Number(r.rank)));
    const changes = computeRatingChanges(standings.map((r, i) => ({ userId: r.user_id, place: places[i], rating: r.rating })))
      .map((ch, i) => ({ ...ch, rank: Number(standings[i].rank) }));
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
