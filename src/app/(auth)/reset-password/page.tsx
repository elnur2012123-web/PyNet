"use client";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthNotConfigured, PasswordInput, StrengthMeter } from "@/components/auth/AuthBits";
import { Notice, Spinner } from "@/components/ui/States";
import { isSupabaseConfigured } from "@/lib/env";
import { passwordStrength } from "@/lib/password";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { getBrowserSupabase()?.auth.getUser().then(({ data }) => setHasSession(Boolean(data.user))); }, []);
  if (!isSupabaseConfigured) return <AuthNotConfigured />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordStrength(pw).score < 3) { setError("Use at least 8 characters with a mix of letters, numbers and symbols."); return; }
    if (pw !== pw2) { setError("Passwords don't match."); return; }
    setBusy(true); setError(null);
    const { error: err } = await getBrowserSupabase()!.auth.updateUser({ password: pw });
    setBusy(false);
    if (err) setError(err.message);
    else router.push("/dashboard?password=updated");
  };

  if (hasSession === false) {
    return (
      <div className="card p-6 sm:p-8">
        <h1 className="text-xl font-semibold"><T k="This link has expired" /></h1>
        <p className="mt-2 text-sm text-muted"><T k="Password reset links can only be used once and expire quickly. Request a new one." /></p>
        <Link href="/forgot-password" className="btn-primary mt-5"><T k="Send a new link" /></Link>
      </div>
    );
  }

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight"><T k="Choose a new password" /></h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div><label className="label" htmlFor="rp1"><T k="New password" /></label><PasswordInput id="rp1" value={pw} onChange={setPw} autoComplete="new-password" /><StrengthMeter password={pw} /></div>
        <div><label className="label" htmlFor="rp2"><T k="Confirm new password" /></label><PasswordInput id="rp2" value={pw2} onChange={setPw2} autoComplete="new-password" /></div>
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn-primary w-full" disabled={busy || hasSession === null}>{busy && <Spinner />} <T k="Save new password" /></button>
      </form>
    </div>
  );
}
