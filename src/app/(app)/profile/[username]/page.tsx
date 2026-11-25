import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarDays, Flame, Lock } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge } from "@/components/ui/PlanBadge";
import { LeagueBadge } from "@/components/ui/LeagueBadge";
import { Icon } from "@/components/ui/Icon";
import { ACHIEVEMENTS } from "@/lib/achievements";
import type { Plan } from "@/lib/plans";
import { EmptyState } from "@/components/ui/States";
import { SpecialBadge, SpecialChip } from "@/components/ui/SpecialBadge";
import { formatXp } from "@/lib/xp";
import { ModerateButtons } from "@/components/admin/ModerateButtons";
import { BadgeChip, BadgeMedal } from "@/components/ui/AchievementBadge";
import Link from "next/link";
import { BarChart3, Star, Users } from "lucide-react";
import { RatingGraph, type RatingPoint } from "@/components/arena/RatingGraph";
import { Heatmap } from "@/components/arena/Heatmap";
import { rankFor } from "@/lib/arena/rank";

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  return { title: `@${(await params).username}` };
}

interface PublicProfile {
  id: string; username: string; display_name: string | null; avatar_url: string | null; bio: string | null; country: string | null;
  created_at: string; show_stats: boolean; total_xp: number | null; level: number; lessons: number | null; exercises: number | null;
  quizzes: number | null; projects: number | null; streak: number | null; longest_streak: number | null; plan: Plan; league: string;
  accent_theme: string; achievements: { id: string; unlocked_at: string }[]; special_title: string | null; role: string; banned: boolean; badge: string | null;
  rating: number | null; max_rating: number | null; friends: number;
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) notFound();
  const supabase = await getServerSupabase();
  if (!supabase) return <EmptyState title="Profiles need accounts" body="Public profiles are available once Supabase is configured." />;
  const { data } = await supabase.rpc("get_public_profile", { p_username: username });
  const prof = (Array.isArray(data) ? data[0] : data) as PublicProfile | undefined;
  if (!prof) {
    return <EmptyState icon={<Lock className="h-8 w-8" />} title="Profile not available" body="This learner doesn't exist or has made their profile private." />;
  }
  const unlocked = new Set(prof.achievements.map((a) => a.id));
  const { data: me } = await supabase.rpc("my_moderation");
  const myPerms: string[] = (Array.isArray(me) ? me[0] : me)?.permissions ?? [];
  const { data: auth } = await supabase.auth.getUser();
  const canModerate = myPerms.includes("ban_users") && auth.user?.id !== prof.id;
  const [{ data: hist }, { data: act }, { data: solvedData }] = await Promise.all([
    supabase.rpc("get_rating_history", { p_username: prof.username }),
    supabase.rpc("get_activity", { p_username: prof.username }),
    supabase.rpc("get_solved_stats", { p_username: prof.username }),
  ]);
  const history = (hist ?? []) as RatingPoint[];
  const solvedRow = (Array.isArray(solvedData) ? solvedData[0] : solvedData) as { all_time: number; last_year: number; last_month: number } | undefined;
  const solved = solvedRow ? { all_time: Number(solvedRow.all_time), last_year: Number(solvedRow.last_year), last_month: Number(solvedRow.last_month) } : null;
  const rank = rankFor(prof.rating);
  const maxRank = rankFor(prof.max_rating);
  const accent = prof.plan !== "FREE" && prof.accent_theme !== "default" ? prof.accent_theme : undefined;

  return (
    <div className="mx-auto max-w-4xl space-y-6" data-accent={accent}>
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-accent/20 to-accent2/20" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-end">
          <Avatar src={prof.avatar_url} name={prof.display_name || prof.username} size={96} />
          <div className="flex-1">
            <p className={`text-sm font-semibold ${rank.className}`}>{rank.name}</p>
            <h1 className={`flex flex-wrap items-center gap-2 text-2xl font-semibold`}><span className={prof.rating != null ? rank.className : ""}>{prof.display_name || prof.username}</span> <PlanBadge plan={prof.plan} />{prof.special_title && <SpecialChip title={prof.special_title} />}</h1>
            <p className="text-muted">@{prof.username}{prof.country ? ` · ${prof.country}` : ""}</p>
            {prof.badge && <div className="mt-2"><BadgeChip id={prof.badge} /></div>}
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-accent" /> Contest rating: {prof.rating != null ? <><b className={rank.className}>{prof.rating}</b> <span className="text-xs text-muted">(max. <span className={maxRank.className}>{maxRank.name.toLowerCase()}, {prof.max_rating}</span>)</span></> : <span className="text-muted">unrated</span>}</p>
              <p className="flex items-center gap-2"><Star className="h-4 w-4 text-warn" /> Friend of: {prof.friends} user{Number(prof.friends) === 1 ? "" : "s"}</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-muted" /> <Link className="link" href={`/submissions?user=${prof.username}`}>Submissions</Link></p>
            </div>
            {prof.banned && <p className="mt-2 inline-flex rounded-md bg-danger/10 px-2 py-0.5 text-xs font-semibold text-danger">Suspended</p>}
            {prof.bio && <p className="mt-2 max-w-xl text-fg/90">{prof.bio}</p>}
            {canModerate && <div className="mt-3"><ModerateButtons username={prof.username} banned={prof.banned} /></div>}
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><CalendarDays className="h-3.5 w-3.5" /> Member since {new Date(prof.created_at).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          </div>
          {prof.special_title ? <SpecialBadge title={prof.special_title} size={56} showLabel /> : <LeagueBadge league={prof.league} size={56} showLabel />}
        </div>
      </div>

      {prof.show_stats || prof.total_xp != null ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[["Total XP", prof.total_xp != null ? formatXp(prof.total_xp) : null], ["Level", prof.level?.toLocaleString("en-US")], ["Lessons", prof.lessons], ["Challenges", prof.exercises], ["Streak", prof.streak]].map(([l, v]) => (
            <div key={String(l)} className="card p-4"><p className="text-xs text-muted">{l}</p><p className="mt-1 flex items-center gap-1 text-2xl font-semibold">{l === "Streak" && <Flame className="h-5 w-5 text-warn" />}{v ?? "—"}</p></div>
          ))}
        </div>
      ) : (
        <p className="card p-4 text-sm text-muted"><Lock className="mr-1 inline h-4 w-4" /> This learner keeps their statistics private.</p>
      )}

      <div className="card p-5">
        <h2 className="mb-3 font-semibold">Rating history</h2>
        <RatingGraph points={history} />
      </div>
      {act !== null && (prof.show_stats || prof.total_xp != null) && (
        <div className="card p-5">
          <h2 className="mb-3 font-semibold">Activity</h2>
          <Heatmap days={(act ?? []) as { day: string; count: number }[]} solved={solved} />
        </div>
      )}

      <div className="card p-6">
        <h2 className="font-semibold">Achievements ({unlocked.size})</h2>
        {unlocked.size === 0 ? <p className="mt-3 text-sm text-muted">No achievements yet.</p> : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).map((a) => (
              <li key={a.id} className="rounded-xl border border-border p-3 text-center">
                <span className="flex justify-center"><BadgeMedal id={a.id} size={48} /></span>
                <p className="mt-2 text-sm font-medium">{a.name}</p>
                <p className="text-[11px] text-muted">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
