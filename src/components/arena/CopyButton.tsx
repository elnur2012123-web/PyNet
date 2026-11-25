"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const tx = useT();
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="inline-flex items-center gap-1 text-muted hover:text-fg" aria-label={tx("Copy")}
      onClick={() => { navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1200); }, () => null); }}>
      {done ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />} {done ? tx("Copied") : tx("Copy")}
    </button>
  );
}
