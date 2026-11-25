"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import type { PublicQuestion } from "@/content/server";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { TestRunner } from "@/components/editor/TestRunner";
import { useProgress, type GradedResponse } from "@/components/providers/ProgressProvider";
import { Notice, Spinner } from "@/components/ui/States";
import { Ring } from "@/components/ui/Progress";
import { Inline } from "@/components/lesson/RichText";
import { looksLikeCodeOption } from "@/lib/looks-like-code";

const TYPE_LABEL: Record<PublicQuestion["type"], string> = { mcq: "Multiple choice", output: "Predict the output", error: "Find the error", blank: "Fill in the blank", code: "Coding challenge" };

export function QuizView({ moduleId, moduleNumber, title, questions }: { moduleId: string; moduleNumber: number; title: string; questions: PublicQuestion[] }) {
  const tx = useT();
  const p = useProgress();
  const [answers, setAnswers] = useState<(number | string | boolean | null)[]>(questions.map(() => null));
  const [graded, setGraded] = useState<GradedResponse | null>(null);
  const [passed, setPassed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const set = (i: number, v: number | string | boolean) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));
  const answered = answers.filter((a) => a !== null && a !== "").length;

  const submit = async () => {
    setBusy(true); setErr(null);
    const r = await p.submitQuiz(moduleId, answers.map((a, i) => (a === null ? (questions[i].type === "code" ? false : null) : a)));
    setBusy(false);
    if (!r.ok) { setErr(r.error ?? "Could not grade"); return; }
    setGraded(r.graded!); setPassed(Boolean(r.passed));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const retake = () => { setGraded(null); setAnswers(questions.map(() => null)); setAttempt((a) => a + 1); window.scrollTo({ top: 0 }); };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/quizzes" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> <T k="All quizzes" /></Link>
      <header>
        <p className="text-sm text-muted"><T k="Module" />{" "}{moduleNumber} <T k="quiz" /></p>
        <h1 className="h1">{title}</h1>
        <p className="mt-1 text-sm text-muted">{questions.length} <T k="questions · pass mark 60% · +50 XP the first time you pass" /></p>
      </header>

      {graded && (
        <div className="card animate-pop p-6">
          <div className="flex flex-wrap items-center gap-5">
            <Ring value={graded.percent} size={88} stroke={8}><span className="text-lg">{graded.percent}%</span></Ring>
            <div className="flex-1">
              <p className="flex items-center gap-2 text-lg font-semibold">{passed ? <><Trophy className="h-5 w-5 text-warn" /> <T k="Quiz passed!" /></> : tx("Not passed yet")}</p>
              <p className="text-sm text-muted">{graded.score} <T k="of" />{" "}{graded.total} <T k="correct." />{" "}{passed ? tx("Great work — review the explanations below.") : tx("You need 60% to pass. Review the explanations and try again.")}</p>
            </div>
            <button onClick={retake} className="btn-secondary"><RotateCcw className="h-4 w-4" /> <T k="Retake quiz" /></button>
          </div>
        </div>
      )}

      <ol className="space-y-5">
        {questions.map((q, i) => {
          const r = graded?.results[i];
          return (
            <li key={`${attempt}-${i}`} className={`card-flat p-5 ${r ? (r.correct ? "border-success/40" : "border-danger/40") : ""}`}>
              <p className="mb-1 text-xs font-medium text-accent">{TYPE_LABEL[q.type]}</p>
              <p className="mb-3 font-medium">{i + 1}. <Inline text={q.q} /></p>
              {(q.type === "mcq" || q.type === "output" || q.type === "error") && q.code && <CodeBlock code={q.code} className="mb-3" copy={false} />}

              {(q.type === "mcq" || q.type === "output" || q.type === "error") && (
                <div className="grid gap-2">
                  {q.options.map((o, j) => (
                    <label key={j} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${answers[i] === j ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}>
                      <input type="radio" name={`q${attempt}-${i}`} checked={answers[i] === j} disabled={Boolean(graded)} onChange={() => set(i, j)} />
                      <span className={`whitespace-pre-wrap ${q.type !== "mcq" || looksLikeCodeOption(o) ? "font-mono text-[13px]" : ""}`}>{o}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === "blank" && (
                <div>
                  <CodeBlock code={q.code.replace(/_{2,}/, "▢")} className="mb-2" copy={false} />
                  <input className="input max-w-xs font-mono" placeholder={tx("Your answer for ▢")} value={(answers[i] as string) ?? ""} disabled={Boolean(graded)} onChange={(e) => set(i, e.target.value)} aria-label={`Answer for question ${i + 1}`} />
                </div>
              )}

              {q.type === "code" && (
                <div>
                  <TestRunner starter={q.starter} tests={q.tests} checkLabel="Run tests" onChecked={(ok) => set(i, ok)} minHeight="140px" />
                  <p className="mt-2 text-xs text-muted">{answers[i] === true ? tx("✓ Your code passes — it will count when you submit.") : tx("Run the tests: your answer counts as correct if all tests pass.")}</p>
                </div>
              )}

              {r && (
                <div className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${r.correct ? "bg-success/10" : "bg-danger/10"}`}>
                  <p className="flex items-center gap-1.5 font-medium">{r.correct ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}{r.correct ? tx("Correct") : tx("Incorrect")}</p>
                  {!r.correct && q.type !== "code" && <p className="mt-1"><T k="Correct answer:" />{" "}<code className="font-mono">{r.correctAnswer}</code></p>}
                  {!r.correct && q.type === "code" && <CodeBlock code={r.correctAnswer} title={tx("One possible solution")} className="mt-2" />}
                  <p className="mt-1 text-fg/80"><Inline text={r.explain} /></p>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {err && <Notice kind="error">{err}</Notice>}
      {!graded && (
        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/95 p-3 shadow-lg backdrop-blur">
          <span className="text-sm text-muted">{answered}/{questions.length} <T k="answered" /></span>
          <button onClick={submit} disabled={busy || answered === 0} className="btn-primary">{busy && <Spinner />} <T k="Submit quiz" /></button>
        </div>
      )}
    </div>
  );
}
