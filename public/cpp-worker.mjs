// PyNest C++ compiler worker: Clang/LLD (LLVM 21) compiled to WebAssembly.
// The toolchain files are stored gzipped in /cpp/*.gz.bin; this worker serves
// them to the compiler unpacked, so the download is ~27 MB instead of ~104 MB.

const realFetch = globalThis.fetch.bind(globalThis);
let downloaded = 0;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" ? input : input.url ?? String(input), self.location.href);
  if (url.pathname.startsWith("/cpp/") && /\.(wasm|tar)$/.test(url.pathname)) {
    const r = await realFetch(url.href + ".gz.bin", init);
    if (!r.ok) throw new Error(`Could not download the C++ compiler (${r.status})`);
    const buf = new Uint8Array(await r.arrayBuffer());
    downloaded += buf.length;
    self.postMessage({ type: "progress", mb: Math.round(downloaded / 1e6) });
    // Some hosts already undo the gzip; only unpack real gzip data.
    const body = buf[0] === 0x1f && buf[1] === 0x8b
      ? await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer()
      : buf;
    return new Response(body, { headers: { "content-type": url.pathname.endsWith(".wasm") ? "application/wasm" : "application/octet-stream" } });
  }
  return realFetch(input, init);
};

// libc++ has no <bits/stdc++.h>; contestants expect it, so we provide one.
const STDCPP = [
  "algorithm", "array", "bitset", "cassert", "cctype", "chrono", "climits", "cmath", "complex", "cstdint", "cstdio", "cstdlib",
  "cstring", "deque", "functional", "iomanip", "iostream", "iterator", "limits", "list", "map", "memory", "numeric",
  "optional", "queue", "random", "set", "sstream", "stack", "string", "string_view", "tuple", "unordered_map",
  "unordered_set", "utility", "variant", "vector",
].map((h) => `#include <${h}>`).join("\n");

let clang = null;
async function load() {
  if (!clang) {
    const mod = await import(new URL("/cpp/bundle.js", self.location.href).href);
    clang = mod.runClang;
    // Warm up: downloads + compiles the toolchain once.
    await clang(["clang++", "--version"], {}, { stdout: () => {}, stderr: () => {}, fetchProgress: () => {} });
  }
  return clang;
}

self.onmessage = async (e) => {
  const msg = e.data;
  if (msg.type === "load") {
    try { await load(); self.postMessage({ type: "ready" }); }
    catch (err) { self.postMessage({ type: "fatal", message: String(err?.message ?? err) }); }
    return;
  }
  if (msg.type !== "compile") return;
  const dec = new TextDecoder();
  let log = "";
  const sink = (b) => { if (b) log += dec.decode(b, { stream: true }); };
  try {
    const run = await load();
    const started = performance.now();
    const out = await run(
      ["clang++", "-std=c++20", "-O2", "-w", "-fno-exceptions", "-I", "inc", "-Wl,-z,stack-size=33554432", "main.cpp", "-o", "main.wasm"],
      { "main.cpp": msg.code, inc: { bits: { "stdc++.h": `#pragma once\n${STDCPP}\n` } } },
      { stdout: sink, stderr: sink, fetchProgress: () => {} },
    );
    const wasm = out["main.wasm"];
    self.postMessage({ type: "compiled", id: msg.id, ok: true, wasm, log, ms: performance.now() - started }, [wasm.buffer]);
  } catch (err) {
    self.postMessage({ type: "compiled", id: msg.id, ok: false, log: (log || String(err?.message ?? err)).replace(/\/tmp\/[\w.-]+/g, "main.o") });
  }
};
