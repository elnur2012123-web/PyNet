import { getT } from "@/i18n/server";
import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getServerSupabase } from "@/lib/supabase/server";
import { LogoMark } from "@/components/ui/Logo";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata: Metadata = { title: "Account suspended" };
export const dynamic = "force-dynamic";

export default async function BannedPage() {
  const tx = await getT();
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
        <h1 className="mt-3 text-2xl font-semibold"><T k="Your account is suspended" /></h1>
        <p className="mt-2 text-sm text-muted"><T k="A PyNest moderator has suspended your account" />{until ? "" : tx(" permanently")}.</p>
        <div className="mt-5 space-y-2 rounded-xl bg-elevated/70 p-4 text-left text-sm">
          <p><span className="text-muted"><T k="Reason:" /></span> {row.reason || tx("No reason was given.")}</p>
          <p><span className="text-muted"><T k="Ends:" /></span> {until ?? tx("Never (permanent)")}</p>
        </div>
        <p className="mt-5 text-sm text-muted"><T k="Your progress and XP are kept. When the suspension ends, everything comes back. If you think this is a mistake, contact the PyNest team." /></p>
        <div className="mt-6"><SignOutButton /></div>
      </div>
    </main>
  );
}
