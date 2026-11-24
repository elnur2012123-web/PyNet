import type { Metadata } from "next";
import Link from "next/link";
import { getServerSupabase } from "@/lib/supabase/server";
import { Handle } from "@/components/arena/Handle";
import { ArenaSidebar, SideBox } from "@/components/arena/ArenaSidebar";
import { RANKS, rankFor } from "@/lib/arena/rank";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Rating" };
export const dynamic = "force-dynamic";

export default async function RatingPage({ searchParams }: { searchParams: Promise<{ country?: string }> }) {
  const sp = await searchParams;
  const sb = await getServerSupabase();
  if (!sb) return <EmptyState title="Rating needs accounts" />;
  const { data } = await sb.rpc("get_rating_list", { p_limit: 500 });
  const all = (data ?? []) as { rank: number; username: string; country: string | null; rating: number; max_rating: number; contests: number }[];
  const countries = [...new Set(all.map((r) => r.country).filter(Boolean) as string[])].sort();
  const rows = sp.country ? all.filter((r) => r.country === sp.country).map((r, i) => ({ ...r, rank: i + 1 })) : all;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="h1">Rating</h1>
            <p className="mt-1 text-muted">Contest rating of everyone who has taken part in a rated round. XP rankings are on the <Link href="/leaderboard" className="link">leaderboard</Link>.</p>
          </div>
          <form method="get" className="flex items-center gap-2 text-sm">
            <label htmlFor="country" className="text-muted">Country</label>
            <select id="country" name="country" defaultValue={sp.country ?? ""} className="input">
              <option value="">Any country</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn-secondary btn-sm">Show</button>
          </form>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-elevated/60 text-xs text-muted"><tr><th className="w-14 px-4 py-2.5 text-left">#</th><th className="px-2 py-2.5 text-left">Who</th><th className="hidden px-2 py-2.5 text-left sm:table-cell">Rank</th><th className="px-2 py-2.5 text-right" title="Rated rounds">#</th><th className="px-4 py-2.5 text-right">=</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.username} className={`border-t border-border/60 ${i % 2 ? "bg-elevated/30" : ""}`}>
                  <td className="px-4 py-2.5">{r.rank}</td>
                  <td className="px-2 py-2.5"><Handle username={r.username} rating={r.rating} />{r.country && <span className="ml-2 text-xs text-muted">{r.country}</span>}</td>
                  <td className="hidden px-2 py-2.5 text-xs text-muted sm:table-cell">{rankFor(r.rating).name}</td>
                  <td className="px-2 py-2.5 text-right tabular-nums text-muted">{r.contests}</td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{r.rating}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">Nobody is rated yet. <Link href="/contests" className="link">Join a rated round</Link> to appear here.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <ArenaSidebar>
        <SideBox title="Ranks">
          <ul className="space-y-1 text-sm">
            {[...RANKS].reverse().map((r) => (
              <li key={r.name} className="flex justify-between gap-2"><span className={`font-semibold ${r.className}`}>{r.name}</span><span className="tabular-nums text-muted">{r.min === -Infinity ? "< 1200" : `${r.min}+`}</span></li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Your first rated round starts from 1400.</p>
        </SideBox>
      </ArenaSidebar>
    </div>
  );
}
