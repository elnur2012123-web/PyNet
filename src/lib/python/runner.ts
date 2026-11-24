"use client";

import type { TestCase } from "@/content/types";

export type RuntimeStatus = "idle" | "loading" | "ready" | "running" | "error";

export interface PyError {
  type: string;
  message: string;
  line: number | null;
  traceback: string;
}

export interface RunResult {
  stdout: string;
  stderr: string;
  ok: boolean;
  error: PyError | null;
  timedOut: boolean;
  stopped: boolean;
  ms: number;
}

export interface RunOptions {
  inputs?: string[];
  echoInput?: boolean;
  append?: string;
  timeoutMs?: number;
  /** Judge mode: feed this text as real stdin (sys.stdin / input()). */
  stdin?: string;
  /** Max characters of output kept (default 100 000). */
  maxOutput?: number;
  onOutput?: (text: string, stream: "stdout" | "stderr") => void;
}

const INDEX_URL = process.env.NEXT_PUBLIC_PYODIDE_INDEX_URL || "/pyodide/";

type Pending = {
  resolve: (r: RunResult) => void;
  stdout: string;
  stderr: string;
  opts: RunOptions;
  timer: ReturnType<typeof setTimeout> | null;
};

class PythonRuntime {
  private worker: Worker | null = null;
  private readyPromise: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private queue: Promise<unknown> = Promise.resolve();
  private nextId = 1;
  private listeners = new Set<(s: RuntimeStatus) => void>();
  status: RuntimeStatus = "idle";
  version = "";
  loadError = "";

  subscribe(fn: (s: RuntimeStatus) => void) {
    this.listeners.add(fn);
    fn(this.status);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private setStatus(s: RuntimeStatus) {
    this.status = s;
    this.listeners.forEach((l) => l(s));
  }

  /** Start loading Python (≈ 12 MB on first visit, cached afterwards). */
  load(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.setStatus("loading");
    this.readyPromise = new Promise<void>((resolve, reject) => {
      let worker: Worker;
      try {
        worker = new Worker("/pyodide-worker.mjs", { type: "module" });
      } catch (e) {
        this.fail(String(e));
        reject(e);
        return;
      }
      this.worker = worker;
      worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "ready") {
          this.version = msg.version;
          this.setStatus("ready");
          resolve();
        } else if (msg.type === "fatal") {
          this.fail(msg.message);
          reject(new Error(msg.message));
        } else if (msg.type === "stdout" || msg.type === "stderr") {
          const p = this.pending.get(msg.id);
          if (!p) return;
          if (msg.type === "stdout") p.stdout += msg.text;
          else p.stderr += msg.text;
          p.opts.onOutput?.(msg.text, msg.type);
        } else if (msg.type === "done") {
          const p = this.pending.get(msg.id);
          if (!p) return;
          this.finish(msg.id, {
            stdout: p.stdout,
            stderr: p.stderr,
            ok: msg.ok,
            error: msg.error ?? null,
            timedOut: false,
            stopped: false,
            ms: msg.ms ?? 0,
          });
        }
      };
      worker.onerror = (e) => {
        this.fail(e.message || "The Python worker failed to start.");
        reject(new Error(e.message));
      };
      worker.postMessage({ type: "init", indexURL: new URL(INDEX_URL, window.location.href).href });
    });
    return this.readyPromise;
  }

  private fail(message: string) {
    this.loadError = message;
    this.readyPromise = null;
    this.worker?.terminate();
    this.worker = null;
    this.setStatus("error");
  }

  private finish(id: number, result: RunResult) {
    const p = this.pending.get(id);
    if (!p) return;
    if (p.timer) clearTimeout(p.timer);
    this.pending.delete(id);
    if (this.status === "running" && this.pending.size === 0) this.setStatus("ready");
    p.resolve(result);
  }

  /** Kill the worker (stops infinite loops). Python reloads on the next run. */
  stop(reason: "stopped" | "timeout" = "stopped") {
    if (!this.worker) return;
    this.worker.terminate();
    this.worker = null;
    this.readyPromise = null;
    for (const [id, p] of this.pending) {
      this.finish(id, {
        stdout: p.stdout,
        stderr: p.stderr,
        ok: false,
        error: null,
        timedOut: reason === "timeout",
        stopped: reason === "stopped",
        ms: 0,
      });
    }
    this.setStatus("idle");
  }

  /** Run code in a fresh namespace. Runs are queued one after another. */
  run(code: string, opts: RunOptions = {}): Promise<RunResult> {
    const job = this.queue.then(async () => {
      await this.load();
      const id = this.nextId++;
      this.setStatus("running");
      return new Promise<RunResult>((resolve) => {
        const timeoutMs = opts.timeoutMs ?? 10_000;
        const timer = setTimeout(() => this.stop("timeout"), timeoutMs);
        this.pending.set(id, { resolve, stdout: "", stderr: "", opts, timer });
        this.worker!.postMessage({
          type: "run",
          id,
          code,
          inputs: opts.inputs ?? [],
          echo: opts.echoInput ?? false,
          append: opts.append ?? "",
          stdin: opts.stdin,
          maxOutput: opts.maxOutput,
        });
      });
    });
    this.queue = job.catch(() => undefined);
    return job;
  }
}

let runtime: PythonRuntime | null = null;
export function getRuntime(): PythonRuntime {
  if (!runtime) runtime = new PythonRuntime();
  return runtime;
}

// ---------------------------------------------------------------------
// Test checking
// ---------------------------------------------------------------------
export function normalizeOutput(s: string) {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n+$/, "");
}

export interface TestResult {
  index: number;
  passed: boolean;
  expected: string;
  actual: string;
  input?: string[];
  error: PyError | null;
  timedOut: boolean;
  hidden?: boolean;
}

export async function runTests(code: string, tests: TestCase[]): Promise<TestResult[]> {
  const rt = getRuntime();
  const results: TestResult[] = [];
  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    const r = await rt.run(code, { inputs: t.input, append: t.append, echoInput: false, timeoutMs: 6000 });
    const actual = normalizeOutput(r.stdout);
    results.push({
      index: i,
      passed: r.ok && actual === normalizeOutput(t.expected),
      expected: t.expected,
      actual,
      input: t.input,
      error: r.error,
      timedOut: r.timedOut,
      hidden: t.hidden,
    });
  }
  return results;
}
