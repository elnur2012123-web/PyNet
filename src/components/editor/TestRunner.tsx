"use client";

import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleDashed, Eye, EyeOff, FlaskConical, Lightbulb, Loader2, Play, RotateCcw, Square, XCircle } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { ErrorPanel, RuntimeBadge } from "./PythonRunner";
import { CodeBlock } from "./CodeBlock";
import { getRuntime, runTests, type RunResult, type TestResult } from "@/lib/python/runner";
import type { TestCase } from "@/content/types";

export function TestRunner({
  starter = "", tests, hints = [], solution, explanation, onChecked, storageKey, minHeight = "160px", checkLabel = "Check solution",
}: {
  starter?: string;
  tests: TestCase[];
  hints?: string[];
  solution?: string;
  explanation?: string;
  onChecked?: (passed: boolean, code: string, results: TestResult[]) => void;
  storageKey?: string;
  minHeight?: string;
  checkLabel?: string;
}) {
  const tx = useT();
  const [code, setCode] = useState(starter);
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved != null) setCode(saved);
    } catch {}
  }, [storageKey]);
  const [busy, setBusy] = useState<"run" | "check" | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const update = (v: string) => {
    setCode(v);
    if (storageKey) try { localStorage.setItem(storageKey, v); } catch {}
  };

  const firstInput = tests.find((t) => t.input)?.input ?? [];

  const run = useCallback(async () => {
    setBusy("run");
    setResults(null);
    const t = tests[0];
    const r = await getRuntime().run(code, { inputs: firstInput, echoInput: true, append: t?.append, timeoutMs: 8000 });
    setRunResult(r);
    setBusy(null);
  }, [code, tests, firstInput]);

  const check = useCallback(async () => {
    setBusy("check");
    setRunResult(null);
    const r = await runTests(code, tests);
    setResults(r);
    setBusy(null);
    onChecked?.(r.every((x) => x.passed), code, r);
  }, [code, tests, onChecked]);

  const allPassed = results?.every((r) => r.passed);

  return (
    <div className="card-flat overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
        {busy ? (
          <button onClick={() => getRuntime().stop("stopped")} className="btn-danger btn-sm"><Square className="h-3.5 w-3.5" /> <T k="Stop" /></button>
        ) : (
          <>
            <button onClick={run} className="btn-secondary btn-sm" title={tx("Run with the first example input")}><Play className="h-3.5 w-3.5" /> <T k="Run" /></button>
            <button onClick={check} className="btn-primary btn-sm"><FlaskConical className="h-3.5 w-3.5" /> <T k={checkLabel} /></button>
          </>
        )}
        <button onClick={() => { update(starter); setResults(null); setRunResult(null); }} className="btn-ghost btn-sm" title={tx("Reset")}><RotateCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline"><T k="Reset" /></span></button>
        {hints.length > 0 && (
          <button onClick={() => setHintCount((h) => Math.min(h + 1, hints.length))} disabled={hintCount >= hints.length} className="btn-ghost btn-sm">
            <Lightbulb className="h-3.5 w-3.5" /> <T k="Hint" />{hints.length > 1 ? ` (${hintCount}/${hints.length})` : ""}
          </button>
        )}
        {solution && (
          <button onClick={() => setShowSolution((s) => !s)} className="btn-ghost btn-sm" disabled={!showSolution && hintCount === 0 && !results} title={hintCount === 0 && !results ? tx("Try a hint or check your code first") : undefined}>
            {showSolution ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {showSolution ? tx("Hide") : tx("Show")} <T k="solution" /></button>
        )}
        <span className="ml-auto hidden sm:inline"><RuntimeBadge /></span>
      </div>

      <CodeEditor value={code} onChange={update} onRun={check} minHeight={minHeight} errorLine={runResult?.error?.line ?? results?.find((r) => r.error)?.error?.line ?? null} />

      {hintCount > 0 && (
        <div className="space-y-1 border-t border-border bg-warn/5 px-4 py-3 text-sm">
          {hints.slice(0, hintCount).map((h, i) => <p key={i} className="flex gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warn" /> {h}</p>)}
        </div>
      )}

      {busy && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> {busy === "check" ? tx("Running tests…") : tx("Running…")}</div>
      )}

      {runResult && !busy && (
        <div className="border-t border-border">
          <pre className="code-block thin-scroll max-h-56 overflow-auto px-4 py-3 font-mono text-[13px] leading-6">{runResult.stdout || (runResult.ok ? tx("(no output)") : "")}{runResult.timedOut ? tx("\n⏱ Stopped: the program ran too long (infinite loop?)") : ""}</pre>
          {runResult.error && <ErrorPanel error={runResult.error} code={code} />}
        </div>
      )}

      {results && !busy && (
        <div className="border-t border-border p-4">
          <p className={`mb-3 flex items-center gap-2 text-sm font-semibold ${allPassed ? "text-success" : "text-danger"}`}>
            {allPassed ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {allPassed ? tx("All tests passed — great job!") : `${results.filter((r) => r.passed).length} of ${results.length} tests passed`}
          </p>
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.index} className={`rounded-xl border px-3 py-2 text-sm ${r.passed ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"}`}>
                <p className="flex items-center gap-2 font-medium">
                  {r.passed ? <CheckCircle2 className="h-4 w-4 text-success" /> : r.error || r.timedOut ? <XCircle className="h-4 w-4 text-danger" /> : <CircleDashed className="h-4 w-4 text-danger" />}
                  <T k="Test" />{" "}{r.index + 1}{r.hidden ? tx(" (hidden)") : ""}
                  {r.input && r.input.length > 0 && !r.hidden && <span className="font-normal text-muted"><T k="— input:" />{" "}<code className="font-mono">{r.input.join(" ⏎ ")}</code></span>}
                </p>
                {!r.passed && !r.hidden && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div><p className="text-xs text-muted"><T k="Expected output" /></p><pre className="code-block mt-1 overflow-x-auto rounded-lg p-2 font-mono text-xs">{r.expected || "(nothing)"}</pre></div>
                    <div><p className="text-xs text-muted"><T k="Your output" /></p><pre className="code-block mt-1 overflow-x-auto rounded-lg p-2 font-mono text-xs">{r.timedOut ? tx("⏱ timed out") : r.error ? `${r.error.type}: ${r.error.message}` : r.actual || "(nothing)"}</pre></div>
                  </div>
                )}
                {!r.passed && r.hidden && <p className="mt-1 text-xs text-muted"><T k="A hidden test checks an extra case. Think about edge cases (0, negatives, empty input)." /></p>}
              </li>
            ))}
          </ul>
          {results.find((r) => r.error) && <div className="mt-3 overflow-hidden rounded-xl border border-border"><ErrorPanel error={results.find((r) => r.error)!.error!} code={code} /></div>}
        </div>
      )}

      {showSolution && solution && (
        <div className="space-y-3 border-t border-border p-4">
          <CodeBlock code={solution} title={tx("Solution")} />
          {explanation && <p className="text-sm text-fg/90"><span className="font-semibold"><T k="Why it works:" />{" "}</span>{explanation}</p>}
        </div>
      )}
    </div>
  );
}
