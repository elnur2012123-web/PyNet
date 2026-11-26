import "server-only";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/supabase/server";
import type { Plan } from "@/lib/plans";

export interface SubscriptionRow {
  plan: Plan;
  status: string;
  billing_interval: "month" | "year" | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider_subscription_id: string | null;
  portal_url: string | null;
  update_payment_url: string | null;
  payment_provider?: string | null;
}

/** Statuses during which paid features stay unlocked. */
const ACTIVE = new Set(["active", "on_trial", "past_due"]);

export function effectivePlan(sub: Pick<SubscriptionRow, "plan" | "status" | "current_period_end"> | null): Plan {
  if (!sub) return "FREE";
  if (ACTIVE.has(sub.status)) return sub.plan;
  // A cancelled subscription keeps its features until the paid period ends.
  if (sub.status === "cancelled" && sub.current_period_end && new Date(sub.current_period_end) > new Date()) return sub.plan;
  return "FREE";
}

export interface UserContext {
  supabase: SupabaseClient;
  user: User;
  plan: Plan;
  subscription: SubscriptionRow | null;
}

/** Authenticated user + their verified plan, read server-side under RLS. */
export async function getUserContext(): Promise<UserContext | null> {
  const auth = await getCurrentUser();
  if (!auth) return null;
  const { data } = await auth.supabase
    .from("subscriptions")
    .select("plan,status,billing_interval,current_period_end,cancel_at_period_end,provider_subscription_id,portal_url,update_payment_url,payment_provider")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  const subscription = (data as SubscriptionRow | null) ?? null;
  return { ...auth, plan: effectivePlan(subscription), subscription };
}
