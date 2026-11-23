import { getUserContext } from "@/lib/server/user";
import { cancelProviderSubscription, isPaymentsConfigured } from "@/lib/server/billing";
import { error, json, sameOrigin } from "@/lib/server/http";

/** Cancels at the end of the current period; the webhook records the new status. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  if (!isPaymentsConfigured()) return error("Payments are not configured on this deployment yet.", 503, { demo: true });
  const ctx = await getUserContext();
  if (!ctx) return error("Please sign in first", 401);
  const subId = ctx.subscription?.provider_subscription_id;
  if (!subId) return error("No active subscription", 400);
  try {
    await cancelProviderSubscription(subId);
    return json({ ok: true, pending: true });
  } catch {
    return error("Could not cancel right now. Please try again.", 502);
  }
}
