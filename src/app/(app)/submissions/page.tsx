import type { Metadata } from "next";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Handle } from "@/components/arena/Handle";
import { verdictClass, verdictText } from "@/lib/arena/verdict";
import { LocalTime } from "@/components/arena/Countdown";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Status" };
export const dynamic = "force-dynamic";

interface Row { id: number; created_at: string; username: string; rating: number | null; problem_id: number; problem_title: string; contest_id: number | null; letter: string | null; verdict: string; failed_test: number | null; time_ms: number; language?: string }
type SP = Promise<{ user?: string; problem?: string; contest?: string; verdict?: string }>;

export default async function StatusPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sb = await getServerSupabase();
  if (!sb) return <EmptyState title="Status needs accounts" />;
  const { data } = await sb.rpc("get_status", {
    p_username: sp.user || null, p_problem: sp.problem ? Number(sp.problem) : null, p_contest: sp.contest ? Number(sp.contest) : null, p_limit: 200,
  });
  let rows = (data ?? []) as Row[];
  if (sp.verdict) rows = rows.filter((r) => r.verdict === sp.verdict);
  const title = sp.user ? `${sp.user} submissions` : sp.contest ? "Contest status" : sp.problem ? `Submissions for problem ${sp.problem}` : "Status";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">{title}</h1>
          <p className="mt-1 text-muted">The latest judged solutions. Code is private: you can read someone&apos;s solution after you solve that problem yourself.</p>
        </div>
        <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
          {sp.user && <input type="hidden" name="user" value={sp.user} />}
          {sp.problem && <input type="hidden" name="problem" value={sp.problem} />}
          {sp.contest && <input type="hidden" name="contest" value={sp.contest} />}
          <select name="verdict" defaultValue={sp.verdict ?? ""} className="input">
            <option value="">Any verdict</option><option value="OK">Accepted</option><option value="WA">Wrong answer</option><option value="RE">Runtime error</option><option value="TLE">Time limit exceeded</option><option value="CE">Compilation error</option>
          </select>
          <button className="btn-secondary btn-sm">Apply</button>
          {(sp.user || sp.problem || sp.contest || sp.verdict) && <Link href="/submissions" className="btn-ghost btn-sm">Reset</Link>}
        </form>
      </div>
      <div className="card overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-elevated/60 text-xs text-muted">
              <tr><th className="px-4 py-2.5 text-left">#</th><th className="px-2 py-2.5 text-left">When</th><th className="px-2 py-2.5 text-left">Who</th><th className="px-2 py-2.5 text-left">Problem</th><th className="px-2 py-2.5 text-left">Lang</th><th className="px-2 py-2.5 text-left">Verdict</th><th className="px-4 py-2.5 text-right">Time</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-2.5"><Link href={`/submissions/${r.id}`} className="link">{r.id}</Link></td>
                  <td className="px-2 py-2.5 text-xs text-muted"><LocalTime iso={r.created_at} /></td>
                  <td className="px-2 py-2.5"><Handle username={r.username} rating={r.rating} />{r.contest_id && <span className="ml-1 text-xs text-muted" title="Submitted during a contest">#</span>}</td>
                  <td className="px-2 py-2.5">
                    <Link href={r.contest_id && r.letter ? `/contests/${r.contest_id}/problem/${r.letter}` : `/problemset/${r.problem_id}`} className="link">
                      {r.letter ? `${r.letter} - ` : `${r.problem_id} - `}{r.problem_title}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-xs">{r.language === "cpp" ? "C++20" : "Python 3"}</td>
                  <td className={`px-2 py-2.5 ${verdictClass(r.verdict)}`}>{verdictText(r.verdict, r.failed_test)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{r.time_ms} ms</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted">No submissions yet. <Link href="/problemset" className="link">Solve a problem</Link> to be the first!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
