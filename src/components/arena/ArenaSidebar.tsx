import { T } from "@/components/i18n/T";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Handle } from "./Handle";
import { Countdown } from "./Countdown";
import { contestPhase, endsAt, listContests, topRated, type ContestListRow } from "@/lib/server/arena";

export function SideBox({ title, children, footer }: { title: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <h2 className="flex items-center gap-1.5 border-b border-border px-4 py-2.5 text-sm font-semibold text-accent"><ArrowRight className="h-4 w-4" /> <T k={title} /></h2>
      <div className="p-4">{children}</div>
      {footer && <div className="border-t border-border px-4 py-2 text-right text-xs">{footer}</div>}
    </section>
  );
}

/** "Before contest" / "Contest is running" box for the nearest round. */
export function NextContestBox({ contests }: { contests: ContestListRow[] }) {
  const live = contests.filter((c) => contestPhase(c) === "running").sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];
  const next = contests.filter((c) => contestPhase(c) === "upcoming").sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at))[0];
  const c = live ?? next;
  if (!c) return null;
  return (
    <SideBox title="Pay attention">
      <div className="text-center">
        <p className="font-semibold">{live ? <T k="Contest is running" /> : <T k="Before contest" />}</p>
        <Link href={`/contests/${c.id}`} className="link text-sm">{c.title}</Link>
        <p className="mt-1 text-sm text-muted"><Countdown to={live ? endsAt(c).toISOString() : c.starts_at} /></p>
        {!live && !c.registered && <Link href={`/contests/${c.id}`} className="link mt-1 inline-block text-sm font-medium"><T k="Register now »" /></Link>}
        {c.registered && <p className="mt-1 text-xs text-success"><T k="You are registered ✓" /></p>}
      </div>
    </SideBox>
  );
}

export function TopRatedBox({ rows }: { rows: Awaited<ReturnType<typeof topRated>> }) {
  return (
    <SideBox title="Top rated" footer={<Link href="/rating" className="link"><T k="View all →" /></Link>}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted"><T k="Nobody is rated yet. Take part in a rated round to be the first!" /></p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="text-xs text-muted"><th className="w-8 text-left">#</th><th className="text-left"><T k="User" /></th><th className="text-right"><T k="Rating" /></th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.username} className="border-t border-border/60">
                <td className="py-1.5">{r.rank}</td>
                <td className="truncate py-1.5"><Handle username={r.username} rating={r.rating} /></td>
                <td className="py-1.5 text-right tabular-nums">{r.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SideBox>
  );
}

/** Right-hand column used on the Arena pages. */
export async function ArenaSidebar({ children }: { children?: React.ReactNode }) {
  const [contests, top] = await Promise.all([listContests(), topRated(10)]);
  return (
    <aside className="space-y-4">
      <NextContestBox contests={contests} />
      {children}
      <TopRatedBox rows={top} />
    </aside>
  );
}
