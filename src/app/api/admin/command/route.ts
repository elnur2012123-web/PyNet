import { runCommand } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getUserContext } from "@/lib/server/user";

/** Moderation commands (/ban, /unban, /bans, /log, /staff, /role, /help). Staff only. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const ctx = await getUserContext();
  if (!ctx) return error("Please sign in.", 401);
  if (!rateLimit(`mod:${ctx.user.id}`, 30, 60_000).ok) return error("Too many commands — slow down a little.", 429);
  const body = await readJson<{ command?: string }>(req, 2000);
  const command = body?.command?.trim() ?? "";
  if (!command.startsWith("/")) return error("Commands start with /");
  const result = await runCommand(command);
  return json(result, result.ok ? 200 : 400);
}
