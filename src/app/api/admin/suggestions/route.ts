import { getStaff } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";

export const dynamic = "force-dynamic";

/** Suggestions inbox for staff with "read_suggestions". */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || !staff.can("read_suggestions")) return error("Your role can't read suggestions.", 403);
  const status = new URL(req.url).searchParams.get("status") ?? "new";
  let q = staff.admin.from("suggestions").select("id, user_id, category, message, page, language, status, staff_reply, created_at").order("created_at", { ascending: false }).limit(100);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  const rows = (data ?? []) as { user_id: string }[];
  const ids = [...new Set(rows.map((r) => r.user_id))];
  const { data: profs } = ids.length ? await staff.admin.from("profiles").select("id, username").in("id", ids) : { data: [] };
  const name = new Map(((profs ?? []) as { id: string; username: string }[]).map((p) => [p.id, p.username]));
  const { count } = await staff.admin.from("suggestions").select("id", { count: "exact", head: true }).eq("status", "new");
  return json({ newCount: count ?? 0, suggestions: rows.map((r) => ({ ...r, username: name.get(r.user_id) ?? "deleted user" })) });
}

/** Set a status and an optional reply the learner will see. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const staff = await getStaff();
  if (!staff || !staff.can("read_suggestions")) return error("Your role can't read suggestions.", 403);
  const body = await readJson<{ id?: number; status?: string; reply?: string }>(req);
  if (!body || !["new", "planned", "done", "declined"].includes(String(body.status))) return error("Bad status");
  const { error: e } = await staff.admin.from("suggestions").update({
    status: body.status, staff_reply: String(body.reply ?? "").trim().slice(0, 1000) || null, reviewed_by: staff.user.id, reviewed_at: new Date().toISOString(),
  }).eq("id", Number(body.id));
  if (e) return error("Could not update", 500);
  return json({ ok: true });
}
