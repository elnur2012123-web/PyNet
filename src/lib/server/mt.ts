import "server-only";
/**
 * Optional machine translation for learning content that has no human translation yet.
 * Providers (first one configured wins):
 *   GOOGLE_TRANSLATE_API_KEY  Google Cloud Translation v2 (free tier: 500k characters / month)
 *   ANTHROPIC_API_KEY         Claude
 * Code is protected: `inline code` and ```blocks``` are replaced by markers before
 * translation and restored afterwards, so it can never be changed.
 */
type Target = "uz" | "ru";

function protect(text: string) {
  const saved: string[] = [];
  const masked = text.replace(/```[\s\S]*?```|`[^`\n]+`/g, (m) => { saved.push(m); return `⟦${saved.length - 1}⟧`; });
  return { masked, restore: (t: string) => t.replace(/⟦\s*(\d+)\s*⟧/g, (_, i) => saved[Number(i)] ?? "") };
}

async function google(texts: string[], target: Target): Promise<string[] | null> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) return null;
  const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: texts, source: "en", target, format: "text" }),
  });
  if (!r.ok) return null;
  const j = await r.json() as { data?: { translations?: { translatedText: string }[] } };
  const out = j.data?.translations?.map((t) => t.translatedText);
  return out && out.length === texts.length ? out : null;
}

async function claude(texts: string[], target: Target): Promise<string[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic();
  const lang = target === "uz" ? "Uzbek in the Latin alphabet (use oʻ and gʻ with ʻ, and ʼ for the tutuq belgisi)" : "Russian";
  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
    max_tokens: 8000,
    system: `You translate a beginner Python course from English into ${lang}. Use simple, friendly language for school students. Never translate or change anything inside ⟦n⟧ markers, Python code, variable names, program output, or error names like TypeError. Reply with ONLY a JSON array of strings, same length and order as the input.`,
    messages: [{ role: "user", content: JSON.stringify(texts) }],
  });
  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  try {
    const arr = JSON.parse(text.slice(text.indexOf("["), text.lastIndexOf("]") + 1));
    return Array.isArray(arr) && arr.length === texts.length ? arr.map(String) : null;
  } catch {
    return null;
  }
}

export const mtConfigured = () => Boolean(process.env.GOOGLE_TRANSLATE_API_KEY || process.env.ANTHROPIC_API_KEY);
export const mtProvider = () => (process.env.GOOGLE_TRANSLATE_API_KEY ? "google" : process.env.ANTHROPIC_API_KEY ? "claude" : "none");

/** Translate a batch; returns null entries for anything that failed. */
export async function machineTranslate(texts: string[], target: Target): Promise<(string | null)[]> {
  if (!texts.length || !mtConfigured()) return texts.map(() => null);
  const prepared = texts.map(protect);
  const out: (string | null)[] = texts.map(() => null);
  for (let i = 0; i < prepared.length; i += 40) {
    const chunk = prepared.slice(i, i + 40);
    let res: string[] | null = null;
    try { res = (await google(chunk.map((c) => c.masked), target)) ?? (await claude(chunk.map((c) => c.masked), target)); } catch { res = null; }
    if (res) res.forEach((t, j) => { out[i + j] = chunk[j].restore(t); });
  }
  return out;
}
