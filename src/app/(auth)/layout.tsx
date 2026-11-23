import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(50%_40%_at_50%_0%,rgb(var(--accent)/0.10),transparent)]" />
      <header className="flex h-16 items-center justify-between px-4 sm:px-8"><Logo /><ThemeToggle /></header>
      <main id="main" className="flex flex-1 items-start justify-center px-4 pb-16 pt-6 sm:pt-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="pb-6 text-center text-xs text-muted"><Link href="/terms" className="hover:text-fg">Terms</Link> · <Link href="/privacy" className="hover:text-fg">Privacy</Link></footer>
    </div>
  );
}
