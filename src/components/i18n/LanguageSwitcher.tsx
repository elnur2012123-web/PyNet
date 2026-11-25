"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Languages } from "lucide-react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/i18n/locales";
import { useLocale } from "./LocaleProvider";

export function setLocale(l: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  // full reload so server-rendered pages switch language too
  window.location.reload();
}

/** Globe button with the four languages. */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", close);
    return () => { document.removeEventListener("click", close); };
  }, []);
  const cur = LOCALES.find((l) => l.id === locale) ?? LOCALES[0];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="btn-ghost btn-sm h-9 gap-1.5 px-2" aria-label="Language" aria-expanded={open}>
        <Languages className="h-[18px] w-[18px]" />{!compact && <span className="text-xs font-semibold">{cur.short}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-xl border border-border bg-surface p-1 shadow-lg">
          {LOCALES.map((l) => (
            <button key={l.id} onClick={() => setLocale(l.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-elevated">
              <span>{l.label}{l.note && <span className="ml-1 text-xs text-muted">({l.note})</span>}</span>
              {l.id === locale && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
