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

/**
 * Applies rating changes for every finished, rated round that hasn't been rated yet.
 * Safe to call on every page view: the database applies each round exactly once.
 */
export async function finalizeFinishedContests() {
  const admin = getAdminSupabase();
  if (!admin) return;
  const { data } = await admin.from("contests").select("id, starts_at, duration_minutes").eq("rated", true).eq("rating_applied", false);
  for (const c of (data ?? []) as Pick<ContestRow, "id" | "starts_at" | "duration_minutes">[]) {
    if (contestPhase(c) !== "finished") continue;
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
