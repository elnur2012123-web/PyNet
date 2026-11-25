"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ContestTabs({ id, started }: { id: number; started: boolean }) {
  const tx = useT();
  const path = usePathname();
  const tabs = [
    { href: `/contests/${id}`, label: tx("Problems") },
    ...(started ? [{ href: `/contests/${id}/standings`, label: tx("Standings") }, { href: `/submissions?contest=${id}`, label: tx("Status") }] : []),
  ];
  return (
    <nav className="flex flex-wrap gap-1" aria-label={tx("Contest")}>
      {tabs.map((t) => {
        const active = path === t.href || (t.href === `/contests/${id}` && path.startsWith(`/contests/${id}/problem`));
        return <Link key={t.href} href={t.href} className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${active ? "bg-elevated text-fg" : "text-muted hover:text-fg"}`}>{t.label}</Link>;
      })}
    </nav>
  );
}
