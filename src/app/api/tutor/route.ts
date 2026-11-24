import Anthropic from "@anthropic-ai/sdk";
import { getUserContext } from "@/lib/server/user";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { error, readJson, sameOrigin } from "@/lib/server/http";
import { AI_DAILY_LIMIT, AI_FEATURE_MIN_PLAN, planAtLeast, type AiFeature, type Plan } from "@/lib/plans";
import { isSupabaseConfigured } from "@/lib/env";
import { localTutorAnswer } from "@/lib/tutor/local";

/** Which tutor engine is active (used by the chat UI label). */
export function GET() {
  return Response.json({ mode: process.env.ANTHROPIC_API_KEY ? "claude" : "lite" });
}

/** Stream a ready-made answer in small chunks so it feels like typing. */
function streamText(text: string, headers: Record<string, string> = {}) {
  const enc = new TextEncoder();
  const chars = Array.from(text); // split by code point so emoji are never cut in half
  const parts: string[] = [];
  for (let i = 0; i < chars.length; i += 24) parts.push(chars.slice(i, i + 24).join(""));
  const stream = new ReadableStream<Uint8Array>({
    async start(c) {
      for (const p of parts) {
        c.enqueue(enc.encode(p));
        await new Promise((r) => setTimeout(r, 8));
      }
      c.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const GUEST_DAILY_LIMIT = 10;

const SYSTEM_PROMPT = `You are PyBuddy, the personal Python tutor inside PyNest, a learning platform for people who have never programmed before.

Who you are talking to:
- Assume the learner may not know ANY programming vocabulary. If you must use a technical word (variable, function, loop, string, index, argument...), explain it in plain words the first time.
- Many learners are young or are learning English as a second language. Use short sentences and simple, friendly English.

How to teach:
- Start with the simplest correct explanation, then add detail only if it helps.
- Use real-life analogies (a variable is like a labelled box; a list is like a numbered shelf; a function is like a recipe).
- Break hard ideas into small numbered steps.
- Show SHORT code examples (usually under 10 lines) in \`\`\`python fenced blocks, then explain what each important line does.
- When explaining code line by line, go in order and refer to line numbers.
- When explaining an error message, say: (1) what the error name means, (2) which line caused it and why, (3) how to fix it, with the corrected code.
- When a learner is stuck on an exercise or asks for an answer to a practice task, give a hint first and ask them to try. Only give the full solution if they ask again or have clearly tried.
- When asked for practice questions, give 2–3 beginner-level questions with expected output, without solutions unless asked.
- Be patient, warm and encouraging. Mistakes are normal; never make the learner feel stupid.
- Stay focused on Python and programming. If asked about something unrelated, gently steer back to learning Python.
- Keep answers concise: most replies should be under 250 words unless the learner asks for depth or a review.
- Use Python 3 only. Code in PyNest runs in the browser via Pyodide: only the standard library is available, input() reads from an Input box, and there is no pip.`;

const FEATURE_PROMPTS: Record<AiFeature, string> = {
  chat: "",
  explain: "The learner wants this code explained line by line in simple English.",
  debug: "The learner's code is not working. Find the problem, explain why it happens in simple words, and show the fixed code.",
  review:
    "Give a detailed code review for a beginner-to-intermediate learner: correctness, readability, naming, edge cases and Pythonic improvements. Go line by line where useful, praise what is good, and show an improved version at the end.",
  generate:
    "Create a personalised practice set: 3 exercises of increasing difficulty on the requested topic, each with a description, example input/output, and a hint. Put the solutions at the end under a 'Solutions' heading.",
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function validate(messages: unknown): ChatMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) return null;
  let total = 0;
  const out: ChatMessage[] = [];
  for (const m of messages) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") return null;
    const content = m.content.slice(0, 12_000);
    total += content.length;
    if (!content.trim()) continue;
    out.push({ role: m.role, content });
  }
  if (total > 60_000 || out.length === 0 || out[out.length - 1].role !== "user") return null;
  // The API expects alternating turns starting with the user.
  while (out.length && out[0].role !== "user") out.shift();
  return out.slice(-20);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("Bad origin", 403);
  const body = await readJson<{ messages?: unknown; feature?: AiFeature; context?: string }>(req, 200_000);
  const messages = validate(body?.messages);
  if (!messages) return error("Invalid conversation");
  const feature: AiFeature = body?.feature && body.feature in FEATURE_PROMPTS ? body.feature : "chat";

  // Free mode: no API key configured -> PyBuddy Lite (rule-based, no cost, no quota).
  if (!process.env.ANTHROPIC_API_KEY) {
    if (isSupabaseConfigured && !(await getUserContext())) return error("Please sign up or sign in to chat with PyBuddy.", 401, { signIn: true });
    const burst = rateLimit(`lite:${clientIp(req)}`, 30, 60_000);
    if (!burst.ok) return error(`You're sending messages very quickly. Try again in ${burst.retryAfter}s.`, 429);
    return streamText(localTutorAnswer(messages, feature), { "X-AI-Mode": "lite" });
  }
  const context = typeof body?.context === "string" ? body.context.slice(0, 500) : "";

  // --- who is asking, and are they allowed? ---------------------------------
  let plan: Plan = "FREE";
  let remaining = 0;
  let limit = GUEST_DAILY_LIMIT;
  let userId: string | null = null;

  if (isSupabaseConfigured) {
    const ctx = await getUserContext();
    if (!ctx) return error("Please sign in to chat with PyBuddy.", 401, { signIn: true });
    plan = ctx.plan;
    userId = ctx.user.id;
    if (!planAtLeast(plan, AI_FEATURE_MIN_PLAN[feature])) {
      return error(`This PyBuddy feature is part of the ${AI_FEATURE_MIN_PLAN[feature]} plan.`, 403, { upgrade: true });
    }
    const burst = rateLimit(`ai:${userId}`, 8, 60_000);
    if (!burst.ok) return error(`You're sending messages very quickly. Try again in ${burst.retryAfter}s.`, 429);
    const admin = getAdminSupabase();
    if (!admin) return error("Server is missing SUPABASE_SERVICE_ROLE_KEY", 500);
    limit = AI_DAILY_LIMIT[plan];
    const { data, error: e } = await admin.rpc("consume_ai_quota", { p_user: userId, p_feature: feature, p_limit: limit });
    if (e) return error("Could not check your AI allowance. Please try again.", 500);
    if (!data?.allowed) {
      return error(
        `You've used all ${limit} PyBuddy messages for today. Your allowance resets at 00:00 UTC.` +
          (plan === "MAX" ? "" : " Upgrading gives you a bigger daily allowance."),
        429,
        { limitReached: true, limit, plan },
      );
    }
    remaining = Math.max(0, limit - data.used);
  } else {
    // Demo mode (no database configured): per-IP limits, clearly labelled in the UI.
    if (feature === "review" || feature === "generate") return error("This feature needs accounts (Supabase) to be configured.", 403);
    const ip = clientIp(req);
    const burst = rateLimit(`ai-burst:${ip}`, 5, 60_000);
    const daily = rateLimit(`ai-day:${ip}`, GUEST_DAILY_LIMIT, 86_400_000);
    if (!burst.ok || !daily.ok) return error("Demo limit reached for now. Please try again later.", 429, { limitReached: true });
  }

  // --- call Claude -----------------------------------------------------------
  const client = new Anthropic();
  const system = [
    { type: "text" as const, text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" as const } },
    ...(FEATURE_PROMPTS[feature] || context
      ? [{ type: "text" as const, text: [FEATURE_PROMPTS[feature], context ? `Current page: ${context}` : ""].filter(Boolean).join("\n") }]
      : []),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const s = client.beta.messages.stream({
          model: MODEL,
          max_tokens: feature === "review" || feature === "generate" ? 8000 : 3000,
          system,
          messages,
          output_config: { effort: feature === "review" || feature === "generate" ? "medium" : "low" },
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        for await (const event of s) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await s.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\nSorry, I can't help with that one. Let's get back to Python — what would you like to learn?"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_(I stopped because the answer got long — ask me to continue!)_"));
        }
        if (userId) {
          const admin = getAdminSupabase();
          const tokens = (final.usage?.input_tokens ?? 0) + (final.usage?.output_tokens ?? 0);
          await admin?.rpc("record_ai_tokens", { p_user: userId, p_feature: feature, p_tokens: tokens });
        }
      } catch (e) {
        let msg = "PyBuddy had a problem answering. Please try again in a moment.";
        if (e instanceof Anthropic.AuthenticationError) msg = "PyBuddy's API key is invalid. The site owner needs to update ANTHROPIC_API_KEY.";
        else if (e instanceof Anthropic.RateLimitError) msg = "PyBuddy is very busy right now. Please try again in a minute.";
        else if (e instanceof Anthropic.APIConnectionError) msg = "PyBuddy couldn't reach the AI service. Check back shortly.";
        controller.enqueue(encoder.encode(`\n\n[[error]] ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-AI-Remaining": String(remaining),
      "X-AI-Limit": String(limit),
    },
  });
}
