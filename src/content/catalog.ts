import type { Plan } from "@/lib/plans";
import type { Difficulty } from "@/lib/xp";

/** Lightweight course metadata that is safe to send to the browser. */
export interface CatalogLesson {
  id: string;
  title: string;
  minutes: number;
  kind: "lesson" | "project";
  minPlan: Plan;
  moduleId: string;
}
export interface CatalogModule {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: CatalogLesson[];
}
export interface CatalogExercise {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  minPlan: Plan;
}
export interface CatalogError {
  slug: string;
  name: string;
  summary: string;
  category: string;
  difficulty: string;
  premium: boolean;
}
export interface Catalog {
  modules: CatalogModule[];
  exercises: CatalogExercise[];
  errors: CatalogError[];
  quizzes: { moduleId: string; questions: number }[];
}
