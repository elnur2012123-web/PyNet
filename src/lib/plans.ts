export type Plan = "FREE" | "PRO" | "MAX";
export type BillingInterval = "month" | "year";

export const PLAN_ORDER: Record<Plan, number> = { FREE: 0, PRO: 1, MAX: 2 };
export const planAtLeast = (plan: Plan, min: Plan) => PLAN_ORDER[plan] >= PLAN_ORDER[min];

/** Daily AI message allowance (fair-use, resets at 00:00 UTC). */
export const AI_DAILY_LIMIT: Record<Plan, number> = { FREE: 15, PRO: 100, MAX: 400 };
/** Daily exercise completions that earn credit on the Free plan. */
export const FREE_DAILY_EXERCISE_LIMIT = 8;

export type AiFeature = "chat" | "explain" | "debug" | "review" | "generate";
export const AI_FEATURE_MIN_PLAN: Record<AiFeature, Plan> = {
  chat: "FREE",
  explain: "FREE",
  debug: "FREE",
  review: "MAX",
  generate: "MAX",
};

export const PLANS: {
  id: Plan;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
}[] = [
  {
    id: "FREE",
    name: "Free",
    tagline: "Everything you need to start coding today.",
    monthly: 0,
    yearly: 0,
    features: [
      "Full beginner curriculum (all 15 modules)",
      "Browser-based Python editor",
      "Very Easy, Easy & Medium exercises (8 credited per day)",
      "Module quizzes & progress tracking",
      "Global leaderboard & leagues",
      "Error encyclopedia basics",
      `${AI_DAILY_LIMIT.FREE} PyBuddy messages per day`,
      "First 3 guided projects",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "For students serious about learning Python.",
    monthly: 5,
    yearly: 50,
    highlight: true,
    features: [
      "Everything in Free",
      "Unlimited credited exercises",
      "Hard coding challenges",
      `${AI_DAILY_LIMIT.PRO} PyBuddy messages per day`,
      "AI code explanations & error debugging",
      "Full error encyclopedia with quizzes",
      "7 guided projects",
      "Advanced learning statistics",
      "Profile accent themes",
      "Exclusive Pro badge",
    ],
  },
  {
    id: "MAX",
    name: "Max",
    tagline: "A premium AI-powered programming mentor.",
    monthly: 20,
    yearly: 200,
    features: [
      "Everything in Pro",
      `${AI_DAILY_LIMIT.MAX} PyBuddy messages per day (fair use)`,
      "AI code reviews with line-by-line analysis",
      "AI-generated practice exercises",
      "Full project library (all 10 projects)",
      "Personalised study plans from PyBuddy",
      "Exclusive Max badge",
      "Early access to new features",
    ],
  },
];

export const COMPARISON: { feature: string; values: [string, string, string] }[] = [
  { feature: "Python lessons", values: ["✓", "✓", "✓"] },
  { feature: "Code editor", values: ["✓", "✓", "✓"] },
  { feature: "Exercises", values: ["Limited", "✓", "✓"] },
  { feature: "Hard challenges", values: ["—", "✓", "✓"] },
  { feature: "PyBuddy AI tutor", values: [`${AI_DAILY_LIMIT.FREE}/day`, `${AI_DAILY_LIMIT.PRO}/day`, `${AI_DAILY_LIMIT.MAX}/day`] },
  { feature: "AI debugging", values: ["Basic", "✓", "Advanced"] },
  { feature: "Projects", values: ["3", "7", "All 10"] },
  { feature: "Learning analytics", values: ["Basic", "✓", "Advanced"] },
  { feature: "Profile badges", values: ["—", "Pro", "Max"] },
  { feature: "Profile themes", values: ["—", "✓", "✓"] },
  { feature: "AI code reviews", values: ["—", "—", "✓"] },
  { feature: "AI-generated exercises", values: ["—", "—", "✓"] },
  { feature: "Leaderboard", values: ["✓", "✓", "✓"] },
];

export function yearlySavings(monthly: number, yearly: number) {
  const full = monthly * 12;
  return { amount: full - yearly, pct: full ? Math.round(((full - yearly) / full) * 100) : 0 };
}
