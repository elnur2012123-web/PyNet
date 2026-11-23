/** Mirrors the achievements seeded in supabase/migrations/0001_init.sql. */
export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  type: "lesson" | "lessons" | "quiz" | "quizzes" | "exercises" | "projects" | "streak" | "xp";
  value: number;
  ref?: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-program", name: "First Python Program", description: 'Complete the "Your first Python program" lesson.', icon: "terminal", xp: 10, type: "lesson", value: 1, ref: "m1-first-program" },
  { id: "lessons-10", name: "Getting Serious", description: "Complete 10 lessons.", icon: "book-open", xp: 15, type: "lessons", value: 10 },
  { id: "lessons-50", name: "Bookworm", description: "Complete 50 lessons.", icon: "library", xp: 40, type: "lessons", value: 50 },
  { id: "variable-master", name: "Variable Master", description: "Pass the Variables & Data Types quiz.", icon: "box", xp: 15, type: "quiz", value: 1, ref: "m2" },
  { id: "loop-explorer", name: "Loop Explorer", description: "Pass the Loops quiz.", icon: "repeat", xp: 15, type: "quiz", value: 1, ref: "m7" },
  { id: "function-builder", name: "Function Builder", description: "Pass the Functions quiz.", icon: "braces", xp: 20, type: "quiz", value: 1, ref: "m9" },
  { id: "debugging-beginner", name: "Debugging Beginner", description: "Pass the Error Handling quiz.", icon: "bug", xp: 20, type: "quiz", value: 1, ref: "m10" },
  { id: "oop-architect", name: "Object Architect", description: "Pass the Object-Oriented Programming quiz.", icon: "shapes", xp: 25, type: "quiz", value: 1, ref: "m13" },
  { id: "python-intermediate", name: "Python Intermediate", description: "Pass the Intermediate Python quiz.", icon: "graduation-cap", xp: 40, type: "quiz", value: 1, ref: "m14" },
  { id: "exercises-5", name: "Problem Solver", description: "Solve 5 coding exercises.", icon: "code", xp: 10, type: "exercises", value: 5 },
  { id: "exercises-20", name: "Challenge Hunter", description: "Solve 20 coding exercises.", icon: "target", xp: 30, type: "exercises", value: 20 },
  { id: "quizzes-5", name: "Quiz Whiz", description: "Pass 5 module quizzes.", icon: "list-checks", xp: 20, type: "quizzes", value: 5 },
  { id: "first-project", name: "Builder", description: "Complete your first project.", icon: "hammer", xp: 20, type: "projects", value: 1 },
  { id: "streak-3", name: "On a Roll", description: "Learn 3 days in a row.", icon: "flame", xp: 10, type: "streak", value: 3 },
  { id: "streak-7", name: "Week Warrior", description: "Learn 7 days in a row.", icon: "flame", xp: 25, type: "streak", value: 7 },
  { id: "streak-30", name: "Unstoppable", description: "Learn 30 days in a row.", icon: "flame", xp: 75, type: "streak", value: 30 },
  { id: "xp-500", name: "Rising Star", description: "Earn 500 XP.", icon: "star", xp: 0, type: "xp", value: 500 },
  { id: "xp-2000", name: "Pythonista", description: "Earn 2,000 XP.", icon: "trophy", xp: 0, type: "xp", value: 2000 },
];

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);

export interface AchievementState {
  lessons: Set<string>;
  quizzes: Set<string>;
  exercises: number;
  projects: number;
  streak: number;
  xp: number;
}

export function isAchievementMet(a: AchievementDef, s: AchievementState) {
  switch (a.type) {
    case "lesson": return s.lessons.has(a.ref!);
    case "lessons": return s.lessons.size >= a.value;
    case "quiz": return s.quizzes.has(a.ref!);
    case "quizzes": return s.quizzes.size >= a.value;
    case "exercises": return s.exercises >= a.value;
    case "projects": return s.projects >= a.value;
    case "streak": return s.streak >= a.value;
    case "xp": return s.xp >= a.value;
  }
}
