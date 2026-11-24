"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "./ThemeToggle";
import { UpdatesBell } from "@/components/updates/UpdatesBell";
import { useProgress } from "@/components/providers/ProgressProvider";

const LINKS = [
  { href: "/learn", label: "Course" },
  { href: "/practice", label: "Practice" },
  { href: "/playground", label: "Playground" },
  { href: "/tutor", label: "PyBuddy" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteHeader() {
  const p = useProgress();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">{l.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <UpdatesBell />
          <ThemeToggle />
          {p.ready && p.mode === "account" ? (
            <Link href="/dashboard" className="btn-primary btn-sm">Dashboard</Link>
          ) : (
            <>
              {p.authConfigured && <Link href="/signin" className="btn-ghost btn-sm hidden sm:inline-flex">Sign in</Link>}
              <Link href={p.authConfigured ? "/signup" : "/dashboard"} className="btn-primary btn-sm">Start learning</Link>
            </>
          )}
          <button onClick={() => setOpen((o) => !o)} className="btn-ghost btn-sm h-9 w-9 !p-0 md:hidden" aria-label="Menu" aria-expanded={open}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-3 md:hidden" aria-label="Mobile">
          {LINKS.map((l) => <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm hover:bg-elevated">{l.label}</Link>)}
          {p.authConfigured && p.mode === "guest" && <Link href="/signin" className="block rounded-lg px-3 py-2.5 text-sm hover:bg-elevated">Sign in</Link>}
        </nav>
      )}
    </header>
  );
}
