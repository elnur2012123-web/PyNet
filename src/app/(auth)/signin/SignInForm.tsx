"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProgress } from "@/components/providers/ProgressProvider";
import { AuthNotConfigured, GoogleButton, PasswordInput } from "@/components/auth/AuthBits";
import { Notice, Spinner } from "@/components/ui/States";
import { isSupabaseConfigured } from "@/lib/env";

export function SignInForm() {
  const params = useSearchParams();
  const p = useProgress();
  const rawNext = params.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error") === "link" ? "That link is invalid or has expired. Please try again." : null);

  if (!isSupabaseConfigured) return <AuthNotConfigured />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/signin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, password, remember }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setBusy(false); setError(d.error ?? "Sign in failed"); return; }
    // Full page load so no page cached while signed out is reused.
    window.location.assign(next);
  };

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Sign in to continue learning.</p>
      <div className="mt-6"><GoogleButton next={next} /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="id">Email or username</label>
          <input id="id" className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required autoFocus />
        </div>
        <div>
          <div className="flex items-center justify-between"><label className="label" htmlFor="pw">Password</label><Link href="/forgot-password" className="mb-1.5 text-xs text-accent hover:underline">Forgot password?</Link></div>
          <PasswordInput id="pw" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me on this device</label>
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn-primary w-full" disabled={busy || !identifier || !password}>{busy && <Spinner />} Sign in</button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New to PyNest? <Link href={`/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`} className="link font-medium">Create an account</Link></p>
    </div>
  );
}
