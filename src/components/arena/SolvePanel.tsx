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
import { CPP_STARTER, getCppRuntime, type CppStatus } from "@/lib/cpp/runner";

type Lang = "python" | "cpp";
const LANG_LABEL: Record<Lang, string> = { python: "Python 3", cpp: "C++20 (Clang 21)" };

/** Compiler status for C++ (download progress, ready…). */
function CppBadge() {
  const [st, setSt] = useState<{ s: CppStatus; mb: number }>({ s: "idle", mb: 0 });
  useEffect(() => getCppRuntime().subscribe((s, mb) => setSt({ s, mb })), []);
  const text = st.s === "idle" ? "Compiler loads on first run (~27 MB, once)" : st.s === "loading" ? `Downloading compiler… ${st.mb} / 27 MB` : st.s === "error" ? "Compiler failed to load" : st.s === "compiling" ? "Compiling…" : st.s === "running" ? "Running…" : "Clang 21 ready";
  return <span className={`inline-flex items-center gap-1.5 text-xs ${st.s === "error" ? "text-danger" : "text-muted"}`}><span className={`h-2 w-2 rounded-full ${st.s === "ready" ? "bg-success" : st.s === "error" ? "bg-danger" : "bg-warn"}`} />{text}</span>;
}

interface TestRun { stdout: string; error: { type: string; message: string; line?: number | null } | null; timedOut: boolean; ms: number }

/** Runs code on each input (compiling first for C++). Stops early on a crash or timeout when asked. */
async function runInputs(lang: Lang, code: string, inputs: string[], limit: number, maxOutput: number, stopOnFail: boolean, onTest: (i: number) => void): Promise<{ compileLog?: string; runs: TestRun[] }> {
  const runs: TestRun[] = [];
  if (lang === "cpp") {
    const cpp = getCppRuntime();
    const c = await cpp.compile(code);
    if (!c.ok || !c.wasm) return { compileLog: c.log || "Compilation failed.", runs };
    for (let i = 0; i < inputs.length; i++) {
      onTest(i);
      const r = await cpp.run(c.wasm, inputs[i], { timeoutMs: limit + 1500, maxOutput });
      runs.push({ stdout: r.stdout, error: r.error, timedOut: r.timedOut, ms: Math.round(r.ms) });
      if (stopOnFail && (r.error || r.timedOut || r.ms > limit)) break;
    }
    return { runs };
  }
  const rt = getRuntime();
  for (let i = 0; i < inputs.length; i++) {
    onTest(i);
    const r = await rt.run(code, { stdin: inputs[i], timeoutMs: limit + 1500, maxOutput });
    runs.push({ stdout: r.stdout, error: r.error, timedOut: r.timedOut, ms: Math.round(r.ms) });
    if (r.error && ["SyntaxError", "IndentationError", "TabError"].includes(r.error.type)) {
      return { compileLog: `${r.error.type}: ${r.error.message}${r.error.line ? ` (line ${r.error.line})` : ""}`, runs };
    }
    if (stopOnFail && (r.error || r.timedOut || r.ms > limit)) break;
  }
  return { runs };
}

const STARTER = "# Read the input with input() and print the answer.\n";
const MAX_OUTPUT = 4_000_000;

interface MySub { id: number; language?: string; verdict: string; failed_test: number | null; time_ms: number; created_at: string; contest_id: number | null }
interface ExampleResult { ok: boolean; output: string; error?: string }

