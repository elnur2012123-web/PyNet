/** Simple strength estimate (0–4) used for the sign-up meter and validation. */
export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  score = Math.min(4, score);
  if (pw.length < 8) score = Math.min(score, 1);
  const label = ["Very weak", "Weak", "Fair", "Strong", "Very strong"][score];
  return { score, label };
}
