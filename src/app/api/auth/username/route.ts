import { getServerSupabase } from "@/lib/supabase/server";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { error, json } from "@/lib/server/http";

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams.get("u") ?? "";
  if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return json({ available: false, reason: "3–20 letters, numbers or underscores" });
  if (!rateLimit(`uname:${clientIp(req)}`, 30, 60_000).ok) return error("Slow down", 429);
  const supabase = await getServerSupabase();
  if (!supabase) return error("Not configured", 503);
  const { data, error: e } = await supabase.rpc("username_available", { p_username: u });
  if (e) return error("Could not check username", 500);
  return json({ available: Boolean(data) });
}
