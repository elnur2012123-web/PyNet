import "server-only";
import { MODULES } from "./curriculum";
import { EXERCISES } from "./exercises";
import { PY_ERRORS } from "./errors";
import { MODULE_QUIZZES } from "./quizzes";
import type { Catalog } from "./catalog";
import type { Exercise, Lesson, Module, QuizQuestion } from "./types";
import type { Plan } from "@/lib/plans";

export const exerciseMinPlan = (e: Exercise): Plan => (e.difficulty === "hard" ? "PRO" : "FREE");

let cached: Catalog | null = null;
export function getCatalog(): Catalog {
  if (cached) return cached;
  cached = {
    modules: MODULES.map((m) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      icon: m.icon,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        minutes: l.minutes,
        kind: l.kind ?? "lesson",
        minPlan: l.minPlan ?? "FREE",
        moduleId: m.id,
      })),
    })),
    exercises: EXERCISES.map((e) => ({ id: e.id, title: e.title, difficulty: e.difficulty, topic: e.topic, minPlan: exerciseMinPlan(e) })),
    errors: PY_ERRORS.map((e) => ({ slug: e.slug, name: e.name, summary: e.summary, category: e.category, difficulty: e.difficulty, premium: Boolean(e.premium) })),
    quizzes: MODULE_QUIZZES.map((q) => ({ moduleId: q.moduleId, questions: q.questions.length })),
  };
  return cached;
}

export function findLesson(id: string): { module: Module; lesson: Lesson; index: number } | null {
  for (const m of MODULES) {
    const index = m.lessons.findIndex((l) => l.id === id);
    if (index >= 0) return { module: m, lesson: m.lessons[index], index };
  }
  return null;
}
export const findModule = (id: string) => MODULES.find((m) => m.id === id) ?? null;
export const findExercise = (id: string) => EXERCISES.find((e) => e.id === id) ?? null;
export const findError = (slug: string) => PY_ERRORS.find((e) => e.slug === slug) ?? null;
export const findQuiz = (moduleId: string) => MODULE_QUIZZES.find((q) => q.moduleId === moduleId) ?? null;

/** Flat ordered list of lesson ids, used for prev/next navigation. */
export const LESSON_ORDER = MODULES.flatMap((m) => m.lessons.map((l) => l.id));

/** Quiz questions without answer keys (safe for the browser). */
export type PublicQuestion =
  | { type: "mcq" | "output" | "error"; q: string; code?: string; options: string[] }
  | { type: "blank"; q: string; code: string }
  | { type: "code"; q: string; starter: string; tests: { input?: string[]; append?: string; expected: string; hidden?: boolean }[] };

export function publicQuestions(questions: QuizQuestion[]): PublicQuestion[] {
  return questions.map((q) => {
    if (q.type === "blank") return { type: "blank", q: q.q, code: q.code };
    if (q.type === "code") return { type: "code", q: q.q, starter: q.starter, tests: q.tests };
    return { type: q.type, q: q.q, code: q.code, options: q.options };
  });
}

export type QuizAnswer = number | string | boolean | null;
export interface GradedQuestion {
  correct: boolean;
  explain: string;
  correctAnswer: string;
}

/** Grade on the server. Code questions are run in the browser and reported as booleans. */
export function gradeQuestions(questions: QuizQuestion[], answers: QuizAnswer[]) {
  const results: GradedQuestion[] = questions.map((q, i) => {
    const a = answers[i];
    if (q.type === "blank") {
      const given = typeof a === "string" ? a.trim().toLowerCase() : "";
      return { correct: q.answers.some((x) => x.toLowerCase() === given), explain: q.explain, correctAnswer: q.answers[0] };
    }
    if (q.type === "code") {
      return { correct: a === true, explain: q.explain, correctAnswer: q.solution };
    }
    return { correct: a === q.answer, explain: q.explain, correctAnswer: q.options[q.answer] };
  });
  const score = results.filter((r) => r.correct).length;
  return { results, score, total: questions.length, percent: Math.round((score / Math.max(questions.length, 1)) * 100) };
}
