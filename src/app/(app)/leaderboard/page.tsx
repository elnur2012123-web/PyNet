"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Flame, Medal, Trophy } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { EmptyState, Skeleton } from "@/components/ui/States";
import { leagueForWeeklyXp } from "@/lib/xp";
import type { Plan } from "@/lib/plans";

interface Row { rank: number; user_id: string; username: string; display_name: string | null; avatar_url: string | null; country: string | null; xp: number; level: number; lessons: number; exercises: number; streak: number; plan: Plan; league: string }
const TABS = [
  { id: "global", label: "All time" },
  { id: "weekly", label: "This week" },
  { id: "monthly", label: "This month" },
  { id: "friends", label: "Friends" },
  { id: "country", label: "My country" },
] as const;

export default function LeaderboardPage() {
  const p = useProgress();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("global");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setRows(null);
    setError(null);
    const period = tab === "country" ? "global" : tab;
    sb.rpc("get_leaderboard", { p_period: period, p_limit: 100 }).then(({ data, error: e }) => {
      if (e) { setError("Could not load the leaderboard."); setRows([]); return; }
      let list = (data ?? []) as Row[];
      if (tab === "country") {
        const c = p.profile?.country;
        list = c ? list.filter((r) => r.country === c).map((r, i) => ({ ...r, rank: i + 1 })) : [];
      }
      setRows(list);
    });
  }, [tab, p.profile?.country]);

  const weekly = p.stats?.weekly_xp ?? 0;
  const league = leagueForWeeklyXp(weekly);

  if (!p.authConfigured) {
    return <EmptyState icon={<Trophy className="h-8 w-8" />} title="Leaderboard needs accounts" body="Rankings come from the database, so they're available once Supabase is configured on this deployment." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h1">Leaderboard</h1>
          <p className="mt-1 text-muted">Rankings are based only on XP earned by learning. Free, Pro and Max learners compete together.</p>
        </div>
      </div>

      {p.mode === "account" ? (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card flex items-center gap-3 p-4 md:col-span-2">
            <LeagueBadge league={league.league.name} size={48} />
            <div>
              <p className="font-semibold">{league.league.name} League</p>
              <p className="text-sm text-muted">{weekly} XP this week{league.next ? ` · ${league.xpToNext} XP to ${league.next.name}` : ""}</p>
            </div>
          </div>
          <div className="card p-4"><p className="text-xs text-muted">Global rank</p><p className="text-2xl font-semibold">{p.stats?.global_rank ? `#${p.stats.global_rank}` : "—"}</p><p className="text-xs text-muted">Best: {p.stats?.best_rank ? `#${p.stats.best_rank}` : "—"}</p></div>
          <div className="card p-4"><p className="text-xs text-muted">Weekly rank</p><p className="text-2xl font-semibold">{weekly > 0 && p.stats?.weekly_rank ? `#${p.stats.weekly_rank}` : "—"}</p><p className="text-xs text-muted">{p.stats?.monthly_xp ?? 0} XP this month</p></div>
        </div>
      ) : (
        <div className="card flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><span>Create an account to appear on the leaderboard and get your own rank.</span><Link href="/signup" className="btn-primary btn-sm">Join free</Link></div>
      )}

      <div className="flex flex-wrap gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`rounded-xl px-3.5 py-1.5 text-sm ${tab === t.id ? "bg-accent text-white" : "border border-border bg-surface text-muted hover:text-fg"}`}>{t.label}</button>
        ))}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {rows === null ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon={<Trophy className="h-8 w-8" />}
          title={tab === "friends" ? (p.mode === "account" ? "No friends yet" : "Sign in to see friends") : tab === "country" ? (p.profile?.country ? "No one from your country yet" : "Set your country in Settings") : "No rankings yet"}
          body={tab === "friends" ? "Add friends to compete with them." : tab === "country" ? undefined : "Complete a lesson to be the first on the board!"}
          action={tab === "friends" && p.mode === "account" ? <Link href="/friends" className="btn-primary btn-sm">Find friends</Link> : tab === "country" && !p.profile?.country && p.mode === "account" ? <Link href="/settings" className="btn-primary btn-sm">Settings</Link> : undefined} />
      ) : (
        <>
          {rows.length >= 3 && (
            <div className="grid grid-cols-3 items-end gap-3">
              {[rows[1], rows[0], rows[2]].map((r, i) => {
                const place = [2, 1, 3][i];
                const color = place === 1 ? "text-[#d4a72c]" : place === 2 ? "text-[#9aa4b2]" : "text-[#b4774a]";
                return (
                  <Link key={r.user_id} href={`/profile/${r.username}`} className={`card flex flex-col items-center p-4 text-center ${place === 1 ? "pb-8 pt-6" : ""}`}>
                    <Trophy className={`h-6 w-6 ${color}`} aria-label={`${place} place`} />
                    <div className="mt-2"><Avatar src={r.avatar_url} name={r.display_name || r.username} size={place === 1 ? 56 : 44} /></div>
                    <p className="mt-2 max-w-full truncate text-sm font-semibold">{r.display_name || r.username}</p>
                    <p className="text-xs text-muted">{r.xp.toLocaleString()} XP</p>
                  </Link>
                );
              })}
            </div>
          )}
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border text-left text-xs text-muted">
                <tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Learner</th><th className="px-4 py-3 text-right">XP</th><th className="px-4 py-3 text-right">Level</th><th className="px-4 py-3 text-right">Lessons</th><th className="px-4 py-3 text-right">Challenges</th><th className="px-4 py-3 text-right">Streak</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const me = r.user_id === p.profile?.id;
                  return (
                    <tr key={r.user_id} className={`border-b border-border last:border-0 ${me ? "bg-accent/5" : ""}`}>
                      <td className="px-4 py-3 font-semibold">{r.rank <= 3 ? <Medal className={`inline h-4 w-4 ${r.rank === 1 ? "text-[#d4a72c]" : r.rank === 2 ? "text-[#9aa4b2]" : "text-[#b4774a]"}`} aria-label={`#${r.rank}`} /> : `#${r.rank}`}</td>
                      <td className="px-4 py-3">
                        <Link href={`/profile/${r.username}`} className="flex items-center gap-3 hover:text-accent">
                          <Avatar src={r.avatar_url} name={r.display_name || r.username} size={32} />
                          <span className="min-w-0"><span className="flex items-center gap-1.5 font-medium">{r.display_name || r.username} <PlanBadge plan={r.plan} />{me && <span className="chip">You</span>}</span><span className="text-xs text-muted">@{r.username}</span></span>
                          <span className="ml-auto"><LeagueBadge league={r.league} size={22} /></span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{r.xp.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.level}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.lessons}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{r.exercises}</td>
                      <td className="px-4 py-3 text-right tabular-nums"><Flame className="mr-1 inline h-3.5 w-3.5 text-warn" />{r.streak}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-muted"><Crown className="mr-1 inline h-3.5 w-3.5" />Paid plans never earn extra XP. Private profiles are hidden from public rankings.</p>
        </>
      )}
    </div>
  );
}
