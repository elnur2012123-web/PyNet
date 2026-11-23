"use client";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { Icon } from "@/components/ui/Icon";

export default function QuizzesPage() {
  const catalog = useCatalog();
  const p = useProgress();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">Quizzes</h1>
        <p className="mt-1 text-muted">One quiz per module: multiple choice, predict-the-output, find-the-error, fill-in-the-blank and small coding challenges. Pass with 60% to earn 50 XP.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.modules.map((m) => {
          const q = catalog.quizzes.find((x) => x.moduleId === m.id);
          const best = p.bestQuiz[m.id];
          const passed = p.quizzes.has(m.id);
          return (
            <Link key={m.id} href={`/quizzes/${m.id}`} className="card-flat group p-5 transition hover:border-accent/50">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><Icon name={m.icon} className="h-5 w-5" /></span>
                {passed && <CheckCircle2 className="h-5 w-5 text-success" aria-label="Passed" />}
              </div>
              <p className="mt-3 text-xs text-muted">Module {m.number} · {q?.questions ?? 0} questions</p>
              <p className="font-semibold group-hover:text-accent">{m.title}</p>
              <p className="mt-2 text-sm text-muted">{best != null ? `Best score: ${best}%` : "Not attempted yet"}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
