import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLS = [
  { title: "Learn", links: [["Course", "/learn"], ["Practice", "/practice"], ["Quizzes", "/quizzes"], ["Projects", "/learn/m15-number-guessing"]] },
  { title: "Tools", links: [["Playground", "/playground"], ["PyBuddy", "/tutor"], ["Error guide", "/errors"]] },
  { title: "Community", links: [["Leaderboard", "/leaderboard"], ["Friends", "/friends"], ["Achievements", "/achievements"]] },
  { title: "PyNest", links: [["Pricing", "/pricing"], ["Terms", "/terms"], ["Privacy", "/privacy"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">A friendly place to learn Python from scratch — short lessons, real code, and help whenever you get stuck.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="mb-3 text-sm font-semibold">{c.title}</p>
            <ul className="space-y-2">
              {c.links.map(([label, href]) => <li key={href}><Link href={href} className="text-sm text-muted hover:text-fg">{label}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">© {new Date().getFullYear()} PyNest · Made for people learning their first programming language. “Python” is a trademark of the Python Software Foundation.</div>
    </footer>
  );
}
