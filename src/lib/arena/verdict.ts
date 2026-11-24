export type Verdict = "OK" | "WA" | "RE" | "TLE" | "CE";

export function verdictText(v: Verdict | string, failedTest?: number | null) {
  const on = failedTest ? ` on test ${failedTest}` : "";
  switch (v) {
    case "OK": return "Accepted";
    case "WA": return `Wrong answer${on}`;
    case "RE": return `Runtime error${on}`;
    case "TLE": return `Time limit exceeded${on}`;
    case "CE": return "Compilation error";
    default: return v;
  }
}

export function verdictClass(v: string) {
  if (v === "OK") return "font-semibold text-success";
  if (v === "CE") return "text-muted";
  return "text-danger";
}

/** Compare outputs token by token (extra spaces and blank lines don't matter). */
export function sameOutput(actual: string, expected: string) {
  const a = actual.trim().split(/\s+/);
  const b = expected.trim().split(/\s+/);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
