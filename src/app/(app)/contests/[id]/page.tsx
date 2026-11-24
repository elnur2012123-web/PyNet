import type { Metadata } from "next";
import Link from "next/link";
import { Check, Users } from "lucide-react";
import { loadContest } from "./data";
import { contestPhase } from "@/lib/server/arena";
import { RichText } from "@/components/arena/Statement";
import { LocalTime } from "@/components/arena/Countdown";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = await loadContest(Number((await params).id));
  return { title: d?.contest.title ?? "Contest" };
}

export default async function ContestPage({ params }: { params: Promise<{ id: string }> }) {
  const data = (await loadContest(Number((await params).id)))!;
  const { contest: c, problems, standings, me } = data;
  const phase = contestPhase(c);
  const myRow = standings.find((r) => r.user_id === me);
  const solvedCount = (letter: string) => standings.filter((r) => r.cells[letter]?.ok).length;

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h1 className="text-2xl font-semibold">{c.title}</h1>
        <p className="mt-1 text-sm text-muted">Starts <LocalTime iso={c.starts_at} withWeekday /> · {c.duration_minutes} minutes · {c.rated ? "rated" : "unrated"}</p>
        {c.description && <div className="mt-3 space-y-2 text-sm"><RichText text={c.description} /></div>}
      </div>

      {phase === "upcoming" ? (
        <div className="card p-8 text-center">
          <p className="text-lg font-semibold">The problems will appear here when the round starts.</p>
          <p className="mt-1 text-sm text-muted">Register now so you don&apos;t miss it. While you wait, warm up in the <Link href="/problemset" className="link">problemset</Link>.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-elevated/60 text-xs text-muted"><tr><th className="w-12 px-4 py-2.5 text-left">#</th><th className="px-2 py-2.5 text-left">Name</th><th className="px-4 py-2.5 text-right">Solved</th></tr></thead>
            <tbody>
              {problems.map((p) => {
                const mine = myRow?.cells[p.letter];
                return (
                  <tr key={p.letter} className={`border-t border-border/60 ${mine?.ok ? "bg-success/10" : mine ? "bg-danger/5" : ""}`}>
                    <td className="px-4 py-3 font-semibold"><Link href={`/contests/${c.id}/problem/${p.letter}`} className="link">{p.letter}</Link></td>
                    <td className="px-2 py-3">
                      <Link href={`/contests/${c.id}/problem/${p.letter}`} className="font-medium hover:underline">{p.title}</Link> {mine?.ok && <Check className="inline h-4 w-4 text-success" />}
                      <p className="text-xs text-muted">time limit {p.time_limit_ms / 1000} s{phase === "finished" ? ` · *${p.rating}` : ""}</p>
                    </td>
                    <td className="px-4 py-3 text-right"><span className="inline-flex items-center gap-1 text-muted"><Users className="h-3.5 w-3.5" />x{solvedCount(p.letter)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {phase === "finished" && <p className="text-sm text-muted">The round is over. You can still solve the problems for practice — practice submissions don&apos;t change the standings or your rating.</p>}
    </div>
  );
}
