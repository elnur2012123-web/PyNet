"use client";
import { useState } from "react";
import { Gavel } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { sendCommand } from "./useCommand";

/** Ban / unban controls shown to staff on a user's public profile. */
export function ModerateButtons({ username, banned }: { username: string; banned: boolean }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState("1d");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (cmd: string) => {
    setBusy(true);
    const r = await sendCommand(cmd);
    setBusy(false);
    toast({ kind: r.ok ? "success" : "error", title: r.ok ? "Done" : "Not allowed", body: r.message.replace(/[*`⚠️🔨✅]/g, "").trim() });
    if (r.ok) setTimeout(() => location.reload(), 800);
  };

  return (
    <>
      {banned ? (
        <button onClick={() => run(`/unban @${username}`)} disabled={busy} className="btn-secondary btn-sm">Unban</button>
      ) : (
        <button onClick={() => setOpen(true)} className="btn-sm btn border border-danger/40 text-danger hover:bg-danger/10"><Gavel className="h-3.5 w-3.5" /> Ban</button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title={`Ban @${username}`}>
        <form onSubmit={(e) => { e.preventDefault(); setOpen(false); run(`/ban @${username} ${duration} ${reason}`); }} className="space-y-4">
          <div><label className="label" htmlFor="ban-d">How long?</label>
            <select id="ban-d" className="input" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="1h">1 hour</option><option value="1d">1 day</option><option value="7d">7 days</option><option value="30d">30 days</option><option value="perm">Permanent</option>
            </select></div>
          <div><label className="label" htmlFor="ban-r">Reason <span className="text-muted">(the user will see this)</span></label>
            <input id="ban-r" className="input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button><button className="btn-danger">Ban user</button></div>
        </form>
      </Modal>
    </>
  );
}
