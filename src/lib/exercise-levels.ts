import type { Difficulty } from "./xp";

export const EXERCISE_LEVELS: { id: Difficulty; label: string; dot: string }[] = [
  { id: "very-easy", label: "Very Easy", dot: "bg-success" },
  { id: "easy", label: "Easy", dot: "bg-accent" },
  { id: "medium", label: "Medium", dot: "bg-warn" },
  { id: "hard", label: "Hard", dot: "bg-danger" },
];
