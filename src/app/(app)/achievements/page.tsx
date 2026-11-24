"use client";
import { Lock } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { ACHIEVEMENTS, TIER_LABEL, displayBadge, tierOf } from "@/lib/achievements";
import { BadgeChip, BadgeMedal } from "@/components/ui/AchievementBadge";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/Progress";
import { LEAGUES, levelProgress, xpForLevel } from "@/lib/xp";
import { LeagueBadge } from "@/components/ui/LeagueBadge";

export default function AchievementsPage() {
  const p = useProgress();
  const catalog = useCatalog();
  const unlocked = new Map(p.achievements.map((a) => [a.id, a.at]));
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const shown = displayBadge([...unlocked.keys()], p.profile?.featured_badge);
  const wear = async (id: string | null) => {
    const sb = getBrowserSupabase();
    if (!sb || !p.profile) return;
    setSaving(true);
    const { error } = await sb.from("profiles").update({ featured_badge: id }).eq("id", p.profile.id);
    setSaving(false);
    if (error) toast({ kind: "error", title: "Couldn't change your badge", body: error.message });
    else { toast({ kind: "success", title: id ? "Badge updated" : "Showing your rarest badge" }); p.refresh(); }
  };
  const lvl = levelProgress(p.xp);
  const totalLessons = catalog.modules.reduce((s, m) => s + m.lessons.length, 0);

  const progressFor = (type: string, value: number, ref?: string) => {
    switch (type) {
      case "lessons": return Math.min(1, p.lessons.size / value);
      case "exercises": return Math.min(1, p.exercises.size / value);
      case "quizzes": return Math.min(1, p.quizzes.size / value);
      case "projects": return Math.min(1, p.projects / value);
      case "streak": return Math.min(1, p.streak / value);
      case "xp": return Math.min(1, p.xp / value);
      case "lesson": return p.lessons.has(ref!) ? 1 : 0;
      case "quiz": return p.quizzes.has(ref!) ? 1 : 0;
      default: return 0;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="h1">Progress & achievements</h1>
        <p className="mt-1 text-muted">Every badge is earned by real learning. {unlocked.size}/{ACHIEVEMENTS.length} unlocked.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-muted">Level</p>
          <p className="text-3xl font-semibold">{lvl.level}</p>
          <ProgressBar value={lvl.pct} className="mt-3" label="Level progress" />
          <p className="mt-1.5 text-xs text-muted">{lvl.needed - lvl.current} XP to level {lvl.level + 1} ({xpForLevel(lvl.level + 1).toLocaleString()} total)</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Course</p>
          <p className="text-3xl font-semibold">{p.lessons.size}<span className="text-base text-muted">/{totalLessons}</span></p>
          <ProgressBar value={(p.lessons.size / totalLessons) * 100} className="mt-3" label="Lessons" />
          <p className="mt-1.5 text-xs text-muted">{p.exercises.size} challenges · {p.quizzes.size} quizzes · {p.projects} projects</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-muted">Leagues (by weekly XP)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEAGUES.map((l) => <span key={l.name} className="flex items-center gap-1 text-xs"><LeagueBadge league={l.name} size={22} />{l.min}+</span>)}
          </div>
        </div>
      </div>

      {shown && (
        <div className="card flex flex-wrap items-center gap-4 p-5">
          <BadgeMedal id={shown} size={64} />
          <div className="flex-1">
            <p className="text-sm text-muted">Your badge — shown next to your name on the leaderboard and your profile</p>
            <div className="mt-1"><BadgeChip id={shown} /></div>
          </div>
          {p.mode === "account" && p.profile?.featured_badge && <button onClick={() => wear(null)} disabled={saving} className="btn-ghost btn-sm">Show my rarest badge automatically</button>}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked.get(a.id);
          const pct = at ? 1 : progressFor(a.type, a.value, a.ref);
          const tier = tierOf(a.id);
          const showing = shown === a.id;
          return (
            <div key={a.id} className={`card-flat flex gap-4 p-4 ${at ? "" : "opacity-80"} ${showing ? "ring-2 ring-accent" : ""}`}>
              <span className="relative">
                <BadgeMedal id={a.id} size={52} locked={!at} />
                {!at && <Lock className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-surface p-0.5 text-muted" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-semibold">{a.name} <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{TIER_LABEL[tier]}</span></p>
                <p className="text-sm text-muted">{a.description}</p>
                {at ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs text-success">Unlocked {new Date(at).toLocaleDateString()}{a.xp ? ` · +${a.xp} XP` : ""}</p>
                    {p.mode === "account" && (showing
                      ? <span className="text-xs font-medium text-accent">✓ Shown on your profile</span>
                      : <button onClick={() => wear(a.id)} disabled={saving} className="text-xs font-medium text-accent hover:underline">Show on my profile</button>)}
                  </div>
                ) : (
                  <><ProgressBar value={pct * 100} className="mt-2 h-1.5" label={`${a.name} progress`} /><p className="mt-1 text-xs text-muted">{a.xp ? `+${a.xp} XP` : "Badge"}</p></>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
