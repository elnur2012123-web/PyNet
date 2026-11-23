"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { EXERCISE_LEVELS } from "@/lib/exercise-levels";
import { planAtLeast } from "@/lib/plans";
import { XP_RULES } from "@/lib/xp";

export default function PracticePage() {
  const catalog = useCatalog();
  const p = useProgress();
  const [filter, setFilter] = useState<string>("all");
  const shown = catalog.exercises.filter((e) => filter === "all" || e.difficulty === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Practice challenges</h1>
        <p className="mt-1 text-muted">Write real programs. Automatic tests run your code and check its exact output. {p.exercises.size}/{catalog.exercises.length} solved.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Difficulty">
        {[{ id: "all", label: "All" }, ...EXERCISE_LEVELS].map((d) => (
          <button key={d.id} role="tab" aria-selected={filter === d.id} onClick={() => setFilter(d.id)} className={`rounded-xl px-3.5 py-1.5 text-sm ${filter === d.id ? "bg-accent text-white" : "border border-border bg-surface text-muted hover:text-fg"}`}>
            {d.label}
          </button>
        ))}
      </div>
      {EXERCISE_LEVELS.filter((d) => filter === "all" || d.id === filter).map((d) => {
        const list = shown.filter((e) => e.difficulty === d.id);
        if (!list.length) return null;
        return (
          <section key={d.id}>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${d.dot}`} /> {d.label} <span className="text-sm font-normal text-muted">· {XP_RULES.exercise[d.id]} XP each</span></h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => {
                const solved = p.exercises.has(e.id);
                const locked = !planAtLeast(p.plan, e.minPlan);
                return (
                  <Link key={e.id} href={`/practice/${e.id}`} className="card-flat group flex items-start gap-3 p-4 transition hover:border-accent/50">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium group-hover:text-accent">{e.title}</span>
                      <span className="text-xs text-muted">{e.topic}</span>
                    </span>
                    {solved ? <CheckCircle2 className="h-5 w-5 text-success" aria-label="Solved" /> : locked ? <span className="chip"><Lock className="h-3 w-3" /> Pro</span> : null}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
