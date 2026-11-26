import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json } from "@/lib/server/http";

/** Daily leaderboard snapshot (Vercel Cron). Protected by CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return error("Unauthorized", 401);
  const admin = getAdminSupabase();
  if (!admin) return error("Not configured", 503);
  await admin.rpc("expire_manual_plans").then(() => null, () => null);
  const { error: e } = await admin.rpc("snapshot_leaderboards");
  if (e) return error(e.message, 500);
  return json({ ok: true });
}
