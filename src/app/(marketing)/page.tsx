import { T } from "@/components/i18n/T";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getCatalog } from "@/content/server";
import { HighlightedCode } from "@/components/editor/CodeBlock";

const STAGES = [
  {
    name: "The basics",
    range: [1, 5],
    blurb: "What code is, how to store information, do math, work with text and talk to the user. By the end you'll have built a small calculator.",
  },
  {
    name: "Thinking like a programmer",
    range: [6, 10],
    blurb: "Decisions, loops, lists and dictionaries, your own functions — and how to read error messages instead of fearing them.",
  },
  {
    name: "Building real things",
    range: [11, 15],
    blurb: "Files, modules, classes and the tricks experienced developers use. Then ten projects, from a guessing game to an expense tracker.",
  },
] as const;

const FAQ = [
  ["I've never written code. Is this really for me?", "Yes — that's exactly who it's for. The first lesson starts with “what is a program?” and every new word is explained the first time it appears."],
  ["Do I need to install anything?", "No. Python runs right inside your browser, on a laptop or a phone. When you want to build projects on your own computer, lesson 3 shows you how to install it."],
  ["Is it actually free?", "The whole course, the editor, the exercises and the quizzes are free. Pro and Max add harder challenges, extra projects and more help from PyBuddy."],
  ["What if I get stuck?", "Ask PyBuddy, the built-in tutor. Paste your error or your code, or just say “I didn't understand” — it explains things a different way."],
];

