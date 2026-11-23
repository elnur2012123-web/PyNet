import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLS = [
  { title: "Learn", links: [["Curriculum", "/learn"], ["Practice", "/practice"], ["Quizzes", "/quizzes"], ["Projects", "/learn/m15-number-guessing"]] },
  { title: "Tools", links: [["Playground", "/playground"], ["PyBuddy tutor", "/tutor"], ["Error Explorer", "/errors"], ["Leaderboard", "/leaderboard"]] },
  { title: "Account", links: [["Dashboard", "/dashboard"], ["Pricing", "/pricing"], ["Billing", "/billing"], ["Settings", "/settings"]] },
  { title: "Legal", links: [["Terms of Service", "/terms"], ["Privacy Policy", "/privacy"]] },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted">Learn Python from absolute zero with interactive lessons, real code and a patient AI tutor.</p>
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
      <div className="border-t border-border py-5 text-center text-xs text-muted">© {new Date().getFullYear()} PyNest. Python is a trademark of the Python Software Foundation.</div>
    </footer>
  );
}
