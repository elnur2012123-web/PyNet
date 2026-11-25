"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import type { PythonErrorEntry } from "@/content/types";
import { CodeBlock } from "@/components/editor/CodeBlock";
import { PythonRunner } from "@/components/editor/PythonRunner";
import { TestRunner } from "@/components/editor/TestRunner";
import { Inline } from "@/components/lesson/RichText";
import { looksLikeCodeOption } from "@/lib/looks-like-code";

export function ErrorView({ entry: e }: { entry: PythonErrorEntry }) {
  const tx = useT();
  const [answers, setAnswers] = useState<(number | null)[]>(e.quiz.map(() => null));
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link href="/errors" className="btn-ghost btn-sm"><ArrowLeft className="h-4 w-4" /> <T k="Error Explorer" /></Link>
      <header>
        <div className="mb-2 flex gap-2"><span className="chip"><T k={e.category} /></span><span className="chip"><T k={e.difficulty} /></span></div>
        <h1 className="font-mono text-3xl font-semibold text-danger">{e.name}</h1>
        <p className="mt-2 text-lg">{e.summary}</p>
      </header>

      <section><h2 className="mb-2 font-semibold"><T k="What it means" /></h2><p className="leading-7 text-fg/90"><Inline text={e.meaning} /></p></section>
      <section>
        <h2 className="mb-2 font-semibold"><T k="Why it happens" /></h2>
        <ul className="list-disc space-y-1 pl-5 text-fg/90">{e.why.map((w) => <li key={w}><Inline text={w} /></li>)}</ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-danger"><XCircle className="h-4 w-4" /> <T k="Incorrect code" /></p>
          <CodeBlock code={e.badCode} lineNumbers />
          <p className="mb-1 mt-3 text-xs font-medium text-muted"><T k="Error message" /></p>
          <pre className="whitespace-pre-wrap rounded-xl border border-danger/30 bg-danger/5 p-3 font-mono text-[13px] text-danger">{e.message}</pre>
        </div>
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-success"><CheckCircle2 className="h-4 w-4" /> <T k="Corrected code" /></p>
          <CodeBlock code={e.fixedCode} lineNumbers />
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-semibold"><T k="See it happen" /></h2>
        <p className="mb-3 text-sm text-muted"><T k="Run the broken code to see the real error, then fix it yourself." /></p>
        <PythonRunner initialCode={e.badCode} minHeight="120px" compact />
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4 text-success" /> <T k="How to prevent it" /></h2>
        <ul className="list-disc space-y-1 pl-5 text-fg/90">{e.prevent.map((w) => <li key={w}><Inline text={w} /></li>)}</ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold"><T k="Practice" /></h2>
        <p className="mb-3 text-[15px]"><Inline text={e.exercise.prompt} /></p>
        <TestRunner starter={e.exercise.starter ?? ""} tests={e.exercise.tests} hints={[e.exercise.hint]} solution={e.exercise.solution} storageKey={`pn-err-${e.slug}`} />
      </section>

      <section className="card p-5">
        <h2 className="mb-4 font-semibold"><T k="Quick quiz" /></h2>
        <div className="space-y-5">
          {e.quiz.map((q, i) => (
            <fieldset key={i}>
              <legend className="mb-2 font-medium">{i + 1}. <Inline text={q.q} /></legend>
              <div className="grid gap-2">
                {q.options.map((o, j) => {
                  const chosen = answers[i] === j;
                  const show = answers[i] !== null;
                  const tone = show ? (j === q.answer ? "border-success bg-success/10" : chosen ? "border-danger bg-danger/10" : "border-border") : "border-border hover:border-accent/40";
                  return (
                    <button key={j} disabled={show} onClick={() => setAnswers((a) => a.map((x, k) => (k === i ? j : x)))} className={`rounded-xl border px-3.5 py-2.5 text-left text-sm ${looksLikeCodeOption(o) ? "font-mono text-[13px]" : ""} ${tone}`}>{o}</button>
                  );
                })}
              </div>
              {answers[i] !== null && <p className={`mt-2 text-sm ${answers[i] === q.answer ? "text-success" : "text-danger"}`}>{answers[i] === q.answer ? tx("Correct! ") : tx("Not quite. ")}<span className="text-fg/80">{q.explain}</span></p>}
            </fieldset>
          ))}
        </div>
      </section>
    </article>
  );
}
