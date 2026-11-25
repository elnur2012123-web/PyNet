"use client";
import { T } from "@/components/i18n/T";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { Inline } from "@/components/lesson/RichText";

/** Minimal, safe markdown renderer for tutor replies (no raw HTML). */
export function Markdown({ text }: { text: string }) {
  text = text.replace(/\s*_\(quiz [^)]*\)_/g, ""); // hidden quiz-state marker
  const parts = text.split(/```(\w*)\n?([\s\S]*?)(?:```|$)/g);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    const prose = parts[i];
    if (prose) nodes.push(<Prose key={`p${i}`} text={prose} />);
    if (i + 2 < parts.length) {
      const code = parts[i + 2].replace(/\n$/, "");
      const lang = parts[i + 1];
      if (code && lang === "text") nodes.push(<pre key={`c${i}`} className="code-block my-2 overflow-x-auto rounded-xl border border-border p-3 font-mono text-[13px] leading-6">{code}</pre>);
      else if (code) nodes.push(
        <div key={`c${i}`} className="my-3">
          <CodeBlock code={code} />
          <button
            onClick={() => { try { localStorage.setItem("pn-playground", code); } catch {} window.location.href = "/playground"; }}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            <T k="▶ Open in Playground" /></button>
        </div>,
      );
    }
  }
  return <div className="prose-lite text-[14.5px]">{nodes}</div>;
}

function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  const out: React.ReactNode[] = [];
  blocks.forEach((b, i) => {
    const lines = b.split("\n").filter((l) => l.trim());
    // group consecutive lines into paragraph / bullet / numbered runs
    let run: { kind: "p" | "ul" | "ol"; lines: string[] } | null = null;
    const runs: { kind: "p" | "ul" | "ol"; lines: string[] }[] = [];
    for (const l of lines) {
      const kind = /^\s*[-*•]\s/.test(l) ? "ul" : /^\s*\d+[.)]\s/.test(l) ? "ol" : "p";
      if (!run || run.kind !== kind) { run = { kind, lines: [] }; runs.push(run); }
      run.lines.push(l);
    }
    runs.forEach((r, j) => {
      const key = `${i}-${j}`;
      if (r.kind === "ul") out.push(<ul key={key}>{r.lines.map((l, k) => <li key={k}><Inline text={l.replace(/^\s*[-*•]\s/, "")} /></li>)}</ul>);
      else if (r.kind === "ol") out.push(<ol key={key}>{r.lines.map((l, k) => <li key={k}><Inline text={l.replace(/^\s*\d+[.)]\s/, "")} /></li>)}</ol>);
      else {
        const h = /^(#{1,4})\s+(.*)$/.exec(r.lines[0]);
        if (h && r.lines.length === 1) out.push(h[1].length <= 3 ? <h3 key={key}>{h[2]}</h3> : <h4 key={key}>{h[2]}</h4>);
        else if (r.lines.length === 1 && /^-{3,}$/.test(r.lines[0].trim())) out.push(<hr key={key} className="my-4 border-border" />);
        else out.push(<p key={key}>{r.lines.map((l, k) => <span key={k}>{k > 0 && <br />}<Inline text={l.replace(/^#{1,4}\s+/, "")} /></span>)}</p>);
      }
    });
  });
  return <>{out}</>;
}
