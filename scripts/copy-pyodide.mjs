// Copies the Pyodide runtime into /public so Python runs fully in the browser
// without depending on a third-party CDN.
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const src = join(process.cwd(), "node_modules", "pyodide");
const dest = join(process.cwd(), "public", "pyodide");
if (!existsSync(src)) {
  console.warn("[pynest] pyodide package not found, skipping copy");
  process.exit(0);
}
mkdirSync(dest, { recursive: true });
const files = [
  "pyodide.js",
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];
for (const f of files) {
  if (existsSync(join(src, f))) cpSync(join(src, f), join(dest, f));
  else console.warn(`[pynest] missing ${f} in pyodide package`);
}
console.log("[pynest] Pyodide runtime copied to public/pyodide");

// ---------------------------------------------------------------------------
// C++: the Clang/LLD toolchain compiled to WebAssembly (@yowasp/clang).
// The big files are stored gzipped (~27 MB instead of ~104 MB) and unpacked in
// the browser by public/cpp-worker.mjs.
import { createGzip } from "node:zlib";
import { createReadStream, createWriteStream, readdirSync, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";

const clangSrc = join(process.cwd(), "node_modules", "@yowasp", "clang", "gen");
const clangDest = join(process.cwd(), "public", "cpp");
if (!existsSync(clangSrc)) {
  console.warn("[pynest] @yowasp/clang not found, C++ will be unavailable");
} else {
  mkdirSync(clangDest, { recursive: true });
  cpSync(join(clangSrc, "bundle.js"), join(clangDest, "bundle.js"));
  for (const f of readdirSync(clangSrc)) {
    if (!/\.(wasm|tar)$/.test(f)) continue;
    const out = join(clangDest, `${f}.gz.bin`);
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(join(clangSrc, f)).mtimeMs) continue;
    await pipeline(createReadStream(join(clangSrc, f)), createGzip({ level: 9 }), createWriteStream(out));
  }
  console.log("[pynest] C++ toolchain copied to public/cpp");
}
