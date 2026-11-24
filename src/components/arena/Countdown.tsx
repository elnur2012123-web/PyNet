"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return d > 0 ? `${d} day${d === 1 ? "" : "s"} ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

/** Live countdown to `to`. Refreshes the page when it reaches zero (e.g. round starts). */
export function Countdown({ to, refresh = true, className = "" }: { to: string; refresh?: boolean; className?: string }) {
  const router = useRouter();
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      if (n >= target) {
        clearInterval(t);
        if (refresh) setTimeout(() => router.refresh(), 1200);
      }
    }, 1000);
    return () => { clearInterval(t); };
  }, [target, refresh, router]);
  return <span className={`font-mono tabular-nums ${className}`}>{now === null ? "--:--:--" : fmt(target - now)}</span>;
}

/** A date shown in the viewer's own time zone. */
export function LocalTime({ iso, withWeekday = false }: { iso: string; withWeekday?: boolean }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    setText(new Date(iso).toLocaleString(undefined, { weekday: withWeekday ? "short" : undefined, month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  }, [iso, withWeekday]);
  return <time dateTime={iso} suppressHydrationWarning>{text ?? new Date(iso).toISOString().slice(0, 16).replace("T", " ") + " UTC"}</time>;
}
