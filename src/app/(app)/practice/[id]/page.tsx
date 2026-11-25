import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { EXERCISES } from "@/content/exercises";
import { exerciseMinPlan, findExercise } from "@/content/server";
import { getUserContext } from "@/lib/server/user";
import { planAtLeast } from "@/lib/plans";
import { isSupabaseConfigured } from "@/lib/env";
import { ExerciseView } from "./ExerciseView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: findExercise((await params).id)?.title ?? "Exercise" };
}

export default async function ExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ex = findExercise(id);
  if (!ex) notFound();
  const minPlan = exerciseMinPlan(ex);
  const idx = EXERCISES.findIndex((e) => e.id === id);
  const next = EXERCISES[idx + 1];

  if (minPlan !== "FREE") {
    const ctx = isSupabaseConfigured ? await getUserContext() : null;
    if (!planAtLeast(ctx?.plan ?? "FREE", minPlan)) {
      return (
        <div className="mx-auto max-w-2xl">
          <Link href="/practice" className="btn-ghost btn-sm mb-4"><ArrowLeft className="h-4 w-4" /> <T k="All challenges" /></Link>
          <h1 className="h1"><T k={ex.title} /></h1>
          <div className="card mt-6 p-6">
            <p className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-accent2" /> <T k="Hard challenges are part of Pro" /></p>
            <p className="mt-2 text-sm text-muted"><T k="Pro unlocks every Hard challenge, unlimited credited exercises and more PyBuddy messages — for $5/month." /></p>
            <div className="mt-5 flex gap-3"><Link href="/pricing" className="btn-primary"><T k="See plans" /></Link>{next && <Link href={`/practice/${next.id}`} className="btn-secondary"><T k="Next challenge" /></Link>}</div>
          </div>
        </div>
      );
    }
  }
  return <ExerciseView exercise={ex} nextId={next?.id ?? null} />;
}
