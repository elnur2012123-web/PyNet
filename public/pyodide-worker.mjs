// PyNest Python runtime worker. Runs real CPython (Pyodide/WebAssembly)
// off the main thread so long-running code never freezes the page.
// The main thread terminates this worker to stop infinite loops.

let pyodide = null;
let currentId = null;
let outLen = 0;
const OUTPUT_LIMIT = 100_000;
const decoder = new TextDecoder();

const PRELUDE = `
import builtins, sys, os
_pn_inputs = []
_pn_echo = False
def _pn_input(prompt=""):
    if _pn_echo:
        sys.stdout.write(str(prompt))
    if not _pn_inputs:
        raise EOFError("input() was called but there is no input left. Add a line to the Input box (one line per input() call).")
    value = _pn_inputs.pop(0)
    if _pn_echo:
        sys.stdout.write(value + "\\n")
    return value
builtins.input = _pn_input
def _pn_setup(inputs, echo):
    global _pn_echo
    _pn_inputs.clear()
    _pn_inputs.extend(inputs)
    _pn_echo = echo
    if os.getcwd() not in sys.path:
        sys.path.insert(0, os.getcwd())
    import importlib
    importlib.invalidate_caches()
`;

function post(msg) {
  self.postMessage(msg);
}

function makeWriter(stream) {
  return {
    write(buf) {
      const text = decoder.decode(buf);
      if (outLen < OUTPUT_LIMIT) {
        const room = OUTPUT_LIMIT - outLen;
        const chunk = text.length > room ? text.slice(0, room) + "\n[output truncated]\n" : text;
        outLen += text.length;
        post({ type: stream, id: currentId, text: chunk });
      }
      return buf.length;
    },
  };
}

async function init(indexURL) {
  const { loadPyodide } = await import(indexURL + "pyodide.mjs");
  pyodide = await loadPyodide({ indexURL });
  pyodide.setStdout(makeWriter("stdout"));
  pyodide.setStderr(makeWriter("stderr"));
  pyodide.runPython(PRELUDE);
  const version = pyodide.runPython("import sys; sys.version.split()[0]");
  post({ type: "ready", version });
}

function parseError(err, userLines) {
  const raw = String(err && err.message ? err.message : err);
  const lines = raw.split("\n");
  // Drop frames that belong to Pyodide internals rather than the learner's code.
  const kept = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s+File "\/lib\/python|^\s+File "\/(?:home\/pyodide\/)?.*_pyodide|^\s+File "<frozen/.test(l)) {
      if (lines[i + 1] && /^\s{4,}/.test(lines[i + 1]) && !/^\s+File /.test(lines[i + 1])) i++;
      while (lines[i + 1] && /^\s+\^+\s*$/.test(lines[i + 1])) i++;
      continue;
    }
    kept.push(l);
  }
  const traceback = kept.join("\n").trim();
  const last = kept.filter((l) => l.trim()).pop() || raw;
  const m = /^(\w+(?:Error|Exception|Interrupt|Exit|Warning)?):?\s?(.*)$/.exec(last.trim());
  const type = (err && err.type) || (m ? m[1] : "Error");
  const message = m ? m[2] : last;
  let line = null;
  const re = /File "(?:main\.py|<exec>)", line (\d+)/g;
  let mm;
  while ((mm = re.exec(raw))) line = Number(mm[1]);
  if (line !== null && userLines && line > userLines) line = null; // inside test code
  return { type, message, line, traceback };
}

async function run({ id, code, inputs, echo, append }) {
  currentId = id;
  outLen = 0;
  const started = performance.now();
  let ns;
  try {
    pyodide.globals.get("_pn_setup")(pyodide.toPy(inputs || []), Boolean(echo));
    ns = pyodide.globals.get("dict")();
    ns.set("__name__", "__main__");
    const userLines = code.split("\n").length;
    const full = append ? code + "\n" + append : code;
    try {
      pyodide.runPython(full, { globals: ns, filename: "main.py" });
      post({ type: "done", id, ok: true, ms: performance.now() - started });
    } catch (err) {
      post({ type: "done", id, ok: false, error: parseError(err, userLines), ms: performance.now() - started });
    }
  } catch (err) {
    post({ type: "done", id, ok: false, error: { type: "InternalError", message: String(err), line: null, traceback: String(err) }, ms: 0 });
  } finally {
    if (ns) ns.destroy();
    try {
      pyodide.runPython("import sys; sys.stdout.flush(); sys.stderr.flush()");
    } catch {}
  }
}

self.onmessage = async (e) => {
  const msg = e.data;
  try {
    if (msg.type === "init") await init(msg.indexURL);
    else if (msg.type === "run") await run(msg);
  } catch (err) {
    post({ type: "fatal", message: String(err && err.message ? err.message : err) });
  }
};
