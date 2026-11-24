"use client";
/**
 * C++ in the browser: Clang (LLVM 21, WebAssembly) compiles the program in one
 * worker; a second, disposable worker runs it so infinite loops can be stopped.
 */

export type CppStatus = "idle" | "loading" | "ready" | "compiling" | "running" | "error";
export interface CppCompileResult { ok: boolean; wasm?: Uint8Array; log: string }
export interface CppRunResult { stdout: string; stderr: string; ok: boolean; error: { type: string; message: string } | null; timedOut: boolean; ms: number }

class CppRuntime {
  private compiler: Worker | null = null;
  private ready: Promise<void> | null = null;
  private runner: Worker | null = null;
  private nextId = 1;
  private waiting = new Map<number, (m: MessageEvent["data"]) => void>();
  private listeners = new Set<(s: CppStatus, mb: number) => void>();
  status: CppStatus = "idle";
  downloadedMb = 0;
  loadError = "";

  subscribe(fn: (s: CppStatus, mb: number) => void) {
    this.listeners.add(fn);
    fn(this.status, this.downloadedMb);
    return () => { this.listeners.delete(fn); };
  }
  private set(s: CppStatus) { this.status = s; this.listeners.forEach((l) => l(s, this.downloadedMb)); }

  /** Downloads the compiler (~27 MB, cached by the browser afterwards). */
  load(): Promise<void> {
    if (this.ready) return this.ready;
    this.set("loading");
    this.ready = new Promise<void>((resolve, reject) => {
      const w = new Worker("/cpp-worker.mjs", { type: "module" });
      this.compiler = w;
      w.onmessage = (e) => {
        const m = e.data;
        if (m.type === "progress") { this.downloadedMb = m.mb; this.set("loading"); }
        else if (m.type === "ready") { this.set("ready"); resolve(); }
        else if (m.type === "fatal") { this.fail(m.message); reject(new Error(m.message)); }
        else if (m.type === "compiled") { this.waiting.get(m.id)?.(m); this.waiting.delete(m.id); }
      };
      w.onerror = (e) => { this.fail(e.message || "The C++ compiler failed to start."); reject(new Error(e.message)); };
      w.postMessage({ type: "load" });
    });
    return this.ready;
  }

  private fail(message: string) {
    this.loadError = message;
    this.ready = null;
    this.compiler?.terminate();
    this.compiler = null;
    this.set("error");
  }

  async compile(code: string): Promise<CppCompileResult> {
    await this.load();
    this.set("compiling");
    const id = this.nextId++;
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        // A compile that never ends (e.g. template explosion): restart the compiler.
        this.waiting.delete(id);
        this.fail("Compilation took longer than 60 seconds.");
        resolve({ ok: false, log: "Compilation took longer than 60 seconds." });
      }, 60_000);
      this.waiting.set(id, (m) => {
        clearTimeout(timer);
        this.set("ready");
        resolve({ ok: m.ok, wasm: m.wasm, log: m.log ?? "" });
      });
      this.compiler!.postMessage({ type: "compile", id, code });
    });
  }

  /** Runs a compiled program on one input. */
  run(wasm: Uint8Array, stdin: string, { timeoutMs = 3000, maxOutput = 4_000_000 } = {}): Promise<CppRunResult> {
    if (!this.runner) this.runner = new Worker("/cpp-run-worker.mjs", { type: "module" });
    const w = this.runner;
    const id = this.nextId++;
    this.set("running");
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        w.terminate();
        if (this.runner === w) this.runner = null;
        this.set("ready");
        resolve({ stdout: "", stderr: "", ok: false, error: null, timedOut: true, ms: timeoutMs });
      }, timeoutMs);
      w.onmessage = (e) => {
        if (e.data.id !== id) return;
        clearTimeout(timer);
        this.set("ready");
        resolve({ stdout: e.data.stdout, stderr: e.data.stderr, ok: !e.data.error, error: e.data.error, timedOut: false, ms: e.data.ms });
      };
      w.postMessage({ id, wasm, stdin, maxOutput });
    });
  }
}

let rt: CppRuntime | null = null;
export function getCppRuntime() {
  if (!rt) rt = new CppRuntime();
  return rt;
}

export const CPP_STARTER = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Read the input with cin and print the answer with cout.

    return 0;
}
`;
