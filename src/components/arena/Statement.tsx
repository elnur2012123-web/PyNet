import { CopyButton } from "./CopyButton";

/**
 * Simple math: a_i → a with subscript i, a_{i+1}, 10^9 → 10 with superscript 9, 2^{n-1}.
 * Only a single-letter base gets a subscript, so words like snake_case stay as they are.
 */
const MATH = /\b([A-Za-z])_(\{[^}]{1,20}\}|[A-Za-z0-9]{1,3}\b)|([A-Za-z0-9)])\^(\{[^}]{1,20}\}|-?[A-Za-z0-9]{1,4})/g;
function Math({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(MATH)) {
    out.push(text.slice(last, m.index));
    const strip = (x: string) => x.replace(/^\{|\}$/g, "");
    if (m[1]) out.push(<span key={m.index}><i>{m[1]}</i><sub>{strip(m[2])}</sub></span>);
    else out.push(<span key={m.index}>{m[3]}<sup>{strip(m[4])}</sup></span>);
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

/** Renders `code` spans, simple math and paragraphs from plain statement text. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n{2,}/).map((para, i) => (
        <p key={i} className="leading-relaxed">
          {para.split(/(`[^`]+`)/g).map((part, j) =>
            part.startsWith("`") && part.endsWith("`") && part.length > 2
              ? <code key={j} className="rounded bg-elevated px-1 py-0.5 font-mono text-[0.9em]">{part.slice(1, -1)}</code>
              : <Math key={j} text={part} />,
          )}
        </p>
      ))}
    </>
  );
}

export interface ProblemView {
  id: number;
  title: string;
  statement: string;
  input_spec: string;
  output_spec: string;
  notes: string;
  examples: { input: string; output: string }[];
  tags: string[];
  rating: number;
  time_limit_ms: number;
}

export function ProblemStatement({ problem, letter, showTags = true }: { problem: ProblemView; letter?: string; showTags?: boolean }) {
  return (
    <article className="card space-y-5 p-5 sm:p-7">
      <header className="text-center">
        <h1 className="text-2xl font-semibold">{letter ? `${letter}. ` : ""}{problem.title}</h1>
        <p className="mt-1 text-sm text-muted">time limit per test: {problem.time_limit_ms / 1000} second{problem.time_limit_ms === 1000 ? "" : "s"} · input: standard input · output: standard output</p>
      </header>
      <section className="space-y-3"><RichText text={problem.statement} /></section>
      {problem.input_spec && <section className="space-y-2"><h2 className="font-semibold">Input</h2><RichText text={problem.input_spec} /></section>}
      {problem.output_spec && <section className="space-y-2"><h2 className="font-semibold">Output</h2><RichText text={problem.output_spec} /></section>}
      <section className="space-y-3">
        <h2 className="font-semibold">Example{problem.examples.length > 1 ? "s" : ""}</h2>
        {problem.examples.map((ex, i) => (
          <div key={i} className="grid overflow-hidden rounded-xl border border-border sm:grid-cols-2">
            <div className="border-b border-border sm:border-b-0 sm:border-r">
              <div className="flex items-center justify-between bg-elevated px-3 py-1.5 text-xs font-medium">input <CopyButton text={ex.input} /></div>
              <pre className="thin-scroll max-h-64 overflow-auto px-3 py-2 font-mono text-sm">{ex.input}</pre>
            </div>
            <div>
              <div className="flex items-center justify-between bg-elevated px-3 py-1.5 text-xs font-medium">output <CopyButton text={ex.output} /></div>
              <pre className="thin-scroll max-h-64 overflow-auto px-3 py-2 font-mono text-sm">{ex.output}</pre>
            </div>
          </div>
        ))}
      </section>
      {problem.notes && <section className="space-y-2"><h2 className="font-semibold">Note</h2><RichText text={problem.notes} /></section>}
      {showTags && problem.tags.length > 0 && (
        <footer className="flex flex-wrap gap-1.5 border-t border-border pt-4">
          {problem.tags.map((t) => <span key={t} className="chip">{t}</span>)}
          <span className="chip font-semibold">*{problem.rating}</span>
        </footer>
      )}
    </article>
  );
}
