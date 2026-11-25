import { T } from "@/components/i18n/T";
import { LEAGUES } from "@/lib/xp";

export function LeagueBadge({ league, size = 36, showLabel = false }: { league: string; size?: number; showLabel?: boolean }) {
  const def = LEAGUES.find((l) => l.name === league) ?? LEAGUES[0];
  const tier = LEAGUES.findIndex((l) => l.name === def.name);
  return (
    <span className="inline-flex items-center gap-2" title={`${def.name} League`}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <path d="M20 2l15 6v11c0 9.5-6.4 16.4-15 19C11.4 35.4 5 28.5 5 19V8l15-6z" fill={def.color} />
        <path d="M20 6l11 4.5V19c0 7.3-4.8 12.7-11 14.8C13.8 31.7 9 26.3 9 19v-8.5L20 6z" fill="white" fillOpacity=".18" />
        {Array.from({ length: Math.min(tier + 1, 6) }).map((_, i) => (
          <circle key={i} cx={20 + (i - Math.min(tier, 5) / 2) * 4.2} cy={20} r="1.6" fill="white" />
        ))}
      </svg>
      {showLabel && <span className="text-sm font-medium"><T k={def.name} /></span>}
    </span>
  );
}
