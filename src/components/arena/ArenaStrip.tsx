"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BarChart3, ListOrdered, Swords } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Countdown } from "./Countdown";
import { rankFor } from "@/lib/arena/rank";

interface C { id: number; title: string; starts_at: string; duration_minutes: number; registered: boolean; participants: number }

/** Dashboard row: next round, your rating, and a nudge to the problemset. */
export function ArenaStrip() {
  const tx = useT();
  const p = useProgress();
  const [next, setNext] = useState<C | null | undefined>(undefined);
  const [solved, setSolved] = useState<number | null>(null);
  useEffect(() => {
    const sb = getBrowserSupabase();
    if (!sb) { setNext(null); return; }
    sb.rpc("get_contests").then(({ data }) => {
      const now = Date.now();
      const list = ((data ?? []) as C[]).filter((c) => new Date(c.starts_at).getTime() + c.duration_minutes * 60e3 > now)
        .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
      setNext(list[0] ?? null);
    });
    sb.rpc("get_problemset").then(({ data }) => setSolved(((data ?? []) as { my_status: string | null }[]).filter((r) => r.my_status === "OK").length));
  }, []);
  if (!p.authConfigured) return null;
  const rating = p.profile?.rating ?? null;
  const rank = rankFor(rating);
  const running = next && new Date(next.starts_at).getTime() <= Date.now();
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Link href={next ? `/contests/${next.id}` : "/contests"} className="card flex items-start gap-3 p-4 hover:border-accent/50">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-danger/10 text-danger"><Swords className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="text-xs text-muted">{running ? tx("Contest is running") : tx("Next contest")}</p>
          {next === undefined ? <p className="text-sm text-muted"><T k="Loading…" /></p> : next ? (
            <>
              <p className="truncate font-semibold">{next.title}</p>
              <p className="text-sm text-muted">{running ? tx("ends in ") : tx("starts in ")}<Countdown to={running ? new Date(new Date(next.starts_at).getTime() + next.duration_minutes * 60e3).toISOString() : next.starts_at} refresh={false} /></p>
              <p className="text-xs">{next.registered ? <span className="text-success"><T k="You're registered ✓" /></span> : <span className="text-accent"><T k="Register »" /></span>}</p>
            </>
          ) : <p className="text-sm"><T k="No round scheduled yet" /></p>}
        </div>
      </Link>
      <Link href={p.profile ? `/profile/${p.profile.username}` : "/rating"} className="card flex items-start gap-3 p-4 hover:border-accent/50">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent"><BarChart3 className="h-5 w-5" /></span>
        <div>
          <p className="text-xs text-muted"><T k="Contest rating" /></p>
          {rating != null ? <p className={`text-xl font-semibold ${rank.className}`}>{rating} <span className="text-sm"><T k={rank.name} /></span></p> : <p className="font-semibold"><T k="Unrated" /></p>}
          <p className="text-xs text-muted">{rating != null ? `Max ${p.profile?.max_rating}` : tx("Finish a rated round to get one")}</p>
        </div>
      </Link>
      <Link href="/problemset" className="card flex items-start gap-3 p-4 hover:border-accent/50">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-success/10 text-success"><ListOrdered className="h-5 w-5" /></span>
        <div>
          <p className="text-xs text-muted"><T k="Problemset" /></p>
          <p className="text-xl font-semibold">{solved ?? "—"} <T k="solved" /></p>
          <p className="text-xs text-muted"><T k="Real problems with hidden tests →" /></p>
        </div>
      </Link>
    </div>
  );
}
