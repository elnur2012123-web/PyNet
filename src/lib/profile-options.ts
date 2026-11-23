export const EXPERIENCE = [
  { id: "beginner", label: "Complete beginner" },
  { id: "some_python", label: "I know a little Python" },
  { id: "other_language", label: "I already know another language" },
] as const;

export const GOALS = [
  { id: "school", label: "School" },
  { id: "ai", label: "Artificial Intelligence" },
  { id: "games", label: "Game development" },
  { id: "web", label: "Web development" },
  { id: "competitive", label: "Competitive programming" },
  { id: "personal", label: "Personal interest" },
] as const;

export const DAILY = [
  { id: 10, label: "10 minutes" },
  { id: 20, label: "20 minutes" },
  { id: 30, label: "30 minutes" },
  { id: 60, label: "1 hour or more" },
] as const;

export const ACCENTS = ["default", "emerald", "amber", "rose", "violet", "cyan"] as const;
