import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { ArenaSidebar, SideBox } from "@/components/arena/ArenaSidebar";
import { Countdown, LocalTime } from "@/components/arena/Countdown";
import { RegisterButton } from "@/components/arena/RegisterButton";
import { Handle } from "@/components/arena/Handle";
import { DivisionChip } from "@/components/arena/DivisionChip";
import { DIVISIONS } from "@/lib/arena/divisions";
import { contestPhase, endsAt, finalizeFinishedContests, listContests } from "@/lib/server/arena";
import { EmptyState } from "@/components/ui/States";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Contests" };
export const dynamic = "force-dynamic";

const len = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export default async function ContestsPage() {
  if (!isSupabaseConfigured) return <EmptyState title="Contests need accounts" body="Rounds and standings live in the database, so they appear once Supabase is configured." />;
  await finalizeFinishedContests();
  const contests = await listContests();
  const current = contests.filter((c) => contestPhase(c) !== "finished").sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
  const past = contests.filter((c) => contestPhase(c) === "finished");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-6">
        <div>
          <h1 className="h1">Contests</h1>
          <p className="mt-1 text-muted">Timed rounds with a live scoreboard. Rated rounds change your rating; ties are broken by penalty time (minutes to solve + 20 per wrong try).</p>
        </div>

        <section className="card overflow-hidden">
          <h2 className="border-b border-border bg-elevated/60 px-4 py-2.5 text-sm font-semibold">Current or upcoming contests</h2>
          {current.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">No rounds scheduled right now. Check the <Link href="/calendar" className="link">calendar</Link> later.</p> : (
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="text-xs text-muted"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-2 py-2">Writers</th><th className="px-2 py-2">Start</th><th className="px-2 py-2">Length</th><th className="px-2 py-2" /><th className="px-4 py-2" /></tr></thead>
                <tbody>
                  {current.map((c) => {
                    const phase = contestPhase(c);
                    return (
                      <tr key={c.id} className="border-t border-border/60 text-center">
                        <td className="px-4 py-3 text-left">
                          <Link href={`/contests/${c.id}`} className="font-medium hover:underline">{c.title}</Link>
                          {phase === "running" && <Link href={`/contests/${c.id}`} className="link ml-2 text-xs">Enter »</Link>}
                          {!c.rated && <span className="chip ml-2">unrated</span>}
                          <div className="mt-1"><DivisionChip division={c.division} /></div>
                        </td>
                        <td className="px-2 py-3 text-xs">{c.authors.map((a) => <div key={a}><Handle username={a} /></div>)}</td>
                        <td className="px-2 py-3 text-xs"><LocalTime iso={c.starts_at} /></td>
                        <td className="px-2 py-3 tabular-nums">{len(c.duration_minutes)}</td>
                        <td className="px-2 py-3 text-xs">
                          {phase === "upcoming" ? <>Before start<br /><Countdown to={c.starts_at} className="text-muted" /></> : <>Running<br /><Countdown to={endsAt(c).toISOString()} className="text-muted" /></>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-center gap-1">
                            <RegisterButton contestId={c.id} registered={c.registered} canUnregister={phase === "upcoming"} compact />
                            <span className="inline-flex items-center gap-1 text-xs text-muted"><Users className="h-3.5 w-3.5" />x{c.participants}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card overflow-hidden">
          <h2 className="border-b border-border bg-elevated/60 px-4 py-2.5 text-sm font-semibold">Past contests</h2>
          {past.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">No finished rounds yet.</p> : (
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="text-xs text-muted"><tr><th className="px-4 py-2 text-left">Name</th><th className="px-2 py-2">Writers</th><th className="px-2 py-2">Start</th><th className="px-2 py-2">Length</th><th className="px-2 py-2" /><th className="px-4 py-2" /></tr></thead>
                <tbody>
                  {past.map((c) => (
                    <tr key={c.id} className="border-t border-border/60 text-center">
                      <td className="px-4 py-3 text-left">
                        <Link href={`/contests/${c.id}`} className="font-medium hover:underline">{c.title}</Link> <DivisionChip division={c.division} />
                        <div className="text-xs"><Link href={`/contests/${c.id}`} className="link">Practice »</Link></div>
                      </td>
                      <td className="px-2 py-3 text-xs">{c.authors.map((a) => <div key={a}><Handle username={a} /></div>)}</td>
                      <td className="px-2 py-3 text-xs"><LocalTime iso={c.starts_at} /></td>
                      <td className="px-2 py-3 tabular-nums">{len(c.duration_minutes)}</td>
                      <td className="px-2 py-3"><Link href={`/contests/${c.id}/standings`} className="link">Final standings</Link></td>
                      <td className="px-4 py-3 text-xs text-muted"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />x{c.participants}</span>{!c.rated && <div>unrated</div>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      <ArenaSidebar>
        <SideBox title="Divisions">
          <ul className="space-y-2 text-xs">
            {DIVISIONS.map((d) => <li key={d.id}><DivisionChip division={d.id} /> <span className="text-muted">{d.who}</span></li>)}
          </ul>
          <p className="mt-2 text-xs text-muted">Anyone can join any round. Above the limit you play &quot;out of competition&quot; and your rating doesn&apos;t change.</p>
        </SideBox>
        <SideBox title="How rounds work">
          <ul className="list-disc space-y-1 pl-4 text-xs text-muted">
            <li>Register before the start (or just submit during the round).</li>
            <li>Problems open when the round starts. Usually they get harder from A to F.</li>
            <li>Rank = problems solved, then lowest penalty.</li>
            <li>After a rated round your rating updates automatically.</li>
            <li>When it ends, the problems move to the <Link href="/problemset" className="link">problemset</Link>.</li>
          </ul>
        </SideBox>
      </ArenaSidebar>
    </div>
  );
}
