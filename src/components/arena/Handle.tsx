import Link from "next/link";
import { rankFor } from "@/lib/arena/rank";

/** A username coloured by rating rank (a Phoenix gets a dark first letter). */
export function Handle({ username, rating, link = true, className = "" }: { username: string; rating?: number | null; link?: boolean; className?: string }) {
  const rank = rankFor(rating);
  const legendary = rank.name === "Phoenix";
  const inner = legendary ? (
    <><span className="text-fg">{username[0]}</span>{username.slice(1)}</>
  ) : username;
  const cls = `font-semibold ${rank.className} ${className}`;
  if (!link) return <span className={cls} title={rank.name}>{inner}</span>;
  return <Link href={`/profile/${username}`} className={`${cls} hover:underline`} title={rank.name}>{inner}</Link>;
}
