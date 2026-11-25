import { getStaff } from "@/lib/server/moderation";
import { error, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Staff members, all roles, and what the signed-in staff member may do. */
export async function GET() {
  const staff = await getStaff();
  if (!staff) return error("Staff only", 403);
  const [{ data: list, error: e }, { data: roles }] = await Promise.all([
    staff.admin.rpc("mod_staff"),
    staff.admin.from("roles").select("id, name, color, rank, permissions, show_title, is_system").order("rank", { ascending: false }),
  ]);
  if (e) return error("Could not load staff", 500);
  return json({ staff: list ?? [], roles: roles ?? [], me: { role: staff.role, rank: staff.role === "founder" ? 100 : staff.rank, permissions: staff.permissions } });
}
