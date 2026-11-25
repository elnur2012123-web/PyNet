"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Check, Pencil, Plus, Shield, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { PERMISSIONS, ROLE_CHIP, ROLE_COLORS, type Permission } from "@/lib/permissions";

interface Role { id: string; name: string; color: string; rank: number; permissions: string[]; show_title: boolean; is_system: boolean }
interface Member { username: string; role: string; role_name: string; color: string; rank: number }
interface Me { role: string; rank: number; permissions: Permission[] }
interface Draft { id: string | null; name: string; color: string; rank: number; permissions: string[]; showTitle: boolean }

export function RoleChip({ name, color }: { name: string; color: string }) {
  return <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${ROLE_CHIP[color] ?? ROLE_CHIP.gray}`}>{name}</span>;
}

/** Staff list, giving/removing roles, and the role editor (create roles with permission checkboxes). */
export function RolesManager({ run, version }: { run: (cmd: string) => Promise<void>; version: number }) {
  const [data, setData] = useState<{ staff: Member[]; roles: Role[]; me: Me } | null>(null);
  const [give, setGive] = useState({ user: "", role: "" });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/staff", { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (j?.roles) setData(j);
  }, []);
  useEffect(() => { load(); }, [load, version]);

  if (!data) return <section className="card p-5 text-sm text-muted">Loading roles…</section>;
  const { staff, roles, me } = data;
  const founder = me.role === "founder";
  const canManage = me.permissions.includes("manage_roles");
  const below = (rank: number) => founder || rank < me.rank;
  const assignable = roles.filter((r) => r.id !== "founder" && r.id !== "user" && below(r.rank));

  const post = async (body: Record<string, unknown>, ok: string) => {
    setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: j.error || "Failed" }); return false; }
    setMsg({ ok: true, text: ok }); load(); return true;
  };
  const save = async () => {
    if (!draft) return;
    if (await post({ action: "save", id: draft.id, name: draft.name, color: draft.color, rank: draft.rank, permissions: draft.permissions, showTitle: draft.showTitle }, draft.id ? `Role "${draft.name}" saved.` : `Role "${draft.name}" created. Give it to someone below.`)) setDraft(null);
  };

  return (
    <section className="card space-y-5 p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Users className="h-4 w-4" /> Staff &amp; roles</h2>
      {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}

      {/* members */}
      <ul className="divide-y divide-border/70">
        {staff.map((s) => (
          <li key={s.username} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
            <span className="flex items-center gap-2"><Link href={`/profile/${s.username}`} className="font-medium hover:underline">@{s.username}</Link><RoleChip name={s.role_name} color={s.color} /></span>
            {canManage && s.role !== "founder" && below(s.rank) && (
              <span className="flex items-center gap-1">
                <select className="input w-auto py-1 text-xs" value={s.role} aria-label={`Role of ${s.username}`} disabled={busy}
                  onChange={async (e) => { await run(`/role @${s.username} ${e.target.value}`); load(); }}>
                  {[...assignable, ...(assignable.some((r) => r.id === s.role) ? [] : [{ id: s.role, name: s.role_name } as Role])].map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button className="btn-ghost btn-sm text-danger" onClick={async () => {
                  if (!confirm(`Remove @${s.username}'s ${s.role_name} role? They become a normal user.`)) return;
                  await run(`/unrole @${s.username}`); load();
                }}><UserMinus className="h-4 w-4" /> Remove role</button>
              </span>
            )}
          </li>
        ))}
      </ul>

      {canManage ? (
        <form className="flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); await run(`/role @${give.user.replace(/^@/, "")} ${give.role || assignable[0]?.id}`); setGive({ ...give, user: "" }); load(); }}>
          <input className="input min-w-0 flex-1" placeholder="Username" value={give.user} onChange={(e) => setGive({ ...give, user: e.target.value })} required aria-label="Username for role" />
          <select className="input w-auto" value={give.role || assignable[0]?.id || ""} onChange={(e) => setGive({ ...give, role: e.target.value })} aria-label="Role to give">
            {assignable.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="btn-secondary btn-sm" disabled={!give.user || !assignable.length}><UserPlus className="h-4 w-4" /> Give role</button>
        </form>
      ) : <p className="text-xs text-muted">Your role can&apos;t give or remove roles.</p>}

      {/* role editor */}
      {canManage && (
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Shield className="h-4 w-4" /> Roles</h3>
            {!draft && <button className="btn-primary btn-sm" onClick={() => setDraft({ id: null, name: "", color: "teal", rank: Math.min(50, (founder ? 100 : me.rank) - 1), permissions: [], showTitle: true })}><Plus className="h-4 w-4" /> New role</button>}
          </div>

          {draft && (
            <div className="space-y-3 rounded-xl border border-accent/40 bg-accent/5 p-4">
              <p className="text-sm font-semibold">{draft.id ? `Edit role` : "Create a new role"}</p>
              <div className="grid gap-2 sm:grid-cols-[1fr_110px]">
                <label className="space-y-1 text-sm"><span className="label">Name</span><input className="input w-full" maxLength={24} placeholder="e.g. Problem Setter" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label>
                <label className="space-y-1 text-sm"><span className="label">Rank (1–{founder ? 99 : me.rank - 1})</span><input type="number" min={1} max={founder ? 99 : me.rank - 1} className="input w-full" value={draft.rank} onChange={(e) => setDraft({ ...draft, rank: Number(e.target.value) })} /></label>
              </div>
              <div>
                <span className="label">Colour</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {ROLE_COLORS.map((c) => (
                    <button type="button" key={c} onClick={() => setDraft({ ...draft, color: c })} aria-label={c}
                      className={`rounded-md px-2 py-1 text-xs font-semibold ${ROLE_CHIP[c]} ${draft.color === c ? "ring-2 ring-accent" : ""}`}>{draft.name || "Role"}</button>
                  ))}
                </div>
              </div>
              <fieldset className="space-y-1.5">
                <legend className="label">What can this role do?</legend>
                {PERMISSIONS.map((p) => {
                  const mine = founder || me.permissions.includes(p.id);
                  return (
                    <label key={p.id} className={`flex items-start gap-2 rounded-lg p-1.5 text-sm ${mine ? "hover:bg-elevated" : "opacity-50"}`} title={mine ? "" : "You can't give a permission you don't have"}>
                      <input type="checkbox" className="mt-1" disabled={!mine} checked={draft.permissions.includes(p.id)}
                        onChange={(e) => setDraft({ ...draft, permissions: e.target.checked ? [...draft.permissions, p.id] : draft.permissions.filter((x) => x !== p.id) })} />
                      <span><span className="font-medium">{p.label}</span><span className="block text-xs text-muted">{p.hint}</span></span>
                    </label>
                  );
                })}
              </fieldset>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.showTitle} onChange={(e) => setDraft({ ...draft, showTitle: e.target.checked })} /> Show the role name as a title on profiles and the leaderboard</label>
              <p className="text-xs text-muted">Rank decides who outranks whom: people can only ban, give or edit roles ranked below their own. A role with no permissions is just a title.</p>
              <div className="flex gap-2">
                <button className="btn-primary btn-sm" disabled={busy || draft.name.trim().length < 2} onClick={save}><Check className="h-4 w-4" /> {draft.id ? "Save changes" : "Create role"}</button>
                <button className="btn-ghost btn-sm" onClick={() => setDraft(null)}><X className="h-4 w-4" /> Cancel</button>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {roles.filter((r) => r.id !== "user").map((r) => {
              const editable = r.id !== "founder" && below(r.rank);
              return (
                <li key={r.id} className="rounded-xl border border-border p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <RoleChip name={r.name} color={r.color} />
                    <span className="text-xs text-muted">rank {r.rank} · {staff.filter((s) => s.role === r.id).length} member{staff.filter((s) => s.role === r.id).length === 1 ? "" : "s"}</span>
                    {editable && (
                      <span className="ml-auto flex gap-1">
                        <button className="btn-ghost btn-sm" onClick={() => setDraft({ id: r.id, name: r.name, color: r.color, rank: r.rank, permissions: r.permissions, showTitle: r.show_title })}><Pencil className="h-3.5 w-3.5" /> Edit</button>
                        {!r.is_system && <button className="btn-ghost btn-sm text-danger" onClick={() => { if (confirm(`Delete the role "${r.name}"? Its members become normal users.`)) post({ action: "delete", id: r.id }, `Role "${r.name}" deleted.`); }}><Trash2 className="h-3.5 w-3.5" /> Delete</button>}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {r.id === "founder" ? "Can do everything." : r.permissions.length ? r.permissions.map((p) => PERMISSIONS.find((x) => x.id === p)?.label ?? p).join(" · ") : "No permissions — title only."}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
