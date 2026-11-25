"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { UserMinus, UserPlus, Users } from "lucide-react";

const LABEL: Record<string, string> = { founder: "Founder", co_founder: "Co-Founder", admin: "Admin" };
const CHIP: Record<string, string> = { founder: "bg-warn/20 text-warn", co_founder: "bg-accent2/15 text-accent2", admin: "bg-accent/15 text-accent" };

/** Staff list. The Founder can give roles and take them away again. */
export function StaffRoles({ role, run, version }: { role: string; run: (cmd: string) => Promise<void>; version: number }) {
  const [staff, setStaff] = useState<{ username: string; role: string }[] | null>(null);
  const [form, setForm] = useState({ user: "", role: "admin" });
  const founder = role === "founder";

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/staff", { cache: "no-store" });
    const j = await r.json().catch(() => ({}));
    setStaff(j.staff ?? []);
  }, []);
  useEffect(() => { load(); }, [load, version]);

  return (
    <section className="card p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Staff &amp; roles</h2>
      {staff === null ? <p className="mt-3 text-sm text-muted">Loading…</p> : (
        <ul className="mt-3 divide-y divide-border/70">
          {staff.map((s) => (
            <li key={s.username} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="flex items-center gap-2">
                <Link href={`/profile/${s.username}`} className="font-medium hover:underline">@{s.username}</Link>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${CHIP[s.role] ?? ""}`}>{LABEL[s.role] ?? s.role}</span>
              </span>
              {founder && s.role !== "founder" && (
                <button className="btn-ghost btn-sm text-danger" onClick={async () => {
                  if (!confirm(`Remove @${s.username}'s ${LABEL[s.role]} role? They become a normal user.`)) return;
                  await run(`/unrole @${s.username}`); load();
                }}><UserMinus className="h-4 w-4" /> Remove role</button>
              )}
            </li>
          ))}
        </ul>
      )}
      {founder ? (
        <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); await run(`/role @${form.user.replace(/^@/, "")} ${form.role}`); setForm({ ...form, user: "" }); load(); }}>
          <input className="input min-w-0 flex-1" placeholder="Username" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} required aria-label="Username for role" />
          <select className="input w-auto" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} aria-label="Role">
            <option value="admin">Admin</option><option value="co_founder">Co-Founder</option>
          </select>
          <button className="btn-secondary btn-sm" disabled={!form.user}><UserPlus className="h-4 w-4" /> Give role</button>
        </form>
      ) : <p className="mt-3 text-xs text-muted">Only the Founder can give or remove roles.</p>}
    </section>
  );
}
