"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Check, ChevronDown, Copy, Eraser, Keyboard, Loader2, Play, RotateCcw, Square, TerminalSquare } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { getRuntime, type PyError, type RunResult, type RuntimeStatus } from "@/lib/python/runner";
import { friendlyHelp } from "@/lib/python/friendly";
import { askTutor } from "@/components/tutor/bus";

export function useRuntimeStatus() {
  const [status, setStatus] = useState<RuntimeStatus>("idle");
  useEffect(() => getRuntime().subscribe(setStatus), []);
  return status;
}

export function RuntimeBadge() {
  const status = useRuntimeStatus();
  const map: Record<RuntimeStatus, [string, string]> = {
    idle: ["bg-muted", "Python loads on first run"],
    loading: ["bg-warn animate-pulse", "Loading Python…"],
    ready: ["bg-success", `Python ${getRuntime().version || "ready"}`],
    running: ["bg-accent animate-pulse", "Running…"],
    error: ["bg-danger", "Python failed to load"],
  };
  const [dot, label] = map[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${dot}`} /> {label}
    </span>
  );
}

export function ErrorPanel({ error, code }: { error: PyError; code: string }) {
  const help = friendlyHelp(error.type);
  return (
    <div className="border-t border-danger/30 bg-danger/5 p-4 text-sm" role="alert">
      <p className="font-semibold text-danger">
        {error.type}{error.line ? <span className="font-normal text-muted"> on line {error.line}</span> : null}
      </p>
      {error.message && <p className="mt-0.5 font-mono text-[13px]">{error.message}</p>}
      <p className="mt-2 text-fg/90"><span className="font-medium">What this means: </span>{help.tip}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {help.slug && <Link href={`/errors/${help.slug}`} className="btn-secondary btn-sm">Learn about {error.type}</Link>}
        <button
          className="btn-secondary btn-sm"
          onClick={() => askTutor({
            feature: "debug",
            message: `My code gives an error. Can you explain what went wrong and how to fix it?\n\n\`\`\`python\n${code}\n\`\`\`\n\nError:\n\`\`\`\n${error.traceback || `${error.type}: ${error.message}`}\n\`\`\``,
          })}
        >
          <Bot className="h-3.5 w-3.5" /> Ask PyBuddy
        </button>
      </div>
    </div>
  );
}

export interface PythonRunnerProps {
  initialCode: string;
  storageKey?: string;
  minHeight?: string;
  showInput?: boolean;
  defaultInput?: string;
  examples?: { title: string; code: string }[];
  onCodeChange?: (code: string) => void;
  onResult?: (r: RunResult, code: string) => void;
  toolbarExtra?: React.ReactNode;
  compact?: boolean;
}

