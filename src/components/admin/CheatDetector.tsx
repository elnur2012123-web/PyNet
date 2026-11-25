"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Ban, Check, Code2, Loader2, ScanSearch, ShieldAlert, UserX } from "lucide-react";
import { rankFor } from "@/lib/arena/rank";

interface U { id: string; username: string; rating: number | null }
interface Flag {
  id: number; kind: "similar_code" | "fast_solve"; severity: "low" | "medium" | "high"; contest_id: number | null; problem_id: number | null;
  submission_id: number | null; other_submission_id: number | null; score: number; details: string; status: string; created_at: string;
  user: U | null; other: U | null; code: string | null; otherCode: string | null; contest: string | null;
}
const SEV = { high: "bg-danger text-white", medium: "bg-warn/20 text-warn", low: "bg-elevated text-muted" };

function Who({ u }: { u: U | null }) {
  if (!u) return <span className="text-muted">deleted user</span>;
  return <Link href={`/profile/${u.username}`} className={`font-semibold hover:underline ${rankFor(u.rating).className}`}>{u.username}</Link>;
}

export function CheatDetector({ canBan = true }: { canBan?: boolean }) {
  const [flags, setFlags] = useState<Flag[] | null>(null);
  const [rounds, setRounds] = useState<{ id: number; title: string }[]>([]);
  const [status, setStatus] = useState("open");
  const [open, setOpen] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [scanId, setScanId] = useState("");
  const [duration, setDuration] = useState("30d");

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/cheat?status=${status}`, { cache: "no-store" });
    const j = await r.json();
    setFlags(j.flags ?? []);
    setRounds(j.rounds ?? []);
  }, [status]);
  useEffect(() => { load(); }, [load]);

  const act = async (body: Record<string, unknown>, key: string) => {
    setBusy(key); setMsg(null);
    const r = await fetch("/api/admin/cheat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) setMsg({ ok: false, text: j.error || "Failed" });
    else setMsg({ ok: true, text: j.message ?? (j.added !== undefined ? `Scan finished: ${j.added} new flag${j.added === 1 ? "" : "s"}.` : "Done") });
    load();
  };

  return (
    <section className="card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-danger" /> Cheat detector</h3>
          <p className="text-xs text-muted">Every round is scanned automatically when it ends. Copies are found even if variables are renamed, spacing changed or comments added. Ratings wait until medium/high flags are reviewed (max 48 h).</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select className="input w-auto" value={scanId} onChange={(e) => setScanId(e.target.value)}>
            <option value="">Scan a round now…</option>
            {rounds.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <button className="btn-secondary btn-sm" disabled={!scanId || busy === "scan"} onClick={() => act({ action: "scan", contestId: Number(scanId) }, "scan")}>
            {busy === "scan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />} Scan
          </button>
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">Open</option><option value="actioned">Actioned</option><option value="dismissed">Dismissed</option><option value="all">All</option>
          </select>
        </div>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      {flags === null ? <p className="text-sm text-muted">Loading…</p> : flags.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">{status === "open" ? "No suspicious activity found. 🎉" : "Nothing here."}</p>
      ) : (
        <ul className="space-y-3">
          {flags.map((f) => (
            <li key={f.id} className="rounded-xl border border-border p-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${SEV[f.severity]}`}>{f.severity}</span>
                <span className="font-medium">{f.kind === "similar_code" ? `Same code · ${f.score}%` : "Very fast solve"}</span>
                {f.contest && <Link href={`/contests/${f.contest_id}/standings`} className="link text-xs">{f.contest}</Link>}
                <span className="ml-auto text-xs text-muted">{new Date(f.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-1 text-sm"><Who u={f.user} />{f.other && <> and <Who u={f.other} /></>}</p>
              <p className="mt-1 text-xs text-muted">{f.details}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button className="btn-ghost btn-sm" onClick={() => setOpen(open === f.id ? null : f.id)}><Code2 className="h-4 w-4" /> {open === f.id ? "Hide code" : "Compare code"}</button>
                {f.status === "open" && (
                  <>
                    <select className="input w-auto py-1 text-xs" value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Ban length">
                      <option value="7d">7 days</option><option value="30d">30 days</option><option value="perm">Permanent</option>
                    </select>
                    {canBan && <button className="btn-danger btn-sm" disabled={!!busy} onClick={() => act({ action: "ban", id: f.id, who: "user", duration }, `b${f.id}`)}><Ban className="h-4 w-4" /> Ban {f.user?.username}</button>}
                    {canBan && f.other && <button className="btn-danger btn-sm" disabled={!!busy} onClick={() => act({ action: "ban", id: f.id, who: "other", duration }, `o${f.id}`)}><Ban className="h-4 w-4" /> Ban {f.other.username}</button>}
                    {f.contest_id && <button className="btn-secondary btn-sm" disabled={!!busy} onClick={() => act({ action: "disqualify", id: f.id, who: "user" }, `d${f.id}`)}><UserX className="h-4 w-4" /> Disqualify {f.user?.username}</button>}
                    <button className="btn-ghost btn-sm" disabled={!!busy} onClick={() => act({ action: "dismiss", id: f.id }, `x${f.id}`)}><Check className="h-4 w-4" /> Not cheating</button>
                  </>
                )}
                {f.status !== "open" && <span className="chip">{f.status}</span>}
              </div>
              {open === f.id && (
                <div className={`mt-3 grid gap-2 ${f.otherCode ? "md:grid-cols-2" : ""}`}>
                  <div><p className="mb-1 text-xs text-muted">{f.user?.username} · <Link className="link" href={`/submissions/${f.submission_id}`}>#{f.submission_id}</Link></p><pre className="code-block max-h-80 overflow-auto text-xs">{f.code}</pre></div>
                  {f.otherCode && <div><p className="mb-1 text-xs text-muted">{f.other?.username} · <Link className="link" href={`/submissions/${f.other_submission_id}`}>#{f.other_submission_id}</Link></p><pre className="code-block max-h-80 overflow-auto text-xs">{f.otherCode}</pre></div>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted">Banning also removes the user from that round&apos;s standings. Ban only after comparing the code — two people can honestly write the same short solution.</p>
    </section>
  );
}
