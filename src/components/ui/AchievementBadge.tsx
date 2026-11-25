import { T } from "@/components/i18n/T";
import { achievementById, tierOf, TIER_LABEL, type Tier } from "@/lib/achievements";
import { Icon } from "@/components/ui/Icon";

const STYLE: Record<Tier, { ring: string; fill: string; chip: string }> = {
  bronze: { ring: "from-[#e0a070] to-[#8a5530]", fill: "from-[#c98552] to-[#9c6236]", chip: "bg-[#b4774a]/15 text-[#9c6236] ring-[#b4774a]/40 dark:text-[#e0a070]" },
  silver: { ring: "from-[#eef2f7] to-[#8a94a3]", fill: "from-[#aeb8c6] to-[#6f7a89]", chip: "bg-slate-400/15 text-slate-600 ring-slate-400/50 dark:text-slate-300" },
  gold: { ring: "from-[#ffe58a] to-[#c78c00]", fill: "from-[#f5c242] to-[#d49a06]", chip: "bg-amber-400/15 text-amber-700 ring-amber-400/50 dark:text-amber-300" },
  legendary: { ring: "from-[#7ee8fa] via-[#a66bff] to-[#ff6bd6]", fill: "from-[#6b8cff] to-[#a66bff]", chip: "bg-violet-500/15 text-violet-700 ring-violet-500/50 dark:text-violet-300" },
};

/** Round medal for an achievement: coloured ring by rarity, icon in the middle. */
export function BadgeMedal({ id, size = 48, locked = false }: { id: string; size?: number; locked?: boolean }) {
  const a = achievementById(id);
  const tier = tierOf(id);
  const st = STYLE[tier];
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full p-[3px] ${locked ? "bg-border" : `bg-gradient-to-br ${st.ring}`}`} style={{ width: size, height: size }} title={a ? `${a.name} · ${TIER_LABEL[tier]}` : id}>
      <span className={`grid h-full w-full place-items-center rounded-full ${locked ? "bg-elevated text-muted" : `bg-gradient-to-br ${st.fill} text-white`}`}>
        <Icon name={a?.icon ?? "trophy"} className="h-[45%] w-[45%]" />
      </span>
      {tier === "legendary" && !locked && <span className="pointer-events-none absolute inset-0 animate-pulse rounded-full ring-2 ring-violet-400/40" />}
    </span>
  );
}

/** Small pill shown next to a name: "🏅 Pythonista". */
export function BadgeChip({ id, className = "" }: { id: string | null | undefined; className?: string }) {
  if (!id) return null;
  const a = achievementById(id);
  if (!a) return null;
  const tier = tierOf(id);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${STYLE[tier].chip} ${className}`} title={`${a.description} · ${TIER_LABEL[tier]} badge`}>
      <Icon name={a.icon} className="h-3 w-3" /> <T k={a.name} />
    </span>
  );
}
