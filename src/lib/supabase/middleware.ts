import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/**
 * Routes that require a signed-in user (when Supabase is configured).
 * Learning itself needs an account; the home page, pricing, the course
 * overview (/learn), the leaderboard and public profiles stay open.
 */
export const PROTECTED_PREFIXES = [
  "/dashboard", "/learn/", "/practice", "/quizzes", "/playground", "/tutor", "/errors",
  "/achievements", "/onboarding", "/billing", "/friends", "/settings", "/updates", "/admin", "/banned", "/suggest",
];
/** Pages a banned user may still open. */
const BAN_EXEMPT = ["/banned", "/terms", "/privacy", "/auth", "/api"];
/** Auth pages a signed-in user should not see. */
export const AUTH_PAGES = ["/signin", "/signup", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes an expired session token if needed.
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const path = request.nextUrl.pathname;

  if (!user && PROTECTED_PREFIXES.some((p) => (p.endsWith("/") ? path.startsWith(p) : path === p || path.startsWith(p + "/")))) {
    const url = request.nextUrl.clone();
    url.pathname = "/signup";
    url.search = `?next=${encodeURIComponent(path)}`;
    return NextResponse.redirect(url);
  }
  // Banned users can only see the "banned" page (and legal pages / sign-out).
  if (user && !BAN_EXEMPT.some((p) => path === p || path.startsWith(p + "/"))) {
    const { data: mod } = await supabase.rpc("my_moderation");
    const row = Array.isArray(mod) ? mod[0] : mod;
    if (row?.banned) {
      const url = request.nextUrl.clone();
      url.pathname = "/banned";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }
  if (user && AUTH_PAGES.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return response;
}
