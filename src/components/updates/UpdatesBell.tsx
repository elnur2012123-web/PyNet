"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useUpdates } from "./UpdatesProvider";
import { KIND_LABEL, timeAgo } from "./format";

export function UpdatesBell() {
  const tx = useT();
  const { updates, unread, markAllRead } = useUpdates();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const unreadIds = new Set(unread.map((u) => u.id));

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="btn-ghost btn-sm relative h-9 w-9 !p-0" aria-label={unread.length ? `What's new — ${unread.length} new` : tx("What's new")} aria-expanded={open}>
        <Bell className="h-[18px] w-[18px]" />
        {unread.length > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white">{unread.length}</span>}
      </button>
      {open && (
        <div className="card absolute right-0 top-11 z-50 w-[min(92vw,360px)] animate-fade-up overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-semibold"><T k="What's new" /></p>
            {unread.length > 0 && <button onClick={markAllRead} className="text-xs text-accent hover:underline"><T k="Mark all as read" /></button>}
          </div>
          <ul className="thin-scroll max-h-[60vh] divide-y divide-border overflow-y-auto">
            {updates.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted"><T k="No updates yet." /></li>}
            {updates.slice(0, 6).map((u) => (
              <li key={u.id} className={`px-4 py-3 ${unreadIds.has(u.id) ? "bg-accent/5" : ""}`}>
                <div className="flex items-center gap-2 text-xs text-muted">
                  {unreadIds.has(u.id) && <span className="h-2 w-2 rounded-full bg-accent" aria-label={tx("New")} />}
                  <span>{KIND_LABEL[u.kind]}</span><span>·</span><time dateTime={u.date}>{timeAgo(u.date)}</time>
                </div>
                <p className="mt-1 text-sm font-medium">{u.title}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">{u.body}</p>
                {u.link && <Link href={u.link} onClick={() => setOpen(false)} className="mt-1 inline-block text-xs text-accent hover:underline"><T k="Take a look →" /></Link>}
              </li>
            ))}
          </ul>
          <Link href="/updates" onClick={() => { setOpen(false); markAllRead(); }} className="block border-t border-border px-4 py-2.5 text-center text-sm text-accent hover:bg-elevated"><T k="See all updates" /></Link>
        </div>
      )}
    </div>
  );
}
