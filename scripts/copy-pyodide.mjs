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
