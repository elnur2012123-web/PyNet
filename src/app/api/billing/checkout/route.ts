import { getUserContext } from "@/lib/server/user";
import { createCheckout, isPaymentsConfigured } from "@/lib/server/billing";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { SITE_URL } from "@/lib/env";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  if (!isPaymentsConfigured()) return error("Payments are not configured on this deployment yet.", 503, { demo: true });
  const ctx = await getUserContext();
  if (!ctx) return error("Please sign in first", 401);
  const body = await readJson<{ plan?: string; interval?: string }>(req);
  const plan = body?.plan === "PRO" || body?.plan === "MAX" ? body.plan : null;
  const interval = body?.interval === "year" ? "year" : body?.interval === "month" ? "month" : null;
  if (!plan || !interval) return error("Invalid plan");
  if (ctx.plan !== "FREE" && ctx.subscription?.provider_subscription_id) {
    return error("You already have a subscription — change plans from the Billing page.", 409);
  }
  try {
    const url = await createCheckout({ userId: ctx.user.id, email: ctx.user.email, plan, interval, siteUrl: SITE_URL });
    return json({ url });
  } catch {
    return error("Could not start checkout. Please try again.", 502);
  }
}
