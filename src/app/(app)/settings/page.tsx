"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Camera, Crown, Download, LogOut, Trash2 } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Notice, Spinner } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { ACCENTS, DAILY, EXPERIENCE, GOALS } from "@/lib/profile-options";
import { passwordStrength } from "@/lib/password";

export default function SettingsPage() {
  const p = useProgress();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const sb = getBrowserSupabase();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ username: "", display_name: "", bio: "", country: "", experience_level: "", learning_goal: "", daily_goal_minutes: 20, is_public: true, show_stats: true, accent_theme: "default" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pw, setPw] = useState("");
  const [delOpen, setDelOpen] = useState(false);
  const [delText, setDelText] = useState("");

  useEffect(() => {
    const pr = p.profile;
    if (!pr) return;
    setForm({ username: pr.username, display_name: pr.display_name ?? "", bio: pr.bio ?? "", country: pr.country ?? "", experience_level: pr.experience_level ?? "", learning_goal: pr.learning_goal ?? "", daily_goal_minutes: pr.daily_goal_minutes ?? 20, is_public: pr.is_public, show_stats: pr.show_stats, accent_theme: pr.accent_theme });
  }, [p.profile]);

  const appearance = (
    <section className="card p-6">
      <h2 className="font-semibold">Appearance</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {["light", "dark", "system"].map((t) => <button key={t} onClick={() => setTheme(t)} className={`rounded-xl px-4 py-2 text-sm capitalize ${theme === t ? "bg-accent text-white" : "border border-border"}`}>{t}</button>)}
      </div>
    </section>
  );

  if (p.ready && p.mode !== "account") {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="h1">Settings</h1>
        {appearance}
        <Notice>{p.authConfigured ? <><Link href="/signin?next=/settings" className="link">Sign in</Link> to manage your profile, privacy and account.</> : "Accounts are not configured on this deployment; progress is stored in this browser."}</Notice>
        <button className="btn-secondary" onClick={() => { if (confirm("Reset all progress saved in this browser?")) { localStorage.removeItem("pynest-guest-v1"); location.reload(); } }}>Reset local progress</button>
      </div>
    );
  }

  const save = async () => {
    if (!sb || !p.profile) return;
    setErr(null);
    if (!/^[A-Za-z0-9_]{3,20}$/.test(form.username)) { setErr("Username must be 3–20 letters, numbers or underscores."); return; }
    setSaving(true);
    const update: Record<string, unknown> = {
      username: form.username, display_name: form.display_name.trim() || null, bio: form.bio.trim() || null, country: form.country.trim() || null,
      experience_level: form.experience_level || null, learning_goal: form.learning_goal || null, daily_goal_minutes: form.daily_goal_minutes,
      is_public: form.is_public, show_stats: form.show_stats,
    };
    if (form.accent_theme !== p.profile.accent_theme) update.accent_theme = form.accent_theme;
    const { error } = await sb.from("profiles").update(update).eq("id", p.profile.id);
    setSaving(false);
    if (error) setErr(error.code === "23505" ? "That username is taken." : error.message.includes("Pro or Max") ? "Profile themes require Pro or Max." : "Could not save. Please check your inputs.");
    else { toast({ kind: "success", title: "Settings saved" }); p.refresh(); }
  };

  const upload = async (file: File) => {
    if (!sb || !p.profile) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type) || file.size > 2 * 1024 * 1024) { toast({ kind: "error", title: "Use a PNG, JPG, WEBP or GIF under 2 MB" }); return; }
    setUploading(true);
    const path = `${p.profile.id}/avatar-${Date.now()}.${file.type.split("/")[1]}`;
    const { error } = await sb.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (!error) {
      const { data } = sb.storage.from("avatars").getPublicUrl(path);
      await sb.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", p.profile.id);
      p.refresh();
      toast({ kind: "success", title: "Avatar updated" });
    } else toast({ kind: "error", title: "Upload failed" });
    setUploading(false);
  };

  const changePassword = async () => {
    if (!sb) return;
    if (passwordStrength(pw).score < 3) { toast({ kind: "error", title: "Choose a stronger password", body: "At least 8 characters with letters, numbers and a symbol." }); return; }
    const { error } = await sb.auth.updateUser({ password: pw });
    toast(error ? { kind: "error", title: "Could not change password", body: error.message } : { kind: "success", title: "Password changed" });
    if (!error) setPw("");
  };

  const deleteAccount = async () => {
    const res = await fetch("/api/account/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirm: delText }) });
    if (res.ok) { localStorage.clear(); location.href = "/"; }
    else toast({ kind: "error", title: (await res.json().catch(() => ({}))).error ?? "Could not delete account" });
  };

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm((s) => ({ ...s, [k]: k === "daily_goal_minutes" ? Number(e.target.value) : e.target.value }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="h1">Settings</h1>

      <section className="card p-6">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <Avatar src={p.profile?.avatar_url} name={form.display_name || form.username} size={64} />
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} className="btn-secondary btn-sm" disabled={uploading}>{uploading ? <Spinner /> : <Camera className="h-3.5 w-3.5" />} Change avatar</button>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="s-user">Username</label><input id="s-user" className="input" value={form.username} onChange={f("username")} maxLength={20} /></div>
          <div><label className="label" htmlFor="s-name">Display name</label><input id="s-name" className="input" value={form.display_name} onChange={f("display_name")} maxLength={50} /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="s-bio">Bio</label><textarea id="s-bio" className="input" rows={3} value={form.bio} onChange={f("bio")} maxLength={280} /></div>
          <div><label className="label" htmlFor="s-country">Country <span className="text-muted">(optional)</span></label><input id="s-country" className="input" value={form.country} onChange={f("country")} maxLength={56} placeholder="e.g. Uzbekistan" /></div>
          <div><label className="label" htmlFor="s-exp">Experience</label><select id="s-exp" className="input" value={form.experience_level} onChange={f("experience_level")}><option value="">—</option>{EXPERIENCE.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
          <div><label className="label" htmlFor="s-goal">Learning goal</label><select id="s-goal" className="input" value={form.learning_goal} onChange={f("learning_goal")}><option value="">—</option>{GOALS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
          <div><label className="label" htmlFor="s-daily">Daily study goal</label><select id="s-daily" className="input" value={form.daily_goal_minutes} onChange={f("daily_goal_minutes")}>{DAILY.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
        </div>

        <h3 className="mt-6 text-sm font-semibold">Privacy</h3>
        <label className="mt-3 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5" checked={form.is_public} onChange={(e) => setForm((s) => ({ ...s, is_public: e.target.checked }))} /><span><span className="font-medium">Public profile</span><br /><span className="text-muted">Others can find you, view your profile and see you on leaderboards.</span></span></label>
        <label className="mt-3 flex items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5" checked={form.show_stats} onChange={(e) => setForm((s) => ({ ...s, show_stats: e.target.checked }))} /><span><span className="font-medium">Show learning statistics</span><br /><span className="text-muted">XP, lessons, streak and leaderboard rank. Your email is never shown.</span></span></label>

        <h3 className="mt-6 flex items-center gap-2 text-sm font-semibold">Profile accent <Crown className="h-3.5 w-3.5 text-accent2" /></h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {ACCENTS.map((a) => (
            <button key={a} disabled={p.plan === "FREE" && a !== "default"} onClick={() => setForm((s) => ({ ...s, accent_theme: a }))} data-accent={a === "default" ? undefined : a}
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm capitalize disabled:opacity-40 ${form.accent_theme === a ? "border-accent ring-2 ring-accent/30" : "border-border"}`}>
              <span className="h-3 w-3 rounded-full bg-accent" />{a}
            </button>
          ))}
        </div>
        {p.plan === "FREE" && <p className="mt-2 text-xs text-muted">Accent themes are a <Link href="/pricing" className="link">Pro/Max</Link> perk.</p>}

        {err && <div className="mt-4"><Notice kind="error">{err}</Notice></div>}
        <button onClick={save} disabled={saving} className="btn-primary mt-6">{saving && <Spinner />} Save changes</button>
      </section>

      {appearance}

      <section className="card p-6">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted">Signed in as {p.email}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="password" className="input" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" aria-label="New password" />
          <button onClick={changePassword} className="btn-secondary shrink-0" disabled={!pw}>Change password</button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <a href="/api/account/export" className="btn-secondary btn-sm"><Download className="h-3.5 w-3.5" /> Export my data</a>
          <button onClick={() => p.signOut(true)} className="btn-secondary btn-sm"><LogOut className="h-3.5 w-3.5" /> Sign out of all devices</button>
          <button onClick={() => setDelOpen(true)} className="btn-sm btn text-danger hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" /> Delete account</button>
        </div>
      </section>

      <Modal open={delOpen} onClose={() => setDelOpen(false)} title="Delete account">
        <p className="text-sm">This permanently deletes your profile, progress, XP, saved code and friends, and cancels any subscription. This cannot be undone.</p>
        <label className="label mt-4" htmlFor="del">Type <strong>DELETE</strong> to confirm</label>
        <input id="del" className="input" value={delText} onChange={(e) => setDelText(e.target.value)} />
        <div className="mt-4 flex justify-end gap-2"><button onClick={() => setDelOpen(false)} className="btn-secondary">Cancel</button><button onClick={deleteAccount} disabled={delText !== "DELETE"} className="btn-danger">Delete forever</button></div>
      </Modal>
    </div>
  );
}
