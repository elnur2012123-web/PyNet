import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = { title: "Account suspended" };
export const dynamic = "force-dynamic";

export default async function BannedPage() {
  const supabase = await getServerSupabase();
  if (!supabase) redirect("/");
  const { data } = await supabase.rpc("my_moderation");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.banned) redirect("/dashboard");
  const until = row.expires_at ? new Date(row.expires_at).toUTCString().replace(" GMT", " UTC") : null;

  return (
    <main id="main" className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="flex justify-center"><LogoMark size={36} /></div>
        <ShieldAlert className="mx-auto mt-6 h-10 w-10 text-danger" />
        <h1 className="mt-3 text-2xl font-semibold">Your account is suspended</h1>
        <p className="mt-2 text-sm text-muted">A PyNest moderator has suspended your account{until ? "" : " permanently"}.</p>
        <div className="mt-5 space-y-2 rounded-xl bg-elevated/70 p-4 text-left text-sm">
          <p><span className="text-muted">Reason:</span> {row.reason || "No reason was given."}</p>
          <p><span className="text-muted">Ends:</span> {until ?? "Never (permanent)"}</p>
        </div>
        <p className="mt-5 text-sm text-muted">Your progress and XP are kept. When the suspension ends, everything comes back. If you think this is a mistake, contact the PyNest team.</p>
        <div className="mt-6"><SignOutButton /></div>
      </div>
    </main>
  );
}
