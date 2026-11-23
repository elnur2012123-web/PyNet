import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { LESSON_ORDER, findLesson } from "@/content/server";
import { LessonView, type LessonPayload } from "@/components/lesson/LessonView";
import { getUserContext } from "@/lib/server/user";
import { planAtLeast } from "@/lib/plans";
import { isSupabaseConfigured } from "@/lib/env";
import { RichText } from "@/components/lesson/RichText";

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
  const found = findLesson((await params).lessonId);
  return { title: found ? found.lesson.title : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const found = findLesson(lessonId);
  if (!found) notFound();
  const { module, lesson, index } = found;

  const idx = LESSON_ORDER.indexOf(lesson.id);
  const nav = (id?: string) => {
    const f = id ? findLesson(id) : null;
    return f ? { id: f.lesson.id, title: f.lesson.title } : null;
  };
  const prev = nav(LESSON_ORDER[idx - 1]);
  const next = nav(LESSON_ORDER[idx + 1]);

  // Premium projects: content is only sent to users whose verified plan allows it.
  if (lesson.minPlan && lesson.minPlan !== "FREE") {
    const ctx = isSupabaseConfigured ? await getUserContext() : null;
    if (!planAtLeast(ctx?.plan ?? "FREE", lesson.minPlan)) {
      return (
        <div className="mx-auto max-w-2xl">
          <p className="mb-2 text-sm text-muted">Module {module.number}: {module.title}</p>
          <h1 className="h1">{lesson.title}</h1>
          <div className="card mt-6 p-6">
            <p className="flex items-center gap-2 font-semibold"><Lock className="h-4 w-4 text-accent2" /> This project is part of the {lesson.minPlan} plan</p>
            <div className="mt-3 text-sm text-muted"><RichText text={lesson.intro.split("\n\n").slice(0, 2).join("\n\n")} /></div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/pricing" className="btn-primary">See plans</Link>
              {!ctx && isSupabaseConfigured && <Link href={`/signin?next=/learn/${lesson.id}`} className="btn-secondary">Sign in</Link>}
              {next && <Link href={`/learn/${next.id}`} className="btn-ghost">Skip to next</Link>}
            </div>
          </div>
        </div>
      );
    }
  }

  const payload: LessonPayload = {
    id: lesson.id,
    title: lesson.title,
    minutes: lesson.minutes,
    kind: lesson.kind ?? "lesson",
    intro: lesson.intro,
    syntax: lesson.syntax,
    examples: lesson.examples,
    realWorld: lesson.realWorld,
    mistakes: lesson.mistakes,
    tryIt: lesson.tryIt,
    practice: lesson.practice,
    quiz: lesson.quiz.map(({ q, code, options }) => ({ q, code, options })), // answers stay on the server
  };

  return <LessonView lesson={payload} moduleTitle={module.title} moduleNumber={module.number} position={index + 1} total={module.lessons.length} prev={prev} next={next} />;
}
