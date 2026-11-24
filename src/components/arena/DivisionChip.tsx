import { divisionOf } from "@/lib/arena/divisions";

export function DivisionChip({ division, long = false }: { division: string | null | undefined; long?: boolean }) {
  const d = divisionOf(division);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${d.className}`} title={`${d.name}: ${d.who}`}>
      {d.emoji} {d.name}{long && <span className="font-normal opacity-80"> · {d.who}</span>}
    </span>
  );
}
