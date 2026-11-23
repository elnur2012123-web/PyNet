"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Crown, Search } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { ERROR_CATEGORIES } from "@/content/error-categories";
import { EmptyState } from "@/components/ui/States";

export default function ErrorsPage() {
  const catalog = useCatalog();
  const p = useProgress();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [level, setLevel] = useState("All");
  const list = useMemo(() => catalog.errors.filter((e) =>
    (cat === "All" || e.category === cat) && (level === "All" || e.difficulty === level) &&
    (!q || `${e.name} ${e.summary}`.toLowerCase().includes(q.toLowerCase()))), [catalog.errors, cat, level, q]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Python Error Explorer</h1>
        <p className="mt-1 max-w-2xl text-muted">Every error message is a clue. Learn what each one means, why it happens, how to fix it — then practise and quiz yourself.</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search errors, e.g. “not defined” or KeyError" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search errors" />
        </label>
        <select className="input md:w-48" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category">
          <option>All</option>{ERROR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input md:w-40" value={level} onChange={(e) => setLevel(e.target.value)} aria-label="Difficulty">
          <option>All</option><option>Beginner</option><option>Intermediate</option>
        </select>
      </div>
      {list.length === 0 ? <EmptyState title="No errors match" body="Try another search or clear the filters." /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <Link key={e.slug} href={`/errors/${e.slug}`} className="card-flat group p-5 transition hover:border-accent/50">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono font-semibold text-danger">{e.name}</p>
                {e.premium && p.plan === "FREE" && <span className="chip"><Crown className="h-3 w-3" /> Pro</span>}
              </div>
              <p className="mt-2 text-sm text-fg/90">{e.summary}</p>
              <div className="mt-3 flex gap-2"><span className="chip">{e.category}</span><span className="chip">{e.difficulty}</span></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
