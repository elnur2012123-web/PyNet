"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bug, BookOpen, Languages, Lightbulb, MessageSquare, Send, Sparkles } from "lucide-react";
import { useT } from "@/components/i18n/LocaleProvider";

type Cat = "idea" | "bug" | "lesson" | "translation" | "other";
const CATS: { id: Cat; label: string; icon: typeof Bug }[] = [
  { id: "idea", label: "A new idea or feature", icon: Lightbulb },
  { id: "bug", label: "Something is broken", icon: Bug },
  { id: "lesson", label: "About a lesson or problem", icon: BookOpen },
  { id: "translation", label: "Translation / language", icon: Languages },
  { id: "other", label: "Something else", icon: MessageSquare },
];
const ASK: Record<Cat, string> = {
  idea: "Great! What should we add or change? Tell us what you'd like and why it would help.",
  bug: "Sorry about that! What happened? Tell us which page, what you clicked and what you expected.",
  lesson: "Which lesson or problem is it, and what should we improve?",
  translation: "Thank you! Which text is wrong or missing, and how should it read?",
  other: "Sure — what would you like to tell the PyNest team?",
};
const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Sent", cls: "bg-elevated text-muted" },
  planned: { label: "Planned", cls: "bg-accent/15 text-accent" },
  done: { label: "Done", cls: "bg-success/15 text-success" },
  declined: { label: "Not planned", cls: "bg-danger/10 text-danger" },
};
interface Msg { from: "bot" | "me"; text: string }
interface Mine { id: number; category: Cat; message: string; status: string; staff_reply: string | null; created_at: string }

/** A small chat bot that collects suggestions for the PyNest team. */
export function SuggestBot() {
  const tx = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [cat, setCat] = useState<Cat | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [mine, setMine] = useState<Mine[] | null>(null);
  const end = useRef<HTMLDivElement>(null);

  const start = useCallback(() => {
    setMsgs([
      { from: "bot", text: tx("Hi! I'm the PyNest suggestion bot 💡 Everything you send goes straight to the PyNest team.") },
      { from: "bot", text: tx("What would you like to tell us?") },
    ]);
    setCat(null); setText(""); setDone(false);
  }, [tx]);
  const loadMine = useCallback(async () => {
    const r = await fetch("/api/suggestions", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    setMine(j.suggestions ?? []);
  }, []);
  useEffect(() => { start(); loadMine(); }, [start, loadMine]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [msgs]);

  const pick = (c: Cat) => {
    setCat(c);
    setMsgs((m) => [...m, { from: "me", text: tx(CATS.find((x) => x.id === c)!.label) }, { from: "bot", text: tx(ASK[c]) }]);
  };
  const send = async () => {
    if (!cat || text.trim().length < 5 || busy) return;
    setBusy(true);
    const message = text.trim();
    setMsgs((m) => [...m, { from: "me", text: message }]);
    let page: string | null = null;
    try { page = document.referrer ? new URL(document.referrer).pathname : null; } catch {}
    const r = await fetch("/api/suggestions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: cat, message, page }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsgs((m) => [...m, { from: "bot", text: `⚠️ ${tx(j.error || "Could not send. Please try again.")}` }]); return; }
    setText(""); setDone(true);
    setMsgs((m) => [...m, { from: "bot", text: tx("Thank you! Suggestion #{id} was sent to the team. You'll see its status and our reply here.", { id: j.id }) }]);
    loadMine();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="card flex min-h-[460px] flex-col overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-warn/15 text-warn"><Sparkles className="h-5 w-5" /></span>
          <div><p className="font-semibold">{tx("Suggestion bot")}</p><p className="text-xs text-muted">{tx("Ideas, bugs, lessons, translations — we read everything.")}</p></div>
        </div>
        <div className="thin-scroll flex-1 space-y-3 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
              <p className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${m.from === "me" ? "rounded-br-md bg-accent text-white" : "rounded-bl-md bg-elevated"}`}>{m.text}</p>
            </div>
          ))}
          {!cat && (
            <div className="flex flex-wrap gap-2 pt-1">
              {CATS.map((c) => <button key={c.id} onClick={() => pick(c.id)} className="btn-secondary btn-sm"><c.icon className="h-4 w-4" /> {tx(c.label)}</button>)}
            </div>
          )}
          {done && <button onClick={start} className="btn-ghost btn-sm">{tx("Send another suggestion")}</button>}
          <div ref={end} />
        </div>
        {cat && !done && (
          <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <textarea className="input min-h-[44px] flex-1 resize-y" rows={2} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)}
              placeholder={tx("Write your suggestion…")} aria-label={tx("Your suggestion")}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="btn-primary" disabled={busy || text.trim().length < 5} aria-label={tx("Send")}><Send className="h-4 w-4" /></button>
          </form>
        )}
      </section>
      <aside className="card p-4">
        <h2 className="font-semibold">{tx("My suggestions")}</h2>
        {mine === null ? <p className="mt-3 text-sm text-muted">{tx("Loading…")}</p> : mine.length === 0 ? <p className="mt-3 text-sm text-muted">{tx("Nothing sent yet.")}</p> : (
          <ul className="mt-3 space-y-3">
            {mine.map((s) => (
              <li key={s.id} className="rounded-xl border border-border p-3 text-sm">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted">#{s.id} · {new Date(s.created_at).toLocaleDateString()}</span>
                  <span className={`rounded-md px-1.5 py-0.5 font-semibold ${STATUS[s.status]?.cls ?? ""}`}>{tx(STATUS[s.status]?.label ?? s.status)}</span>
                </div>
                <p className="mt-1 line-clamp-4 whitespace-pre-wrap">{s.message}</p>
                {s.staff_reply && <p className="mt-2 rounded-lg bg-accent/10 px-2.5 py-1.5 text-xs"><b>{tx("PyNest team:")}</b> {s.staff_reply}</p>}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
