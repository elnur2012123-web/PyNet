// Runs one compiled C++ program (WASI) with the given stdin and returns stdout.
// The main thread terminates this worker to stop infinite loops.

class ProcExit { constructor(code) { this.code = code; } }

function run(wasm, stdinText, maxOutput) {
  const module = new WebAssembly.Module(wasm);
  const stdin = new TextEncoder().encode(stdinText);
  let pos = 0;
  const out = [];
  let outLen = 0, truncated = false, errText = "";
  let memory;
  const dv = () => new DataView(memory.buffer);
  const u8 = () => new Uint8Array(memory.buffer);
  const dec = new TextDecoder();
  const wasi = {
    args_sizes_get(argc, size) { dv().setUint32(argc, 1, true); dv().setUint32(size, 5, true); return 0; },
    args_get(argv, buf) { dv().setUint32(argv, buf, true); u8().set([109, 97, 105, 110, 0], buf); return 0; },
    environ_sizes_get(c, s) { dv().setUint32(c, 0, true); dv().setUint32(s, 0, true); return 0; },
    environ_get() { return 0; },
    clock_res_get(_id, ptr) { dv().setBigUint64(ptr, 1000n, true); return 0; },
    clock_time_get(id, _prec, ptr) {
      const ns = id === 0 ? BigInt(Date.now()) * 1000000n : BigInt(Math.round(performance.now() * 1e6));
      dv().setBigUint64(ptr, ns, true); return 0;
    },
    fd_write(fd, iovs, n, written) {
      let total = 0;
      for (let i = 0; i < n; i++) {
        const p = dv().getUint32(iovs + i * 8, true), len = dv().getUint32(iovs + i * 8 + 4, true);
        const bytes = u8().slice(p, p + len);
        if (fd === 1) {
          if (outLen + len <= maxOutput) { out.push(bytes); outLen += len; } else truncated = true;
        } else if (fd === 2) { if (errText.length < 10000) errText += dec.decode(bytes); }
        else return 8;
        total += len;
      }
      dv().setUint32(written, total, true); return 0;
    },
    fd_read(fd, iovs, n, read) {
      if (fd !== 0) return 8;
      let total = 0;
      for (let i = 0; i < n; i++) {
        const p = dv().getUint32(iovs + i * 8, true), len = dv().getUint32(iovs + i * 8 + 4, true);
        const take = Math.min(len, stdin.length - pos);
        u8().set(stdin.subarray(pos, pos + take), p);
        pos += take; total += take;
        if (take < len) break;
      }
      dv().setUint32(read, total, true); return 0;
    },
    fd_fdstat_get(fd, ptr) {
      if (fd > 2) return 8;
      // character device with seek/tell rights => not a TTY => fully buffered (fast) stdio
      dv().setUint8(ptr, 2); dv().setUint16(ptr + 2, 0, true);
      dv().setBigUint64(ptr + 8, 0xffffffffffffffffn, true); dv().setBigUint64(ptr + 16, 0xffffffffffffffffn, true);
      return 0;
    },
    fd_close() { return 0; },
    fd_seek() { return 70; },
    fd_prestat_get() { return 8; },
    fd_prestat_dir_name() { return 8; },
    random_get(buf, len) { for (let o = 0; o < len; o += 65536) crypto.getRandomValues(new Uint8Array(memory.buffer, buf + o, Math.min(65536, len - o))); return 0; },
    sched_yield() { return 0; },
    proc_exit(code) { throw new ProcExit(code); },
  };
  const imports = {};
  for (const imp of WebAssembly.Module.imports(module)) {
    if (imp.module !== "wasi_snapshot_preview1") continue;
    imports[imp.name] = wasi[imp.name] ?? (() => 52); // ENOSYS for anything a contest program shouldn't need
  }
  const instance = new WebAssembly.Instance(module, { wasi_snapshot_preview1: imports });
  memory = instance.exports.memory;
  const started = performance.now();
  let exitCode = 0, error = null;
  try { instance.exports._start(); }
  catch (e) {
    if (e instanceof ProcExit) exitCode = e.code;
    else {
      const m = String(e?.message ?? e);
      error = { type: /stack/i.test(m) ? "StackOverflow" : "RuntimeError", message: /unreachable/.test(m) ? "the program crashed (abort, assert or out-of-range access)" : m };
    }
  }
  const ms = performance.now() - started;
  if (!error && exitCode !== 0) error = { type: "RuntimeError", message: `the program exited with code ${exitCode}` };
  const all = new Uint8Array(outLen);
  let o = 0; for (const b of out) { all.set(b, o); o += b.length; }
  return { stdout: dec.decode(all) + (truncated ? "\n[output truncated]\n" : ""), stderr: errText, error, ms };
}

self.onmessage = (e) => {
  const { id, wasm, stdin, maxOutput } = e.data;
  try { self.postMessage({ id, ...run(wasm, stdin, maxOutput || 4_000_000) }); }
  catch (err) { self.postMessage({ id, stdout: "", stderr: "", error: { type: "RuntimeError", message: String(err?.message ?? err) }, ms: 0 }); }
};
