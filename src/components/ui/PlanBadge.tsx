import type { Plan } from "@/lib/plans";

export function PlanBadge({ plan, className = "" }: { plan: Plan; className?: string }) {
  if (plan === "FREE") return null;
  const style = plan === "MAX"
    ? "bg-gradient-to-r from-accent2 to-accent text-white"
    : "bg-accent/10 text-accent ring-1 ring-accent/30";
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${style} ${className}`}>{plan}</span>;
}
