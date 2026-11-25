"use client";
import { T } from "@/components/i18n/T";
import { useMemo } from "react";

const DAY = 86400e3;
const iso = (d: Date) => d.toISOString().slice(0, 10);

/** One year of activity, one square per day (like a contribution graph). */
export function Heatmap({ days, solved }: { days: { day: string; count: number }[]; solved?: { all_time: number; last_year: number; last_month: number } | null }) {
  const { weeks, months, stats } = useMemo(() => {
    const map = new Map(days.map((d) => [d.day, d.count]));
    const today = new Date(iso(new Date()) + "T00:00:00Z");
    const start = new Date(today.getTime() - (52 * 7 + today.getUTCDay()) * DAY);
    const weeks: { date: string; count: number }[][] = [];
    const months: { col: number; label: string }[] = [];
    for (let w = 0; w < 53; w++) {
      const col: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(start.getTime() + (w * 7 + d) * DAY);
        if (dt > today) break;
        col.push({ date: iso(dt), count: map.get(iso(dt)) ?? 0 });
        if (dt.getUTCDate() === 1) months.push({ col: w, label: dt.toLocaleString(undefined, { month: "short", timeZone: "UTC" }) });
      }
      weeks.push(col);
    }
    // longest runs of active days
    const run = (from: number) => {
      let best = 0, cur = 0;
      for (let t = from; t <= today.getTime(); t += DAY) {
        cur = (map.get(iso(new Date(t))) ?? 0) > 0 ? cur + 1 : 0;
        best = Math.max(best, cur);
      }
      return best;
    };
    const all = days.length ? run(new Date(days[0].day + "T00:00:00Z").getTime()) : 0;
    return { weeks, months, stats: { all, year: run(today.getTime() - 365 * DAY), month: run(today.getTime() - 30 * DAY) } };
  }, [days]);

  const shade = (n: number) => (n === 0 ? "bg-elevated" : n === 1 ? "bg-green-300 dark:bg-green-900" : n <= 3 ? "bg-green-500 dark:bg-green-700" : n <= 6 ? "bg-green-600 dark:bg-green-500" : "bg-green-800 dark:bg-green-400");

  return (
    <div>
      <div className="thin-scroll overflow-x-auto pb-1">
        <div className="relative ml-8 h-4 min-w-[640px] text-[10px] text-muted">
          {months.map((m) => <span key={`${m.col}-${m.label}`} className="absolute" style={{ left: `${m.col * 12}px` }}>{m.label}</span>)}
        </div>
        <div className="flex min-w-[680px] gap-[2px]">
          <div className="mr-1 grid w-7 grid-rows-7 gap-[2px] text-[10px] text-muted">
            <span /> <span><T k="Mon" /></span> <span /> <span><T k="Wed" /></span> <span /> <span><T k="Fri" /></span> <span />
          </div>
          {weeks.map((col, w) => (
            <div key={w} className="grid grid-rows-7 gap-[2px]">
              {col.map((d) => <span key={d.date} title={`${d.count} on ${d.date}`} className={`h-[10px] w-[10px] rounded-[2px] ${shade(d.count)}`} />)}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {solved && (
          <>
            <div><p className="text-2xl font-semibold">{solved.all_time} <T k="problems" /></p><p className="text-xs text-muted"><T k="solved for all time" /></p></div>
            <div><p className="text-2xl font-semibold">{solved.last_year} <T k="problems" /></p><p className="text-xs text-muted"><T k="solved for the last year" /></p></div>
            <div><p className="text-2xl font-semibold">{solved.last_month} <T k="problems" /></p><p className="text-xs text-muted"><T k="solved for the last month" /></p></div>
          </>
        )}
        <div><p className="text-2xl font-semibold">{stats.all} <T k="day" />{stats.all === 1 ? "" : "s"}</p><p className="text-xs text-muted"><T k="in a row max." /></p></div>
        <div><p className="text-2xl font-semibold">{stats.year} <T k="day" />{stats.year === 1 ? "" : "s"}</p><p className="text-xs text-muted"><T k="in a row for the last year" /></p></div>
        <div><p className="text-2xl font-semibold">{stats.month} <T k="day" />{stats.month === 1 ? "" : "s"}</p><p className="text-xs text-muted"><T k="in a row for the last month" /></p></div>
      </div>
    </div>
  );
}
