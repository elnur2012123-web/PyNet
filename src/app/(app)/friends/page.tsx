"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Search, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { achievementById } from "@/lib/achievements";

interface Friend { friendship_id: string; user_id: string; username: string; display_name: string | null; avatar_url: string | null; level: number; status: "pending" | "accepted"; direction: "incoming" | "outgoing" }
interface Found { id: string; username: string; display_name: string | null; avatar_url: string | null; level: number }
interface FeedItem { username: string; display_name: string | null; avatar_url: string | null; achievement_id: string; unlocked_at: string }

export default function FriendsPage() {
  const p = useProgress();
  const toast = useToast();
  const sb = getBrowserSupabase();
  const [friends, setFriends] = useState<Friend[] | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Found[] | null>(null);
  const [searching, setSearching] = useState(false);

  const load = useCallback(async () => {
    if (!sb) return;
    const [{ data: f }, { data: fd }] = await Promise.all([sb.rpc("get_friends"), sb.rpc("friends_feed")]);
    setFriends((f ?? []) as Friend[]);
    setFeed((fd ?? []) as FeedItem[]);
  }, [sb]);
  useEffect(() => { if (p.mode === "account") load(); }, [p.mode, load]);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb || q.trim().length < 2) return;
    setSearching(true);
    const { data } = await sb.rpc("search_users", { p_query: q.trim() });
    setFound((data ?? []) as Found[]);
    setSearching(false);
  };

  const add = async (id: string) => {
    const { error } = await sb!.from("friendships").insert({ requester_id: p.profile!.id, receiver_id: id });
    toast(error ? { kind: "error", title: error.code === "23505" ? "Request already exists" : "Could not send request" } : { kind: "success", title: "Friend request sent" });
    load();
  };
  const accept = async (fid: string) => { await sb!.from("friendships").update({ status: "accepted" }).eq("id", fid); load(); };
  const remove = async (fid: string) => { await sb!.from("friendships").delete().eq("id", fid); load(); };

  if (p.ready && p.mode !== "account") {
    return <EmptyState icon={<Users className="h-8 w-8" />} title="Learn with friends" body={p.authConfigured ? "Sign in to add friends, compare progress and see their achievements." : "Friends need accounts (Supabase) to be configured."} action={p.authConfigured ? <Link href="/signin?next=/friends" className="btn-primary btn-sm">Sign in</Link> : undefined} />;
  }

  const incoming = friends?.filter((f) => f.status === "pending" && f.direction === "incoming") ?? [];
  const outgoing = friends?.filter((f) => f.status === "pending" && f.direction === "outgoing") ?? [];
  const accepted = friends?.filter((f) => f.status === "accepted") ?? [];
  const known = new Set(friends?.map((f) => f.user_id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div>
          <h1 className="h1">Friends</h1>
          <p className="mt-1 text-muted">Find classmates by username, then compete on the <Link href="/leaderboard" className="link">friends leaderboard</Link>.</p>
        </div>
        <form onSubmit={search} className="flex gap-2">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Search by username or name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search learners" />
          </label>
          <button className="btn-primary" disabled={q.trim().length < 2}>{searching ? <Spinner /> : "Search"}</button>
        </form>
        {found && (
          <div className="card-flat divide-y divide-border">
            {found.length === 0 ? <p className="p-4 text-sm text-muted">No public profiles match “{q}”.</p> : found.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3">
                <Avatar src={u.avatar_url} name={u.display_name || u.username} />
                <Link href={`/profile/${u.username}`} className="min-w-0 flex-1"><p className="truncate font-medium">{u.display_name || u.username}</p><p className="text-xs text-muted">@{u.username} · Level {u.level}</p></Link>
                {known.has(u.id) ? <span className="chip">Added</span> : <button onClick={() => add(u.id)} className="btn-secondary btn-sm"><UserPlus className="h-3.5 w-3.5" /> Add</button>}
              </div>
            ))}
          </div>
        )}

        {incoming.length > 0 && (
          <section>
            <h2 className="mb-2 font-semibold">Requests for you</h2>
            <div className="card-flat divide-y divide-border">
              {incoming.map((f) => (
                <div key={f.friendship_id} className="flex items-center gap-3 p-3">
                  <Avatar src={f.avatar_url} name={f.display_name || f.username} />
                  <p className="min-w-0 flex-1 truncate font-medium">{f.display_name || f.username} <span className="text-xs text-muted">@{f.username}</span></p>
                  <button onClick={() => accept(f.friendship_id)} className="btn-primary btn-sm"><Check className="h-3.5 w-3.5" /> Accept</button>
                  <button onClick={() => remove(f.friendship_id)} className="btn-ghost btn-sm" aria-label="Reject"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-2 font-semibold">Your friends ({accepted.length})</h2>
          {friends === null ? <div className="py-6"><Spinner /></div> : accepted.length === 0 ? (
            <EmptyState title="No friends yet" body="Search for a username above to send your first request." />
          ) : (
            <div className="card-flat divide-y divide-border">
              {accepted.map((f) => (
                <div key={f.friendship_id} className="flex items-center gap-3 p-3">
                  <Avatar src={f.avatar_url} name={f.display_name || f.username} />
                  <Link href={`/profile/${f.username}`} className="min-w-0 flex-1"><p className="truncate font-medium">{f.display_name || f.username}</p><p className="text-xs text-muted">@{f.username} · Level {f.level}</p></Link>
                  <button onClick={() => remove(f.friendship_id)} className="btn-ghost btn-sm" title="Remove friend"><UserMinus className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          {outgoing.length > 0 && <p className="mt-2 text-xs text-muted">Pending: {outgoing.map((f) => `@${f.username}`).join(", ")}</p>}
        </section>
      </div>

      <aside>
        <h2 className="mb-2 font-semibold">Friends' achievements</h2>
        {feed.length === 0 ? <EmptyState title="Quiet for now" body="When friends unlock achievements, they'll appear here." /> : (
          <ul className="space-y-2">
            {feed.map((f, i) => (
              <li key={i} className="card-flat flex items-center gap-3 p-3 text-sm">
                <Avatar src={f.avatar_url} name={f.display_name || f.username} size={30} />
                <p className="min-w-0 flex-1"><span className="font-medium">{f.display_name || f.username}</span> unlocked <span className="font-medium text-accent">{achievementById(f.achievement_id)?.name ?? f.achievement_id}</span><br /><span className="text-xs text-muted">{new Date(f.unlocked_at).toLocaleDateString()}</span></p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
