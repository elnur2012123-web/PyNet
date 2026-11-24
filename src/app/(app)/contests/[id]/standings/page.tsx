import type { Metadata } from "next";
import { getServerSupabase } from "@/lib/supabase/server";
import { loadContest } from "../data";
import { contestPhase, MIN_RATED_CONTESTANTS } from "@/lib/server/arena";
import { Handle } from "@/components/arena/Handle";
import { isEligible, divisionOf } from "@/lib/arena/divisions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Standings" };

const hm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function StandingsPage({ params }: { params: Promise<{ id: string }> }) {
  const data = (await loadContest(Number((await params).id)))!;
  const { contest: c, problems, standings, me } = data;
  const phase = contestPhase(c);
  if (phase === "upcoming") return <div className="card p-8 text-center text-muted">Standings appear when the round starts.</div>;
  let changes = new Map<string, { old_rating: number; new_rating: number }>();
  if ((c as { rating_applied?: boolean }).rating_applied) {
    const sb = (await getServerSupabase())!;
    const { data: rc } = await sb.from("rating_changes").select("user_id, old_rating, new_rating").eq("contest_id", c.id);
    changes = new Map((rc ?? []).map((r) => [r.user_id as string, r]));
  }
  const showDelta = changes.size > 0;
  const accepted = (l: string) => standings.filter((r) => r.cells[l]?.ok).length;
  const tried = (l: string) => standings.filter((r) => r.cells[l]).length;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h1 className="font-semibold">{c.title} — {phase === "running" ? "live standings" : "final standings"}</h1>
        <span className="text-xs text-muted">{standings.length} contestant{standings.length === 1 ? "" : "s"} with submissions{divisionOf(c.division).ratedBelow ? ` · * = out of competition (rating ${divisionOf(c.division).ratedBelow}+)` : ""}</span>
      </div>
      {phase === "finished" && c.rated && c.rating_applied && changes.size === 0 && (
        <p className="border-b border-border bg-elevated/50 px-4 py-2 text-xs text-muted">Ratings didn&apos;t change in this round: a rated round needs at least {MIN_RATED_CONTESTANTS} contestants inside the division limit.</p>
      )}
      {phase === "finished" && c.rated && !c.rating_applied && (
        <p className="border-b border-border bg-elevated/50 px-4 py-2 text-xs text-muted">Rating changes are waiting for the anti-cheat review. They&apos;ll appear here soon.</p>
      )}
      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-elevated/60 text-xs text-muted">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2 text-left">Who</th>
              <th className="px-2 py-2" title="Problems solved">=</th>
              <th className="px-2 py-2">Penalty</th>
              {problems.map((p) => <th key={p.letter} className="px-2 py-2"><a href={`/contests/${c.id}/problem/${p.letter}`} className="hover:text-fg" title={p.title}>{p.letter}</a></th>)}
              {showDelta && <th className="px-3 py-2">Δ rating</th>}
            </tr>
          </thead>
          <tbody>
            {standings.map((r, i) => {
              const ch = changes.get(r.user_id);
              return (
                <tr key={r.user_id} className={`border-t border-border/60 text-center ${r.user_id === me ? "bg-accent/10" : i % 2 ? "bg-elevated/30" : ""}`}>
                  <td className="px-3 py-2">{r.rank}</td>
                  <td className="px-3 py-2 text-left"><Handle username={r.username} rating={ch ? ch.old_rating : r.rating} />{c.rated && !ch && !isEligible(c.division, r.rating) && <span className="ml-1 text-muted" title="Out of competition: rating is above this division's limit">*</span>}</td>
                  <td className="px-2 py-2 font-semibold">{r.solved}</td>
                  <td className="px-2 py-2 tabular-nums">{r.penalty}</td>
                  {problems.map((p) => {
                    const cell = r.cells[p.letter];
                    if (!cell) return <td key={p.letter} className="px-2 py-2" />;
                    return cell.ok ? (
                      <td key={p.letter} className="px-2 py-1.5 leading-tight"><span className="font-bold text-success">+{cell.wrong || ""}</span><br /><span className="text-[11px] text-muted">{hm(cell.minute ?? 0)}</span></td>
                    ) : (
                      <td key={p.letter} className="px-2 py-2 font-bold text-danger">-{cell.wrong}</td>
                    );
                  })}
                  {showDelta && <td className={`px-3 py-2 font-semibold ${ch && ch.new_rating - ch.old_rating >= 0 ? "text-success" : "text-danger"}`}>{ch ? `${ch.new_rating - ch.old_rating >= 0 ? "+" : ""}${ch.new_rating - ch.old_rating}` : ""}</td>}
                </tr>
              );
            })}
            {standings.length === 0 && <tr><td colSpan={5 + problems.length} className="px-4 py-10 text-center text-muted">No submissions yet.</td></tr>}
          </tbody>
          {standings.length > 0 && (
            <tfoot className="border-t border-border text-center text-xs">
              <tr><td colSpan={4} className="px-3 py-1.5 text-right text-success">Accepted</td>{problems.map((p) => <td key={p.letter} className="text-success">{accepted(p.letter)}</td>)}{showDelta && <td />}</tr>
              <tr><td colSpan={4} className="px-3 py-1.5 text-right text-muted">Tried</td>{problems.map((p) => <td key={p.letter} className="text-muted">{tried(p.letter)}</td>)}{showDelta && <td />}</tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