export default function Landing() {
  const catalog = getCatalog();
  const lessonCount = catalog.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <h1 className="text-[40px] font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            <T k="Learn Python the way you'd want a friend to" />{" "}
            <span className="relative whitespace-nowrap text-accent">
              <T k="teach you" /><svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 7 C 50 2, 120 2, 198 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
            <T k="Short lessons in plain English, real code you run in your browser, and a tutor who doesn't mind explaining the same thing three times." /></p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/learn/m1-what-is-programming" className="btn-primary px-5 py-3 text-[15px]"><T k="Start the first lesson" />{" "}<ArrowRight className="h-4 w-4" /></Link>
            <Link href="/learn" className="btn-ghost px-4 py-3 text-[15px]"><T k="See all" />{" "}{lessonCount} <T k="lessons" /></Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {["Free to start", "Nothing to install", "Works on your phone"].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success" /> <T k={t} /></li>
            ))}
          </ul>
        </div>

        {/* a real lesson, not a mock-up */}
        <div className="relative">
          <div className="card overflow-hidden">
            <div className="border-b border-border px-5 py-3 text-xs text-muted"><T k="Module 2 · Lesson 1 · What are variables?" /></div>
            <div className="px-5 pt-4 text-[15px] leading-7 text-fg/90">
              <T k="Imagine a" />{" "}<strong><T k="variable" /></strong> <T k="as a labelled box. You give the box a name, put something inside, and look at it later." /></div>
            <pre className="code-block mx-5 mt-4 overflow-x-auto rounded-xl border border-border p-4 font-mono text-[13px] leading-6"><code><HighlightedCode code={'name = "Aziza"\nage = 14\nprint(name, "is", age)'} /></code></pre>
            <div className="mx-5 mb-5 mt-3 rounded-xl bg-elevated/70 px-4 py-3 font-mono text-[13px]">
              <span className="text-muted"><T k="Output →" />{" "}</span><T k="Aziza is 14" /></div>
          </div>
          <div className="card ml-auto mr-2 mt-4 max-w-sm p-4 text-sm sm:-mt-6 sm:mr-[-12px] lg:mr-[-28px]">
            <p className="text-muted"><span className="font-medium text-fg"><T k="You:" /></span> <T k="I didn't understand" /></p>
            <p className="mt-2 leading-6"><span className="font-medium text-accent"><T k="PyBuddy:" /></span> <T k="No problem, let's go slower. The" />{" "}<code className="rounded bg-elevated px-1 font-mono text-[12px]">=</code> <T k="doesn't mean “equals” here — it means “put this value in the box called" />{" "}<code className="rounded bg-elevated px-1 font-mono text-[12px]">name</code><T k="”." /></p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- how a lesson works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight"><T k="Every lesson works the same way" /></h2>
            <p className="mt-3 max-w-md text-muted"><T k="About ten minutes each. You always know what's coming, so you can focus on the idea instead of the website." /></p>
            <ol className="mt-8 space-y-6">
              {[
                ["Read a short explanation", "One idea at a time, with an everyday comparison and a real-world example."],
                ["Run the examples", "Press Run and see what happens. Change a number and run it again."],
                ["Make it break, then fix it", "Each lesson shows the mistakes beginners make most, so you recognise them when they happen to you."],
                ["Solve three small tasks", "Your code is run and checked against the expected output automatically."],
                ["Answer two quick questions", "Get them right to finish the lesson and earn XP."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border font-mono text-sm">{i + 1}</span>
                  <div><p className="font-medium"><T k={t} /></p><p className="mt-0.5 text-sm text-muted"><T k={d} /></p></div>
                </li>
              ))}
            </ol>
          </div>

          <div className="self-center">
            <p className="mb-3 text-sm font-medium text-muted"><T k="What it looks like when something goes wrong" /></p>
            <div className="card overflow-hidden">
              <pre className="code-block overflow-x-auto p-4 font-mono text-[13px] leading-6"><code><HighlightedCode code={'age = 14\nprint("I am " + age + " years old")'} /></code></pre>
              <div className="border-t border-danger/30 bg-danger/5 p-4 text-sm">
                <p className="font-semibold text-danger"><T k="TypeError" />{" "}<span className="font-normal text-muted"><T k="on line 2" /></span></p>
                <p className="mt-1 font-mono text-[12.5px]"><T k={"can only concatenate str (not \"int\") to str"} /></p>
                <p className="mt-3 leading-6">
                  <span className="font-medium"><T k="What this means:" /></span> <T k="you're gluing text and a number together with" />{" "}<code className="rounded bg-elevated px-1 font-mono text-[12px]">+</code><T k=". Python can't add words to numbers. Write" />{" "}<code className="rounded bg-elevated px-1 font-mono text-[12px]">str(age)</code><T k=", or use an f-string:" />{" "}<code className="rounded bg-elevated px-1 font-mono text-[12px]">f&quot;I am {"{age}"} years old&quot;</code>.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted"><T k="Every error message gets a plain-English explanation. There's a whole" />{" "}<Link href="/errors" className="link"><T k="error guide" /></Link> <T k="too." /></p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- curriculum in 3 stages */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight"><T k="What you'll learn" /></h2>
            <p className="mt-2 max-w-xl text-muted">{catalog.modules.length} <T k="modules in three stages. Go in order, or jump to the part you need." /></p>
          </div>
          <Link href="/learn" className="btn-secondary"><T k="Open the course" /></Link>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {STAGES.map((stage, si) => {
            const mods = catalog.modules.filter((m) => m.number >= stage.range[0] && m.number <= stage.range[1]);
            return (
              <div key={stage.name} className="rounded-2xl border border-border p-6">
                <p className="text-sm text-muted"><T k="Stage" />{" "}{si + 1}</p>
                <h3 className="mt-1 text-lg font-semibold"><T k={stage.name} /></h3>
                <p className="mt-2 text-sm leading-6 text-muted"><T k={stage.blurb} /></p>
                <ol className="mt-5 space-y-1 border-t border-border pt-4">
                  {mods.map((m) => (
                    <li key={m.id}>
                      <Link href={`/learn#m${m.number}`} className="flex items-baseline gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-elevated">
                        <span className="w-5 shrink-0 font-mono text-xs text-muted">{m.number}</span>
                        <span className="flex-1"><T k={m.title} /></span>
                        <span className="text-xs text-muted">{m.lessons.length}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- tools */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-3">
          <div>
            <h3 className="font-semibold"><T k="A real Python editor" /></h3>
            <p className="mt-2 text-sm leading-6 text-muted"><T k="Not a simulation — actual Python 3 running in your browser. Use it inside lessons or in the" />{" "}<Link href="/playground" className="link"><T k="playground" /></Link> <T k="to try your own ideas." /></p>
          </div>
          <div>
            <h3 className="font-semibold"><T k="A tutor that explains again" /></h3>
            <p className="mt-2 text-sm leading-6 text-muted"><Link href="/tutor" className="link"><T k="PyBuddy" /></Link> <T k="answers Python questions, explains your code line by line and gives hints before answers. Ask as many “why?”s as you like." /></p>
          </div>
          <div>
            <h3 className="font-semibold"><T k="Practice that checks itself" /></h3>
            <p className="mt-2 text-sm leading-6 text-muted">{catalog.exercises.length} <Link href="/practice" className="link"><T k="challenges" /></Link> <T k="and a quiz for every module. Your code is tested on real inputs, so you know it actually works." /></p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- progress + plans */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight"><T k="Keep going, a little every day" /></h2>
          <p className="mt-3 leading-7 text-muted">
            <T k="You earn XP for every lesson, challenge and quiz, keep a daily streak, and climb weekly leagues from Bronze to Master. Add friends and see who's learning the most this week on the" />{" "}<Link href="/leaderboard" className="link"><T k="leaderboard" /></Link><T k=". It's only there to keep you coming back — the real reward is the day your first program works." /></p>
        </div>
        <div className="rounded-2xl border border-border p-6">
          <h2 className="text-2xl font-semibold tracking-tight"><T k="Free is enough to learn Python" /></h2>
          <p className="mt-3 leading-7 text-muted">
            <T k="All" />{" "}{lessonCount} <T k="lessons are free. If you want more," />{" "}<strong className="text-fg"><T k="Pro" /></strong> <T k="($5/month) adds hard challenges, more projects and more PyBuddy help, and" />{" "}<strong className="text-fg"><T k="Max" /></strong> <T k="($20/month) adds code reviews and the full project library." /></p>
          <Link href="/pricing" className="btn-secondary mt-5"><T k="Compare plans" /></Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight"><T k="Questions people ask before starting" /></h2>
          <dl className="mt-8 divide-y divide-border">
            {FAQ.map(([q, a]) => (
              <div key={q} className="py-5">
                <dt className="font-medium"><T k={q} /></dt>
                <dd className="mt-2 text-sm leading-6 text-muted"><T k={a} /></dd>
              </div>
            ))}
          </dl>
          <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center">
            <p className="text-xl font-semibold"><T k="Ready to write your first line of code?" /></p>
            <p className="mt-2 text-sm text-muted"><T k="The first lesson takes about five minutes." /></p>
            <Link href="/learn/m1-what-is-programming" className="btn-primary mt-5"><T k="Start learning" />{" "}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
