"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { Megaphone, X } from "lucide-react";
import { useUpdates } from "./UpdatesProvider";

/** Shown once per new update, bottom-left, so it doesn't cover PyBuddy. */
export function UpdatePopup() {
  const tx = useT();
  const { popup, dismissPopup, markAllRead } = useUpdates();
  if (!popup) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 z-[70] sm:bottom-6 sm:left-6 sm:right-auto sm:w-[360px] lg:left-[17.5rem]" role="status">
      <div className="card animate-fade-up p-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><Megaphone className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted"><T k="New on PyNest" /></p>
            <p className="font-semibold">{popup.title}</p>
            <p className="mt-1 line-clamp-3 text-sm text-muted">{popup.body}</p>
            <div className="mt-3 flex gap-2">
              <Link href={popup.link ?? "/updates"} onClick={markAllRead} className="btn-primary btn-sm">{popup.link ? tx("Take a look") : tx("See what's new")}</Link>
              <button onClick={dismissPopup} className="btn-ghost btn-sm"><T k="Later" /></button>
            </div>
          </div>
          <button onClick={dismissPopup} className="text-muted hover:text-fg" aria-label={tx("Dismiss")}><X className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
