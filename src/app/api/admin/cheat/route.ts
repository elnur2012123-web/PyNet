import { getStaff, parseDuration } from "@/lib/server/moderation";
import { error, json, readJson, sameOrigin } from "@/lib/server/http";
import { scanContest } from "@/lib/server/cheat";
import { finalizeFinishedContests } from "@/lib/server/arena";

export const dynamic = "force-dynamic";

interface FlagRow {
  id: number; kind: string; severity: string; contest_id: number | null; problem_id: number | null; user_id: string; other_user_id: string | null;
  submission_id: number | null; other_submission_id: number | null; score: number; details: string; status: string; created_at: string;
}

/** Cheat flags for staff, newest first, with both programs attached. */
export async function GET(req: Request) {
  const staff = await getStaff();
  if (!staff || !staff.can("review_cheating")) return error("Your role can't use the cheat detector.", 403);
  const { admin } = staff;
  const status = new URL(req.url).searchParams.get("status") ?? "open";
  let q = admin.from("cheat_flags").select("*").order("created_at", { ascending: false }).limit(100);
  if (status !== "all") q = q.eq("status", status);
  const { data } = await q;
  const flags = (data ?? []) as FlagRow[];
  const users = [...new Set(flags.flatMap((f) => [f.user_id, f.other_user_id]).filter(Boolean) as string[])];
  const subs = [...new Set(flags.flatMap((f) => [f.submission_id, f.other_submission_id]).filter(Boolean) as number[])];
  const contests = [...new Set(flags.map((f) => f.contest_id).filter(Boolean) as number[])];
  const [{ data: profs }, { data: codes }, { data: cs }, { data: rounds }] = await Promise.all([
    users.length ? admin.from("profiles").select("id, username, rating").in("id", users) : Promise.resolve({ data: [] }),
    subs.length ? admin.from("submissions").select("id, code, created_at").in("id", subs) : Promise.resolve({ data: [] }),
    contests.length ? admin.from("contests").select("id, title").in("id", contests) : Promise.resolve({ data: [] }),
    admin.from("contests").select("id, title, starts_at").lte("starts_at", new Date().toISOString()).order("starts_at", { ascending: false }).limit(20),
  ]);
  const P = new Map(((profs ?? []) as { id: string; username: string; rating: number | null }[]).map((p) => [p.id, p]));
  const S = new Map(((codes ?? []) as { id: number; code: string; created_at: string }[]).map((s) => [s.id, s]));
  const C = new Map(((cs ?? []) as { id: number; title: string }[]).map((c) => [c.id, c.title]));
  return json({
    rounds,
    flags: flags.map((f) => ({
      ...f,
      user: P.get(f.user_id) ?? null,
      other: f.other_user_id ? P.get(f.other_user_id) ?? null : null,
      code: f.submission_id ? S.get(f.submission_id)?.code ?? null : null,
      otherCode: f.other_submission_id ? S.get(f.other_submission_id)?.code ?? null : null,
      contest: f.contest_id ? C.get(f.contest_id) ?? null : null,
    })),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const staff = await getStaff();
  if (!staff || !staff.can("review_cheating")) return error("Your role can't use the cheat detector.", 403);
  const { admin, user } = staff;
  const body = await readJson<{ action?: string; id?: number; contestId?: number; who?: "user" | "other"; duration?: string }>(req);
  if (!body) return error("Invalid request");

  if (body.action === "scan") {
    const id = Number(body.contestId);
    const { data: c } = await admin.from("contests").select("starts_at, duration_minutes").eq("id", id).maybeSingle();
    if (!c) return error("Round not found", 404);
    const ended = new Date(c.starts_at).getTime() + c.duration_minutes * 60e3 <= Date.now();
    const added = await scanContest(admin, id, ended);
    return json({ added });
  }

  const { data: flag } = await admin.from("cheat_flags").select("*").eq("id", Number(body.id)).maybeSingle();
  if (!flag) return error("Flag not found", 404);
  const f = flag as FlagRow;
  const target = body.who === "other" ? f.other_user_id : f.user_id;
  const close = async () => {
    await admin.from("cheat_flags").update({ status: body.action === "dismiss" ? "dismissed" : "actioned", reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", f.id);
    await finalizeFinishedContests(); // ratings may be waiting for this review
  };
  const { data: tp } = target ? await admin.from("profiles").select("username").eq("id", target).maybeSingle() : { data: null };
  const reason = `Cheating: ${f.kind === "similar_code" ? `copied code (${f.score}% match)` : "suspiciously fast solve"}${f.contest_id ? ` in round #${f.contest_id}` : ""}`;

  if (body.action === "dismiss") {
    await close();
    return json({ message: "Flag dismissed." });
  }
  if (!target || !tp) return error("User not found", 404);

  if (body.action === "ban" && !staff.can("ban_users")) return error("Your role can't ban users.", 403);
  if (body.action === "disqualify" || body.action === "ban") {
    if (f.contest_id) {
      await admin.from("contest_disqualifications").upsert({ contest_id: f.contest_id, user_id: target, reason, created_by: user.id });
      await admin.from("moderation_log").insert({ actor_id: user.id, action: "disqualify", target_id: target, details: reason });
    }
    if (body.action === "ban") {
      const until = parseDuration(body.duration || "30d");
      if (until === undefined) return error("Bad duration");
      const { error: e } = await admin.rpc("mod_ban", { p_actor: user.id, p_username: tp.username, p_reason: reason, p_until: until ? until.toISOString() : null });
      if (e) return error(e.message);
    }
    await close();
    return json({ message: body.action === "ban" ? `@${tp.username} was banned and removed from the standings.` : `@${tp.username} was removed from the round's standings.` });
  }
  return error("Unknown action");
}
