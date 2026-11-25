"use client";
import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, Check, X } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useProgress } from "@/components/providers/ProgressProvider";
import { AuthNotConfigured, GoogleButton, PasswordInput, StrengthMeter } from "@/components/auth/AuthBits";
import { Notice, Spinner } from "@/components/ui/States";
import { isSupabaseConfigured, SITE_URL } from "@/lib/env";
import { passwordStrength } from "@/lib/password";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function SignUpForm() {
  const tx = useT();
  const router = useRouter();
  const params = useSearchParams();
  const rawNext = params.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "";
  const p = useProgress();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [uname, setUname] = useState<{ state: "idle" | "checking" | "ok" | "taken" | "invalid"; msg?: string }>({ state: "idle" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!username) { setUname({ state: "idle" }); return; }
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) { setUname({ state: "invalid", msg: "3–20 letters, numbers or underscores" }); return; }
    setUname({ state: "checking" });
    const t = setTimeout(async () => {
      const r = await fetch(`/api/auth/username?u=${encodeURIComponent(username)}`).then((x) => x.json()).catch(() => null);
      setUname(r?.available ? { state: "ok" } : { state: "taken", msg: r?.reason ?? "That username is taken" });
    }, 400);
    return () => clearTimeout(t);
  }, [username]);

  if (!isSupabaseConfigured) return <AuthNotConfigured />;

  const strength = passwordStrength(password);
  const errors = {
    email: email && !EMAIL_RE.test(email) ? "Enter a valid email address" : null,
    password: password && strength.score < 3 ? "Use at least 8 characters with a mix of letters, numbers and symbols" : null,
    confirm: confirm && confirm !== password ? "Passwords don't match" : null,
  };
  const valid = uname.state === "ok" && EMAIL_RE.test(email) && strength.score >= 3 && confirm === password && terms;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setBusy(true);
    setError(null);
    const sb = getBrowserSupabase()!;
    const { data, error: err } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username, display_name: username }, emailRedirectTo: `${SITE_URL}/auth/callback?next=/onboarding` },
    });
    if (err) {
      setBusy(false);
      setError(/registered|exists/i.test(err.message) ? "An account with this email already exists. Try signing in." : /username|profiles/i.test(err.message) ? "That username was just taken — please choose another." : err.message);
      return;
    }
    // Supabase returns a user with no identities when the email is already registered.
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setBusy(false);
      setError("An account with this email already exists. Try signing in.");
      return;
    }
    if (data.session && data.user && avatar) {
      const path = `${data.user.id}/avatar-${Date.now()}.${avatar.type.split("/")[1]}`;
      const up = await sb.storage.from("avatars").upload(path, avatar, { contentType: avatar.type });
      if (!up.error) await sb.from("profiles").update({ avatar_url: sb.storage.from("avatars").getPublicUrl(path).data.publicUrl }).eq("id", data.user.id);
    }
    if (data.session) {
      // Full page load so no page cached while signed out is reused.
      window.location.assign(next ? `/onboarding?next=${encodeURIComponent(next)}` : "/onboarding");
    } else {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight"><T k="Create your account" /></h1>
      <p className="mt-1 text-sm text-muted">{next ? tx("Create a free account to start this lesson — it takes 30 seconds.") : tx("Free forever. Your progress is saved and you can learn on any device.")}</p>
      <div className="mt-6"><GoogleButton next="/onboarding" /></div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => fileRef.current?.click()} className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-dashed border-border bg-elevated text-muted hover:border-accent" aria-label={tx("Choose a profile picture (optional)")}>
            {avatar ? <img src={URL.createObjectURL(avatar)} alt="" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f && f.size <= 2 * 1024 * 1024) setAvatar(f); }} />
          <p className="text-xs text-muted"><T k="Profile picture" />{" "}<span className="text-muted/80"><T k="(optional, max 2 MB)" /></span><T k=". You can also add it later in Settings." /></p>
        </div>
        <div>
          <label className="label" htmlFor="su-user"><T k="Username" /></label>
          <div className="relative">
            <input id="su-user" className="input pr-9" value={username} onChange={(e) => setUsername(e.target.value.trim())} autoComplete="username" maxLength={20} required aria-describedby="su-user-msg" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">{uname.state === "checking" ? <Spinner /> : uname.state === "ok" ? <Check className="h-4 w-4 text-success" /> : uname.state === "taken" || uname.state === "invalid" ? <X className="h-4 w-4 text-danger" /> : null}</span>
          </div>
          <p id="su-user-msg" className={`mt-1 text-xs ${uname.state === "ok" ? "text-success" : uname.msg ? "text-danger" : "text-muted"}`}>{uname.state === "ok" ? tx("Username is available") : uname.msg ?? tx("Shown on your public profile and the leaderboard")}</p>
        </div>
        <div>
          <label className="label" htmlFor="su-email"><T k="Email address" /></label>
          <input id="su-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value.trim())} autoComplete="email" required />
          {(touched || email) && errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="su-pw"><T k="Password" /></label>
          <PasswordInput id="su-pw" value={password} onChange={setPassword} autoComplete="new-password" />
          <StrengthMeter password={password} />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
        </div>
        <div>
          <label className="label" htmlFor="su-pw2"><T k="Confirm password" /></label>
          <PasswordInput id="su-pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" />
          {errors.confirm && <p className="mt-1 text-xs text-danger">{errors.confirm}</p>}
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-0.5" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
          <span><T k="I agree to the" />{" "}<Link href="/terms" className="link" target="_blank"><T k="Terms of Service" /></Link> <T k="and" />{" "}<Link href="/privacy" className="link" target="_blank"><T k="Privacy Policy" /></Link>.</span>
        </label>
        {touched && !terms && <p className="-mt-2 text-xs text-danger"><T k="Please accept the terms to continue." /></p>}
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />} <T k="Create account" /></button>
      </form>
      <p className="mt-6 text-center text-sm text-muted"><T k="Already have an account?" />{" "}<Link href={next ? `/signin?next=${encodeURIComponent(next)}` : "/signin"} className="link font-medium"><T k="Sign in" /></Link></p>
    </div>
  );
}
