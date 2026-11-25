"use client";
import { T } from "@/components/i18n/T";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { useProgress } from "@/components/providers/ProgressProvider";

export function RegisterButton({ contestId, registered, canUnregister, compact = false }: { contestId: number; registered: boolean; canUnregister: boolean; compact?: boolean }) {
  const p = useProgress();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (p.mode !== "account") return <Link href={`/signup?next=/contests/${contestId}`} className={compact ? "link text-xs font-semibold" : "btn-primary btn-sm"}><T k="Register »" /></Link>;
  const act = async () => {
    const sb = getBrowserSupabase();
    if (!sb || !p.profile) return;
    setBusy(true); setErr(null);
    const { error } = registered
      ? await sb.from("contest_registrations").delete().eq("contest_id", contestId).eq("user_id", p.profile.id)
      : await sb.from("contest_registrations").insert({ contest_id: contestId, user_id: p.profile.id });
    setBusy(false);
    if (error) setErr("Could not update your registration.");
    else router.refresh();
  };
  if (registered) {
    return (
      <span className="inline-flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium text-success"><T k="Registered ✓" /></span>
        {canUnregister && <button onClick={act} disabled={busy} className="text-[11px] text-muted hover:text-danger"><T k="Cancel registration" /></button>}
      </span>
    );
  }
  return (
    <span className="inline-flex flex-col items-center gap-0.5">
      <button onClick={act} disabled={busy} className={compact ? "rounded-md bg-danger px-2 py-0.5 text-xs font-semibold text-white hover:opacity-90" : "btn-primary btn-sm"}><T k="Register »" /></button>
      {err && <span className="text-[11px] text-danger">{err}</span>}
    </span>
  );
}
