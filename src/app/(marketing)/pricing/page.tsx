"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useState } from "react";
import { Check, ChevronDown, Minus, Sparkles } from "lucide-react";
import { COMPARISON, PLANS, PLAN_ORDER, yearlySavings, type BillingInterval } from "@/lib/plans";
import { useProgress } from "@/components/providers/ProgressProvider";
import { usePaymentsStatus, usePlanActions } from "@/components/billing/usePlanActions";
import { Notice, Spinner } from "@/components/ui/States";

const FAQ = [
  ["Can I use PyNest for free?", "Yes. The Free plan includes the full beginner-to-intermediate curriculum, the browser Python editor, quizzes, the leaderboard, 8 credited exercises per day and 15 PyBuddy messages per day — forever, no card required."],
  ["Can I cancel anytime?", "Yes. Cancel from the Billing page in one click. You keep your paid features until the end of the period you already paid for, and you won't be charged again."],
  ["What happens when my subscription expires?", "Your account moves back to Free. You never lose earned XP, achievements, completed lessons, saved progress or leaderboard history — only paid features (extra AI messages, Hard challenges, premium projects, unlimited snippets, themes) are locked again."],
  ["Can I upgrade from Pro to Max?", "Yes. Choose Max on this page or on the Billing page. The payment provider prorates the difference automatically. You can also downgrade the same way."],
  ["Do unused AI messages roll over?", "No. PyBuddy allowances are daily and reset at 00:00 UTC. They're fair-use limits that keep the service fast and affordable for everyone."],
  ["Are subscriptions automatically renewed?", "Yes, monthly or yearly plans renew automatically until you cancel. You'll see the next billing date on the Billing page, and receipts are emailed by our payment provider."],
];

export default function PricingPage() {
  const tx = useT();
  const p = useProgress();
  const [interval, setInterval] = useState<BillingInterval>("year");
  const configured = usePaymentsStatus();
  const { choose, busy } = usePlanActions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="eyebrow"><T k="Pricing" /></p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight"><T k="Affordable plans for every learner" /></h1>
        <p className="mx-auto mt-3 max-w-xl text-muted"><T k="Start free. Upgrade when you want more AI help, harder challenges and full projects. Students pay the same low price everywhere." /></p>
        <div className="mt-7 inline-flex rounded-xl border border-border bg-surface p-1" role="radiogroup" aria-label={tx("Billing interval")}>
          {(["month", "year"] as const).map((i) => (
            <button key={i} role="radio" aria-checked={interval === i} onClick={() => setInterval(i)} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${interval === i ? "bg-accent text-white" : "text-muted"}`}>
              {i === "month" ? tx("Monthly") : tx("Yearly")} {i === "year" && <span className={`ml-1 text-xs ${interval === i ? "text-white/80" : "text-success"}`}><T k="2 months free" /></span>}
            </button>
          ))}
        </div>
      </div>

      {configured === false && (
        <div className="mx-auto mt-8 max-w-2xl"><Notice kind="warn" title={tx("Demo mode")}><T k="Payments are not configured on this deployment, so upgrades are disabled. No payment will be simulated." /></Notice></div>
      )}

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = interval === "month" ? plan.monthly : plan.yearly;
          const save = yearlySavings(plan.monthly, plan.yearly);
          const current = p.mode === "account" && p.plan === plan.id;
          const lower = p.mode === "account" && PLAN_ORDER[plan.id] < PLAN_ORDER[p.plan];
          return (
            <div key={plan.id} className={`card relative flex flex-col p-6 ${plan.highlight ? "ring-2 ring-accent lg:-my-3 lg:py-9" : ""}`}>
              {plan.highlight && <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white"><Sparkles className="h-3 w-3" /> <T k="Recommended" /></span>}
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-bold tracking-widest ${plan.id === "MAX" ? "text-accent2" : plan.id === "PRO" ? "text-accent" : ""}`}>{plan.name.toUpperCase()}</h2>
                {current && <span className="chip border-success/40 text-success"><T k="Current plan" /></span>}
              </div>
              <p className="mt-4 flex items-end gap-1">
                <span className="text-4xl font-semibold tracking-tight">${price}</span>
                <span className="mb-1 text-sm text-muted">{tx(plan.id === "FREE" ? "forever" : interval === "month" ? "/ month" : "/ year")}</span>
              </p>
              <p className="mt-1 h-5 text-xs text-success">
                {plan.id !== "FREE" && interval === "year" ? tx("Save ${amount} ({pct}%) vs monthly · ${perMonth}/mo", { amount: save.amount, pct: save.pct, perMonth: (plan.yearly / 12).toFixed(2) }) : plan.id !== "FREE" ? tx("or ${yearly}/year", { yearly: plan.yearly }) + `` : ""}
              </p>
              <p className="mt-3 text-sm text-muted">{tx(plan.tagline)}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => <li key={f} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{tx(f)}</li>)}
              </ul>
              <div className="mt-7">
                {plan.id === "FREE" ? (
                  current || p.mode === "account" ? <button disabled className="btn-secondary w-full">{current ? tx("Your plan") : tx("Included")}</button>
                    : <Link href={p.authConfigured ? "/signup" : "/dashboard"} className="btn-secondary w-full"><T k="Start free" /></Link>
                ) : current ? (
                  <Link href="/billing" className="btn-secondary w-full"><T k="Manage plan" /></Link>
                ) : (
                  <button onClick={() => choose(plan.id as "PRO" | "MAX", interval)} disabled={configured === false || busy !== null} className={plan.highlight ? "btn-primary w-full" : "btn-secondary w-full"}>
                    {busy === `${plan.id}-${interval}` && <Spinner />}{lower ? tx("Switch to {plan}", { plan: plan.name }) : p.mode === "account" ? tx("Upgrade to {plan}", { plan: plan.name }) : tx("Get {plan}", { plan: plan.name })}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-xs text-muted"><T k="Prices in USD. Taxes may apply depending on your country. Payments are processed securely by Lemon Squeezy; PyNest never sees your card details. AI allowances are daily fair-use limits." /></p>

      <section className="mt-20">
        <h2 className="text-center text-2xl font-semibold tracking-tight"><T k="Compare plans" /></h2>
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead><tr className="border-b border-border"><th className="px-5 py-4 text-left font-semibold"><T k="Feature" /></th>{PLANS.map((pl) => <th key={pl.id} className="px-5 py-4 text-center font-semibold">{pl.name}</th>)}</tr></thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">{tx(row.feature)}</td>
                  {row.values.map((v, i) => <td key={i} className="px-5 py-3 text-center">{v === "✓" ? <Check className="mx-auto h-4 w-4 text-success" aria-label={tx("Included")} /> : v === "—" ? <Minus className="mx-auto h-4 w-4 text-muted" aria-label={tx("Not included")} /> : <span className={i === 2 ? "text-accent2" : i === 1 ? "text-accent" : ""}>{tx(v)}</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight"><T k="Frequently asked questions" /></h2>
        <div className="mt-8 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="card-flat group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">{tx(q)}<ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" /></summary>
              <p className="mt-3 text-sm leading-6 text-muted">{tx(a)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
