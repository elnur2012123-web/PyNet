import { getLocale, getT } from "@/i18n/server";
import { translateTexts } from "@/i18n/content";
import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Users } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { ArenaSidebar, SideBox } from "@/components/arena/ArenaSidebar";
import { difficultyClass } from "@/lib/arena/rank";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Problemset" };
export const dynamic = "force-dynamic";

interface Row { id: number; title: string; tags: string[]; rating: number; solved: number; my_status: "OK" | "TRIED" | null }
type SP = Promise<{ min?: string; max?: string; tag?: string; q?: string; order?: string; status?: string }>;

export default async function ProblemsetPage({ searchParams }: { searchParams: SP }) {
  const tx = await getT();
  const sp = await searchParams;
  const sb = await getServerSupabase();
  if (!sb) return <EmptyState title={tx("Problemset needs accounts")} body={tx("Problems are stored in the database, so they appear once Supabase is configured.")} />;
  const { data } = await sb.rpc("get_problemset");
  const raw = (data ?? []) as Row[];
  const tr = await translateTexts(await getLocale(), raw.map((r) => r.title));
  const all = raw.map((r) => ({ ...r, en: r.title, title: tr.get(r.title) ?? r.title, solved: Number(r.solved) }));
  const tags = [...new Set(all.flatMap((r) => r.tags))].sort();
  const min = Number(sp.min) || 0, max = Number(sp.max) || 99999;
  const q = (sp.q ?? "").trim().toLowerCase();
  let rows = all.filter((r) => r.rating >= min && r.rating <= max && (!sp.tag || r.tags.includes(sp.tag))
    && (!q || r.title.toLowerCase().includes(q) || r.en.toLowerCase().includes(q) || String(r.id) === q)
    && (!sp.status || (sp.status === "unsolved" ? r.my_status !== "OK" : r.my_status === "OK")));
  const order = sp.order ?? "new";
  rows = [...rows].sort((a, b) =>
    order === "easy" ? a.rating - b.rating || a.id - b.id
    : order === "hard" ? b.rating - a.rating || a.id - b.id
    : order === "popular" ? b.solved - a.solved || a.id - b.id
    : b.id - a.id);
  const solvedByMe = all.filter((r) => r.my_status === "OK").length;
  const link = (o: string) => `?${new URLSearchParams({ ...sp, order: o } as Record<string, string>).toString()}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-4">
        <div>
          <h1 className="h1"><T k="Problemset" /></h1>
          <p className="mt-1 text-muted">{all.length} <T k="problems with hidden tests. Solve them in Python, right in your browser." />{" "}{solvedByMe > 0 && <><T k="You've solved" />{" "}<b className="text-fg">{solvedByMe}</b>.</>}</p>
        </div>
        <div className="card overflow-hidden">
          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-elevated/60 text-xs text-muted">
                <tr>
                  <th className="px-4 py-2.5 text-left">#</th>
                  <th className="px-2 py-2.5 text-left"><T k="Name" /></th>
                  <th className="px-2 py-2.5 text-right"><Link href={link(order === "easy" ? "hard" : "easy")} className="hover:text-fg"><T k="Difficulty" />{" "}{order === "easy" ? "↑" : order === "hard" ? "↓" : "↕"}</Link></th>
                  <th className="px-4 py-2.5 text-right"><Link href={link("popular")} className="hover:text-fg"><T k="Solved" />{" "}{order === "popular" ? "↓" : "↕"}</Link></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={`border-t border-border/60 ${r.my_status === "OK" ? "bg-success/10" : r.my_status === "TRIED" ? "bg-danger/5" : ""}`}>
                    <td className="px-4 py-2.5"><Link href={`/problemset/${r.id}`} className="link">{r.id}</Link></td>
                    <td className="px-2 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <Link href={`/problemset/${r.id}`} className="font-medium hover:underline">{r.title} {r.my_status === "OK" && <Check className="inline h-4 w-4 text-success" />}</Link>
                        <span className="text-xs text-muted">{r.tags.map((t, i) => <span key={t}>{i ? ", " : ""}<Link href={`?tag=${encodeURIComponent(t)}`} className="hover:text-fg"><T k={t} /></Link></span>)}</span>
                      </div>
                    </td>
                    <td className={`px-2 py-2.5 text-right font-semibold tabular-nums ${difficultyClass(r.rating)}`}>{r.rating}</td>
                    <td className="px-4 py-2.5 text-right"><Link href={`/submissions?problem=${r.id}`} className="inline-flex items-center gap-1 text-muted hover:text-fg"><Users className="h-3.5 w-3.5" />x{r.solved}</Link></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-muted"><T k="No problems match these filters." /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ArenaSidebar>
        <SideBox title={tx("Filter problems")}>
          <form className="space-y-3 text-sm" method="get">
            <div>
              <label className="label"><T k="Difficulty" /></label>
              <div className="flex items-center gap-2">
                <input name="min" type="number" step={100} min={800} max={3500} placeholder="800" defaultValue={sp.min} className="input w-full" />
                <span>—</span>
                <input name="max" type="number" step={100} min={800} max={3500} placeholder="3500" defaultValue={sp.max} className="input w-full" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="tag"><T k="Tag" /></label>
              <select id="tag" name="tag" defaultValue={sp.tag ?? ""} className="input w-full">
                <option value=""><T k="Any" /></option>
                {tags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="status"><T k="Status" /></label>
              <select id="status" name="status" defaultValue={sp.status ?? ""} className="input w-full">
                <option value=""><T k="Any" /></option><option value="unsolved"><T k="Not solved by me" /></option><option value="solved"><T k="Solved by me" /></option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="q"><T k="Name or #" /></label>
              <input id="q" name="q" defaultValue={sp.q} className="input w-full" placeholder={tx("e.g. brackets")} />
            </div>
            <input type="hidden" name="order" value={order} />
            <div className="flex gap-2"><button className="btn-primary btn-sm flex-1"><T k="Apply" /></button><Link href="/problemset" className="btn-ghost btn-sm"><T k="Reset" /></Link></div>
          </form>
        </SideBox>
      </ArenaSidebar>
    </div>
  );
}
