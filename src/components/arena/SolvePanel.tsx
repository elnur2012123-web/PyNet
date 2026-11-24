"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Play, Send, XCircle } from "lucide-react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { RuntimeBadge } from "@/components/editor/PythonRunner";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useToast } from "@/components/ui/Toast";
import { getRuntime } from "@/lib/python/runner";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { sameOutput, verdictClass, verdictText } from "@/lib/arena/verdict";
import { achievementById } from "@/lib/achievements";

const STARTER = "# Read the input with input() and print the answer.\n";
const MAX_OUTPUT = 4_000_000;

interface MySub { id: number; verdict: string; failed_test: number | null; time_ms: number; created_at: string; contest_id: number | null }
interface ExampleResult { ok: boolean; output: string; error?: string }

export function SolvePanel({ problemId, contestId, examples, timeLimitMs, contestRunning = false }: {
  problemId: number; contestId?: number; examples: { input: string; output: string }[]; timeLimitMs: number; contestRunning?: boolean;
}) {
  const p = useProgress();
  const toast = useToast();
  const draftKey = `pynest-arena-${problemId}`;
  const [code, setCode] = useState(STARTER);
  const [busy, setBusy] = useState<null | "examples" | "submit">(null);
  const [progress, setProgress] = useState("");
  const [exResults, setExResults] = useState<ExampleResult[] | null>(null);
  const [result, setResult] = useState<{ id: number; verdict: string; failedTest: number | null; timeMs: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mine, setMine] = useState<MySub[] | null>(null);

  useEffect(() => {
    try { const d = localStorage.getItem(draftKey); if (d) setCode(d); } catch {}
  }, [draftKey]);
  useEffect(() => {
    const t = setTimeout(() => { try { localStorage.setItem(draftKey, code); } catch {} }, 400);
    return () => { clearTimeout(t); };
  }, [code, draftKey]);

  const loadMine = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb || !p.profile) return;
    const { data } = await sb.from("submissions").select("id, verdict, failed_test, time_ms, created_at, contest_id")
      .eq("user_id", p.profile.id).eq("problem_id", problemId).order("created_at", { ascending: false }).limit(20);
    setMine((data ?? []) as MySub[]);
  }, [p.profile, problemId]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const runExamples = async () => {
    setBusy("examples"); setErr(null); setExResults(null);
    const rt = getRuntime();
    const out: ExampleResult[] = [];
    for (const ex of examples) {
      const r = await rt.run(code, { stdin: ex.input, timeoutMs: timeLimitMs + 1500, maxOutput: 200_000 });
      if (r.timedOut) out.push({ ok: false, output: r.stdout, error: `Time limit exceeded (over ${timeLimitMs / 1000}s)` });
      else if (r.error) out.push({ ok: false, output: r.stdout, error: `${r.error.type}: ${r.error.message}${r.error.line ? ` (line ${r.error.line})` : ""}` });
      else out.push({ ok: sameOutput(r.stdout, ex.output), output: r.stdout });
    }
    setExResults(out);
    setBusy(null);
  };

  const submit = async () => {
    setBusy("submit"); setErr(null); setResult(null); setProgress("Getting tests…");
    try {
      const t = await fetch(`/api/arena/tests?problem=${problemId}`, { cache: "no-store" });
      const tj = await t.json();
      if (!t.ok) throw new Error(tj.error || "Could not load tests");
      const inputs: string[] = tj.inputs;
      const limit: number = tj.timeLimitMs;
      const rt = getRuntime();
      const results: { stdout: string; error: { type: string } | null; timedOut: boolean; ms: number }[] = [];
      for (let i = 0; i < inputs.length; i++) {
        setProgress(`Running on test ${i + 1} of ${inputs.length}…`);
        const r = await rt.run(code, { stdin: inputs[i], timeoutMs: limit + 1500, maxOutput: MAX_OUTPUT });
        results.push({ stdout: r.stdout, error: r.error ? { type: r.error.type } : null, timedOut: r.timedOut, ms: Math.round(r.ms) });
        if (r.error || r.timedOut || r.ms > limit) break;
      }
      setProgress("Judging…");
      const s = await fetch("/api/arena/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, contestId: contestId ?? null, code, results }),
      });
      const sj = await s.json();
      if (!s.ok) throw new Error(sj.error || "Submission failed");
      setResult(sj);
      if (sj.xp > 0) toast({ kind: "success", title: `Accepted! +${sj.xp} XP`, body: "First solve of this problem." });
      for (const id of sj.achievements ?? []) {
        const a = achievementById(id);
        if (a) toast({ kind: "achievement", title: a.name, body: a.description });
      }
      if (sj.verdict === "OK") p.refresh();
      loadMine();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null); setProgress("");
    }
  };

  const signedIn = p.mode === "account";

  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
          <p className="text-sm font-medium">Your solution <span className="text-muted">· Python 3</span></p>
          <RuntimeBadge />
        </div>
        <CodeEditor value={code} onChange={setCode} minHeight="280px" maxHeight="560px" onRun={runExamples} ariaLabel="Solution code" />
        <div className="flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
          <button className="btn-secondary btn-sm" onClick={runExamples} disabled={!!busy}>
            {busy === "examples" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Run examples
          </button>
          {signedIn ? (
            <button className="btn-primary btn-sm" onClick={submit} disabled={!!busy || !code.trim()}>
              {busy === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
            </button>
          ) : (
            <Link href="/signup" className="btn-primary btn-sm">Sign up to submit</Link>
          )}
          {progress && <span className="text-sm text-muted">{progress}</span>}
          {contestRunning && <span className="ml-auto text-xs text-muted">Submitting registers you for the round.</span>}
        </div>
      </div>

      {err && <div className="card border-danger/40 p-3 text-sm text-danger">{err}</div>}
      {result && (
        <div className={`card flex flex-wrap items-center gap-3 p-4 ${result.verdict === "OK" ? "border-success/50" : "border-danger/40"}`}>
          {result.verdict === "OK" ? <CheckCircle2 className="h-6 w-6 text-success" /> : <XCircle className="h-6 w-6 text-danger" />}
          <div>
            <p className={`text-lg ${verdictClass(result.verdict)}`}>{verdictText(result.verdict, result.failedTest)}</p>
            <p className="text-xs text-muted">Submission #{result.id} · {result.timeMs} ms</p>
          </div>
          <Link href={`/submissions/${result.id}`} className="btn-ghost btn-sm ml-auto">View submission</Link>
        </div>
      )}

      {exResults && (
        <div className="card divide-y divide-border">
          {exResults.map((r, i) => (
            <div key={i} className="p-3 text-sm">
              <p className={r.ok ? "font-medium text-success" : "font-medium text-danger"}>Example {i + 1}: {r.ok ? "correct" : r.error ?? "wrong answer"}</p>
              {!r.ok && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div><p className="text-xs text-muted">Your output</p><pre className="code-block mt-1 max-h-40 overflow-auto text-xs">{r.output || "(nothing)"}</pre></div>
                  <div><p className="text-xs text-muted">Expected</p><pre className="code-block mt-1 max-h-40 overflow-auto text-xs">{examples[i].output}</pre></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {mine && mine.length > 0 && (
        <div className="card overflow-hidden">
          <p className="border-b border-border px-4 py-2.5 text-sm font-medium">My submissions</p>
          <table className="w-full text-sm">
            <tbody>
              {mine.map((s) => (
                <tr key={s.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-2"><Link className="link" href={`/submissions/${s.id}`}>#{s.id}</Link></td>
                  <td className="px-2 py-2 text-xs text-muted">{new Date(s.created_at).toLocaleString()}</td>
                  <td className={`px-2 py-2 ${verdictClass(s.verdict)}`}>{verdictText(s.verdict, s.failed_test)}</td>
                  <td className="px-4 py-2 text-right text-xs text-muted">{s.time_ms} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
