import "server-only";
import { cache } from "react";
import { getServerSupabase } from "@/lib/supabase/server";
import { finalizeFinishedContests, type ContestRow } from "@/lib/server/arena";
import { localizeProblemTitles, translateTexts } from "@/i18n/content";
import { getLocale } from "@/i18n/server";

export interface StandingRow { rank: number; user_id: string; username: string; rating: number | null; country: string | null; solved: number; penalty: number; cells: Record<string, { ok: boolean; wrong: number; minute: number | null }> }
export interface ContestProblem { letter: string; problem_id: number; title: string; rating: number; tags: string[]; time_limit_ms: number }

export const loadContest = cache(async (id: number) => {
  const sb = await getServerSupabase();
  if (!sb || !Number.isInteger(id)) return null;
  await finalizeFinishedContests();
  const { data: c } = await sb.from("contests").select("id, title, description, starts_at, duration_minutes, rated, rating_applied, created_by, division").eq("id", id).maybeSingle();
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
  const problems = (probs.data ?? []) as ContestProblem[];
  const contest = c as ContestRow & { description?: string | null };
  const locale = await getLocale();
  const [tr, titles] = await Promise.all([
    translateTexts(locale, [contest.title, contest.description ?? ""]),
    localizeProblemTitles(locale, problems.map((p) => ({ id: p.problem_id, title: p.title }))),
  ]);
  const localized = { ...contest, title: tr.get(contest.title) ?? contest.title, description: contest.description ? tr.get(contest.description) ?? contest.description : contest.description } as ContestRow;
  const authors = ((author.data ?? []) as { id: number; authors: string[] }[]).find((x) => x.id === id)?.authors ?? [];
  return {
    contest: localized,
    me,
    participants: count ?? 0,
    registered: Boolean(reg.data),
    problems: problems.map((p) => ({ ...p, title: titles.get(p.problem_id) ?? p.title })),
    standings: ((stand.data ?? []) as StandingRow[]).map((r) => ({ ...r, rank: Number(r.rank) })),
    authors,
  };
});
