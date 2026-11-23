import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";

/**
 * Sign in with email OR username. Usernames are resolved to the account email
 * on the server, so emails are never exposed to the browser.
 * "Remember me" off => session cookies that end when the browser closes.
 */
export async function POST(req: Request) {
  if (!isSupabaseConfigured) return error("Authentication is not configured", 503);
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const limited = rateLimit(`signin:${clientIp(req)}`, 10, 60_000);
  if (!limited.ok) return error(`Too many attempts. Try again in ${limited.retryAfter}s.`, 429);

  const body = await readJson<{ identifier?: string; password?: string; remember?: boolean }>(req);
  const identifier = body?.identifier?.trim() ?? "";
  const password = body?.password ?? "";
  if (!identifier || !password) return error("Enter your email or username and password.");

  let email = identifier;
  if (!identifier.includes("@")) {
    const admin = getAdminSupabase();
    if (!admin) return error("Username sign-in needs SUPABASE_SERVICE_ROLE_KEY on the server. Use your email instead.", 500);
    const { data: profile } = await admin.from("profiles").select("id").eq("username", identifier).maybeSingle();
    if (!profile) return error("Incorrect username/email or password.", 401);
    const { data: u } = await admin.auth.admin.getUserById(profile.id);
    if (!u?.user?.email) return error("Incorrect username/email or password.", 401);
    email = u.user.email;
  }

  const remember = body?.remember !== false;
  const cookieStore = await cookies();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) =>
        list.forEach(({ name, value, options }) => {
          const opts = { ...options };
          if (!remember) {
            delete opts.maxAge;
            delete opts.expires;
          }
          cookieStore.set(name, value, opts);
        }),
    },
  });
  const { error: e } = await supabase.auth.signInWithPassword({ email, password });
  if (e) {
    if (/confirm/i.test(e.message)) return error("Please verify your email first — check your inbox for the confirmation link.", 403, { unverified: true });
    return error("Incorrect username/email or password.", 401);
  }
  return json({ ok: true });
}
