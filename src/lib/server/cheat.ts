import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fingerprint, similarity, MIN_TOKENS, SIMILAR_AT } from "@/lib/arena/plagiarism";

interface Sub { id: number; user_id: string; problem_id: number; code: string; created_at: string }
interface Flag {
  kind: "similar_code" | "fast_solve"; severity: "low" | "medium" | "high"; contest_id: number; problem_id: number;
  user_id: string; other_user_id?: string | null; submission_id: number; other_submission_id?: number | null; score: number; details: string;
}

/** Scans one round's accepted solutions and stores new flags. Returns how many were added. */
export async function scanContest(admin: SupabaseClient, contestId: number, markChecked: boolean) {
  const { data: c } = await admin.from("contests").select("id, starts_at").eq("id", contestId).maybeSingle();
  if (!c) return 0;
  const [{ data: cps }, { data: subs }] = await Promise.all([
    admin.from("contest_problems").select("letter, problem_id, problems(rating)").eq("contest_id", contestId),
    admin.from("submissions").select("id, user_id, problem_id, code, created_at").eq("contest_id", contestId).eq("verdict", "OK").order("created_at"),
  ]);
  const rating = new Map(((cps ?? []) as unknown as { letter: string; problem_id: number; problems: { rating: number } }[]).map((p) => [p.problem_id, { rating: p.problems?.rating ?? 800, letter: p.letter }]));
  // first Accepted per contestant per problem
  const first = new Map<string, Sub>();
  for (const s of (subs ?? []) as Sub[]) if (!first.has(`${s.user_id}:${s.problem_id}`)) first.set(`${s.user_id}:${s.problem_id}`, s);
  const ids = [...new Set([...first.values()].map((s) => s.user_id))];
  const { data: profs } = ids.length ? await admin.from("profiles").select("id, username").in("id", ids) : { data: [] };
  const name = new Map(((profs ?? []) as { id: string; username: string }[]).map((p) => [p.id, p.username]));
  const start = new Date(c.starts_at).getTime();
  const flags: Flag[] = [];

  const byProblem = new Map<number, Sub[]>();
  for (const s of first.values()) byProblem.set(s.problem_id, [...(byProblem.get(s.problem_id) ?? []), s]);
  for (const [pid, list] of byProblem) {
    const info = rating.get(pid) ?? { rating: 800, letter: "?" };
    const fps = list.map((s) => fingerprint(s.code));
    const pairs: { i: number; j: number; sim: number }[] = [];
    let total = 0;
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      total++;
      if (fps[i].tokens < MIN_TOKENS || fps[j].tokens < MIN_TOKENS) continue;
      const sim = similarity(fps[i], fps[j]);
      if (sim >= SIMILAR_AT) pairs.push({ i, j, sim });
    }
    // When most contestants wrote the same thing, it's probably just the natural solution.
    const common = list.length >= 4 && pairs.length / Math.max(1, total) > 0.5;
    for (const { i, j, sim } of pairs) {
      const [early, late] = list[i].created_at <= list[j].created_at ? [list[i], list[j]] : [list[j], list[i]];
      const gap = Math.round((new Date(late.created_at).getTime() - new Date(early.created_at).getTime()) / 60000);
      flags.push({
        kind: "similar_code", severity: common ? "low" : sim >= 95 ? "high" : "medium", contest_id: contestId, problem_id: pid,
        user_id: late.user_id, other_user_id: early.user_id, submission_id: late.id, other_submission_id: early.id, score: sim,
        details: `Problem ${info.letter}: @${name.get(late.user_id)}'s code is ${sim}% the same as @${name.get(early.user_id)}'s (submitted ${gap} min later).${common ? " Many contestants wrote similar code — may be the standard solution." : ""}`,
      });
    }
    // Hard problem solved impossibly fast.
    if (info.rating >= 1500) {
      for (const s of list) {
        const minute = (new Date(s.created_at).getTime() - start) / 60000;
        const limit = info.rating / 300;
        if (minute < limit) {
          flags.push({
            kind: "fast_solve", severity: minute < limit / 2 ? "medium" : "low", contest_id: contestId, problem_id: pid,
            user_id: s.user_id, submission_id: s.id, score: Math.max(0, Math.round(minute)),
            details: `Problem ${info.letter} (*${info.rating}) accepted ${minute < 1 ? "in under a minute" : `${Math.round(minute)} min`} after the start.`,
          });
        }
      }
    }
  }
  let added = 0;
  for (const f of flags) {
    const { error } = await admin.from("cheat_flags").insert(f);
    if (!error) added++; // duplicates (already flagged) are ignored by the unique index
  }
  if (markChecked) await admin.from("contests").update({ checked_at: new Date().toISOString() }).eq("id", contestId);
  return added;
}
