"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, Info, Trophy, X, XCircle } from "lucide-react";

type Kind = "success" | "error" | "info" | "achievement";
interface ToastItem { id: number; kind: Kind; title: string; body?: string }

const Ctx = createContext<(t: Omit<ToastItem, "id">) => void>(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const tx = useT();
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-3), { ...t, id }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), t.kind === "achievement" ? 6500 : 4500);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-24 sm:right-6 sm:left-auto sm:items-end" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xl ${t.kind === "achievement" ? "animate-pop ring-2 ring-accent2/40" : "animate-fade-up"}`}>
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />}
            {t.kind === "error" && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-danger" />}
            {t.kind === "info" && <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />}
            {t.kind === "achievement" && (
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent2 text-white"><Trophy className="h-5 w-5" /></span>
            )}
            <div className="min-w-0 flex-1">
              {t.kind === "achievement" && <p className="eyebrow"><T k="Achievement unlocked" /></p>}
              <p className="text-sm font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-sm text-muted">{t.body}</p>}
            </div>
            <button onClick={() => setItems((s) => s.filter((x) => x.id !== t.id))} className="text-muted hover:text-fg" aria-label={tx("Dismiss")}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
