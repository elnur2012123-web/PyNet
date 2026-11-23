"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge } from "@/components/ui/PlanBadge";

export function UserMenu() {
  const p = useProgress();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!p.ready) return <div className="h-9 w-9 animate-pulse rounded-full bg-elevated" />;
  if (p.mode === "guest") {
    if (!p.authConfigured) return <span className="chip" title="Accounts are not configured on this deployment">Local mode</span>;
    return (
      <div className="flex items-center gap-2">
        <Link href="/signin" className="btn-ghost btn-sm hidden sm:inline-flex">Sign in</Link>
        <Link href="/signup" className="btn-primary btn-sm">Sign up</Link>
      </div>
    );
  }
  const name = p.profile?.display_name || p.profile?.username || "You";
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-border" aria-haspopup="menu" aria-expanded={open} aria-label="Account menu">
        <Avatar src={p.profile?.avatar_url} name={name} size={34} />
      </button>
      {open && (
        <div role="menu" className="card absolute right-0 top-11 z-50 w-60 animate-fade-up p-1.5">
          <div className="px-3 py-2.5">
            <p className="flex items-center gap-2 truncate text-sm font-semibold">{name} <PlanBadge plan={p.plan} /></p>
            <p className="truncate text-xs text-muted">@{p.profile?.username}</p>
          </div>
          <div className="my-1 h-px bg-border" />
          {[
            { href: `/profile/${p.profile?.username}`, label: "Public profile", icon: User },
            { href: "/billing", label: "Billing & plan", icon: CreditCard },
            { href: "/settings", label: "Settings", icon: Settings },
          ].map((i) => (
            <Link key={i.href} href={i.href} role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-elevated">
              <i.icon className="h-4 w-4 text-muted" /> {i.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button role="menuitem" onClick={() => p.signOut()} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-danger hover:bg-elevated">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
