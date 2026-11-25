import { T } from "@/components/i18n/T";
import type { Metadata } from "next";
import { listContests } from "@/lib/server/arena";
import { ContestCalendar } from "@/components/arena/ContestCalendar";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const contests = await listContests();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="h1"><T k="Calendar" /></h1>
        <p className="mt-1 text-muted"><T k="Every PyNest round, in your own time zone." /></p>
      </div>
      <ContestCalendar contests={contests.map((c) => ({ id: c.id, title: c.title, starts_at: c.starts_at, duration_minutes: c.duration_minutes }))} />
    </div>
  );
}
