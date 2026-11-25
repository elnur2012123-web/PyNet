"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { intlLocale } from "@/i18n/translate";

interface Item { id: number; title: string; starts_at: string; duration_minutes: number }
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export function ContestCalendar({ contests }: { contests: Item[] }) {
  const tx = useT();
  const [month, setMonth] = useState<Date | null>(null);
  const loc = intlLocale(useLocale());
  const WEEKDAYS = Array.from({ length: 7 }, (_, i) => new Date(2023, 0, 1 + i).toLocaleString(loc, { weekday: "short" }));
  const [tz, setTz] = useState("");
  useEffect(() => {
    const n = new Date();
    setMonth(new Date(n.getFullYear(), n.getMonth(), 1));
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  const byDay = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const c of contests) {
      const k = key(new Date(c.starts_at));
      m.set(k, [...(m.get(k) ?? []), c].sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at)));
    }
    return m;
  }, [contests]);
  if (!month) return <div className="card h-[560px] animate-pulse" />;
  const first = new Date(month.getFullYear(), month.getMonth(), 1 - month.getDay());
  const cells = Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
  const rows = cells[35].getMonth() !== month.getMonth() ? cells.slice(0, 35) : cells;
  const today = key(new Date());
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <button className="btn-secondary btn-sm" onClick={() => { const n = new Date(); setMonth(new Date(n.getFullYear(), n.getMonth(), 1)); }}><T k="Today" /></button>
        <button className="btn-ghost btn-sm" onClick={() => shift(-1)} aria-label={tx("Previous month")}><ChevronLeft className="h-4 w-4" /></button>
        <button className="btn-ghost btn-sm" onClick={() => shift(1)} aria-label={tx("Next month")}><ChevronRight className="h-4 w-4" /></button>
        <h2 className="text-lg font-semibold">{month.toLocaleString(loc, { month: "long", year: "numeric" })}</h2>
      </div>
      <div className="grid grid-cols-7 border-b border-border text-center text-xs font-medium text-muted">
        {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {rows.map((d) => {
          const items = byDay.get(key(d)) ?? [];
          const inMonth = d.getMonth() === month.getMonth();
          return (
            <div key={key(d)} className={`min-h-[92px] border-b border-r border-border/70 p-1.5 text-xs ${inMonth ? "" : "bg-elevated/40 text-muted"}`}>
              <div className="mb-1 text-center">
                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 ${key(d) === today ? "bg-accent font-semibold text-white" : ""}`}>{d.getDate() === 1 ? d.toLocaleString(loc, { month: "short", day: "numeric" }) : d.getDate()}</span>
              </div>
              <div className="space-y-0.5">
                {items.map((c) => (
                  <Link key={c.id} href={`/contests/${c.id}`} className="block truncate rounded px-1 py-0.5 hover:bg-accent/10" title={c.title}>
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
                    {new Date(c.starts_at).toLocaleTimeString(loc, { hour: "numeric", minute: "2-digit" })} <b>{c.title}</b>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-4 py-3 text-xs text-muted"><T k="Events shown in your time zone" />{tz ? `: ${tz}` : ""}.</p>
    </div>
  );
}
