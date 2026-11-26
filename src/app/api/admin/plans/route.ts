import { getStaff } from "@/lib/server/moderation";
import { effectivePlan, type SubscriptionRow } from "@/lib/server/user";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { addPeriods } from "@/lib/server/periods";

export const dynamic = "force-dynamic";

/**
 * Manual plans: staff with "give_plans" give a user Pro or Max for some months or years
 * (for payments made outside the site). Stored as a non-renewing subscription with
 * payment_provider = 'manual', so it switches back to Free by itself when it runs out.
 */
const SUB_FIELDS = "plan,status,billing_interval,current_period_start,current_period_end,cancel_at_period_end,provider_subscription_id,portal_url,update_payment_url,payment_provider";
type Sub = SubscriptionRow & { payment_provider: string | null; current_period_start: string | null };

async function staffOrError() {
  const staff = await getStaff();
  if (!staff) return { staff: null, fail: error("Staff only", 403) };
  if (!staff.can("give_plans")) return { staff: null, fail: error("Your role can't give plans.", 403) };
  return { staff, fail: null };
}


/** Everyone who has a manual plan right now. */
export async function GET() {
  const { staff, fail } = await staffOrError();
  if (!staff) return fail;
  await staff.admin.rpc("expire_manual_plans").then(() => null, () => null);
  const { data } = await staff.admin.from("subscriptions")
    .select("user_id, plan, billing_interval, current_period_start, current_period_end")
    .eq("payment_provider", "manual").neq("plan", "FREE").gt("current_period_end", new Date().toISOString())
    .order("current_period_end", { ascending: true }).limit(200);
  const rows = (data ?? []) as { user_id: string; plan: string; billing_interval: string; current_period_start: string; current_period_end: string }[];
  const { data: profs } = rows.length ? await staff.admin.from("profiles").select("id, username").in("id", rows.map((r) => r.user_id)) : { data: [] };
  const names = new Map(((profs ?? []) as { id: string; username: string }[]).map((p) => [p.id, p.username]));
  return json({
    grants: rows.map((r) => ({ username: names.get(r.user_id) ?? "?", plan: r.plan, interval: r.billing_interval, from: r.current_period_start, until: r.current_period_end })),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const { staff, fail } = await staffOrError();
  if (!staff) return fail;
  const { admin, user } = staff;
  const body = await readJson<{ action?: string; username?: string; plan?: string; interval?: string; count?: number }>(req, 10_000);
  if (!body) return error("Invalid request");

  const username = String(body.username ?? "").trim().replace(/^@/, "");
  if (!username) return error("Type a username.");
  const { data: prof } = await admin.from("profiles").select("id, username").eq("username", username).maybeSingle();
  if (!prof) return error(`No user called @${username}.`, 404);
  const { data: subRow } = await admin.from("subscriptions").select(SUB_FIELDS).eq("user_id", prof.id).maybeSingle();
  const sub = subRow as Sub | null;
  const current = effectivePlan(sub);
  const manual = sub?.payment_provider === "manual";
  const info = { username: prof.username, plan: current, manual, until: current !== "FREE" ? sub?.current_period_end ?? null : null, renews: current !== "FREE" && !manual && !sub?.cancel_at_period_end };

  if (body.action === "lookup") return json(info);

  // Never overwrite a subscription someone is paying for through the payment provider.
  const paidElsewhere = current !== "FREE" && !manual;

  if (body.action === "give") {
    const plan = body.plan === "MAX" ? "MAX" : body.plan === "PRO" ? "PRO" : null;
    const interval = body.interval === "year" ? "year" : body.interval === "month" ? "month" : null;
    const count = Math.trunc(Number(body.count ?? 1));
    if (!plan || !interval) return error("Choose Pro or Max, and a month or a year.");
    if (!(count >= 1 && count <= (interval === "year" ? 5 : 24))) return error(interval === "year" ? "Give 1 to 5 years." : "Give 1 to 24 months.");
    if (paidElsewhere) return error(`@${prof.username} already pays for ${current} through the payment provider. Cancel that first.`);

    const now = new Date();
    // Same plan still running: extend it. Different plan: start the new one today.
    const stillRunning = manual && current === plan && sub?.current_period_end && new Date(sub.current_period_end) > now;
    const start = stillRunning ? new Date(sub!.current_period_end!) : now;
    const end = addPeriods(start, interval, count);
    const row = {
      user_id: prof.id, plan, status: "cancelled", billing_interval: interval, payment_provider: "manual",
      cancel_at_period_end: true, provider_customer_id: null, provider_subscription_id: null, provider_variant_id: null,
      portal_url: null, update_payment_url: null,
      current_period_start: stillRunning ? sub!.current_period_start ?? now.toISOString() : now.toISOString(),
      current_period_end: end.toISOString(),
    };
    const { error: e } = await admin.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (e) return error("Could not save the plan.", 500);
    const what = `${plan === "MAX" ? "Max" : "Pro"} for ${count} ${interval}${count > 1 ? "s" : ""}`;
    await Promise.all([
      admin.from("billing_events").insert({ user_id: prof.id, description: `${what}, given by PyNest staff`, status: "manual" }),
      admin.from("moderation_log").insert({ actor_id: user.id, action: "plan_give", details: `@${prof.username}: ${what} → until ${end.toISOString().slice(0, 10)}${stillRunning ? " (extended)" : ""}` }),
    ]).catch(() => null);
    return json({ ...info, plan, manual: true, until: end.toISOString(), extended: Boolean(stillRunning) });
  }

  if (body.action === "remove") {
    if (current === "FREE") return error(`@${prof.username} is already on Free.`);
    if (paidElsewhere) return error(`@${prof.username} pays through the payment provider; that can't be removed here.`);
    const { error: e } = await admin.from("subscriptions").update({
      plan: "FREE", status: "active", billing_interval: null, cancel_at_period_end: false, current_period_end: null, current_period_start: null,
    }).eq("user_id", prof.id);
    if (e) return error("Could not remove the plan.", 500);
    await Promise.all([
      admin.from("billing_events").insert({ user_id: prof.id, description: `${current === "MAX" ? "Max" : "Pro"} removed by PyNest staff`, status: "manual" }),
      admin.from("moderation_log").insert({ actor_id: user.id, action: "plan_remove", details: `@${prof.username}: ${current} → Free` }),
    ]).catch(() => null);
    return json({ ...info, plan: "FREE", manual: false, until: null });
  }

  return error("Unknown action");
}
