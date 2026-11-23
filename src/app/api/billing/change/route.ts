import { getUserContext } from "@/lib/server/user";
import { changeProviderPlan, isPaymentsConfigured, resumeProviderSubscription } from "@/lib/server/billing";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";

/** Upgrade/downgrade (or resume) an existing subscription. The webhook updates our DB. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  if (!isPaymentsConfigured()) return error("Payments are not configured on this deployment yet.", 503, { demo: true });
  const ctx = await getUserContext();
  if (!ctx) return error("Please sign in first", 401);
  const subId = ctx.subscription?.provider_subscription_id;
  if (!subId) return error("No active subscription to change", 400);
  const body = await readJson<{ plan?: string; interval?: string; resume?: boolean }>(req);
  try {
    if (body?.resume) {
      await resumeProviderSubscription(subId);
      return json({ ok: true, pending: true });
    }
    const plan = body?.plan === "PRO" || body?.plan === "MAX" ? body.plan : null;
    const interval = body?.interval === "year" ? "year" : "month";
    if (!plan) return error("Invalid plan");
    await changeProviderPlan(subId, plan, interval);
    return json({ ok: true, pending: true });
  } catch {
    return error("The payment provider rejected the change. Please try again or contact support.", 502);
  }
}
