"use client";
import { Lock } from "lucide-react";
import { useCatalog, useProgress } from "@/components/providers/ProgressProvider";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { Icon } from "@/components/ui/Icon";
import { ProgressBar } from "@/components/ui/Progress";
import { LEAGUES, levelProgress, xpForLevel } from "@/lib/xp";
import { LeagueBadge } from "@/components/ui/LeagueBadge";

export default function AchievementsPage() {
  const p = useProgress();
  const catalog = useCatalog();
  const unlocked = new Map(p.achievements.map((a) => [a.id, a.at]));
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a) => {
          const at = unlocked.get(a.id);
          const pct = at ? 1 : progressFor(a.type, a.value, a.ref);
          return (
            <div key={a.id} className={`card-flat flex gap-4 p-4 ${at ? "" : "opacity-80"}`}>
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${at ? "bg-gradient-to-br from-accent to-accent2 text-white" : "bg-elevated text-muted"}`}>
                {at ? <Icon name={a.icon} className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-muted">{a.description}</p>
                {at ? (
                  <p className="mt-1 text-xs text-success">Unlocked {new Date(at).toLocaleDateString()}{a.xp ? ` · +${a.xp} XP` : ""}</p>
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
