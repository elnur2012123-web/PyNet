"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, X } from "lucide-react";
import { TutorChat } from "./TutorChat";
import { TUTOR_EVENT } from "./bus";

/** Floating PyBuddy button available on every app page. */
export function FloatingTutor() {
  const tx = useT();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  useEffect(() => {
    const onAsk = () => { setMounted(true); setOpen(true); };
    window.addEventListener(TUTOR_EVENT, onAsk);
    return () => window.removeEventListener(TUTOR_EVENT, onAsk);
  }, []);
  if (path === "/tutor") return null;
  return (
    <>
      {(open || mounted) && (
        <div className={`fixed inset-x-2 bottom-20 top-20 z-[60] flex flex-col overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl sm:inset-x-auto sm:right-6 sm:top-auto sm:h-[640px] sm:max-h-[calc(100vh-7rem)] sm:w-[420px] ${open ? "animate-fade-up" : "hidden"}`}
          role="dialog" aria-label={tx("PyBuddy tutor")}>
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-accent" /> <T k="PyBuddy — your Python tutor" /></p>
            <button onClick={() => setOpen(false)} className="btn-ghost btn-sm" aria-label={tx("Close PyBuddy")}><X className="h-4 w-4" /></button>
          </div>
          <div className="min-h-0 flex-1"><TutorChat compact listen context={path} /></div>
        </div>
      )}
      <button onClick={() => { setMounted(true); setOpen((o) => !o); }}
        className="fixed bottom-5 right-5 z-[61] flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent2 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.03] sm:right-6"
        aria-label={open ? tx("Close PyBuddy") : tx("Open PyBuddy tutor")} aria-expanded={open}>
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? tx("Close") : tx("Ask PyBuddy")}</span>
      </button>
    </>
  );
}
