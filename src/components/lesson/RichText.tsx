import { Fragment } from "react";

/** Renders inline **bold** and `code`. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong>
        : p.startsWith("`") && p.endsWith("`") && p.length > 1 ? <code key={i}>{p.slice(1, -1)}</code>
        : <Fragment key={i}>{p}</Fragment>,
      )}
    </>
  );
}

/** Paragraphs separated by blank lines; "- " lines become bullet lists; consecutive `code` lines become a block. */
export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="prose-lite text-[15px] text-fg/90">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}><Inline text={l.trim().slice(2)} /></li>)}</ul>;
        }
        if (lines.length > 1 && lines.every((l) => /^`.*`$/.test(l.trim()))) {
          return (
            <pre key={i} className="code-block my-3 overflow-x-auto rounded-xl border border-border p-3 font-mono text-[13px] leading-6">
              {lines.map((l) => l.trim().slice(1, -1)).join("\n")}
            </pre>
          );
        }
        // paragraph possibly followed by bullets
        const firstBullet = lines.findIndex((l) => l.trim().startsWith("- "));
        if (firstBullet > 0 && lines.slice(firstBullet).every((l) => l.trim().startsWith("- "))) {
          return (
            <div key={i}>
              <p><Inline text={lines.slice(0, firstBullet).join(" ")} /></p>
              <ul>{lines.slice(firstBullet).map((l, j) => <li key={j}><Inline text={l.trim().slice(2)} /></li>)}</ul>
            </div>
          );
        }
        return <p key={i}><Inline text={lines.join(" ")} /></p>;
      })}
    </div>
  );
}
