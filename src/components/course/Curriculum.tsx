"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ChevronDown, Crown, Hammer, ListChecks, Lock } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { ProgressBar } from "@/components/ui/Progress";
import { Icon } from "@/components/ui/Icon";
import { planAtLeast } from "@/lib/plans";

export function Curriculum() {
  const tx = useT();
  const catalog = useCatalog();
  const p = useProgress();
  const [open, setOpen] = useState<Set<string>>(new Set());

  // open the module from the URL hash (#m3) or the first unfinished module
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    const fromHash = catalog.modules.find((m) => `m${m.number}` === hash)?.id;
    const firstOpen = catalog.modules.find((m) => m.lessons.some((l) => !p.lessons.has(l.id)))?.id;
    const id = fromHash ?? firstOpen ?? catalog.modules[0].id;
    setOpen(new Set([id]));
    if (fromHash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [catalog.modules, p.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = catalog.modules.reduce((s, m) => s + m.lessons.length, 0);
  const done = catalog.modules.reduce((s, m) => s + m.lessons.filter((l) => p.lessons.has(l.id)).length, 0);

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="h1"><T k="Python course" /></h1>
            <p className="mt-1 text-muted">{catalog.modules.length} <T k="modules ·" />{" "}{total} <T k="lessons · from absolute zero to intermediate" /></p>
          </div>
          <p className="text-sm text-muted"><span className="text-2xl font-semibold text-fg">{Math.round((done / total) * 100)}%</span> <T k="complete" /></p>
        </div>
        <ProgressBar value={(done / total) * 100} className="mt-4" label={tx("Course completion")} />
      </div>

      <ol className="space-y-3">
        {catalog.modules.map((m) => {
          const mDone = m.lessons.filter((l) => p.lessons.has(l.id)).length;
          const isOpen = open.has(m.id);
          const quizPassed = p.quizzes.has(m.id);
          return (
            <li key={m.id} id={`m${m.number}`} className="card-flat scroll-mt-24 overflow-hidden">
              <button onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })}
                className="flex w-full items-center gap-4 p-4 text-left hover:bg-elevated/50" aria-expanded={isOpen}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${mDone === m.lessons.length ? "bg-success/15 text-success" : "bg-accent/10 text-accent"}`}>
                  {mDone === m.lessons.length ? <Check className="h-5 w-5" /> : <Icon name={m.icon} className="h-5 w-5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-xs text-muted"><T k="Module" />{" "}{m.number}</span>
                  <span className="block font-semibold"><T k={m.title} /></span>
                  <span className="mt-0.5 hidden text-sm text-muted sm:block"><T k={m.description} /></span>
                </span>
                <span className="hidden w-32 shrink-0 sm:block">
                  <span className="mb-1 block text-right text-xs text-muted">{mDone}/{m.lessons.length}</span>
                  <ProgressBar value={(mDone / m.lessons.length) * 100} label={`${m.title} progress`} />
                </span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-border px-2 py-2">
                  <ul>
                    {m.lessons.map((l, i) => {
                      const ok = p.lessons.has(l.id);
                      const locked = !planAtLeast(p.plan, l.minPlan);
                      return (
                        <li key={l.id}>
                          <Link href={`/learn/${l.id}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-elevated">
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${ok ? "bg-success text-white" : "border border-border text-muted"}`}>{ok ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                            <span className="flex-1 text-sm"><T k={l.title} /></span>
                            {l.kind === "project" && <span className="chip hidden sm:inline-flex"><Hammer className="h-3 w-3" /> <T k="Project" /></span>}
                            {locked && <span className="chip"><Lock className="h-3 w-3" /> {l.minPlan}</span>}
                            <span className="w-12 text-right text-xs text-muted">{l.minutes} <T k="min" /></span>
                          </Link>
                        </li>
                      );
                    })}
                    <li>
                      <Link href={`/quizzes/${m.id}`} className="mt-1 flex items-center gap-3 rounded-xl bg-elevated/60 px-3 py-2.5 hover:bg-elevated">
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${quizPassed ? "bg-success text-white" : "bg-accent/15 text-accent"}`}>{quizPassed ? <Check className="h-3.5 w-3.5" /> : <ListChecks className="h-3.5 w-3.5" />}</span>
                        <span className="flex-1 text-sm font-medium"><T k="Module" />{" "}{m.number} <T k="quiz" /></span>
                        {p.bestQuiz[m.id] != null && <span className="text-xs text-muted"><T k="Best:" />{" "}{p.bestQuiz[m.id]}%</span>}
                        <span className="text-xs text-accent"><T k="+50 XP" /></span>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {p.plan === "FREE" && (
        <p className="text-center text-sm text-muted"><Crown className="mr-1 inline h-4 w-4 text-accent2" /><T k="All lessons are free. Projects 4–7 unlock with Pro and 8–10 with Max." />{" "}<Link href="/pricing" className="link"><T k="Compare plans" /></Link></p>
      )}
    </div>
  );
}
