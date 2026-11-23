import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findModule, findQuiz, publicQuestions } from "@/content/server";
import { QuizView } from "./QuizView";

export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }): Promise<Metadata> {
  const m = findModule((await params).moduleId);
  return { title: m ? `${m.title} quiz` : "Quiz" };
}

export default async function QuizPage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const m = findModule(moduleId);
  const quiz = findQuiz(moduleId);
  if (!m || !quiz) notFound();
  return <QuizView moduleId={m.id} moduleNumber={m.number} title={m.title} questions={publicQuestions(quiz.questions)} />;
}
