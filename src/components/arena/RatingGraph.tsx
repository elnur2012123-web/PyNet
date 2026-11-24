"use client";
import Link from "next/link";
import { useState } from "react";
import { RANKS, rankFor } from "@/lib/arena/rank";

export interface RatingPoint { contest_id: number; title: string; ended_at: string; rank: number; old_rating: number; new_rating: number }

/** Rating history with rank-coloured background bands. */
export function RatingGraph({ points }: { points: RatingPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (!points.length) return <p className="py-10 text-center text-sm text-muted">No rated rounds yet. Join a contest to get a rating!</p>;
  const W = 760, H = 260, L = 44, Rr = 12, T = 10, B = 26;
  const values = points.flatMap((p) => [p.new_rating]).concat(points[0].old_rating);
  const minV = Math.max(0, Math.floor((Math.min(...values) - 150) / 100) * 100);
  const maxV = Math.ceil((Math.max(...values) + 150) / 100) * 100;
  const times = points.map((p) => new Date(p.ended_at).getTime());
  const t0 = times[0] - 86400e3 * 3, t1 = times[times.length - 1] + 86400e3 * 3;
  const x = (t: number) => L + ((t - t0) / Math.max(1, t1 - t0)) * (W - L - Rr);
  const y = (v: number) => T + (1 - (v - minV) / (maxV - minV)) * (H - T - B);
  const bands = RANKS.map((r, i) => ({ r, lo: Math.max(minV, r.min === -Infinity ? minV : r.min), hi: Math.min(maxV, RANKS[i + 1]?.min ?? maxV) })).filter((b) => b.hi > b.lo);
  const ticks = bands.map((b) => b.lo).filter((v) => v > minV);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(p.new_rating).toFixed(1)}`).join(" ");
  const h = hover !== null ? points[hover] : null;
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Rating history graph">
        {bands.map((b) => <rect key={b.r.name} x={L} width={W - L - Rr} y={y(b.hi)} height={y(b.lo) - y(b.hi)} fill={b.r.band} opacity={0.55} />)}
        {ticks.map((v) => <text key={v} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-muted text-[11px]">{v}</text>)}
        <rect x={L} y={T} width={W - L - Rr} height={H - T - B} fill="none" className="stroke-border" />
        <path d={path} fill="none" stroke="#ca8a04" strokeWidth={2} />
        {points.map((p, i) => (
          <circle key={p.contest_id} cx={x(times[i])} cy={y(p.new_rating)} r={hover === i ? 6 : 4} fill="#fff" stroke={i === points.length - 1 ? "#dc2626" : "#ca8a04"} strokeWidth={2}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} tabIndex={0} />
        ))}
        {[0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i).map((i) => (
          <text key={i} x={x(times[i])} y={H - 8} textAnchor="middle" className="fill-muted text-[11px]">{new Date(times[i]).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</text>
        ))}
      </svg>
      {h && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-xl border border-border bg-surface px-3 py-2 text-xs shadow-lg">
          <p className="font-semibold">= {h.new_rating} ({h.new_rating - h.old_rating >= 0 ? "+" : ""}{h.new_rating - h.old_rating}), {rankFor(h.new_rating).name}</p>
          <p>Rank: {h.rank}</p>
          <p className="text-muted">{h.title}</p>
        </div>
      )}
      <ul className="sr-only">{points.map((p) => <li key={p.contest_id}><Link href={`/contests/${p.contest_id}`}>{p.title}</Link>: {p.new_rating}</li>)}</ul>
    </div>
  );
}
