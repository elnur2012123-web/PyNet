"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useToast } from "@/components/ui/Toast";
import type { BillingInterval, Plan } from "@/lib/plans";

export function usePaymentsStatus() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  useEffect(() => { fetch("/api/billing/status").then((r) => r.json()).then((d) => setConfigured(Boolean(d.configured))).catch(() => setConfigured(false)); }, []);
  return configured;
}

/** Start checkout (new subscriber) or change plan (existing subscriber). Never fakes success. */
export function usePlanActions() {
  const p = useProgress();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const choose = async (plan: Exclude<Plan, "FREE">, interval: BillingInterval) => {
    if (p.mode !== "account") { router.push(`/signup?next=/pricing`); return; }
    setBusy(`${plan}-${interval}`);
    try {
      const hasSub = p.plan !== "FREE" && p.subscription?.provider_subscription_id;
      const res = await fetch(hasSub ? "/api/billing/change" : "/api/billing/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, interval }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { toast({ kind: d.demo ? "info" : "error", title: d.demo ? "Payments not configured" : "Could not continue", body: d.error }); return; }
      if (d.url) { window.location.href = d.url; return; }
      toast({ kind: "info", title: "Change requested", body: "Your plan will update as soon as the payment provider confirms it." });
      setTimeout(() => p.refresh(), 4000);
    } finally {
      setBusy(null);
    }
  };
  return { choose, busy };
}
