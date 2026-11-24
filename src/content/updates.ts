/**
 * Release notes shipped with the code. New entries go at the TOP.
 * Announcements added in Supabase (table `announcements`) are merged with these.
 */
export interface UpdateEntry {
  id: string;
  date: string; // ISO date
  title: string;
  body: string;
  link?: string;
  kind: "update" | "feature" | "fix" | "event";
}

export const CODE_UPDATES: UpdateEntry[] = [
  {
    id: "2026-11-24-arena",
    date: "2026-11-24T23:30:00Z",
    kind: "feature",
    title: "New: Problemset, Contests and Rating",
    body: "PyNest now has a competitive side! Solve problems with hidden tests and real verdicts (Accepted, Wrong answer on test 3…). Join timed rounds with a live scoreboard and earn a contest rating, from Newbie to Legendary Grandmaster. Register for PyNest Round #1 on the Contests page!",
    link: "/contests",
  },
  {
    id: "2026-11-24-badges",
    date: "2026-11-24T23:00:00Z",
    kind: "feature",
    title: "Your achievements are now badges",
    body: "Every achievement you unlock is now a Bronze, Silver, Gold or Legendary badge. Your rarest badge shows next to your name on the leaderboard and your profile. Want a different one? Open Achievements and press \"Show on my profile\".",
    link: "/achievements",
  },
  {
    id: "2026-11-24-pybuddy-dictionary",
    date: "2026-11-24T20:00:00Z",
    kind: "feature",
    title: "PyBuddy knows a lot more now",
    body: "Ask PyBuddy what any built-in function, method or keyword does — len(), zip(), .split(), .get(), lambda, yield and 100+ more — and you'll get an example with its real output. New: say \"quiz me on loops\" for a quick quiz, compare things like \"sort vs sorted\", and press \"Open in Playground\" under any code example to run it.",
    link: "/tutor",
  },
  {
    id: "2026-11-24-whats-new",
    date: "2026-11-24T18:00:00Z",
    kind: "feature",
    title: "Never miss an update",
    body: "The bell at the top of the page now tells you when something new arrives on PyNest. You're looking at the first one!",
  },
  {
    id: "2026-11-24-pybuddy",
    date: "2026-11-24T12:00:00Z",
    kind: "feature",
    title: "PyBuddy got a lot more patient",
    body: "Say \"I didn't understand\", \"another example\", \"why?\" or \"more\" and PyBuddy keeps explaining the same topic in a new way. Answers are longer, include real-life comparisons, and PyBuddy now knows how to answer \"how do I…\" questions like reversing a string or reading a file.",
    link: "/tutor",
  },
  {
    id: "2026-11-24-redesign",
    date: "2026-11-24T10:00:00Z",
    kind: "update",
    title: "A cleaner home page and menu",
    body: "The home page shows what a real lesson looks like, the course is grouped into three stages, and the menu is now organised into Learn, Tools and Community.",
    link: "/",
  },
  {
    id: "2026-11-23-launch",
    date: "2026-11-23T12:00:00Z",
    kind: "event",
    title: "Welcome to PyNest 🎉",
    body: "107 lessons, 25 coding challenges, a quiz for every module, a real Python editor in your browser and PyBuddy, your tutor. Start with lesson 1 — it takes about five minutes.",
    link: "/learn/m1-what-is-programming",
  },
];
