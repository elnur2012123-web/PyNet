"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Bot, CheckCircle2 } from "lucide-react";
import type { Exercise } from "@/content/types";
import { TestRunner } from "@/components/editor/TestRunner";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { Inline } from "@/components/lesson/RichText";
import { useProgress } from "@/components/providers/ProgressProvider";
import { askTutor } from "@/components/tutor/bus";
import { Notice } from "@/components/ui/States";
import { EXERCISE_LEVELS } from "@/lib/exercise-levels";
import { XP_RULES } from "@/lib/xp";

export function ExerciseView({ exercise: ex, nextId }: { exercise: Exercise; nextId: string | null }) {
  const tx = useT();
  const p = useProgress();
  const [msg, setMsg] = useState<{ kind: "success" | "warn" | "error"; text: string } | null>(null);
  const solved = p.exercises.has(ex.id);
  const level = EXERCISE_LEVELS.find((l) => l.id === ex.difficulty)!;
  const visibleTests = ex.tests.filter((t) => !t.hidden);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/practice" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> <T k="All challenges" /></Link>
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip"><span className={`h-2 w-2 rounded-full ${level.dot}`} /> <T k={level.label} /></span>
          <span className="chip"><T k={ex.topic} /></span>
          <span className="chip">{XP_RULES.exercise[ex.difficulty]} <T k="XP" /></span>
          {solved && <span className="chip border-success/40 text-success"><CheckCircle2 className="h-3 w-3" /> <T k="Solved" /></span>}
        </div>
        <h1 className="h1"><T k={ex.title} /></h1>
      </header>

      <div className="card p-5">
        <h2 className="mb-2 font-semibold"><T k="Problem" /></h2>
        <p className="prose-lite text-[15px] leading-7"><Inline text={ex.description} /></p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ex.exampleInput && <div><p className="mb-1 text-xs font-medium text-muted"><T k="Example input" /></p><pre className="code-block rounded-xl border border-border p-3 font-mono text-[13px]">{ex.exampleInput}</pre></div>}
          <div className={ex.exampleInput ? "" : "sm:col-span-2"}><p className="mb-1 text-xs font-medium text-muted"><T k="Example output" /></p><pre className="code-block rounded-xl border border-border p-3 font-mono text-[13px]">{ex.exampleOutput}</pre></div>
        </div>
        {ex.constraints && <div className="mt-4"><p className="text-xs font-medium text-muted"><T k="Constraints" /></p><ul className="mt-1 list-disc pl-5 text-sm">{ex.constraints.map((c) => <li key={c}>{c}</li>)}</ul></div>}
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-muted"><T k="Test cases (" />{ex.tests.length}, {ex.tests.length - visibleTests.length} <T k="hidden)" /></summary>
          <ul className="mt-2 space-y-2">
            {visibleTests.map((t, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-2">
                <CodeBlock code={t.input?.join("\n") || "(no input)"} title={`Test ${i + 1} input`} copy={false} />
                <CodeBlock code={t.expected || "(no output)"} title={tx("Expected output")} copy={false} />
              </li>
            ))}
          </ul>
        </details>
      </div>

      <TestRunner
        starter={ex.starter}
        tests={ex.tests}
        hints={ex.hints}
        solution={ex.solution}
        explanation={ex.explanation}
        storageKey={`pn-ex-${ex.id}`}
        minHeight="240px"
        onChecked={async (passed, code) => {
          setMsg(null);
          if (p.mode === "guest" && !passed) return;
          const r = await p.recordExercise(ex.id, code, passed);
          if (!r.ok) setMsg({ kind: r.limit ? "warn" : "error", text: r.error ?? "Could not save your result." });
          else if (passed && r.award?.already) setMsg({ kind: "success", text: tx("Solved again — you already earned XP for this one.") });
        }}
      />
      {msg && <Notice kind={msg.kind}>{msg.text}{msg.kind === "warn" && <> <Link href="/pricing" className="link"><T k="Upgrade" /></Link></>}</Notice>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-secondary btn-sm" onClick={() => askTutor({ message: `I'm working on the "${ex.title}" exercise:\n\n${ex.description}\n\nCan you give me a hint (not the full solution) to get started?` })}>
          <Bot className="h-3.5 w-3.5" /> <T k="Ask PyBuddy for a hint" /></button>
        {nextId && <Link href={`/practice/${nextId}`} className="btn-primary btn-sm"><T k="Next challenge" />{" "}<ArrowRight className="h-3.5 w-3.5" /></Link>}
      </div>
    </div>
  );
}
