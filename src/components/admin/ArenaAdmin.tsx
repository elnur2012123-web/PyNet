"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarPlus, FilePlus2, Loader2, Trash2, X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { getRuntime } from "@/lib/python/runner";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { difficultyClass } from "@/lib/arena/rank";
import { CheatDetector } from "./CheatDetector";
import { DIVISIONS } from "@/lib/arena/divisions";

interface P { id: number; title: string; rating: number; visibility: string }
interface C { id: number; title: string; starts_at: string; duration_minutes: number }
const LETTERS = "ABCDEFGHIJ";

async function post(body: Record<string, unknown>) {
  const r = await fetch("/api/admin/arena", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
const splitBlocks = (t: string) => t.split(/^===\s*$/m).map((x) => x.replace(/^\n/, "")).filter((x) => x.trim()).map((x) => (x.endsWith("\n") ? x : x + "\n"));

export function ArenaAdmin() {
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

  // ---- write a problem
  const [pf, setPf] = useState({ title: "", rating: 800, tags: "implementation", timeLimitMs: 2000, visibility: "hidden", statement: "", inputSpec: "", outputSpec: "", notes: "", examples: "", tests: "" });
  const [ref, setRef] = useState("# Reference solution (used to compute the expected outputs)\n");
  const saveProblem = async () => {
    setBusy("problem"); setMsg(null);
    try {
      const exIn = splitBlocks(pf.examples), testIn = splitBlocks(pf.tests);
      if (!exIn.length) throw new Error("Add at least one example input (separate inputs with a line containing only ===).");
      const rt = getRuntime();
      const outs: string[] = [];
      for (const [i, inp] of [...exIn, ...testIn].entries()) {
        const r = await rt.run(ref, { stdin: inp, timeoutMs: pf.timeLimitMs + 2000, maxOutput: 4_000_000 });
        if (r.error || r.timedOut) throw new Error(`Reference solution failed on ${i < exIn.length ? `example ${i + 1}` : `test ${i - exIn.length + 1}`}: ${r.timedOut ? "time limit" : `${r.error!.type}: ${r.error!.message}`}`);
        outs.push(r.stdout.replace(/\s+$/, ""));
      }
      const all = [...exIn, ...testIn].map((input, i) => ({ input, expected: outs[i] }));
      const j = await post({
        action: "create_problem", title: pf.title, rating: Number(pf.rating), timeLimitMs: Number(pf.timeLimitMs), visibility: pf.visibility,
        tags: pf.tags.split(",").map((t) => t.trim()).filter(Boolean), statement: pf.statement, inputSpec: pf.inputSpec, outputSpec: pf.outputSpec, notes: pf.notes,
        examples: exIn.map((input, i) => ({ input, output: outs[i] })), tests: all,
      });
      setMsg({ ok: true, text: `Problem ${j.id} saved with ${all.length} tests.` });
      load();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    setBusy(null);
  };

  const upcoming = contests.filter((c) => new Date(c.starts_at).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Arena</h2>
      <CheatDetector />
      {msg && <p className={`card p-3 text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card space-y-3 p-5">
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
        </section>

        <section className="card space-y-3 p-5">
          <h3 className="flex items-center gap-2 font-semibold"><FilePlus2 className="h-4 w-4" /> Write a problem</h3>
          <input className="input w-full" placeholder="Title" value={pf.title} onChange={(e) => setPf({ ...pf, title: e.target.value })} />
          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="space-y-1"><span className="label">Difficulty</span>
              <select className="input w-full" value={pf.rating} onChange={(e) => setPf({ ...pf, rating: Number(e.target.value) })}>{Array.from({ length: 28 }, (_, i) => 800 + i * 100).map((r) => <option key={r}>{r}</option>)}</select></label>
            <label className="space-y-1"><span className="label">Time limit (ms)</span><input type="number" min={500} max={10000} step={500} className="input w-full" value={pf.timeLimitMs} onChange={(e) => setPf({ ...pf, timeLimitMs: Number(e.target.value) })} /></label>
            <label className="space-y-1"><span className="label">Where</span>
              <select className="input w-full" value={pf.visibility} onChange={(e) => setPf({ ...pf, visibility: e.target.value })}><option value="hidden">Hidden (for a round)</option><option value="public">Problemset now</option></select></label>
          </div>
          <input className="input w-full" placeholder="Tags, comma separated (math, strings, dp …)" value={pf.tags} onChange={(e) => setPf({ ...pf, tags: e.target.value })} />
          <textarea className="input min-h-24 w-full" placeholder="Statement (use `backticks` for code)" value={pf.statement} onChange={(e) => setPf({ ...pf, statement: e.target.value })} />
          <textarea className="input min-h-14 w-full" placeholder="Input format" value={pf.inputSpec} onChange={(e) => setPf({ ...pf, inputSpec: e.target.value })} />
          <textarea className="input min-h-14 w-full" placeholder="Output format" value={pf.outputSpec} onChange={(e) => setPf({ ...pf, outputSpec: e.target.value })} />
          <textarea className="input min-h-12 w-full" placeholder="Note (optional)" value={pf.notes} onChange={(e) => setPf({ ...pf, notes: e.target.value })} />
          <textarea className="input min-h-20 w-full font-mono text-xs" placeholder={"Example inputs (shown to everyone)\nSeparate inputs with a line: ===\n3\n1 2 3\n===\n1\n5"} value={pf.examples} onChange={(e) => setPf({ ...pf, examples: e.target.value })} />
          <textarea className="input min-h-24 w-full font-mono text-xs" placeholder={"Hidden test inputs, separated by ===\nInclude edge cases and big inputs."} value={pf.tests} onChange={(e) => setPf({ ...pf, tests: e.target.value })} />
          <div className="overflow-hidden rounded-xl border border-border"><CodeEditor value={ref} onChange={setRef} minHeight="160px" ariaLabel="Reference solution" /></div>
          <p className="text-xs text-muted">Expected outputs are computed by running your reference solution here in the browser. Examples become tests 1, 2, ….</p>
          <button className="btn-primary btn-sm" disabled={busy === "problem" || !pf.title || !pf.statement} onClick={saveProblem}>{busy === "problem" && <Loader2 className="h-4 w-4 animate-spin" />} Run reference &amp; save</button>
        </section>
      </div>
    </div>
  );
}
