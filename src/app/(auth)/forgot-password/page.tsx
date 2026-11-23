"use client";
import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { AuthNotConfigured } from "@/components/auth/AuthBits";
import { Notice, Spinner } from "@/components/ui/States";
import { isSupabaseConfigured, SITE_URL } from "@/lib/env";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!isSupabaseConfigured) return <AuthNotConfigured />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error: err } = await getBrowserSupabase()!.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${SITE_URL}/auth/callback?next=/reset-password` });
    setBusy(false);
    if (err && /rate/i.test(err.message)) setError("Too many requests. Please wait a minute and try again.");
    else setSent(true); // don't reveal whether the email exists
  };

  return (
    <div className="card p-6 sm:p-8">
      {sent ? (
        <div className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-success" />
          <h1 className="mt-3 text-xl font-semibold">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted">If an account exists for <strong>{email}</strong>, we've sent a secure link to reset your password. It expires soon, so use it right away.</p>
          <Link href="/signin" className="btn-secondary mt-6">Back to sign in</Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-1 text-sm text-muted">Enter your account email and we'll send you a recovery link.</p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div><label className="label" htmlFor="fp-email">Email address</label><input id="fp-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
            {error && <Notice kind="error">{error}</Notice>}
            <button className="btn-primary w-full" disabled={busy || !email}>{busy && <Spinner />} Send reset link</button>
          </form>
          <p className="mt-6 text-center text-sm text-muted"><Link href="/signin" className="link">Back to sign in</Link></p>
        </>
      )}
    </div>
  );
}
