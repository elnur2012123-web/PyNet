import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { cancelProviderSubscription } from "@/lib/server/billing";

/** Permanently delete the account. All rows cascade from auth.users. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const ctx = await getUserContext();
  if (!ctx) return error("Not signed in", 401);
  const body = await readJson<{ confirm?: string }>(req);
  if (body?.confirm !== "DELETE") return error('Type "DELETE" to confirm');
  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);

  if (ctx.subscription?.provider_subscription_id && ctx.plan !== "FREE") {
    await cancelProviderSubscription(ctx.subscription.provider_subscription_id).catch(() => null);
  }
  const { data: files } = await admin.storage.from("avatars").list(ctx.user.id);
  if (files?.length) await admin.storage.from("avatars").remove(files.map((f) => `${ctx.user.id}/${f.name}`));
  const { error: e } = await admin.auth.admin.deleteUser(ctx.user.id);
  if (e) return error("Could not delete the account. Please contact support.", 500);
  await ctx.supabase.auth.signOut();
  return json({ ok: true });
}
