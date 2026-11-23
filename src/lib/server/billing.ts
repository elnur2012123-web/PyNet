import "server-only";
import crypto from "node:crypto";
import type { BillingInterval, Plan } from "@/lib/plans";

/**
 * Lemon Squeezy integration (merchant of record — handles global card
 * payments, tax/VAT and supports payouts to Uzbekistan).
 * Paid features are only activated by verified webhooks (see /api/billing/webhook).
 */
const API = "https://api.lemonsqueezy.com/v1";

const VARIANTS: Record<string, { plan: Exclude<Plan, "FREE">; interval: BillingInterval }> = {};
function loadVariants() {
  const pairs: [string | undefined, Exclude<Plan, "FREE">, BillingInterval][] = [
    [process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY, "PRO", "month"],
    [process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY, "PRO", "year"],
    [process.env.LEMONSQUEEZY_VARIANT_MAX_MONTHLY, "MAX", "month"],
    [process.env.LEMONSQUEEZY_VARIANT_MAX_YEARLY, "MAX", "year"],
  ];
  for (const [id, plan, interval] of pairs) if (id) VARIANTS[id] = { plan, interval };
  return VARIANTS;
}

export function isPaymentsConfigured() {
  return Boolean(
    process.env.LEMONSQUEEZY_API_KEY &&
      process.env.LEMONSQUEEZY_STORE_ID &&
      process.env.LEMONSQUEEZY_WEBHOOK_SECRET &&
      process.env.LEMONSQUEEZY_VARIANT_PRO_MONTHLY &&
      process.env.LEMONSQUEEZY_VARIANT_PRO_YEARLY &&
      process.env.LEMONSQUEEZY_VARIANT_MAX_MONTHLY &&
      process.env.LEMONSQUEEZY_VARIANT_MAX_YEARLY,
  );
}

export function variantFor(plan: Exclude<Plan, "FREE">, interval: BillingInterval): string | null {
  const v = loadVariants();
  return Object.keys(v).find((id) => v[id].plan === plan && v[id].interval === interval) ?? null;
}
export const planForVariant = (variantId: string | number) => loadVariants()[String(variantId)] ?? null;

async function ls(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.errors?.[0]?.detail ?? `Lemon Squeezy error ${res.status}`);
  return body;
}

export async function createCheckout(opts: { userId: string; email?: string; plan: Exclude<Plan, "FREE">; interval: BillingInterval; siteUrl: string }) {
  const variant = variantFor(opts.plan, opts.interval);
  if (!variant) throw new Error("Plan variant is not configured");
  const body = await ls("/checkouts", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: { email: opts.email, custom: { user_id: opts.userId } },
          product_options: { redirect_url: `${opts.siteUrl}/billing?checkout=success` },
        },
        relationships: {
          store: { data: { type: "stores", id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: "variants", id: variant } },
        },
      },
    }),
  });
  return body.data.attributes.url as string;
}

export async function changeProviderPlan(subscriptionId: string, plan: Exclude<Plan, "FREE">, interval: BillingInterval) {
  const variant = variantFor(plan, interval);
  if (!variant) throw new Error("Plan variant is not configured");
  await ls(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: { type: "subscriptions", id: subscriptionId, attributes: { variant_id: Number(variant) } } }),
  });
}

export async function cancelProviderSubscription(subscriptionId: string) {
  await ls(`/subscriptions/${subscriptionId}`, { method: "DELETE" });
}

export async function resumeProviderSubscription(subscriptionId: string) {
  await ls(`/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: JSON.stringify({ data: { type: "subscriptions", id: subscriptionId, attributes: { cancelled: false } } }),
  });
}

/** Constant-time HMAC-SHA256 check of the X-Signature header. */
export function verifyWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
