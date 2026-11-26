import "server-only";

/**
 * Google Gemini (Generative Language API), streamed over SSE.
 *   GEMINI_API_KEY   required
 *   GEMINI_MODEL     optional; otherwise the models below are tried in order. Busy (503),
 *                    rate-limited (429) or retired (404) models fall through to the next one.
 */
const DEFAULT_MODELS = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-flash-lite-latest"];
const API = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

interface Msg { role: "user" | "assistant"; content: string }

function models() {
  const pinned = process.env.GEMINI_MODEL?.trim();
  return pinned ? [pinned, ...DEFAULT_MODELS.filter((m) => m !== pinned)] : DEFAULT_MODELS;
}

async function open(model: string, body: unknown, stream: boolean) {
  return fetch(`${API}/${encodeURIComponent(model)}:${stream ? "streamGenerateContent?alt=sse" : "generateContent"}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY ?? "" },
    body: JSON.stringify(body),
  });
}

/** First model that accepts the request; 404/429/5xx move on to the next model. */
async function firstWorking(body: unknown, stream: boolean) {
  let last: GeminiError | null = null;
  for (const m of models()) {
    const r = await open(m, body, stream).catch(() => null);
    if (r?.ok) return r;
    const status = r?.status ?? 0;
    const text = r ? await r.text().catch(() => "") : "network error";
    last = new GeminiError(status, `${m}: ${status} ${text.slice(0, 200)}`);
    if (status === 400 || status === 401 || status === 403) break; // bad key or bad request: other models won't help
  }
  throw last ?? new GeminiError(0, "no Gemini model available");
}

const body = (system: string, messages: Msg[], maxTokens: number) => ({
  systemInstruction: { parts: [{ text: system }] },
  contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  generationConfig: { maxOutputTokens: maxTokens },
});

type Part = { text?: string; thought?: boolean };
type Chunk = { candidates?: { content?: { parts?: Part[] }; finishReason?: string }[]; usageMetadata?: { totalTokenCount?: number } };

/** Streams the answer text to `onText`. Returns the finish reason and the tokens used. */
export async function geminiStream(
  opts: { system: string; messages: Msg[]; maxTokens: number },
  onText: (t: string) => void,
): Promise<{ finish: string; tokens: number }> {
  const res = await firstWorking(body(opts.system, opts.messages, opts.maxTokens), true);
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "", finish = "", tokens = 0;
  const handle = (line: string) => {
    if (!line.startsWith("data:")) return;
    let d: Chunk;
    try { d = JSON.parse(line.slice(5)); } catch { return; }
    for (const c of d.candidates ?? []) {
      for (const p of c.content?.parts ?? []) if (p.text && !p.thought) onText(p.text);
      if (c.finishReason) finish = c.finishReason;
    }
    if (d.usageMetadata?.totalTokenCount) tokens = d.usageMetadata.totalTokenCount;
  };
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, i).trim()); buf = buf.slice(i + 1); }
  }
  if (buf.trim()) handle(buf.trim());
  return { finish, tokens };
}

/** One-shot answer (used for translating content). */
export async function geminiText(system: string, prompt: string, maxTokens = 8000): Promise<string> {
  const res = await firstWorking(body(system, [{ role: "user", content: prompt }], maxTokens), false);
  const d = (await res.json()) as Chunk;
  return (d.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("");
}
