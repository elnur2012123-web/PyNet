import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Code2, Flame, Gauge, Layers, MessageSquareCode, Play, Sparkles, Target, Trophy, Zap } from "lucide-react";
import { getCatalog } from "@/content/server";
import { HighlightedCode } from "@/components/editor/CodeBlock";
import { Icon } from "@/components/ui/Icon";

const HERO_CODE = `# Your first steps in Python
name = input("What's your name? ")
skills = ["variables", "loops", "functions"]

print(f"Welcome to PyNest, {name}!")
for i, skill in enumerate(skills, start=1):
    print(f"{i}. Learn {skill}")`;

const HERO_OUTPUT = `What's your name? Aziza
Welcome to PyNest, Aziza!
1. Learn variables
2. Learn loops
3. Learn functions`;

export default function Landing() {
  const catalog = getCatalog();
  const lessonCount = catalog.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <>
      {/* ---------------------------------------------------------------- hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(60%_50%_at_70%_0%,rgb(var(--accent)/0.12),transparent),radial-gradient(40%_40%_at_10%_20%,rgb(var(--accent2)/0.10),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fade-up">
            <p className="chip mb-5"><Sparkles className="h-3.5 w-3.5 text-accent2" /> Real Python in your browser · AI tutor included</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[56px]">
              Learn Python.<br /><span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">From Zero to Developer.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Master Python step by step with interactive lessons, real coding exercises, and your personal AI tutor.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/learn/m1-what-is-programming" className="btn-primary px-5 py-3 text-[15px]">Start Learning <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/learn" className="btn-secondary px-5 py-3 text-[15px]">Explore Curriculum</Link>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <div><dt className="text-muted">Modules</dt><dd className="text-2xl font-semibold">{catalog.modules.length}</dd></div>
              <div><dt className="text-muted">Lessons</dt><dd className="text-2xl font-semibold">{lessonCount}</dd></div>
              <div><dt className="text-muted">Challenges</dt><dd className="text-2xl font-semibold">{catalog.exercises.length}</dd></div>
            </dl>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger/70" /><span className="h-3 w-3 rounded-full bg-warn/70" /><span className="h-3 w-3 rounded-full bg-success/70" />
                <span className="ml-2 font-mono text-xs text-muted">main.py</span>
                <Link href="/playground" className="btn-primary btn-sm ml-auto"><Play className="h-3.5 w-3.5" /> Run it live</Link>
              </div>
              <pre className="code-block overflow-x-auto p-5 font-mono text-[13px] leading-6"><code><HighlightedCode code={HERO_CODE} /></code></pre>
              <div className="border-t border-border bg-surface px-5 py-4">
                <p className="mb-1.5 text-xs font-medium text-muted">Output</p>
                <pre className="whitespace-pre-wrap font-mono text-[13px] leading-6 text-fg/90">{HERO_OUTPUT}</pre>
              </div>
            </div>
            <div className="card -mt-6 ml-6 mr-[-8px] hidden p-4 sm:block lg:ml-10">
              <p className="flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-accent" /> PyBuddy</p>
              <p className="mt-1.5 text-sm text-muted">“<span className="font-mono text-fg">enumerate()</span> gives you a counter and each item together — like numbering a shopping list as you read it.”</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- why */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow">Why learn here</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight">Built for people who have never written a line of code.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Sparkles, title: "Beginner-friendly explanations", body: "Plain English, real-life analogies and no jargon without a definition." },
              { icon: Code2, title: "Interactive code editor", body: "Real Python 3 runs right in your browser. No installs, no setup." },
              { icon: Bot, title: "AI-powered tutor", body: "PyBuddy explains code line by line, debugs errors and gives hints — not just answers." },
              { icon: Target, title: "Real coding challenges", body: "Automatic tests check your program's actual output, from Very Easy to Hard." },
              { icon: BarChart3, title: "Progress tracking", body: "XP, streaks, levels, leagues and achievements that reflect what you really learned." },
              { icon: Gauge, title: "Learn at your own pace", body: "Short lessons of 5–10 minutes. Pick up exactly where you left off." },
            ].map((f) => (
              <div key={f.title} className="card-flat p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><f.icon className="h-5 w-5" /></span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- roadmap */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="eyebrow">Learning roadmap</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">From complete beginner to confident Python programmer.</h2>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.modules.map((m) => (
            <li key={m.id}>
              <Link href={`/learn#m${m.number}`} className="card-flat group flex h-full items-start gap-4 p-4 transition hover:border-accent/50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-elevated text-accent"><Icon name={m.icon} className="h-5 w-5" /></span>
                <span className="min-w-0">
                  <span className="text-xs text-muted">Module {m.number} · {m.lessons.length} lessons</span>
                  <span className="block font-medium group-hover:text-accent">{m.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- how it works */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Five steps, repeated until it clicks.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-5">
            {[
              { icon: Layers, t: "Learn a concept", d: "A short, simple explanation." },
              { icon: MessageSquareCode, t: "See examples", d: "Practical code you can run." },
              { icon: Code2, t: "Write your own code", d: "Try it in the live editor." },
              { icon: Target, t: "Complete exercises", d: "Automatic tests check your work." },
              { icon: Trophy, t: "Track your progress", d: "Earn XP, streaks and badges." },
            ].map((s, i) => (
              <div key={s.t} className="relative rounded-2xl border border-border p-5">
                <span className="text-xs font-semibold text-accent">Step {i + 1}</span>
                <s.icon className="mt-3 h-5 w-5 text-muted" />
                <p className="mt-2 font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-muted">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- dashboard preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Your dashboard</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">See exactly where you are — and what to learn next.</h2>
            <p className="mt-4 text-muted">Your dashboard recommends the next lesson, shows your streak, quiz scores and league, and maps your progress through all {catalog.modules.length} modules.</p>
            <Link href="/dashboard" className="btn-secondary mt-6">Open your dashboard <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="card p-5" aria-label="Illustration of the dashboard (example data)">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-semibold">Welcome back 👋</p>
              <span className="chip">Example</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ i: Flame, l: "Streak", v: "5 days" }, { i: Zap, l: "XP", v: "640" }, { i: Trophy, l: "League", v: "Silver" }].map((s) => (
                <div key={s.l} className="rounded-xl bg-elevated p-3"><s.i className="h-4 w-4 text-accent" /><p className="mt-2 text-xs text-muted">{s.l}</p><p className="font-semibold">{s.v}</p></div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-border p-3">
              <p className="text-xs text-muted">Recommended next</p>
              <p className="font-medium">for loops and range()</p>
              <div className="mt-2 h-2 rounded-full bg-elevated"><div className="h-2 w-2/5 rounded-full bg-gradient-to-r from-accent to-accent2" /></div>
            </div>
            <div className="mt-3 grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
              {Array.from({ length: 15 }).map((_, i) => <span key={i} className={`h-6 rounded ${i < 6 ? "bg-accent" : i === 6 ? "bg-accent/40" : "bg-elevated"}`} />)}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-accent2 p-10 text-white sm:p-14">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Your first program is 5 minutes away.</h2>
          <p className="mt-3 max-w-xl text-white/80">Free forever plan. No credit card. No installation.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/learn/m1-what-is-programming" className="btn bg-white px-5 py-3 text-accent hover:bg-white/90">Start the first lesson</Link>
            <Link href="/pricing" className="btn border border-white/40 px-5 py-3 text-white hover:bg-white/10">See plans</Link>
          </div>
        </div>
      </section>
    </>
  );
}
