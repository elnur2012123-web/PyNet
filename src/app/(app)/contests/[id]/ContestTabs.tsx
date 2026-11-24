"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContestTabs({ id, started }: { id: number; started: boolean }) {
  const path = usePathname();
  const tabs = [
    { href: `/contests/${id}`, label: "Problems" },
    ...(started ? [{ href: `/contests/${id}/standings`, label: "Standings" }, { href: `/submissions?contest=${id}`, label: "Status" }] : []),
  ];
  return (
    <nav className="flex flex-wrap gap-1" aria-label="Contest">
      {tabs.map((t) => {
        const active = path === t.href || (t.href === `/contests/${id}` && path.startsWith(`/contests/${id}/problem`));
        return <Link key={t.href} href={t.href} className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${active ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`}>{t.label}</Link>;
      })}
    </nav>
  );
}
