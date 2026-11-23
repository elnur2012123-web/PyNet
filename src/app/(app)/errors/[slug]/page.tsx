import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { findError } from "@/content/server";
import { getUserContext } from "@/lib/server/user";
import { isSupabaseConfigured } from "@/lib/env";
import { ErrorView } from "./ErrorView";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return { title: findError((await params).slug)?.name ?? "Error" };
}

export default async function ErrorPage({ params }: { params: Promise<{ slug: string }> }) {
  const entry = findError((await params).slug);
  if (!entry) notFound();
  if (entry.premium) {
    const ctx = isSupabaseConfigured ? await getUserContext() : null;
    if ((ctx?.plan ?? "FREE") === "FREE") {
      return (
        <div className="mx-auto max-w-2xl">
          <Link href="/errors" className="btn-ghost btn-sm mb-4"><ArrowLeft className="h-4 w-4" /> Error Explorer</Link>
          <h1 className="font-mono text-3xl font-semibold text-danger">{entry.name}</h1>
          <p className="mt-2 text-lg">{entry.summary}</p>
          <p className="mt-3 text-muted">{entry.meaning}</p>
          <div className="card mt-6 p-6">
            <p className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-accent2" /> The full guide is part of Pro</p>
            <p className="mt-2 text-sm text-muted">Pro unlocks the full error encyclopedia: causes, broken vs fixed code, an interactive example, a practice drill and a quiz for every error.</p>
            <Link href="/pricing" className="btn-primary mt-4">See plans</Link>
          </div>
        </div>
      );
    }
  }
  return <ErrorView entry={entry} />;
}
