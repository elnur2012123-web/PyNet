"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useUpdates } from "@/components/updates/UpdatesProvider";
import { KIND_LABEL } from "@/components/updates/format";
import { EmptyState } from "@/components/ui/States";

export default function UpdatesPage() {
  const { updates, markAllRead } = useUpdates();
  useEffect(() => { if (updates.length) markAllRead(); }, [updates.length, markAllRead]);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="h1">What&apos;s new</h1>
      <p className="mt-1 text-muted">Everything we&apos;ve added or improved on PyNest, newest first.</p>
      {updates.length === 0 ? <div className="mt-8"><EmptyState title="No updates yet" /></div> : (
        <ol className="mt-8 border-l border-border">
          {updates.map((u) => (
            <li key={u.id} className="relative mb-8 pl-6">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" />
              <p className="text-xs text-muted">{new Date(u.date).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} · {KIND_LABEL[u.kind]}</p>
              <h2 className="mt-1 text-lg font-semibold">{u.title}</h2>
              <p className="mt-1 whitespace-pre-line leading-7 text-fg/90">{u.body}</p>
              {u.link && <Link href={u.link} className="mt-2 inline-block text-sm text-accent hover:underline">Take a look →</Link>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
