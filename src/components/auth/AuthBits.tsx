"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { GOOGLE_AUTH_ENABLED, SITE_URL } from "@/lib/env";
import { passwordStrength } from "@/lib/password";

export function PasswordInput({ id, value, onChange, autoComplete, placeholder }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? "text" : "password"} className="input pr-10" value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} required />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted hover:text-fg" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = passwordStrength(password);
  const colors = ["bg-danger", "bg-danger", "bg-warn", "bg-success", "bg-success"];
  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1">{[0, 1, 2, 3].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i < score ? colors[score] : "bg-elevated"}`} />)}</div>
      <p className="mt-1 text-xs text-muted">Strength: {label}</p>
    </div>
  );
}

export function GoogleButton({ next = "/dashboard" }: { next?: string }) {
  if (!GOOGLE_AUTH_ENABLED) return null;
  return (
    <>
      <button type="button" className="btn-secondary w-full"
        onClick={() => getBrowserSupabase()?.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}` } })}>
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
    </>
  );
}

export function AuthNotConfigured() {
  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold">Accounts aren't configured yet</h1>
      <p className="mt-2 text-sm text-muted">This deployment has no Supabase project connected, so sign-up and sign-in are disabled. You can still learn in local mode — progress is saved in this browser.</p>
      <a href="/dashboard" className="btn-primary mt-5">Continue in local mode</a>
    </div>
  );
}
