"use client";

import { useLocale, useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Bot, Check, CheckCircle2, Clock, Globe2, Lightbulb, Play, Sparkles, TriangleAlert, XCircle } from "lucide-react";
import type { CodeExample, Mistake, PracticeTask } from "@/content/types";
import { Inline, RichText } from "./RichText";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { PythonRunner } from "@/components/editor/PythonRunner";
import { TestRunner } from "@/components/editor/TestRunner";
import { useProgress, type GradedResponse } from "@/components/providers/ProgressProvider";
import { askTutor } from "@/components/tutor/bus";
import { useFavorites } from "./useFavorites";
import { Notice, Spinner } from "@/components/ui/States";
import { looksLikeCodeOption } from "@/lib/looks-like-code";

export interface LessonPayload {
  id: string;
  title: string;
  minutes: number;
  kind: "lesson" | "project";
  intro: string;
  syntax?: string;
  examples: CodeExample[];
  realWorld: string;
  mistakes: Mistake[];
  tryIt: string;
  practice: PracticeTask[];
  quiz: { q: string; code?: string; options: string[] }[];
}

interface NavLink { id: string; title: string }

export function LessonView({
  lesson, moduleTitle, moduleNumber, position, total, prev, next,
}: {
  lesson: LessonPayload; moduleTitle: string; moduleNumber: number; position: number; total: number; prev: NavLink | null; next: NavLink | null;
}) {
  const tx = useT();
  const p = useProgress();
  const { favs, toggle } = useFavorites();
  const done = p.lessons.has(lesson.id);
  const [tryCode, setTryCode] = useState<string | null>(null);
  const [practiceDone, setPracticeDone] = useState<Set<number>>(new Set());

  const loadIntoEditor = (code: string) => {
    setTryCode(code);
    document.getElementById("try-it")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article className="mx-auto max-w-3xl animate-fade-up">
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted" aria-label={tx("Breadcrumb")}>
        <Link href="/learn" className="hover:text-fg"><T k="Course" /></Link><span>/</span>
        <Link href={`/learn#m${moduleNumber}`} className="hover:text-fg"><T k="Module" />{" "}{moduleNumber}: {moduleTitle}</Link>
      </nav>

      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="chip">{lesson.kind === "project" ? tx("Project") : tx("Lesson")} {position} <T k="of" />{" "}{total}</span>
          <span className="chip"><Clock className="h-3 w-3" /> {lesson.minutes} <T k="min" /></span>
          {done && <span className="chip border-success/40 text-success"><Check className="h-3 w-3" /> <T k="Completed" /></span>}
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="h1"><T k={lesson.title} /></h1>
          <LessonLanguageNote />
          <button onClick={() => toggle(lesson.id)} className="btn-ghost btn-sm mt-1 shrink-0" aria-pressed={favs.has(lesson.id)} title={favs.has(lesson.id) ? tx("Remove from favourites") : tx("Save to favourites")}>
            {favs.has(lesson.id) ? <BookmarkCheck className="h-5 w-5 text-accent" /> : <Bookmark className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <Section icon={<Sparkles className="h-4 w-4" />} title={tx("The idea")}>
        <RichText text={lesson.intro} />
        <button onClick={() => askTutor({ message: `I'm on the lesson "${lesson.title}". Can you explain it to me in a different, even simpler way, with a real-life analogy?` })} className="btn-secondary btn-sm mt-3">
          <Bot className="h-3.5 w-3.5" /> <T k="Explain it differently" /></button>
      </Section>

      {lesson.syntax && (
        <Section title={tx("Syntax")}>
          <CodeBlock code={lesson.syntax} />
        </Section>
      )}

      <Section title={tx("Examples")}>
        <div className="space-y-5">
          {lesson.examples.map((ex) => (
            <div key={ex.title}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="font-medium">{ex.title}</h3>
                <button onClick={() => loadIntoEditor(ex.code)} className="btn-ghost btn-sm"><Play className="h-3.5 w-3.5" /> <T k="Try it" /></button>
              </div>
              <CodeBlock code={ex.code} lineNumbers />
              {ex.note && <p className="mt-2 text-sm text-muted">{ex.note}</p>}
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Globe2 className="h-4 w-4" />} title={tx("In the real world")}>
        <p className="text-[15px] leading-7 text-fg/90">{lesson.realWorld}</p>
      </Section>

      <Section icon={<TriangleAlert className="h-4 w-4" />} title={tx("Common mistakes")}>
        <div className="space-y-4">
          {lesson.mistakes.map((m, i) => (
            <div key={i} className="card-flat p-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-danger"><XCircle className="h-3.5 w-3.5" /> <T k="Mistake" /></p>
                  {looksLikeCode(m.wrong) ? <CodeBlock code={m.wrong} copy={false} /> : <p className="text-sm">{m.wrong}</p>}
                </div>
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-success"><CheckCircle2 className="h-3.5 w-3.5" /> <T k="Correct" /></p>
                  {looksLikeCode(m.right) ? <CodeBlock code={m.right} copy={false} /> : <p className="text-sm">{m.right}</p>}
                </div>
              </div>
              <p className="mt-3 text-sm text-fg/90"><Lightbulb className="mr-1 inline h-4 w-4 text-warn" />{m.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="try-it" title={tx("Try it yourself")}>
        <p className="mb-3 text-sm text-muted"><T k="This is real Python running in your browser. Change the code and press Run (or Ctrl/⌘ + Enter)." /></p>
        <PythonRunner key={tryCode ?? "initial"} initialCode={tryCode ?? lesson.tryIt} minHeight="180px" />
      </Section>

      <Section title={`${tx("Practice")} (${practiceDone.size}/${lesson.practice.length})`}>
        <div className="space-y-6">
          {lesson.practice.map((t, i) => (
            <div key={i}>
              <p className="mb-2 flex items-start gap-2 text-[15px]">
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold ${practiceDone.has(i) ? "bg-success text-white" : "bg-elevated"}`}>{practiceDone.has(i) ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <RichTextInline text={t.prompt} />
              </p>
              <TestRunner
                starter={t.starter ?? ""}
                tests={t.tests}
                hints={[t.hint]}
                solution={t.solution}
                storageKey={`pn-practice-${lesson.id}-${i}`}
                onChecked={(passed) => passed && setPracticeDone((s) => new Set(s).add(i))}
              />
            </div>
          ))}
        </div>
      </Section>

      <KnowledgeCheck lessonId={lesson.id} questions={lesson.quiz} done={done} kind={lesson.kind} />

      <nav className="mt-10 flex items-center justify-between gap-3 border-t border-border pt-6" aria-label={tx("Lesson navigation")}>
        {prev ? (
          <Link href={`/learn/${prev.id}`} className="btn-secondary max-w-[48%]"><ArrowLeft className="h-4 w-4 shrink-0" /><span className="truncate">{prev.title}</span></Link>
        ) : <span />}
        {next ? (
          <Link href={`/learn/${next.id}`} className="btn-primary max-w-[48%]"><span className="truncate"><T k={next.title} /></span><ArrowRight className="h-4 w-4 shrink-0" /></Link>
        ) : (
          <Link href="/dashboard" className="btn-primary"><T k="Back to dashboard" />{" "}<ArrowRight className="h-4 w-4" /></Link>
        )}
      </nav>
    </article>
  );
}

const looksLikeCode = (s: string) => s.includes("\n") || (/[=()[\]#:]/.test(s) && !/[.!?]$/.test(s.trim()));

function RichTextInline({ text }: { text: string }) {
  return <span className="prose-lite"><Inline text={text} /></span>;
}

function Section({ title, icon, children, id }: { title: string; icon?: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">{icon && <span className="text-accent">{icon}</span>}{title}</h2>
      {children}
    </section>
  );
}

function KnowledgeCheck({ lessonId, questions, done, kind }: { lessonId: string; questions: { q: string; code?: string; options: string[] }[]; done: boolean; kind: "lesson" | "project" }) {
  const tx = useT();
  const p = useProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));
  const [graded, setGraded] = useState<GradedResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    const r = await p.completeLesson(lessonId, answers.map((a) => a ?? -1));
    setBusy(false);
    if (!r.ok) setErr(r.error ?? "Something went wrong");
    else setGraded(r.graded ?? null);
  };

  return (
    <section className="card mb-6 p-5 sm:p-6" aria-labelledby="kc">
      <h2 id="kc" className="text-lg font-semibold"><T k="Knowledge check" /></h2>
      <p className="mt-1 text-sm text-muted">
        <T k="Answer correctly to complete this" />{" "}{kind} <T k="and earn" />{" "}<strong className="text-fg">{kind === "project" ? 100 : 20} <T k="XP" /></strong>{done ? tx(" (already earned)") : ""}.
      </p>
      <div className="mt-5 space-y-6">
        {questions.map((q, i) => {
          const res = graded?.results[i];
          return (
            <fieldset key={i}>
              <legend className="mb-2 font-medium">{i + 1}. {q.q}</legend>
              {q.code && <CodeBlock code={q.code} className="mb-3" copy={false} />}
              <div className="grid gap-2">
                {q.options.map((o, j) => {
                  const chosen = answers[i] === j;
                  const tone = res ? (chosen ? (res.correct ? "border-success bg-success/10" : "border-danger bg-danger/10") : o === res.correctAnswer && !res.correct ? "border-success/60" : "border-border") : chosen ? "border-accent bg-accent/5" : "border-border hover:border-accent/50";
                  return (
                    <label key={j} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition ${tone}`}>
                      <input type="radio" name={`kc-${i}`} className="accent-[rgb(var(--accent))]" checked={chosen} disabled={Boolean(graded)}
                        onChange={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))} />
                      <span className={looksLikeCodeOption(o) ? "font-mono text-[13px]" : ""}>{o}</span>
                    </label>
                  );
                })}
              </div>
              {res && <p className={`mt-2 text-sm ${res.correct ? "text-success" : "text-danger"}`}>{res.correct ? tx("Correct! ") : `Not quite. Answer: ${res.correctAnswer}. `}<span className="text-fg/80">{res.explain}</span></p>}
            </fieldset>
          );
        })}
      </div>
      {err && <div className="mt-4"><Notice kind="error">{err}</Notice></div>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!graded ? (
          <button onClick={submit} disabled={busy || answers.some((a) => a === null)} className="btn-primary">{busy && <Spinner />} <T k="Check answers" /></button>
        ) : (
          <>
            <p className={`text-sm font-semibold ${graded.percent >= 50 ? "text-success" : "text-danger"}`}>
              {graded.score}/{graded.total} <T k="correct —" />{" "}{graded.percent >= 50 ? `${kind === "project" ? "Project" : "Lesson"} complete!` : tx("Review the lesson and try again.")}
            </p>
            <button onClick={() => { setGraded(null); setAnswers(questions.map(() => null)); }} className="btn-secondary btn-sm"><T k="Try again" /></button>
          </>
        )}
      </div>
      {graded && graded.percent >= 50 && p.mode === "guest" && p.authConfigured && (
        <p className="mt-3 text-xs text-muted"><T k="Saved in this browser." />{" "}<Link href="/signup" className="link"><T k="Create an account" /></Link> <T k="to keep your XP on the leaderboard." /></p>
      )}
    </section>
  );
}

/** Lesson bodies are English for now; tell non-English readers. */
function LessonLanguageNote() {
  const locale = useLocale();
  if (locale === "en") return null;
  return <p className="mt-2 inline-flex rounded-lg bg-warn/10 px-2.5 py-1 text-xs text-warn"><T k="Lesson text is still in English — translation is coming soon." /></p>;
}
