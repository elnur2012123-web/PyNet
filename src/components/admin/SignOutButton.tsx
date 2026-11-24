"use client";
import { getBrowserSupabase } from "@/lib/supabase/client";

export function SignOutButton() {
  return (
    <button className="btn-secondary" onClick={async () => { await getBrowserSupabase()?.auth.signOut(); window.location.href = "/"; }}>
      Sign out
    </button>
  );
}
