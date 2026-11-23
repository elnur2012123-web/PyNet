import type { Plan } from "@/lib/plans";
import type { Difficulty } from "@/lib/xp";

/** A single automatic test: feed stdin lines, optionally append test code, compare stdout. */
export interface TestCase {
  /** Lines given to input(), one per call. */
  input?: string[];
  /** Python appended after the learner's code (e.g. calls a function they wrote). */
  append?: string;
  /** Expected stdout (compared after trimming trailing whitespace on each line). */
  expected: string;
  /** Hide this test's details from the learner. */
  hidden?: boolean;
}

export interface PracticeTask {
  prompt: string;
  starter?: string;
  tests: TestCase[];
  hint: string;
  solution: string;
}

export interface McqQuestion {
  q: string;
  /** Optional code shown with the question. */
  code?: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface CodeExample {
  title: string;
  code: string;
  note?: string;
}

export interface Mistake {
  wrong: string;
  right: string;
  why: string;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  /** Projects award project XP and may require a plan. */
  kind?: "lesson" | "project";
  minPlan?: Plan;
  /** Plain explanation. Supports **bold**, `code`, blank-line paragraphs and "- " bullets. */
  intro: string;
  syntax?: string;
  examples: CodeExample[];
  realWorld: string;
  mistakes: Mistake[];
  tryIt: string;
  practice: PracticeTask[];
  quiz: McqQuestion[];
}

export interface Module {
  id: string; // "m1"
  number: number;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
}

export type QuizQuestion =
  | ({ type: "mcq" | "output" | "error" } & McqQuestion)
  | { type: "blank"; q: string; code: string; answers: string[]; explain: string }
  | { type: "code"; q: string; starter: string; tests: TestCase[]; explain: string; solution: string };

export interface ModuleQuiz {
  moduleId: string;
  questions: QuizQuestion[];
}

export interface Exercise {
  id: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  description: string;
  exampleInput?: string;
  exampleOutput: string;
  constraints?: string[];
  starter: string;
  tests: TestCase[];
  hints: string[];
  solution: string;
  explanation: string;
}

export interface PythonErrorEntry {
  slug: string;
  name: string;
  category: "Syntax" | "Names & Types" | "Values & Data" | "Files & Imports" | "Runtime";
  difficulty: "Beginner" | "Intermediate";
  premium?: boolean;
  summary: string;
  meaning: string;
  why: string[];
  badCode: string;
  message: string;
  fixedCode: string;
  prevent: string[];
  exercise: PracticeTask;
  quiz: McqQuestion[];
}
