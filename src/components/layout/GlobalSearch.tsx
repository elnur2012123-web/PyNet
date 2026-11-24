"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, Code2, FileQuestion, Search, Compass } from "lucide-react";
import { useCatalog } from "@/components/providers/ProgressProvider";

interface Item { type: "Lesson" | "Exercise" | "Error" | "Quiz" | "Page"; title: string; sub: string; href: string; keywords: string }

const PAGES: Item[] = [
  ["Dashboard", "/dashboard"], ["Course curriculum", "/learn"], ["Python playground", "/playground"], ["PyBuddy AI tutor", "/tutor"],
  ["Practice exercises", "/practice"], ["Quizzes", "/quizzes"], ["Error encyclopedia", "/errors"], ["Leaderboard", "/leaderboard"],
  ["Progress & achievements", "/achievements"], ["Friends", "/friends"], ["What's new", "/updates"], ["Pricing", "/pricing"], ["Billing", "/billing"], ["Settings", "/settings"],
].map(([title, href]) => ({ type: "Page" as const, title, sub: "Page", href, keywords: title.toLowerCase() }));

export function GlobalSearch() {
  const catalog = useCatalog();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<Item[]>(() => [
    ...catalog.modules.flatMap((m) => m.lessons.map((l) => ({ type: "Lesson" as const, title: l.title, sub: `Module ${m.number} · ${m.title}`, href: `/learn/${l.id}`, keywords: `${l.title} ${m.title}`.toLowerCase() }))),
    ...catalog.exercises.map((e) => ({ type: "Exercise" as const, title: e.title, sub: `${e.difficulty} · ${e.topic}`, href: `/practice/${e.id}`, keywords: `${e.title} ${e.topic} ${e.difficulty}`.toLowerCase() })),
    ...catalog.errors.map((e) => ({ type: "Error" as const, title: e.name, sub: e.summary, href: `/errors/${e.slug}`, keywords: `${e.name} ${e.summary} ${e.category}`.toLowerCase() })),
    ...catalog.modules.map((m) => ({ type: "Quiz" as const, title: `${m.title} quiz`, sub: `Module ${m.number}`, href: `/quizzes/${m.id}`, keywords: `${m.title} quiz test`.toLowerCase() })),
    ...PAGES,
  ], [catalog]);

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return index.filter((i) => i.type === "Page").slice(0, 8);
    return index
      .map((i) => {
        const title = i.title.toLowerCase();
        const full = terms.join(" ");
        let score = terms.reduce((s, t) => s + (i.keywords.includes(t) ? (title.includes(t) ? 3 : 1) : -100), 0);
        if (title === full) score += 20;
        else if (title.startsWith(full)) score += 8;
        return { i, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((r) => r.i);
  }, [q, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "/" && !(e.target as HTMLElement).closest("input,textarea,.cm-editor")) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) { setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [open]);
  useEffect(() => setActive(0), [q]);

  const go = (href: string) => { setOpen(false); router.push(href); };
  const icon = (t: Item["type"]) => t === "Lesson" ? <BookOpen className="h-4 w-4" /> : t === "Exercise" ? <Code2 className="h-4 w-4" /> : t === "Error" ? <AlertTriangle className="h-4 w-4" /> : t === "Quiz" ? <FileQuestion className="h-4 w-4" /> : <Compass className="h-4 w-4" />;

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex h-9 w-full max-w-xs items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm text-muted transition hover:border-accent/40" aria-label="Open search (Ctrl+K)">
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search lessons, errors…</span>
        <span className="kbd hidden sm:inline">⌘K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="card w-full max-w-xl animate-fade-up overflow-hidden" role="dialog" aria-label="Open search (Ctrl+K)">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search lessons, concepts, errors, exercises…" className="h-12 flex-1 bg-transparent text-sm outline-none"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
                  if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
                  if (e.key === "Enter" && results[active]) go(results[active].href);
                }}
                aria-activedescendant={results[active] ? `sr-${active}` : undefined} />
              <span className="kbd">Esc</span>
            </div>
            <ul className="thin-scroll max-h-[50vh] overflow-y-auto p-2" role="listbox">
              {results.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”. Try “loop”, “TypeError” or “dictionary”.</li>}
              {results.map((r, i) => (
                <li key={r.href} id={`sr-${i}`} role="option" aria-selected={i === active}>
                  <button onMouseEnter={() => setActive(i)} onClick={() => go(r.href)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? "bg-elevated" : ""}`}>
                    <span className="text-muted">{icon(r.type)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted">{r.sub}</span>
                    </span>
                    <span className="chip">{r.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
