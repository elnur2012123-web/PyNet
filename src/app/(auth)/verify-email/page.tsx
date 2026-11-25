"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MailOpen } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { SITE_URL } from "@/lib/env";
import { Spinner } from "@/components/ui/States";

function Verify() {
  const tx = useT();
  const email = useSearchParams().get("email") ?? "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const resend = async () => {
    setState("sending");
    const { error } = await getBrowserSupabase()!.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${SITE_URL}/auth/callback?next=/onboarding` } });
    setState(error ? "error" : "sent");
  };
  return (
    <div className="card p-6 text-center sm:p-8">
      <MailOpen className="mx-auto h-10 w-10 text-accent" />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight"><T k="Verify your email" /></h1>
      <p className="mt-2 text-sm text-muted"><T k="We sent a confirmation link to" />{" "}{email ? <strong className="text-fg">{email}</strong> : "your email"}<T k=". Click it to activate your account — then we'll set up your learning path." /></p>
      <div className="mt-6 flex flex-col gap-2">
        {email && <button onClick={resend} disabled={state === "sending" || state === "sent"} className="btn-secondary">{state === "sending" && <Spinner />}{state === "sent" ? tx("Email sent again ✓") : tx("Resend email")}</button>}
        {state === "error" && <p className="text-xs text-danger"><T k="Couldn't resend right now. Please wait a minute and try again." /></p>}
        <Link href="/signin" className="btn-ghost"><T k="Back to sign in" /></Link>
      </div>
      <p className="mt-4 text-xs text-muted"><T k="Can't find it? Check your spam folder." /></p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return <Suspense><Verify /></Suspense>;
}
