"use client";
import { ArenaAdmin } from "./ArenaAdmin";
import { useCallback, useEffect, useRef, useState } from "react";
import { Gavel, ShieldCheck, Terminal } from "lucide-react";
import { Markdown } from "@/components/tutor/Markdown";
import { sendCommand } from "./useCommand";
import { Spinner } from "@/components/ui/States";

const ROLE_LABEL: Record<string, string> = { admin: "Admin", co_founder: "Co-Founder", founder: "Founder" };

export function AdminConsole({ role, username }: { role: string; username: string }) {
  const [history, setHistory] = useState<{ cmd: string; ok: boolean; message: string }[]>([]);
  const [cmd, setCmd] = useState("");
  const [busy, setBusy] = useState(false);
  const [bans, setBans] = useState("");
  const [log, setLog] = useState("");
  const [form, setForm] = useState({ user: "", duration: "1d", reason: "" });
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    const [b, l] = await Promise.all([sendCommand("/bans"), sendCommand("/log 15")]);
    setBans(b.message); setLog(l.message);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [history]);

  const run = async (c: string) => {
    if (!c.trim() || busy) return;
    setBusy(true);
    const r = await sendCommand(c.trim());
    setHistory((h) => [...h, { cmd: c.trim(), ...r }]);
    setBusy(false);
    if (/^\/(ban|unban|role)\b/.test(c)) refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-danger/10 text-danger"><ShieldCheck className="h-6 w-6" /></span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin panel</h1>
          <p className="text-sm text-muted">Signed in as @{username} · {ROLE_LABEL[role]}. Every action here is recorded in the moderation log.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card flex min-h-[420px] flex-col overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold"><Terminal className="h-4 w-4" /> Command console</div>
          <div className="thin-scroll flex-1 space-y-4 overflow-y-auto p-4">
            {history.length === 0 && <div className="text-sm text-muted"><Markdown text={"Type a command below, for example `/ban @username 7d spamming`, or `/help` for the full list. You can also type these commands in the PyBuddy chat."} /></div>}
            {history.map((h, i) => (
              <div key={i}>
                <p className="font-mono text-[13px] text-accent">&gt; {h.cmd}</p>
                <div className={`mt-1 rounded-xl border px-3 py-2 ${h.ok ? "border-border" : "border-danger/40 bg-danger/5"}`}><Markdown text={h.message} /></div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); run(cmd); setCmd(""); }} className="flex gap-2 border-t border-border p-3">
            <input className="input font-mono" value={cmd} onChange={(e) => setCmd(e.target.value)} placeholder="/ban @username 7d reason" aria-label="Command" />
            <button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : "Run"}</button>
          </form>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-semibold"><Gavel className="h-4 w-4" /> Quick ban</h2>
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); run(`/ban @${form.user.replace(/^@/, "")} ${form.duration} ${form.reason}`); setForm({ user: "", duration: "1d", reason: "" }); }}>
              <input className="input" placeholder="Username" value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })} required aria-label="Username" />
              <select className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} aria-label="Duration">
                <option value="1h">1 hour</option><option value="1d">1 day</option><option value="7d">7 days</option><option value="30d">30 days</option><option value="perm">Permanent</option>
              </select>
              <input className="input" placeholder="Reason (shown to the user)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} maxLength={300} aria-label="Reason" />
              <div className="flex gap-2">
                <button className="btn-danger flex-1" disabled={busy || !form.user}>Ban</button>
                <button type="button" className="btn-secondary flex-1" disabled={busy || !form.user} onClick={() => { run(`/unban @${form.user.replace(/^@/, "")}`); setForm({ ...form, user: "" }); }}>Unban</button>
              </div>
            </form>
          </section>
          <section className="card p-5"><h2 className="mb-2 font-semibold">Active bans</h2><Markdown text={bans || "Loading…"} /></section>
          <section className="card p-5"><h2 className="mb-2 font-semibold">Moderation log</h2><Markdown text={log || "Loading…"} /></section>
        </div>
      </div>
      <ArenaAdmin />
    </div>
  );
}
