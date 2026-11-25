import { getStaff } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { PERMISSIONS, ROLE_COLORS } from "@/lib/permissions";

export const dynamic = "force-dynamic";

/** Create, edit or delete a role. The database enforces rank and permission rules too. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const staff = await getStaff();
  if (!staff || !staff.can("manage_roles")) return error("Your role can't manage roles.", 403);
  const body = await readJson<{ action?: string; id?: string | null; name?: string; color?: string; rank?: number; permissions?: string[]; showTitle?: boolean }>(req);
  if (!body) return error("Invalid request");
  const { admin, user } = staff;

  if (body.action === "delete") {
    const { error: e } = await admin.rpc("mod_delete_role", { p_actor: user.id, p_id: String(body.id ?? "") });
    if (e) return error(e.message);
    return json({ ok: true });
  }
  if (body.action === "save") {
    const allowed = new Set<string>(PERMISSIONS.map((p) => p.id));
    const perms = (Array.isArray(body.permissions) ? body.permissions : []).map(String).filter((p) => allowed.has(p));
    const color = (ROLE_COLORS as readonly string[]).includes(String(body.color)) ? String(body.color) : "blue";
    const { data, error: e } = await admin.rpc("mod_save_role", {
      p_actor: user.id, p_id: body.id || null, p_name: String(body.name ?? "").slice(0, 24), p_color: color,
      p_rank: Math.round(Number(body.rank)), p_permissions: perms, p_show_title: body.showTitle !== false,
    });
    if (e) return error(e.message);
    return json({ ok: true, id: data });
  }
  return error("Unknown action");
}
