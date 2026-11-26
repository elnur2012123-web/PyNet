"use client";
import { useEffect, useState } from "react";
import { FilePlus2, Languages, Loader2, Pencil, X } from "lucide-react";
import { getRuntime } from "@/lib/python/runner";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { LOCALES, type Locale } from "@/i18n/locales";

interface Text { title: string; statement: string; inputSpec: string; outputSpec: string; notes: string }
const EMPTY: Text = { title: "", statement: "", inputSpec: "", outputSpec: "", notes: "" };
const splitBlocks = (t: string) => t.split(/^===\s*$/m).map((x) => x.replace(/^\n/, "")).filter((x) => x.trim()).map((x) => (x.endsWith("\n") ? x : x + "\n"));
const joinBlocks = (xs: string[]) => xs.map((x) => x.replace(/\n$/, "")).join("\n===\n");
const langName = (l: Locale) => LOCALES.find((x) => x.id === l)!.label;

async function post(body: Record<string, unknown>) {
  const r = await fetch("/api/admin/arena", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}

/** The text boxes for one language. */
function TextFields({ value, onChange, lang }: { value: Text; onChange: (t: Text) => void; lang: Locale }) {
  const tx = useT();
  const set = (k: keyof Text) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [k]: e.target.value });
  const htmlLang = LOCALES.find((l) => l.id === lang)!.htmlLang;
  return (
    <div className="space-y-2" lang={htmlLang}>
      <input className="input w-full" placeholder={tx("Title")} value={value.title} onChange={set("title")} />
      <textarea className="input min-h-24 w-full" placeholder={tx("Statement (use `backticks` for code)")} value={value.statement} onChange={set("statement")} />
      <textarea className="input min-h-14 w-full" placeholder={tx("Input format")} value={value.inputSpec} onChange={set("inputSpec")} />
      <textarea className="input min-h-14 w-full" placeholder={tx("Output format")} value={value.outputSpec} onChange={set("outputSpec")} />
      <textarea className="input min-h-12 w-full" placeholder={tx("Note (optional)")} value={value.notes} onChange={set("notes")} />
    </div>
  );
}

/**
 * Write a new problem, or edit one (editId). The author picks the language they write in and
 * can tick other languages to type the same problem in them too.
 */
