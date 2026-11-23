"use client";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, CreditCard, ExternalLink, Receipt } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { usePaymentsStatus, usePlanActions } from "@/components/billing/usePlanActions";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { EmptyState, Notice, Spinner } from "@/components/ui/States";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { AI_DAILY_LIMIT, PLANS, type BillingInterval } from "@/lib/plans";

interface BillingEvent { id: string; description: string; amount_formatted: string | null; status: string | null; invoice_url: string | null; created_at: string }

function BillingInner() {
  const p = useProgress();
  const toast = useToast();
  const configured = usePaymentsStatus();
  const { choose, busy } = usePlanActions();
  const params = useSearchParams();
  const [events, setEvents] = useState<BillingEvent[] | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [cycle, setCycle] = useState<BillingInterval>("month");
  const sub = p.subscription;

  useEffect(() => {
    if (p.mode !== "account") return;
    getBrowserSupabase()?.from("billing_events").select("id,description,amount_formatted,status,invoice_url,created_at").order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setEvents((data ?? []) as BillingEvent[]));
  }, [p.mode]);

  // After checkout, the webhook may take a few seconds: poll a few times.
  useEffect(() => {
    if (params.get("checkout") !== "success") return;
    toast({ kind: "info", title: "Payment received — confirming…", body: "Your plan activates as soon as the payment provider confirms it." });
    let n = 0;
    const t = setInterval(() => { n++; p.refresh(); if (n >= 6) clearInterval(t); }, 4000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (sub?.billing_interval) setCycle(sub.billing_interval); }, [sub?.billing_interval]);

  if (p.ready && p.mode !== "account") {
    return <EmptyState icon={<CreditCard className="h-8 w-8" />} title="Sign in to manage billing" action={p.authConfigured ? <Link href="/signin?next=/billing" className="btn-primary btn-sm">Sign in</Link> : undefined} body={p.authConfigured ? undefined : "Accounts are not configured on this deployment."} />;
  }

  const post = async (url: string, body?: object) => {
    setWorking(true);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
    const d = await res.json().catch(() => ({}));
    setWorking(false);
    if (!res.ok) toast({ kind: "error", title: "Could not update subscription", body: d.error });
    else { toast({ kind: "info", title: "Request sent", body: "Changes appear here once the payment provider confirms them." }); setTimeout(() => p.refresh(), 4000); }
    return res.ok;
  };

  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end).toLocaleDateString(undefined, { dateStyle: "long" }) : null;
  const paid = p.plan !== "FREE";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="h1">Billing & plan</h1>
      {configured === false && <Notice kind="warn" title="Demo mode">Payments are not configured on this deployment (missing Lemon Squeezy credentials). Plan changes are disabled — nothing is simulated.</Notice>}

      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Current plan</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold">{PLANS.find((x) => x.id === p.plan)?.name} <PlanBadge plan={p.plan} /></p>
            <p className="mt-1 text-sm text-muted">{paid ? `Billed ${sub?.billing_interval === "year" ? "yearly" : "monthly"} · status: ${sub?.status}` : "Free forever"} · {AI_DAILY_LIMIT[p.plan]} PyBuddy messages/day</p>
          </div>
          {paid && periodEnd && (
            <div className="rounded-xl bg-elevated/70 px-4 py-3 text-sm">
              <p className="flex items-center gap-1.5 text-muted"><CalendarClock className="h-4 w-4" /> {sub?.cancel_at_period_end ? "Access ends on" : "Next billing date"}</p>
              <p className="font-semibold">{periodEnd}</p>
            </div>
          )}
        </div>
        {sub?.status === "past_due" && <div className="mt-4"><Notice kind="warn">Your last payment failed. Update your payment method to keep your plan.</Notice></div>}
        {sub?.cancel_at_period_end && paid && (
          <div className="mt-4"><Notice>Your subscription is cancelled and won't renew. You keep {p.plan} until {periodEnd}. Your XP and progress are always kept.</Notice></div>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {paid && sub?.update_payment_url && <a href={sub.update_payment_url} target="_blank" rel="noreferrer" className="btn-secondary btn-sm"><CreditCard className="h-3.5 w-3.5" /> Update payment method</a>}
          {paid && sub?.portal_url && <a href={sub.portal_url} target="_blank" rel="noreferrer" className="btn-secondary btn-sm"><ExternalLink className="h-3.5 w-3.5" /> Customer portal</a>}
          {paid && !sub?.cancel_at_period_end && <button onClick={() => setCancelOpen(true)} disabled={!configured || working} className="btn-ghost btn-sm text-danger">Cancel subscription</button>}
          {paid && sub?.cancel_at_period_end && <button onClick={() => post("/api/billing/change", { resume: true })} disabled={!configured || working} className="btn-primary btn-sm">{working && <Spinner />} Resume subscription</button>}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">{paid ? "Change plan" : "Upgrade"}</h2>
          <div className="inline-flex rounded-lg border border-border p-0.5 text-xs">
            {(["month", "year"] as const).map((i) => <button key={i} onClick={() => setCycle(i)} className={`rounded-md px-3 py-1 ${cycle === i ? "bg-accent text-white" : "text-muted"}`}>{i === "month" ? "Monthly" : "Yearly"}</button>)}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PLANS.filter((x) => x.id !== "FREE").map((pl) => {
            const current = p.plan === pl.id && sub?.billing_interval === cycle;
            return (
              <div key={pl.id} className={`rounded-2xl border p-4 ${current ? "border-accent" : "border-border"}`}>
                <p className="flex items-center gap-2 font-semibold">{pl.name} <PlanBadge plan={pl.id} /></p>
                <p className="mt-1 text-2xl font-semibold">${cycle === "month" ? pl.monthly : pl.yearly}<span className="text-sm font-normal text-muted">/{cycle}</span></p>
                <p className="mt-1 text-xs text-muted">{pl.tagline}</p>
                <button onClick={() => choose(pl.id as "PRO" | "MAX", cycle)} disabled={current || !configured || busy !== null} className="btn-primary btn-sm mt-3 w-full">
                  {busy === `${pl.id}-${cycle}` && <Spinner />}{current ? "Current plan" : paid ? (pl.id === "MAX" && p.plan === "PRO" ? "Upgrade" : p.plan === "MAX" && pl.id === "PRO" ? "Downgrade" : "Switch") : "Upgrade"}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">Changes are prorated by the payment provider. Paid features activate only after the provider confirms payment.</p>
      </section>

      <section className="card p-6">
        <h2 className="flex items-center gap-2 font-semibold"><Receipt className="h-4 w-4" /> Billing history</h2>
        {events === null ? <div className="py-6"><Spinner /></div> : events.length === 0 ? <p className="mt-3 text-sm text-muted">No payments yet.</p> : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <span className="flex-1">{e.description}<br /><span className="text-xs text-muted">{new Date(e.created_at).toLocaleDateString()}</span></span>
                <span className="chip">{e.status}</span>
                <span className="w-20 text-right font-medium">{e.amount_formatted}</span>
                {e.invoice_url && <a href={e.invoice_url} target="_blank" rel="noreferrer" className="link text-xs">Invoice</a>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel subscription?">
        <p className="text-sm">You'll keep {p.plan} until {periodEnd ?? "the end of your billing period"}, then move to Free. Your XP, achievements, lessons and leaderboard history are never removed.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={() => setCancelOpen(false)} className="btn-secondary">Keep plan</button>
          <button onClick={async () => { if (await post("/api/billing/cancel")) setCancelOpen(false); }} disabled={working} className="btn-danger">{working && <Spinner />} Cancel subscription</button>
        </div>
      </Modal>
    </div>
  );
}

export default function BillingPage() {
  return <Suspense><BillingInner /></Suspense>;
}
