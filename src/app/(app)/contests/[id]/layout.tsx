import { getT } from "@/i18n/server";
import { T } from "@/components/i18n/T";
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
import { DivisionChip } from "@/components/arena/DivisionChip";
import { divisionOf } from "@/lib/arena/divisions";

export const dynamic = "force-dynamic";

export default async function ContestLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const tx = await getT();
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
            {phase === "upcoming" && <><p className="font-semibold"><T k="Before the contest" /></p><p className="text-lg"><Countdown to={c.starts_at} /></p></>}
            {phase === "running" && <><p className="font-semibold text-success"><T k="Contest is running" /></p><p className="text-lg"><Countdown to={endsAt(c).toISOString()} /></p><p className="text-xs text-muted"><T k="left" /></p></>}
            {phase === "finished" && <p className="font-semibold"><T k="Contest is over" /></p>}
            {phase !== "finished" && <RegisterButton contestId={c.id} registered={data.registered} canUnregister={phase === "upcoming"} />}
          </div>
        </SideBox>
        <SideBox title={tx("Round info")}>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Start" /></dt><dd className="text-right"><LocalTime iso={c.starts_at} /></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Length" /></dt><dd>{Math.floor(c.duration_minutes / 60)}h {c.duration_minutes % 60 ? `${c.duration_minutes % 60}m` : ""}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Division" /></dt><dd><DivisionChip division={c.division} /></dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Type" /></dt><dd>{c.rated ? (divisionOf(c.division).ratedBelow ? `Rated below ${divisionOf(c.division).ratedBelow}` : tx("Rated for all")) : tx("Unrated")}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Registered" /></dt><dd className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{data.participants}</dd></div>
            {data.authors.length > 0 && <div className="flex justify-between gap-2"><dt className="text-muted"><T k="Prepared by" /></dt><dd>{data.authors.map((a) => <Handle key={a} username={a} />)}</dd></div>}
          </dl>
          {phase === "finished" && <Link href={`/contests/${c.id}/standings`} className="link mt-3 inline-block text-sm"><T k="Final standings →" /></Link>}
        </SideBox>
      </aside>
    </div>
  );
}
