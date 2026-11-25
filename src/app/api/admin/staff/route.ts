import { getStaff } from "@/lib/server/moderation";
import { error, json } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Current staff members (Founder, Co-Founders, Admins) for the Admin panel. */
export async function GET() {
  const staff = await getStaff();
  if (!staff) return error("Staff only", 403);
  const { data, error: e } = await staff.admin.rpc("mod_staff");
  if (e) return error("Could not load staff", 500);
  return json({ staff: data ?? [] });
}
