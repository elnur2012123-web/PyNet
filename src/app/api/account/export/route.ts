import { getUserContext } from "@/lib/server/user";
import { error } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Download all of the signed-in user's data as JSON (read under RLS). */
export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) return error("Not signed in", 401);
  const { supabase, user } = ctx;
  const tables = ["profiles", "user_progress", "lesson_completions", "exercise_submissions", "quiz_results",
    "user_achievements", "subscriptions", "billing_events", "ai_usage", "saved_code", "daily_activity", "leaderboard_snapshots", "favorite_lessons"] as const;
  const out: Record<string, unknown> = { exported_at: new Date().toISOString(), email: user.email };
  for (const t of tables) {
    const col = t === "profiles" ? "id" : "user_id";
    const { data } = await supabase.from(t).select("*").eq(col, user.id);
    out[t] = data ?? [];
  }
  const { data: friends } = await supabase.rpc("get_friends");
  out.friends = friends ?? [];
  return new Response(JSON.stringify(out, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pynest-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
