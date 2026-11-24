"use client";
/** Sends a moderation command like "/ban @user 7d spam" to the server. */
export async function sendCommand(command: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch("/api/admin/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command }) });
  const d = await res.json().catch(() => ({}));
  return { ok: Boolean(d.ok), message: d.message ?? d.error ?? "Something went wrong." };
}
