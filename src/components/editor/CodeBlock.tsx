"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { tokenize } from "@/lib/highlight";

export function HighlightedCode({ code }: { code: string }) {
  return (
    <>
      {tokenize(code).map((tk, i) => (tk.t === "txt" ? <span key={i}>{tk.v}</span> : <span key={i} className={`tok-${tk.t}`}>{tk.v}</span>))}
    </>
  );
}

export function CodeBlock({ code, title, className = "", lineNumbers = false, copy = true }: { code: string; title?: string; className?: string; lineNumbers?: boolean; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");
  return (
    <div className={`code-block group relative overflow-hidden rounded-xl border border-border ${className}`}>
      {title && <div className="border-b border-border px-4 py-2 text-xs font-medium text-muted">{title}</div>}
      {copy && (
        <button
          onClick={() => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="absolute right-2 top-2 rounded-lg border border-border bg-surface/80 p-1.5 text-muted opacity-0 transition hover:text-fg focus:opacity-100 group-hover:opacity-100"
          aria-label="Copy code" style={title ? { top: 40 } : undefined}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      )}
      <pre className="thin-scroll overflow-x-auto p-4 font-mono text-[13px] leading-6">
        {lineNumbers ? (
          <code className="grid" style={{ gridTemplateColumns: "auto 1fr" }}>
            {lines.map((l, i) => (
              <span key={i} className="contents">
                <span className="select-none pr-4 text-right text-muted/60">{i + 1}</span>
                <span><HighlightedCode code={l || " "} /></span>
              </span>
            ))}
          </code>
        ) : (
          <code><HighlightedCode code={code} /></code>
        )}
      </pre>
    </div>
  );
}
