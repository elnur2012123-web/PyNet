"use client";
import { T } from "@/components/i18n/T";
import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-sm text-danger">RuntimeError</p>
      <h1 className="mt-2 text-2xl font-semibold"><T k="Something went wrong" /></h1>
      <p className="mt-2 max-w-md text-muted"><T k="An unexpected error happened. Your progress is safe." /></p>
      <div className="mt-6 flex gap-3"><button onClick={reset} className="btn-primary"><T k="Try again" /></button><Link href="/dashboard" className="btn-secondary"><T k="Dashboard" /></Link></div>
    </main>
  );
}
