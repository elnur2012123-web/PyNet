import "server-only";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getUserContext } from "@/lib/server/user";

export type StaffRole = "admin" | "co_founder" | "founder";
export const ROLE_LABEL: Record<string, string> = { user: "User", admin: "Admin", co_founder: "Co-Founder", founder: "Founder" };

/** The signed-in user if they are staff (role verified on the server). */
export async function getStaff() {
  const ctx = await getUserContext();
  if (!ctx) return null;
  const admin = getAdminSupabase();
  if (!admin) return null;
  const { data } = await admin.from("profiles").select("role, username").eq("id", ctx.user.id).maybeSingle();
  if (!data || data.role === "user") return null;
  return { ...ctx, admin, role: data.role as StaffRole, username: data.username as string };
}

/** "1h", "3d", "2w", "30m", "perm" -> end time (null = permanent). */
export function parseDuration(token: string): Date | null | undefined {
  const t = token.toLowerCase();
  if (["perm", "permanent", "forever", "never"].includes(t)) return null;
  const m = /^(\d{1,4})(m|min|h|d|w)$/.exec(t);
  if (!m) return undefined;
  const n = Number(m[1]);
  const ms = { m: 60e3, min: 60e3, h: 3600e3, d: 86400e3, w: 7 * 86400e3 }[m[2] as "m"] * n;
  return new Date(Date.now() + ms);
}

export const HELP = `**Moderation commands**

- \`/ban @username [duration] [reason]\` — ban a user. Duration: \`30m\`, \`12h\`, \`7d\`, \`2w\` or \`perm\` (default \`1d\`).
  Example: \`/ban @spammer 7d posting spam\`
- \`/unban @username\` — lift a ban
- \`/bans\` — list active bans
- \`/log\` — recent moderation actions
- \`/staff\` — list staff members
- \`/role @username admin|co_founder|user\` — change a role (Founder only)
- \`/help\` — show this list`;

const fmt = (d: string | null) => (d ? new Date(d).toUTCString().replace(" GMT", " UTC") : "never (permanent)");

/** Run one moderation command. Returns markdown for the chat / admin console. */
export async function runCommand(input: string): Promise<{ ok: boolean; message: string }> {
  const staff = await getStaff();
  if (!staff) return { ok: false, message: "Commands are only available to staff (Founder, Co-Founder and Admin)." };
  const { admin, user } = staff;
  const parts = input.trim().split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const target = (parts[1] ?? "").replace(/^@/, "");
  const fail = (m: string) => ({ ok: false, message: `⚠️ ${m}` });

  try {
    switch (cmd) {
      case "/help":
        return { ok: true, message: HELP };
      case "/ban": {
        if (!target) return fail("Usage: `/ban @username [duration] [reason]`");
        let until: Date | null = new Date(Date.now() + 86400e3);
        let reasonStart = 2;
        if (parts[2]) {
          const d = parseDuration(parts[2]);
          if (d !== undefined) { until = d; reasonStart = 3; }
        }
        const reason = parts.slice(reasonStart).join(" ").slice(0, 300);
        const { error } = await admin.rpc("mod_ban", { p_actor: user.id, p_username: target, p_reason: reason, p_until: until?.toISOString() ?? null });
        if (error) return fail(error.message);
        return { ok: true, message: `🔨 **@${target}** is banned ${until ? `until **${fmt(until.toISOString())}**` : "**permanently**"}.${reason ? `\nReason: ${reason}` : ""}` };
      }
      case "/unban": {
        if (!target) return fail("Usage: `/unban @username`");
        const { error } = await admin.rpc("mod_unban", { p_actor: user.id, p_username: target });
        if (error) return fail(error.message);
        return { ok: true, message: `✅ **@${target}** is no longer banned.` };
      }
      case "/role": {
        const role = (parts[2] ?? "").toLowerCase().replace("-", "_").replace("cofounder", "co_founder");
        if (!target || !role) return fail("Usage: `/role @username admin|co_founder|user`");
        const { error } = await admin.rpc("mod_set_role", { p_actor: user.id, p_username: target, p_role: role });
        if (error) return fail(error.message);
        return { ok: true, message: `👤 **@${target}** is now **${ROLE_LABEL[role] ?? role}**.` };
      }
      case "/bans": {
        const { data, error } = await admin.rpc("mod_list_bans");
        if (error) return fail(error.message);
        if (!data?.length) return { ok: true, message: "No active bans. 🎉" };
        return { ok: true, message: `**Active bans (${data.length})**\n\n` + data.map((b: { username: string; reason: string; expires_at: string | null; banned_by: string | null }) =>
          `- **@${b.username}** — ${b.reason || "no reason given"} · ends ${fmt(b.expires_at)} · by @${b.banned_by ?? "?"}`).join("\n") };
      }
      case "/log": {
        const { data, error } = await admin.rpc("mod_log", { p_limit: Number(parts[1]) || 15 });
        if (error) return fail(error.message);
        if (!data?.length) return { ok: true, message: "The moderation log is empty." };
        return { ok: true, message: "**Recent moderation actions**\n\n" + data.map((l: { created_at: string; actor: string | null; action: string; target: string | null; details: string }) =>
          `- ${new Date(l.created_at).toISOString().slice(0, 16).replace("T", " ")} · @${l.actor ?? "?"} **${l.action}** @${l.target ?? "?"}${l.details ? ` — ${l.details}` : ""}`).join("\n") };
      }
      case "/staff": {
        const { data, error } = await admin.rpc("mod_staff");
        if (error) return fail(error.message);
        return { ok: true, message: "**Staff**\n\n" + (data ?? []).map((s: { username: string; role: string }) => `- @${s.username} — ${ROLE_LABEL[s.role]}`).join("\n") };
      }
      default:
        return fail(`Unknown command \`${cmd}\`. Type \`/help\` to see the list.`);
    }
  } catch {
    return fail("Something went wrong. Please try again.");
  }
}
