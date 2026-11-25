"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";

interface S { id: number; username: string; category: string; message: string; page: string | null; language: string | null; status: string; staff_reply: string | null; created_at: string }
const CAT: Record<string, string> = { idea: "💡 Idea", bug: "🐞 Bug", lesson: "📘 Lesson", translation: "🌐 Translation", other: "💬 Other" };
const LANG: Record<string, string> = { en: "EN", uz: "UZ", "uz-Cyrl": "ЎЗ", ru: "RU" };

/** Admin inbox for the suggestion bot. */
export function SuggestionsInbox() {
  const [status, setStatus] = useState("new");
  const [data, setData] = useState<{ newCount: number; suggestions: S[] } | null>(null);
  const [reply, setReply] = useState<Record<number, string>>({});
  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/suggestions?status=${status}`, { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (j?.suggestions) setData(j);
  }, [status]);
  useEffect(() => { load(); }, [load]);
  const set = async (id: number, st: string) => {
    await fetch("/api/admin/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: st, reply: reply[id] ?? "" }) });
    load();
  };
  return (
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold"><Inbox className="h-4 w-4" /> Suggestions {data && data.newCount > 0 && <span className="rounded-full bg-danger px-2 py-0.5 text-xs text-white">{data.newCount} new</span>}</h2>
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
          <option value="new">New</option><option value="planned">Planned</option><option value="done">Done</option><option value="declined">Not planned</option><option value="all">All</option>
        </select>
      </div>
      {!data ? <p className="text-sm text-muted">Loading…</p> : data.suggestions.length === 0 ? <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Nothing here.</p> : (
        <ul className="space-y-3">
          {data.suggestions.map((s) => (
            <li key={s.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="font-semibold text-fg">{CAT[s.category] ?? s.category}</span>
                <span>#{s.id}</span>
                <Link href={`/profile/${s.username}`} className="link">@{s.username}</Link>
                {s.language && <span className="chip">{LANG[s.language] ?? s.language}</span>}
                {s.page && <span>from {s.page}</span>}
                <span className="ml-auto">{new Date(s.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{s.message}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input className="input min-w-0 flex-1 py-1 text-xs" placeholder="Reply the user will see (optional)" defaultValue={s.staff_reply ?? ""} maxLength={1000}
                  onChange={(e) => setReply({ ...reply, [s.id]: e.target.value })} aria-label="Reply" />
                <button className="btn-secondary btn-sm" onClick={() => set(s.id, "planned")}>Planned</button>
                <button className="btn-secondary btn-sm" onClick={() => set(s.id, "done")}>Done</button>
                <button className="btn-ghost btn-sm text-danger" onClick={() => set(s.id, "declined")}>Not planned</button>
              </div>
              {s.status !== "new" && <p className="mt-1 text-xs text-muted">Status: {s.status}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
