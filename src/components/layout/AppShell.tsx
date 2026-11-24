"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity, AlertTriangle, Award, BarChart3, CalendarDays, ListOrdered, Swords, ShieldCheck, BookOpen, Bot, Code2, Crown, Flame, LayoutDashboard, ListChecks, Menu, Play, Settings, Trophy, Users, X, Zap,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "./ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";
import { UserMenu } from "./UserMenu";
import { UpdatesBell } from "@/components/updates/UpdatesBell";
import { useProgress } from "@/components/providers/ProgressProvider";
import { FloatingTutor } from "@/components/tutor/FloatingTutor";
import { formatXp } from "@/lib/xp";

const NAV_GROUPS = [
  { label: null, items: [{ href: "/dashboard", label: "Home", icon: LayoutDashboard }] },
  {
    label: "Learn",
    items: [
      { href: "/learn", label: "Course", icon: BookOpen },
      { href: "/practice", label: "Practice", icon: Code2 },
      { href: "/quizzes", label: "Quizzes", icon: ListChecks },
    ],
  },
  {
    label: "Compete",
    items: [
      { href: "/problemset", label: "Problemset", icon: ListOrdered },
      { href: "/contests", label: "Contests", icon: Swords },
      { href: "/rating", label: "Rating", icon: BarChart3 },
      { href: "/submissions", label: "Status", icon: Activity },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/playground", label: "Playground", icon: Play },
      { href: "/tutor", label: "PyBuddy", icon: Bot },
      { href: "/errors", label: "Error guide", icon: AlertTriangle },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
      { href: "/achievements", label: "Achievements", icon: Award },
      { href: "/friends", label: "Friends", icon: Users },
    ],
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const p = useProgress();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5"><Logo href="/" /></div>
      <nav className="thin-scroll flex-1 overflow-y-auto px-3" aria-label="Main">
        {NAV_GROUPS.map((g) => (
          <div key={g.label ?? "top"} className={g.label ? "mt-5" : ""}>
            {g.label && <p className="mb-1 px-3 text-xs font-medium text-muted/80">{g.label}</p>}
            <div className="space-y-0.5">
              {g.items.map((n) => {
                const active = path === n.href || path.startsWith(n.href + "/");
                return (
                  <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-accent/10 font-medium text-accent" : "text-muted hover:bg-elevated hover:text-fg"}`}>
                    <n.icon className="h-[18px] w-[18px]" /> {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="space-y-2 p-3">
        {p.plan !== "MAX" && (
          <Link href="/pricing" onClick={onNavigate} className="block rounded-2xl border border-border p-3.5 hover:bg-elevated">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Crown className="h-4 w-4 text-accent2" /> {p.plan === "FREE" ? "Try Pro" : "Try Max"}</p>
            <p className="mt-0.5 text-xs text-muted">{p.plan === "FREE" ? "Hard challenges, more projects — $5/month." : "Code reviews and every project."}</p>
          </Link>
        )}
        {p.profile?.role && p.profile.role !== "user" && (
          <Link href="/admin" onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${path.startsWith("/admin") ? "bg-danger/10 font-medium text-danger" : "text-muted hover:bg-elevated hover:text-fg"}`}>
            <ShieldCheck className="h-[18px] w-[18px]" /> Admin panel
          </Link>
        )}
        <Link href="/settings" onClick={onNavigate} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-elevated hover:text-fg">
          <Settings className="h-[18px] w-[18px]" /> Settings
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const p = useProgress();
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-surface lg:block"><SidebarContent /></aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-fade-up border-r border-border bg-surface">
            <button onClick={() => setOpen(false)} className="btn-ghost btn-sm absolute right-3 top-4" aria-label="Close menu"><X className="h-4 w-4" /></button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
        <button onClick={() => setOpen(true)} className="btn-ghost btn-sm h-9 w-9 !p-0 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <div className="flex-1"><GlobalSearch /></div>
        {p.ready && (
          <div className="hidden items-center gap-2 md:flex">
            <span className="chip" title="Learning streak"><Flame className="h-3.5 w-3.5 text-warn" /> {p.streak} day{p.streak === 1 ? "" : "s"}</span>
            <span className="chip" title="Total XP"><Zap className="h-3.5 w-3.5 text-accent" /> {formatXp(p.xp)} XP</span>
          </div>
        )}
        <UpdatesBell />
        <ThemeToggle />
        <UserMenu />
      </header>
      {p.ready && p.mode === "guest" && (
        <div className="border-b border-border bg-elevated/60 px-4 py-2 text-center text-xs text-muted sm:px-6">
          {p.authConfigured ? (
            <>You&apos;re browsing as a guest. <Link href="/signup" className="link">Create a free account</Link> to open lessons, practise and chat with PyBuddy.</>
          ) : (
            <>Local mode — accounts are not configured on this deployment, so progress is saved only in this browser.</>
          )}
        </div>
      )}
      <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      <FloatingTutor />
    </div>
  );
}
