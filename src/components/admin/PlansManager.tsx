"use client";
import { useCallback, useEffect, useState } from "react";
import { Crown, Loader2, Search } from "lucide-react";

interface Info { username: string; plan: "FREE" | "PRO" | "MAX"; manual: boolean; until: string | null; renews: boolean; extended?: boolean }
interface Grant { username: string; plan: string; interval: string; from: string; until: string }

async function call(body: Record<string, unknown>) {
  const r = await fetch("/api/admin/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" }) : "");
const planName = (p: string) => (p === "MAX" ? "Max" : p === "PRO" ? "Pro" : "Free");

/** Give users Pro or Max by hand, for payments made outside the site. */
export function PlansManager() {
  const [username, setUsername] = useState("");
  const [plan, setPlan] = useState<"PRO" | "MAX">("PRO");
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [count, setCount] = useState(1);
  const [info, setInfo] = useState<Info | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const loadGrants = useCallback(async () => {
    const r = await fetch("/api/admin/plans", { cache: "no-store" });
    if (r.ok) setGrants((await r.json()).grants ?? []);
  }, []);
  useEffect(() => { loadGrants(); }, [loadGrants]);

  const run = async (action: "lookup" | "give" | "remove") => {
    const u = username.trim().replace(/^@/, "");
    if (!u) return;
    if (action === "remove" && !confirm(`Remove @${u}'s plan now? They go back to Free immediately.`)) return;
    setBusy(action); setMsg(null);
    try {
      const j: Info = await call({ action, username: u, plan, interval, count });
      setInfo(j);
      if (action === "give") setMsg({ ok: true, text: `@${j.username} now has ${planName(j.plan)} until ${day(j.until)}${j.extended ? " (added to the time they already had)" : ""}.` });
      if (action === "remove") setMsg({ ok: true, text: `@${j.username} is back on Free.` });
      if (action !== "lookup") loadGrants();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); setInfo(null); }
    setBusy(null);
  };

  const length = `${count} ${interval}${count > 1 ? "s" : ""}`;
  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="flex items-center gap-2 font-semibold"><Crown className="h-4 w-4 text-amber-500" /> Give a plan</h2>
        <p className="mt-1 text-sm text-muted">For people who paid you directly (for example by Click or Payme). The plan switches back to Free by itself when the time runs out.</p>
      </div>
      {msg && <p className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run("give"); }}>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input w-full pl-9" placeholder="@username" value={username}
              onChange={(e) => { setUsername(e.target.value); setInfo(null); }} onBlur={() => username.trim() && run("lookup")} />
          </label>
          {info && (
            <p className="rounded-lg bg-elevated/60 px-3 py-2 text-sm">
              @{info.username}: <b>{planName(info.plan)}</b>
              {info.plan !== "FREE" && (info.manual ? ` (given by hand) until ${day(info.until)}` : info.renews ? " (pays through the payment provider, renews automatically)" : ` (paid, ends ${day(info.until)})`)}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <label className="space-y-1"><span className="label">Plan</span>
              <select className="input w-full" value={plan} onChange={(e) => setPlan(e.target.value as "PRO" | "MAX")}><option value="PRO">Pro</option><option value="MAX">Max</option></select></label>
            <label className="space-y-1"><span className="label">For</span>
              <input type="number" min={1} max={interval === "year" ? 5 : 24} className="input w-full" value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} /></label>
            <label className="space-y-1"><span className="label">&nbsp;</span>
              <select className="input w-full" value={interval} onChange={(e) => { setInterval(e.target.value as "month" | "year"); setCount(1); }}><option value="month">month(s)</option><option value="year">year(s)</option></select></label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary btn-sm" disabled={!username.trim() || busy !== null}>{busy === "give" && <Loader2 className="h-4 w-4 animate-spin" />} Give {planName(plan)} for {length}</button>
            <button type="button" className="btn-ghost btn-sm text-danger" disabled={!username.trim() || busy !== null || info?.plan === "FREE"} onClick={() => run("remove")}>{busy === "remove" && <Loader2 className="h-4 w-4 animate-spin" />} Remove plan</button>
          </div>
          <p className="text-xs text-muted">Giving the same plan again adds the time to what they already have. Giving the other plan replaces it, starting today.</p>
        </form>

        <div>
          <p className="label">Plans given by hand ({grants.length})</p>
          <div className="thin-scroll max-h-64 overflow-y-auto rounded-xl border border-border">
            {grants.map((g) => (
              <button key={g.username} onClick={() => { setUsername(g.username); setInfo(null); setPlan(g.plan as "PRO" | "MAX"); }}
                className="flex w-full items-center justify-between gap-2 border-b border-border/60 px-3 py-1.5 text-left text-sm last:border-0 hover:bg-elevated">
                <span>@{g.username} · <b>{planName(g.plan)}</b></span>
                <span className="text-xs text-muted">until {day(g.until)}</span>
              </button>
            ))}
            {!grants.length && <p className="px-3 py-6 text-center text-sm text-muted">Nobody has a plan given by hand yet.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
