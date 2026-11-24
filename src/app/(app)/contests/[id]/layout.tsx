import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { loadContest } from "./data";
import { ContestTabs } from "./ContestTabs";
import { SideBox } from "@/components/arena/ArenaSidebar";
import { Countdown, LocalTime } from "@/components/arena/Countdown";
import { RegisterButton } from "@/components/arena/RegisterButton";
import { Handle } from "@/components/arena/Handle";
import { contestPhase, endsAt } from "@/lib/server/arena";

export const dynamic = "force-dynamic";

export default async function ContestLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const data = await loadContest(Number((await params).id));
  if (!data) notFound();
  const { contest: c } = data;
  const phase = contestPhase(c);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-4">
        <ContestTabs id={c.id} started={phase !== "upcoming"} />
        {children}
      </div>
      <aside className="space-y-4">
        <SideBox title={c.title}>
          <div className="space-y-2 text-center text-sm">
            {phase === "upcoming" && <><p className="font-semibold">Before the contest</p><p className="text-lg"><Countdown to={c.starts_at} /></p></>}
            {phase === "running" && <><p className="font-semibold text-success">Contest is running</p><p className="text-lg"><Countdown to={endsAt(c).toISOString()} /></p><p className="text-xs text-muted">left</p></>}
            {phase === "finished" && <p className="font-semibold">Contest is over</p>}
            {phase !== "finished" && <RegisterButton contestId={c.id} registered={data.registered} canUnregister={phase === "upcoming"} />}
          </div>
        </SideBox>
        <SideBox title="Round info">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-muted">Start</dt><dd className="text-right"><LocalTime iso={c.starts_at} /></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Length</dt><dd>{Math.floor(c.duration_minutes / 60)}h {c.duration_minutes % 60 ? `${c.duration_minutes % 60}m` : ""}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Type</dt><dd>{c.rated ? "Rated" : "Unrated"}, ICPC rules</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted">Registered</dt><dd className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{data.participants}</dd></div>
            {data.authors.length > 0 && <div className="flex justify-between gap-2"><dt className="text-muted">Prepared by</dt><dd>{data.authors.map((a) => <Handle key={a} username={a} />)}</dd></div>}
          </dl>
          {phase === "finished" && <Link href={`/contests/${c.id}/standings`} className="link mt-3 inline-block text-sm">Final standings →</Link>}
        </SideBox>
      </aside>
    </div>
  );
}
