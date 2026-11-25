import { getT } from "@/i18n/server";
import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { Handle } from "@/components/arena/Handle";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { verdictClass, verdictText } from "@/lib/arena/verdict";
import { LocalTime } from "@/components/arena/Countdown";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Submission" };

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const tx = await getT();
  const id = Number((await params).id);
  const sb = await getServerSupabase();
  if (!sb || !Number.isInteger(id)) notFound();
  const { data } = await sb.rpc("get_submission", { p_id: id });
  const s = (Array.isArray(data) ? data[0] : data) as {
    id: number; username: string; rating: number | null; problem_id: number; problem_title: string; contest_id: number | null; verdict: string; failed_test: number | null;
    tests_total: number; time_ms: number; created_at: string; code: string | null; can_view_code: boolean; language?: string;
  } | undefined;
  if (!s) notFound();
  return (
    <div className="space-y-4">
      <h1 className="h1"><T k="Submission #" />{s.id}</h1>
      <div className="card overflow-hidden">
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-elevated/60 text-xs text-muted"><tr><th className="px-4 py-2 text-left"><T k="Author" /></th><th className="px-2 py-2 text-left"><T k="Problem" /></th><th className="px-2 py-2 text-left"><T k="Verdict" /></th><th className="px-2 py-2 text-left"><T k="Tests" /></th><th className="px-2 py-2 text-left"><T k="Time" /></th><th className="px-4 py-2 text-left"><T k="When" /></th></tr></thead>
            <tbody>
              <tr>
                <td className="px-4 py-3"><Handle username={s.username} rating={s.rating} /></td>
                <td className="px-2 py-3"><Link href={`/problemset/${s.problem_id}`} className="link">{s.problem_id} - {s.problem_title}</Link>{s.contest_id && <div className="text-xs text-muted"><T k="in" />{" "}<Link href={`/contests/${s.contest_id}`} className="link"><T k="contest" /></Link></div>}</td>
                <td className={`px-2 py-3 ${verdictClass(s.verdict)}`}>{verdictText(s.verdict, s.failed_test)}</td>
                <td className="px-2 py-3">{s.verdict === "OK" ? s.tests_total : (s.failed_test ?? 1) - 1} / {s.tests_total} <T k="passed" /></td>
                <td className="px-2 py-3 tabular-nums">{s.time_ms} <T k="ms" /></td>
                <td className="px-4 py-3 text-xs"><LocalTime iso={s.created_at} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {s.can_view_code && s.code !== null ? (
        <CodeBlock code={s.code} title={s.language === "cpp" ? tx("main.cpp · C++20") : tx("main.py · Python 3")} lineNumbers plain={s.language === "cpp"} />
      ) : (
        <div className="card flex items-center gap-3 p-6 text-sm text-muted">
          <Lock className="h-5 w-5" /> <T k="The code is hidden. You can read other people's solutions to a problem after you get" />{" "}<b className="text-success"><T k="Accepted" /></b> <T k="on it yourself." /></div>
      )}
    </div>
  );
}