export function ProblemEditor({ editId, onSaved, onClose }: { editId?: number | null; onSaved: (msg: string) => void; onClose?: () => void }) {
  const tx = useT();
  const siteLocale = useLocale();
  const editing = typeof editId === "number";
  const [meta, setMeta] = useState({ rating: 800, tags: "implementation", timeLimitMs: 2000, visibility: "hidden" });
  const [lang, setLang] = useState<Locale>(siteLocale);
  const [base, setBase] = useState<Text>(EMPTY);
  const [extra, setExtra] = useState<Partial<Record<Locale, Text>>>({});
  const [io, setIo] = useState({ examples: "", tests: "" });
  const [ref, setRef] = useState("# Reference solution (used to compute the expected outputs)\n");
  const [replaceTests, setReplaceTests] = useState(!editing);
  const [testCount, setTestCount] = useState(0);
  const [busy, setBusy] = useState<"load" | "save" | null>(editing ? "load" : null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!editing) return;
    setBusy("load"); setErr(null);
    post({ action: "get_problem", id: editId }).then((j) => {
      const p = j.problem;
      setMeta({ rating: p.rating, tags: (p.tags ?? []).join(", "), timeLimitMs: p.time_limit_ms, visibility: p.visibility });
      setLang(p.lang ?? "en");
      setBase({ title: p.title, statement: p.statement ?? "", inputSpec: p.input_spec ?? "", outputSpec: p.output_spec ?? "", notes: p.notes ?? "" });
      const ex: Partial<Record<Locale, Text>> = {};
      for (const t of j.translations as { locale: Locale; title: string; statement: string; input_spec: string; output_spec: string; notes: string }[])
        ex[t.locale] = { title: t.title, statement: t.statement, inputSpec: t.input_spec, outputSpec: t.output_spec, notes: t.notes };
      setExtra(ex);
      setIo({ examples: joinBlocks((p.examples ?? []).map((e: { input: string }) => e.input)), tests: "" });
      setTestCount(j.testCount);
      setReplaceTests(false);
    }).catch((e) => setErr((e as Error).message)).finally(() => setBusy(null));
  }, [editing, editId]);

  const others = LOCALES.map((l) => l.id).filter((l) => l !== lang);
  const toggle = (l: Locale, on: boolean) => setExtra((x) => {
    const n = { ...x };
    if (on) n[l] = n[l] ?? { ...EMPTY }; else delete n[l];
    return n;
  });
  const switchLang = (l: Locale) => {
    // The language written in can't also be an "extra" language.
    setExtra((x) => { const n = { ...x }; delete n[l]; return n; });
    setLang(l);
  };

  const save = async () => {
    setBusy("save"); setErr(null);
    try {
      const missing = (Object.entries(extra) as [Locale, Text][]).find(([, t]) => !t.title.trim() || !t.statement.trim());
      if (missing) throw new Error(tx("Fill in the title and statement in {lang}, or untick it.", { lang: langName(missing[0]) }));
      let examples: { input: string; output: string }[] | undefined, tests: { input: string; expected: string }[] = [];
      if (replaceTests) {
        const exIn = splitBlocks(io.examples), testIn = splitBlocks(io.tests);
        if (!exIn.length) throw new Error(tx("Add at least one example input (separate inputs with a line containing only ===)."));
        const rt = getRuntime();
        const outs: string[] = [];
        for (const [i, inp] of [...exIn, ...testIn].entries()) {
          const r = await rt.run(ref, { stdin: inp, timeoutMs: meta.timeLimitMs + 2000, maxOutput: 4_000_000 });
          if (r.error || r.timedOut) throw new Error(tx("Reference solution failed on {what}: {why}", { what: i < exIn.length ? tx("example {n}", { n: i + 1 }) : tx("test {n}", { n: i - exIn.length + 1 }), why: r.timedOut ? tx("time limit") : `${r.error!.type}: ${r.error!.message}` }));
          outs.push(r.stdout.replace(/\s+$/, ""));
        }
        examples = exIn.map((input, i) => ({ input, output: outs[i] }));
        tests = [...exIn, ...testIn].map((input, i) => ({ input, expected: outs[i] }));
      }
      const j = await post({
        action: editing ? "update_problem" : "create_problem", id: editId,
        title: base.title, statement: base.statement, inputSpec: base.inputSpec, outputSpec: base.outputSpec, notes: base.notes, lang,
        rating: Number(meta.rating), timeLimitMs: Number(meta.timeLimitMs), visibility: meta.visibility,
        tags: meta.tags.split(",").map((t) => t.trim()).filter(Boolean),
        examples, tests,
        translations: (Object.entries(extra) as [Locale, Text][]).map(([locale, t]) => ({ locale, ...t })),
      });
      onSaved(editing
        ? (j.tests ? tx("Problem {id} updated with {n} new tests.", { id: j.id, n: j.tests }) : tx("Problem {id} updated.", { id: j.id }))
        : tx("Problem {id} saved with {n} tests.", { id: j.id, n: j.tests }));
      if (!editing) { setBase(EMPTY); setExtra({}); setIo({ examples: "", tests: "" }); }
    } catch (e) { setErr((e as Error).message); }
    setBusy(null);
  };

  if (busy === "load") return <section className="card flex items-center gap-2 p-5 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> {tx("Loading problem {id}…", { id: editId! })}</section>;

  const unticked = others.filter((l) => !extra[l]);
  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">{editing ? <Pencil className="h-4 w-4" /> : <FilePlus2 className="h-4 w-4" />} {editing ? tx("Edit problem {id}", { id: editId! }) : tx("Write a problem")}</h3>
        {onClose && <button onClick={onClose} className="btn-ghost btn-sm" aria-label={tx("Close")}><X className="h-4 w-4" /></button>}
      </div>
      {err && <p className="text-sm text-danger">{err}</p>}

      <label className="block space-y-1 text-sm"><span className="label">{tx("I am writing this problem in")}</span>
        <select className="input w-full" value={lang} onChange={(e) => switchLang(e.target.value as Locale)}>
          {LOCALES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>
      <TextFields value={base} onChange={setBase} lang={lang} />

      <div className="rounded-xl border border-border bg-elevated/40 p-3">
        <p className="flex items-center gap-2 text-sm font-medium"><Languages className="h-4 w-4" /> {tx("Do you also want to write it in other languages?")}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {others.map((l) => (
            <label key={l} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(extra[l])} onChange={(e) => toggle(l, e.target.checked)} /> {langName(l)}
            </label>
          ))}
        </div>
        {unticked.length > 0 && (
          <p className="mt-2 text-xs text-muted">
            {lang === "en" ? tx("Languages you leave unticked get an automatic translation of your English text.")
              : lang === "uz" && unticked.includes("uz-Cyrl") ? tx("Ўзбекча is made from your Oʻzbekcha text automatically. Other unticked languages show the problem in {lang}.", { lang: langName(lang) })
              : tx("Readers of unticked languages will see the problem in {lang} only.", { lang: langName(lang) })}
          </p>
        )}
      </div>
      {(Object.keys(extra) as Locale[]).filter((l) => l !== lang).map((l) => (
        <div key={l} className="space-y-2 rounded-xl border border-border p-3">
          <p className="label">{langName(l)}</p>
          <TextFields value={extra[l]!} onChange={(t) => setExtra((x) => ({ ...x, [l]: t }))} lang={l} />
        </div>
      ))}

      <div className="grid grid-cols-3 gap-2 text-sm">
        <label className="space-y-1"><span className="label">{tx("Difficulty")}</span>
          <select className="input w-full" value={meta.rating} onChange={(e) => setMeta({ ...meta, rating: Number(e.target.value) })}>{Array.from({ length: 28 }, (_, i) => 800 + i * 100).map((r) => <option key={r}>{r}</option>)}</select></label>
        <label className="space-y-1"><span className="label">{tx("Time limit (ms)")}</span><input type="number" min={500} max={10000} step={500} className="input w-full" value={meta.timeLimitMs} onChange={(e) => setMeta({ ...meta, timeLimitMs: Number(e.target.value) })} /></label>
        <label className="space-y-1"><span className="label">{tx("Where")}</span>
          <select className="input w-full" value={meta.visibility} onChange={(e) => setMeta({ ...meta, visibility: e.target.value })}><option value="hidden">{tx("Hidden (for a round)")}</option><option value="public">{tx("Problemset now")}</option></select></label>
      </div>
      <input className="input w-full" placeholder={tx("Tags, comma separated (math, strings, dp …)")} value={meta.tags} onChange={(e) => setMeta({ ...meta, tags: e.target.value })} />

      {editing && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={replaceTests} onChange={(e) => setReplaceTests(e.target.checked)} />
          {tx("Replace the examples and tests (now {n} tests)", { n: testCount })}
        </label>
      )}
      {replaceTests && (
        <>
          <textarea className="input min-h-20 w-full font-mono text-xs" placeholder={tx("Example inputs (shown to everyone)\nSeparate inputs with a line: ===")} value={io.examples} onChange={(e) => setIo({ ...io, examples: e.target.value })} />
          <textarea className="input min-h-24 w-full font-mono text-xs" placeholder={tx("Hidden test inputs, separated by ===\nInclude edge cases and big inputs.")} value={io.tests} onChange={(e) => setIo({ ...io, tests: e.target.value })} />
          <div className="overflow-hidden rounded-xl border border-border"><CodeEditor value={ref} onChange={setRef} minHeight="160px" ariaLabel={tx("Reference solution")} /></div>
          <p className="text-xs text-muted">{tx("Expected outputs are computed by running your reference solution here in the browser. Examples become tests 1, 2, ….")}</p>
        </>
      )}
      <button className="btn-primary btn-sm" disabled={busy === "save" || !base.title || !base.statement} onClick={save}>
        {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} {replaceTests ? tx("Run reference & save") : tx("Save changes")}
      </button>
    </section>
  );
}
