import { getT } from "@/i18n/server";
import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { ProblemStatement, type ProblemView } from "@/components/arena/Statement";
import { SolvePanel } from "@/components/arena/SolvePanel";
import { SideBox } from "@/components/arena/ArenaSidebar";
import { contestPhase } from "@/lib/server/arena";
import { Notice } from "@/components/ui/States";

export const dynamic = "force-dynamic";

async function load(id: number) {
  const sb = await getServerSupabase();
  if (!sb || !Number.isInteger(id)) return null;
  const { data } = await sb.from("problems").select("id, title, statement, input_spec, output_spec, notes, examples, tags, rating, time_limit_ms").eq("id", id).maybeSingle();
  if (!data) return null;
  const { data: uses } = await sb.from("contest_problems").select("letter, contests(id, title, starts_at, duration_minutes)").eq("problem_id", id);
  return { problem: data as ProblemView, uses: (uses ?? []) as unknown as { letter: string; contests: { id: number; title: string; starts_at: string; duration_minutes: number } }[] };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await load(Number((await params).id));
  return { title: r ? `${r.problem.id}. ${r.problem.title}` : "Problem" };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const tx = await getT();
  const r = await load(Number((await params).id));
  if (!r) notFound();
  const { problem, uses } = r;
  const running = uses.find((u) => u.contests && contestPhase(u.contests) === "running");
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-5">
        <p className="text-sm text-muted"><Link href="/problemset" className="link"><T k="Problemset" /></Link> / {problem.id}</p>
        {running && (
          <Notice kind="warn" title={tx("This problem is in a running contest")}>
            <T k="Solve it on the" />{" "}<Link className="link" href={`/contests/${running.contests.id}/problem/${running.letter}`}><T k="contest page" /></Link> <T k="so it counts for the round." /></Notice>
        )}
        <ProblemStatement problem={problem} showTags={!running} />
        <SolvePanel problemId={problem.id} examples={problem.examples} timeLimitMs={problem.time_limit_ms} />
      </div>
      <aside className="space-y-4">
        <SideBox title={tx("Problem")}>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-muted"><T k="Number" /></dt><dd>{problem.id}</dd></div>
            {!running && <div className="flex justify-between"><dt className="text-muted"><T k="Difficulty" /></dt><dd className="font-semibold">*{problem.rating}</dd></div>}
            <div className="flex justify-between"><dt className="text-muted"><T k="Time limit" /></dt><dd>{problem.time_limit_ms / 1000} s</dd></div>
          </dl>
          <Link href={`/submissions?problem=${problem.id}`} className="link mt-3 inline-block text-sm"><T k="All submissions →" /></Link>
        </SideBox>
        {uses.filter((u) => u.contests && contestPhase(u.contests) === "finished").map((u) => (
          <SideBox key={u.contests.id} title={tx("From contest")}>
            <Link href={`/contests/${u.contests.id}`} className="link text-sm">{u.contests.title}</Link>
            <p className="text-xs text-muted"><T k="Problem" />{" "}{u.letter}</p>
          </SideBox>
        ))}
        <SideBox title={tx("How judging works")}>
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted">
            <li><T k="Python: read with" />{" "}<code>input()</code> <T k="or" />{" "}<code>sys.stdin</code><T k=". C++: read with" />{" "}<code>cin</code> <T k="or" />{" "}<code>scanf</code><T k=". Print the answer." /></li>
            <li><T k="C++ is compiled with Clang 21 (" /><code>-std=c++20 -O2</code>, <code>bits/stdc++.h</code> <T k="works, no exceptions). The compiler downloads once (~27 MB)." /></li>
            <li><T k="Your code runs on every test in your browser; the server compares the outputs with hidden answers." /></li>
            <li><T k="Extra spaces and blank lines don't matter." /></li>
            <li><T k="First accepted solve gives XP." /></li>
          </ul>
        </SideBox>
      </aside>
    </div>
  );
}
