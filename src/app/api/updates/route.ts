import { CODE_UPDATES, type UpdateEntry } from "@/content/updates";
import { getServerSupabase } from "@/lib/supabase/server";

export const revalidate = 60;

/** Release notes from the code + published announcements from the database, newest first. */
export async function GET() {
  let dbUpdates: UpdateEntry[] = [];
  const supabase = await getServerSupabase();
  if (supabase) {
    const { data } = await supabase.from("announcements").select("id,title,body,link,kind,created_at").order("created_at", { ascending: false }).limit(50);
    dbUpdates = (data ?? []).map((a) => ({ id: `db-${a.id}`, date: a.created_at, title: a.title, body: a.body, link: a.link ?? undefined, kind: a.kind }));
  }
  const all = [...dbUpdates, ...CODE_UPDATES].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  return Response.json({ updates: all }, { headers: { "Cache-Control": "public, max-age=60" } });
}