export function SolvePanel({ problemId, contestId, examples, timeLimitMs, contestRunning = false }: {
  problemId: number; contestId?: number; examples: { input: string; output: string }[]; timeLimitMs: number; contestRunning?: boolean;
}) {
  const p = useProgress();
  const toast = useToast();
  const [lang, setLang] = useState<Lang>("python");
  const draftKey = lang === "python" ? `pynest-arena-${problemId}` : `pynest-arena-${problemId}-cpp`;
  const starter = lang === "cpp" ? CPP_STARTER : STARTER;
  const [code, setCode] = useState(STARTER);
  const [compileLog, setCompileLog] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "examples" | "submit">(null);
  const [progress, setProgress] = useState("");
  const [exResults, setExResults] = useState<ExampleResult[] | null>(null);
  const [result, setResult] = useState<{ id: number; verdict: string; failedTest: number | null; timeMs: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [mine, setMine] = useState<MySub[] | null>(null);

  useEffect(() => {
    try { const l = localStorage.getItem("pynest-arena-lang"); if (l === "cpp" || l === "python") setLang(l); } catch {}
  }, []);
  useEffect(() => {
    let d: string | null = null;
    try { d = localStorage.getItem(draftKey); } catch {}
    setCode(d ?? starter);
    setCompileLog(null); setExResults(null); setResult(null);
  }, [draftKey, starter]);
  const pickLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("pynest-arena-lang", l); } catch {}
    if (l === "cpp") getCppRuntime().load().catch(() => null); // start the download right away
  };
  useEffect(() => {
    const t = setTimeout(() => { try { if (code !== starter) localStorage.setItem(draftKey, code); } catch {} }, 400);
    return () => { clearTimeout(t); };
  }, [code, draftKey, starter]);

  const loadMine = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb || !p.profile) return;
    const { data } = await sb.from("submissions").select("id, verdict, failed_test, time_ms, created_at, contest_id, language")
      .eq("user_id", p.profile.id).eq("problem_id", problemId).order("created_at", { ascending: false }).limit(20);
    setMine((data ?? []) as MySub[]);
  }, [p.profile, problemId]);
  useEffect(() => { loadMine(); }, [loadMine]);

  const runExamples = async () => {
    setBusy("examples"); setErr(null); setExResults(null); setCompileLog(null);
    try {
      if (lang === "cpp") setProgress("Compiling…");
      const { compileLog: log, runs } = await runInputs(lang, code, examples.map((e) => e.input), timeLimitMs, 200_000, false, (i) => setProgress(`Running example ${i + 1}…`));
      if (log) { setCompileLog(log); return; }
      setExResults(runs.map((r, i) =>
        r.timedOut ? { ok: false, output: r.stdout, error: `Time limit exceeded (over ${timeLimitMs / 1000}s)` }
        : r.error ? { ok: false, output: r.stdout, error: `${r.error.type}: ${r.error.message}${r.error.line ? ` (line ${r.error.line})` : ""}` }
        : { ok: sameOutput(r.stdout, examples[i].output), output: r.stdout }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null); setProgress("");
    }
  };

  const submit = async () => {
    setBusy("submit"); setErr(null); setResult(null); setCompileLog(null); setProgress("Getting tests…");
    try {
      const t = await fetch(`/api/arena/tests?problem=${problemId}`, { cache: "no-store" });
      const tj = await t.json();
      if (!t.ok) throw new Error(tj.error || "Could not load tests");
      const inputs: string[] = tj.inputs;
      const limit: number = tj.timeLimitMs;
      if (lang === "cpp") setProgress("Compiling…");
      const { compileLog: log, runs } = await runInputs(lang, code, inputs, limit, MAX_OUTPUT, true, (i) => setProgress(`Running on test ${i + 1} of ${inputs.length}…`));
      if (log) setCompileLog(log);
      const results = log
        ? [{ stdout: "", error: { type: "CompilationError" }, timedOut: false, ms: 0 }]
        : runs.map((r) => ({ stdout: r.stdout, error: r.error ? { type: r.error.type } : null, timedOut: r.timedOut, ms: r.ms }));
      setProgress("Judging…");
      const s = await fetch("/api/arena/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, contestId: contestId ?? null, code, results, language: lang }),
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
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Your solution</p>
            <select className="input w-auto py-1 text-xs" value={lang} onChange={(e) => pickLang(e.target.value as Lang)} aria-label="Language" disabled={!!busy}>
              {(Object.keys(LANG_LABEL) as Lang[]).map((l) => <option key={l} value={l}>{LANG_LABEL[l]}</option>)}
            </select>
          </div>
          {lang === "python" ? <RuntimeBadge /> : <CppBadge />}
        </div>
        <CodeEditor language={lang} value={code} onChange={setCode} minHeight="280px" maxHeight="560px" onRun={runExamples} ariaLabel="Solution code" />
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

      {compileLog && (
        <div className="card border-danger/40 p-4">
          <p className="font-semibold text-danger">Compilation error</p>
          <pre className="code-block mt-2 max-h-72 overflow-auto whitespace-pre-wrap text-xs">{compileLog}</pre>
        </div>
      )}
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
                  <td className="px-2 py-2 text-xs text-muted">{s.language === "cpp" ? "C++" : "Python"}</td>
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
