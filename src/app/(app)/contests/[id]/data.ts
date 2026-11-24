import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { finalizeFinishedContests, type ContestRow } from "@/lib/server/arena";

export interface StandingRow { rank: number; user_id: string; username: string; rating: number | null; country: string | null; solved: number; penalty: number; cells: Record<string, { ok: boolean; wrong: number; minute: number | null }> }
export interface ContestProblem { letter: string; problem_id: number; title: string; rating: number; tags: string[]; time_limit_ms: number }

export const loadContest = cache(async (id: number) => {
  const sb = await getServerSupabase();
  if (!sb || !Number.isInteger(id)) return null;
  await finalizeFinishedContests();
  const { data: c } = await sb.from("contests").select("id, title, description, starts_at, duration_minutes, rated, rating_applied, created_by").eq("id", id).maybeSingle();
  if (!c) return null;
  const { data: auth } = await sb.auth.getUser();
  const me = auth.user?.id ?? null;
  const [{ count }, reg, probs, stand, author] = await Promise.all([
    sb.from("contest_registrations").select("user_id", { count: "exact", head: true }).eq("contest_id", id),
    me ? sb.from("contest_registrations").select("user_id").eq("contest_id", id).eq("user_id", me).maybeSingle() : Promise.resolve({ data: null }),
    sb.rpc("get_contest_problems", { p_contest: id }),
    sb.rpc("get_contest_standings", { p_contest: id }),
    sb.rpc("get_contests"),
  ]);
  const authors = ((author.data ?? []) as { id: number; authors: string[] }[]).find((x) => x.id === id)?.authors ?? [];
  return {
    contest: c as ContestRow,
    me,
    participants: count ?? 0,
    registered: Boolean(reg.data),
    problems: (probs.data ?? []) as ContestProblem[],
    standings: ((stand.data ?? []) as StandingRow[]).map((r) => ({ ...r, rank: Number(r.rank) })),
    authors,
  };
});
