import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { loadContest } from "../../data";
import { contestPhase } from "@/lib/server/arena";
import { ProblemStatement, type ProblemView } from "@/components/arena/Statement";
import { SolvePanel } from "@/components/arena/SolvePanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string; letter: string }> }): Promise<Metadata> {
  const { id, letter } = await params;
  const d = await loadContest(Number(id));
  const p = d?.problems.find((x) => x.letter === letter.toUpperCase());
  return { title: p ? `${letter.toUpperCase()}. ${p.title}` : "Problem" };
}

export default async function ContestProblemPage({ params }: { params: Promise<{ id: string; letter: string }> }) {
  const { id, letter: raw } = await params;
  const letter = raw.toUpperCase();
  const data = await loadContest(Number(id));
  if (!data) notFound();
  const phase = contestPhase(data.contest);
  const entry = data.problems.find((p) => p.letter === letter);
  if (phase === "upcoming" || !entry) notFound();
  const sb = (await getServerSupabase())!;
  const { data: problem } = await sb.from("problems").select("id, title, statement, input_spec, output_spec, notes, examples, tags, rating, time_limit_ms").eq("id", entry.problem_id).maybeSingle();
  if (!problem) notFound();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {data.problems.map((p) => (
          <Link key={p.letter} href={`/contests/${data.contest.id}/problem/${p.letter}`} className={`rounded-lg border px-3 py-1 text-sm font-semibold ${p.letter === letter ? "border-accent bg-accent/10 text-accent" : "border-border hover:bg-elevated"}`}>{p.letter}</Link>
        ))}
      </div>
      <ProblemStatement problem={problem as ProblemView} letter={letter} showTags={phase === "finished"} />
      <SolvePanel problemId={problem.id} contestId={phase === "running" ? data.contest.id : undefined} contestRunning={phase === "running"} examples={(problem as ProblemView).examples} timeLimitMs={problem.time_limit_ms} />
    </div>
  );
}