export function PythonRunner({
  initialCode, storageKey, minHeight = "240px", showInput = true, defaultInput = "", examples, onCodeChange, onResult, toolbarExtra, compact = false,
}: PythonRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [input, setInput] = useState(defaultInput);
  const [inputOpen, setInputOpen] = useState(Boolean(defaultInput) || /input\(/.test(initialCode));
  const [output, setOutput] = useState<{ text: string; stream: "stdout" | "stderr" }[]>([]);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exOpen, setExOpen] = useState(false);
  const outRef = useRef<HTMLDivElement>(null);
  const status = useRuntimeStatus();

  // restore draft
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved != null) setCode(saved);
    } catch {}
  }, [storageKey]);

  const update = (v: string) => {
    setCode(v);
    onCodeChange?.(v);
    if (storageKey) try { localStorage.setItem(storageKey, v); } catch {}
  };

  useEffect(() => { outRef.current?.scrollTo({ top: outRef.current.scrollHeight }); }, [output]);
  useEffect(() => { setInputOpen((o) => o || /input\(/.test(code)); }, [code]);

  const run = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setOutput([]);
    setResult(null);
    const inputs = input.length ? input.replace(/\r\n/g, "\n").split("\n") : [];
    if (inputs.length && inputs[inputs.length - 1] === "") inputs.pop();
    const r = await getRuntime().run(code, {
      inputs,
      echoInput: true,
      timeoutMs: 10_000,
      onOutput: (text, stream) => setOutput((o) => [...o, { text, stream }]),
    });
    setResult(r);
    setRunning(false);
    onResult?.(r, code);
  }, [code, input, running, onResult]);

  const reset = () => { update(initialCode); setOutput([]); setResult(null); };
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="card-flat overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-2">
        {running ? (
          <button onClick={() => getRuntime().stop("stopped")} className="btn-danger btn-sm"><Square className="h-3.5 w-3.5" /> Stop</button>
        ) : (
          <button onClick={run} className="btn-primary btn-sm" title="Run (Ctrl/⌘ + Enter)">
            {status === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Run
          </button>
        )}
        <button onClick={reset} className="btn-ghost btn-sm" title="Reset to the original code"><RotateCcw className="h-3.5 w-3.5" /><span className={compact ? "sr-only" : ""}>Reset</span></button>
        <button onClick={() => { setOutput([]); setResult(null); }} className="btn-ghost btn-sm" title="Clear output"><Eraser className="h-3.5 w-3.5" /><span className={compact ? "sr-only" : ""}>Clear</span></button>
        <button onClick={copy} className="btn-ghost btn-sm" title="Copy code">{copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}<span className={compact ? "sr-only" : ""}>{copied ? "Copied" : "Copy"}</span></button>
        {showInput && (
          <button onClick={() => setInputOpen((o) => !o)} className={`btn-ghost btn-sm ${inputOpen ? "text-fg" : ""}`} title="Provide input() lines" aria-expanded={inputOpen}>
            <Keyboard className="h-3.5 w-3.5" /><span className={compact ? "sr-only" : ""}>Input</span>
          </button>
        )}
        {examples && examples.length > 0 && (
          <div className="relative">
            <button onClick={() => setExOpen((o) => !o)} className="btn-ghost btn-sm" aria-expanded={exOpen}>Examples <ChevronDown className="h-3.5 w-3.5" /></button>
            {exOpen && (
              <div className="card absolute left-0 top-9 z-20 w-64 p-1.5">
                {examples.map((e) => (
                  <button key={e.title} onClick={() => { update(e.code); setExOpen(false); setOutput([]); setResult(null); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated">{e.title}</button>
                ))}
              </div>
            )}
          </div>
        )}
        {toolbarExtra}
        <span className="ml-auto hidden sm:inline"><RuntimeBadge /></span>
      </div>

      <CodeEditor value={code} onChange={update} onRun={run} minHeight={minHeight} errorLine={result?.error?.line ?? null} />

      {showInput && inputOpen && (
        <div className="border-t border-border bg-surface px-3 py-2">
          <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted" htmlFor={`in-${storageKey ?? "x"}`}>
            <span>Input — one line per <code className="font-mono">input()</code> call</span>
          </label>
          <textarea id={`in-${storageKey ?? "x"}`} value={input} onChange={(e) => setInput(e.target.value)} rows={2} placeholder={"e.g.\nAlex\n15"}
            className="input resize-y font-mono text-[13px]" spellCheck={false} />
        </div>
      )}

      <div className="border-t border-border">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted">
          <TerminalSquare className="h-3.5 w-3.5" /> Output
          {result && !running && (
            <span className={`ml-auto ${result.ok ? "text-success" : "text-danger"}`}>
              {result.timedOut ? "Stopped: took longer than 10s" : result.stopped ? "Stopped" : result.ok ? `Finished in ${Math.max(1, Math.round(result.ms))} ms` : "Finished with an error"}
            </span>
          )}
        </div>
        <div ref={outRef} className="code-block thin-scroll max-h-72 min-h-[64px] overflow-auto px-4 pb-3 font-mono text-[13px] leading-6" aria-live="polite">
          {status === "loading" && output.length === 0 && <p className="text-muted">Loading Python (first run takes a few seconds)…</p>}
          {status === "error" && <p className="text-danger">Python could not load: {getRuntime().loadError}. Check your connection and try again.</p>}
          {output.map((o, i) => <span key={i} className={`whitespace-pre-wrap ${o.stream === "stderr" ? "text-warn" : ""}`}>{o.text}</span>)}
          {result && result.ok && output.length === 0 && <p className="text-muted">(no output — use print() to show something)</p>}
          {!result && !running && output.length === 0 && status !== "loading" && status !== "error" && <p className="text-muted">Press Run or Ctrl/⌘ + Enter.</p>}
        </div>
        {result?.timedOut && (
          <div className="border-t border-warn/40 bg-warn/10 px-4 py-3 text-sm">
            <p className="font-semibold">Your program ran for too long and was stopped.</p>
            <p className="mt-0.5 text-fg/80">This usually means an <strong>infinite loop</strong>: a while loop whose condition never becomes False, or a program waiting for more input. <Link className="link" href="/learn/m7-infinite-mistakes">Learn about infinite loops</Link></p>
          </div>
        )}
        {result?.error && <ErrorPanel error={result.error} code={code} />}
      </div>
    </div>
  );
}
