"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { difficultyClass } from "@/lib/arena/rank";
import { CheatDetector } from "./CheatDetector";
import { DIVISIONS } from "@/lib/arena/divisions";
import { ProblemEditor } from "./ProblemEditor";

interface P { id: number; title: string; rating: number; visibility: string }
interface C { id: number; title: string; starts_at: string; duration_minutes: number }
const LETTERS = "ABCDEFGHIJ";

async function post(body: Record<string, unknown>) {
  const r = await fetch("/api/admin/arena", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

export function ArenaAdmin({ permissions }: { permissions: string[] }) {
  const can = (p: string) => permissions.includes(p);
  const [problems, setProblems] = useState<P[]>([]);
  const [used, setUsed] = useState<Map<number, number[]>>(new Map());
  const [contests, setContests] = useState<C[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    const [{ data: ps }, { data: cps }, { data: cs }] = await Promise.all([
      sb.from("problems").select("id, title, rating, visibility").order("id"),
      sb.from("contest_problems").select("contest_id, problem_id"),
      sb.from("contests").select("id, title, starts_at, duration_minutes").order("starts_at", { ascending: false }),
    ]);
    setProblems((ps ?? []) as P[]);
    const m = new Map<number, number[]>();
    for (const r of (cps ?? []) as { contest_id: number; problem_id: number }[]) m.set(r.problem_id, [...(m.get(r.problem_id) ?? []), r.contest_id]);
    setUsed(m);
    setContests((cs ?? []) as C[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  // ---- schedule a round
  const [round, setRound] = useState({ title: "", description: "", start: "", duration: 120, rated: true, division: "hatchling" });
  const [picked, setPicked] = useState<number[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const pool = useMemo(() => [...problems].sort((a, b) => Number(used.has(a.id)) - Number(used.has(b.id)) || (a.visibility === "hidden" ? -1 : 1) - (b.visibility === "hidden" ? -1 : 1) || a.rating - b.rating), [problems, used]);
  const createRound = async () => {
    setBusy("round"); setMsg(null);
    try {
      const j = await post({ action: "create_contest", title: round.title, description: round.description, startsAt: new Date(round.start).toISOString(), durationMinutes: Number(round.duration), rated: round.rated, division: round.division, problems: picked });
      setMsg({ ok: true, text: `Round #${j.id} scheduled.` });
      setRound({ title: "", description: "", start: "", duration: 120, rated: true, division: "hatchling" }); setPicked([]); load();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    setBusy(null);
  };
  const deleteRound = async (id: number) => {
    if (!confirm("Delete this round? This can't be undone.")) return;
    try { await post({ action: "delete_contest", id }); load(); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };

  // ---- edit problems
  const [editId, setEditId] = useState<number | null>(null);
  const [find, setFind] = useState("");
  const found = useMemo(() => {
    const q = find.trim().toLowerCase();
    return [...problems].sort((x, y) => y.id - x.id).filter((p) => !q || String(p.id) === q || p.title.toLowerCase().includes(q)).slice(0, 60);
  }, [problems, find]);
  const saved = (text: string) => { setMsg({ ok: true, text }); load(); };

  const upcoming = contests.filter((c) => new Date(c.starts_at).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Arena</h2>
      {can("review_cheating") && <CheatDetector canBan={can("ban_users")} />}
      {msg && <p className={`card p-3 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        {can("host_contests") && <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2 font-semibold"><CalendarPlus className="h-4 w-4" /> Schedule a round</h3>
          <input className="input w-full" placeholder="PyNest Hatchling Round #3" value={round.title} onChange={(e) => setRound({ ...round, title: e.target.value })} />
          <textarea className="input min-h-16 w-full" placeholder="Short description (optional)" value={round.description} onChange={(e) => setRound({ ...round, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="space-y-1"><span className="label">Start (your time)</span><input type="datetime-local" className="input w-full" value={round.start} onChange={(e) => setRound({ ...round, start: e.target.value })} /></label>
            <label className="space-y-1"><span className="label">Length (minutes)</span><input type="number" min={10} max={10080} className="input w-full" value={round.duration} onChange={(e) => setRound({ ...round, duration: Number(e.target.value) })} /></label>
          </div>
          <label className="block space-y-1 text-sm"><span className="label">Division</span>
            <select className="input w-full" value={round.division} onChange={(e) => setRound({ ...round, division: e.target.value })}>
              {DIVISIONS.map((d) => <option key={d.id} value={d.id}>{d.emoji} {d.name} — {d.who}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={round.rated} onChange={(e) => setRound({ ...round, rated: e.target.checked })} /> Rated</label>
          <div>
            <p className="label">Problems in order ({picked.length}/10)</p>
            <div className="flex flex-wrap gap-1.5">
              {picked.map((id, i) => {
                const p = problems.find((x) => x.id === id);
                return <span key={id} className="chip">{LETTERS[i]}. {p?.title} <button onClick={() => setPicked(picked.filter((x) => x !== id))} aria-label="Remove"><X className="h-3 w-3" /></button></span>;
              })}
              {!picked.length && <span className="text-xs text-muted">Click problems below to add them.</span>}
            </div>
          </div>
          <div className="thin-scroll max-h-56 overflow-y-auto rounded-xl border border-border">
            {pool.map((p) => (
              <button key={p.id} disabled={picked.includes(p.id) || picked.length >= 10} onClick={() => setPicked([...picked, p.id])}
                className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5 text-left text-sm last:border-0 hover:bg-elevated disabled:opacity-40">
                <span>{p.id}. {p.title} {p.visibility === "hidden" && !used.has(p.id) && <span className="chip ml-1">unused</span>}{used.has(p.id) && <span className="ml-1 text-xs text-muted">used in #{used.get(p.id)!.join(", #")}</span>}{p.visibility === "public" && <span className="ml-1 text-xs text-muted">public</span>}</span>
                <span className={`font-semibold ${difficultyClass(p.rating)}`}>{p.rating}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted">Tip: use <b>unused hidden</b> problems — public ones may already be solved by contestants.</p>
          <button className="btn-primary btn-sm" disabled={busy === "round" || !round.title || !round.start || !picked.length} onClick={createRound}>{busy === "round" && <Loader2 className="h-4 w-4 animate-spin" />} Schedule round</button>
          {upcoming.length > 0 && (
            <div className="border-t border-border pt-3">
              <p className="label">Upcoming rounds</p>
              <ul className="space-y-1 text-sm">
                {upcoming.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <Link href={`/contests/${c.id}`} className="link">{c.title}</Link>
                    <span className="flex items-center gap-2 text-xs text-muted">{new Date(c.starts_at).toLocaleString()}<button onClick={() => deleteRound(c.id)} className="text-danger" aria-label="Delete round"><Trash2 className="h-4 w-4" /></button></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>}

        {can("create_problems") && <ProblemEditor onSaved={saved} />}
      </div>

      {can("edit_problems") && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="card space-y-3 p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Pencil className="h-4 w-4" /> Edit problems</h3>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input className="input w-full pl-9" placeholder="Search by number or title" value={find} onChange={(e) => setFind(e.target.value)} />
            </label>
            <div className="thin-scroll max-h-96 overflow-y-auto rounded-xl border border-border">
              {found.map((p) => (
                <button key={p.id} onClick={() => setEditId(p.id)}
                  className={`flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5 text-left text-sm last:border-0 hover:bg-elevated ${editId === p.id ? "bg-elevated" : ""}`}>
                  <span>{p.id}. {p.title} {p.visibility === "hidden" && <span className="chip ml-1">hidden</span>}</span>
                  <span className={`font-semibold ${difficultyClass(p.rating)}`}>{p.rating}</span>
                </button>
              ))}
              {!found.length && <p className="px-3 py-6 text-center text-sm text-muted">No problems match.</p>}
            </div>
          </section>
          {editId !== null
            ? <ProblemEditor key={editId} editId={editId} onSaved={saved} onClose={() => setEditId(null)} />
            : <p className="card p-5 text-sm text-muted">Pick a problem on the left to change its text, languages, difficulty, time limit or tests.</p>}
        </div>
      )}
    </div>
  );
}
