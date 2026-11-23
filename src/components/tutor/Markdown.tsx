"use client";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { Inline } from "@/components/lesson/RichText";

/** Minimal, safe markdown renderer for tutor replies (no raw HTML). */
export function Markdown({ text }: { text: string }) {
  const parts = text.split(/```(\w*)\n?([\s\S]*?)(?:```|$)/g);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    const prose = parts[i];
    if (prose) nodes.push(<Prose key={`p${i}`} text={prose} />);
    if (i + 2 < parts.length) {
      const code = parts[i + 2].replace(/\n$/, "");
      if (code) nodes.push(<CodeBlock key={`c${i}`} code={code} className="my-3" />);
    }
  }
  return <div className="prose-lite text-[14.5px]">{nodes}</div>;
}

function Prose({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter((l) => l.trim());
        if (lines.every((l) => /^\s*[-*•]\s/.test(l))) return <ul key={i}>{lines.map((l, j) => <li key={j}><Inline text={l.replace(/^\s*[-*•]\s/, "")} /></li>)}</ul>;
        if (lines.every((l) => /^\s*\d+[.)]\s/.test(l))) return <ol key={i}>{lines.map((l, j) => <li key={j}><Inline text={l.replace(/^\s*\d+[.)]\s/, "")} /></li>)}</ol>;
        const h = /^(#{1,4})\s+(.*)$/.exec(lines[0] ?? "");
        if (h && lines.length === 1) return h[1].length <= 2 ? <h3 key={i}>{h[2]}</h3> : <h4 key={i}>{h[2]}</h4>;
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>{j > 0 && <br />}<Inline text={l.replace(/^#{1,4}\s+/, "")} /></span>
            ))}
          </p>
        );
      })}
    </>
  );
}
