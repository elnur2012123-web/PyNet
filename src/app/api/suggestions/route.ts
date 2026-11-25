import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getLocale } from "@/i18n/server";

export const dynamic = "force-dynamic";
const CATEGORIES = new Set(["idea", "bug", "lesson", "translation", "other"]);

/** My suggestions (newest first), with the team's status and reply. */
export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) return error("Sign in", 401);
  const { data } = await ctx.supabase.from("suggestions").select("id, category, message, status, staff_reply, created_at").order("created_at", { ascending: false }).limit(30);
  return json({ suggestions: data ?? [] });
}

/** Send a suggestion. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const ctx = await getUserContext();
  if (!ctx) return error("Sign in to send suggestions.", 401);
  const body = await readJson<{ category?: string; message?: string; page?: string }>(req);
  const category = String(body?.category ?? "");
  const message = String(body?.message ?? "").trim().slice(0, 2000);
  if (!CATEGORIES.has(category)) return error("Pick a category.");
  if (message.length < 5) return error("Please write a little more.");
  const limit = rateLimit(`suggest:${ctx.user.id}`, 5, 3_600_000);
  if (!limit.ok) return error("You've sent a lot of suggestions this hour — thank you! Please try again later.", 429);
  const admin = getAdminSupabase();
  if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
  const { data: banned } = await admin.rpc("is_banned", { p_user: ctx.user.id });
  if (banned) return error("Your account is suspended.", 403);
  const { data, error: e } = await admin.from("suggestions").insert({
    user_id: ctx.user.id, category, message, page: String(body?.page ?? "").slice(0, 200) || null, language: await getLocale(),
  }).select("id").single();
  if (e || !data) return error("Could not send. Please try again.", 500);
  return json({ id: data.id });
}
