/** Permissions a role can have. Keep in sync with public.all_permissions() (migration 0020). */
export const PERMISSIONS = [
  { id: "ban_users", label: "Ban and unban users", hint: "Quick ban, /ban, /unban and Ban buttons on profiles" },
  { id: "view_logs", label: "See bans and the moderation log", hint: "Active bans list, /bans, /log" },
  { id: "view_code", label: "Read everyone's code", hint: "Any submission, even during a running contest" },
  { id: "host_contests", label: "Host contests", hint: "Schedule and delete rounds" },
  { id: "create_problems", label: "Create problems", hint: "Write new problems and see hidden ones" },
  { id: "edit_problems", label: "Edit problems", hint: "Change any problem's text, languages, limits and tests" },
  { id: "review_cheating", label: "Review cheating", hint: "Use the cheat detector (banning there also needs \"Ban users\")" },
  { id: "manage_roles", label: "Manage roles", hint: "Create/edit roles and give or remove roles ranked below their own" },
  { id: "read_suggestions", label: "Read suggestions", hint: "See and answer suggestions sent with the suggestion bot" },
] as const;
export type Permission = (typeof PERMISSIONS)[number]["id"];

export const ROLE_COLORS = ["gray", "red", "orange", "amber", "green", "teal", "blue", "violet", "pink"] as const;
/** Chip classes per colour (static strings so Tailwind keeps them). */
export const ROLE_CHIP: Record<string, string> = {
  gray: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-300",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
  amber: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
  green: "bg-green-500/15 text-green-700 dark:text-green-400",
  teal: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  blue: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  violet: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};
