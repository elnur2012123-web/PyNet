import type { Metadata } from "next";
import { SuggestBot } from "@/components/suggest/SuggestBot";
import { getT } from "@/i18n/server";

export const metadata: Metadata = { title: "Suggestions" };

export default async function SuggestPage() {
  const tx = await getT();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="h1">{tx("Send a suggestion")}</h1>
        <p className="mt-1 text-muted">{tx("Tell us what to add, fix or improve. The team reads every message and replies here.")}</p>
      </div>
      <SuggestBot />
    </div>
  );
}
