/** Add months or years to a date; Jan 31 + 1 month = Feb 28/29. */
export function addPeriods(from: Date, interval: "month" | "year", count: number) {
  // Jan 31 + 1 month = Feb 28/29 (not March 3).
  const d = new Date(from);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  if (interval === "year") d.setUTCFullYear(d.getUTCFullYear() + count);
  else d.setUTCMonth(d.getUTCMonth() + count);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}
