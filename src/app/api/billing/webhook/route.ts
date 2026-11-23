import { getAdminSupabase } from "@/lib/supabase/admin";
import { planForVariant, verifyWebhookSignature } from "@/lib/server/billing";
import { error, json } from "@/lib/server/http";

export const runtime = "nodejs";

interface LsEvent {
  meta: { event_name: string; custom_data?: { user_id?: string }; webhook_id?: string };
  data: { id: string; type: string; attributes: Record<string, unknown> };
}

/**
 * Lemon Squeezy webhook. The ONLY place where paid plans are granted.
 * Signature is verified with LEMONSQUEEZY_WEBHOOK_SECRET before anything else.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-signature"))) return error("Invalid signature", 401);
  const admin = getAdminSupabase();
  if (!admin) return error("Not configured", 503);

  let event: LsEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return error("Bad payload");
  }
  const name = event.meta.event_name;
  const a = event.data.attributes;

  async function resolveUser(subscriptionId?: string) {
    const fromMeta = event.meta.custom_data?.user_id;
    if (fromMeta) return fromMeta;
    if (!subscriptionId) return null;
    const { data } = await admin!.from("subscriptions").select("user_id").eq("provider_subscription_id", subscriptionId).maybeSingle();
    return data?.user_id ?? null;
  }

  if (event.data.type === "subscriptions") {
    const userId = await resolveUser(event.data.id);
    if (!userId) return json({ ignored: "unknown user" });
    const variant = planForVariant(a.variant_id as number);
    if (!variant) return json({ ignored: "unknown variant" });
    const urls = (a.urls ?? {}) as Record<string, string | undefined>;
    const status = String(a.status);
    const row = {
      user_id: userId,
      plan: status === "expired" ? "FREE" : variant.plan,
      status,
      billing_interval: variant.interval,
      payment_provider: "lemonsqueezy",
      provider_customer_id: String(a.customer_id ?? ""),
      provider_subscription_id: event.data.id,
      provider_variant_id: String(a.variant_id),
      cancel_at_period_end: Boolean(a.cancelled),
      portal_url: urls.customer_portal ?? null,
      update_payment_url: urls.update_payment_method ?? null,
      current_period_start: (a.created_at as string) ?? null,
      current_period_end: ((a.renews_at as string) || (a.ends_at as string)) ?? null,
    };
    const { error: e } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (e) return error("DB error", 500);
    return json({ ok: true, event: name });
  }

  if (event.data.type === "subscription-invoices") {
    const userId = await resolveUser(String(a.subscription_id ?? ""));
    if (!userId) return json({ ignored: "unknown user" });
    const urls = (a.urls ?? {}) as Record<string, string | undefined>;
    await admin.from("billing_events").upsert(
      {
        user_id: userId,
        provider_event_id: `invoice_${event.data.id}`,
        description: name === "subscription_payment_success" ? "Subscription payment" : name.replace(/_/g, " "),
        amount_formatted: (a.total_formatted as string) ?? null,
        status: String(a.status ?? ""),
        invoice_url: urls.invoice_url ?? null,
        created_at: (a.created_at as string) ?? new Date().toISOString(),
      },
      { onConflict: "provider_event_id" },
    );
    return json({ ok: true, event: name });
  }

  return json({ ignored: name });
}
