import { getT } from "@/i18n/server";
import { localizeProblemTitles } from "@/i18n/content";
import { getLocale } from "@/i18n/server";
import { T } from "@/components/i18n/T";
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
  const tx = await getT();
  const sp = await searchParams;
  const sb = await getServerSupabase();
  if (!sb) return <EmptyState title={tx("Status needs accounts")} />;
  const { data } = await sb.rpc("get_status", {
    p_username: sp.user || null, p_problem: sp.problem ? Number(sp.problem) : null, p_contest: sp.contest ? Number(sp.contest) : null, p_limit: 200,
  });
  let rows = (data ?? []) as Row[];
  if (sp.verdict) rows = rows.filter((r) => r.verdict === sp.verdict);
  const tr = await localizeProblemTitles(await getLocale(), rows.map((r) => ({ id: r.problem_id, title: r.problem_title })));
  rows = rows.map((r) => ({ ...r, problem_title: tr.get(r.problem_id) ?? r.problem_title }));
  const title = sp.user ? tx("Submissions of {user}", { user: sp.user }) : sp.contest ? tx("Contest status") : sp.problem ? tx("Submissions for problem {n}", { n: sp.problem }) : tx("Status");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">{title}</h1>
          <p className="mt-1 text-muted"><T k="The latest judged solutions. Code is private: you can read someone's solution after you solve that problem yourself." /></p>
        </div>
        <form className="flex flex-wrap items-center gap-2 text-sm" method="get">
          {sp.user && <input type="hidden" name="user" value={sp.user} />}
          {sp.problem && <input type="hidden" name="problem" value={sp.problem} />}
          {sp.contest && <input type="hidden" name="contest" value={sp.contest} />}
          <select name="verdict" defaultValue={sp.verdict ?? ""} className="input">
            <option value=""><T k="Any verdict" /></option><option value="OK"><T k="Accepted" /></option><option value="WA"><T k="Wrong answer" /></option><option value="RE"><T k="Runtime error" /></option><option value="TLE"><T k="Time limit exceeded" /></option><option value="CE"><T k="Compilation error" /></option>
          </select>
          <button className="btn-secondary btn-sm"><T k="Apply" /></button>
          {(sp.user || sp.problem || sp.contest || sp.verdict) && <Link href="/submissions" className="btn-ghost btn-sm"><T k="Reset" /></Link>}
        </form>
      </div>
      <div className="card overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-elevated/60 text-xs text-muted">
              <tr><th className="px-4 py-2.5 text-left">#</th><th className="px-2 py-2.5 text-left"><T k="When" /></th><th className="px-2 py-2.5 text-left"><T k="Who" /></th><th className="px-2 py-2.5 text-left"><T k="Problem" /></th><th className="px-2 py-2.5 text-left"><T k="Lang" /></th><th className="px-2 py-2.5 text-left"><T k="Verdict" /></th><th className="px-4 py-2.5 text-right"><T k="Time" /></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/60">
                  <td className="px-4 py-2.5"><Link href={`/submissions/${r.id}`} className="link">{r.id}</Link></td>
                  <td className="px-2 py-2.5 text-xs text-muted"><LocalTime iso={r.created_at} /></td>
                  <td className="px-2 py-2.5"><Handle username={r.username} rating={r.rating} />{r.contest_id && <span className="ml-1 text-xs text-muted" title={tx("Submitted during a contest")}>#</span>}</td>
                  <td className="px-2 py-2.5">
                    <Link href={r.contest_id && r.letter ? `/contests/${r.contest_id}/problem/${r.letter}` : `/problemset/${r.problem_id}`} className="link">
                      {r.letter ? `${r.letter} - ` : `${r.problem_id} - `}{r.problem_title}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 text-xs">{r.language === "cpp" ? "C++20" : tx("Python 3")}</td>
                  <td className={`px-2 py-2.5 ${verdictClass(r.verdict)}`}>{verdictText(r.verdict, r.failed_test)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted">{r.time_ms} <T k="ms" /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-muted"><T k="No submissions yet." />{" "}<Link href="/problemset" className="link"><T k="Solve a problem" /></Link> <T k="to be the first!" /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
