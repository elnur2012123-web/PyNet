"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, Crown, Loader2, Square, Trash2, User } from "lucide-react";
import { Markdown } from "./Markdown";
import { useProgress } from "@/components/providers/ProgressProvider";
import { AI_FEATURE_MIN_PLAN, planAtLeast, type AiFeature } from "@/lib/plans";
import { Notice } from "@/components/ui/States";
import { TUTOR_EVENT, takePendingTutorRequest } from "./bus";

interface Msg { role: "user" | "assistant"; content: string; error?: boolean }

const SUGGESTIONS = [
  "What is a variable?",
  "Explain a for loop like I'm 10",
  "What's the difference between a list and a tuple?",
  "Why do I get TypeError: can only concatenate str?",
  "Give me 3 practice questions about if statements",
  "What does the % symbol mean in Python?",
];

const MODES: { id: AiFeature; label: string; hint: string }[] = [
  { id: "chat", label: "Ask", hint: "Ask anything about Python" },
  { id: "explain", label: "Explain code", hint: "Paste code to get a line-by-line explanation" },
  { id: "debug", label: "Debug", hint: "Paste broken code and the error message" },
  { id: "review", label: "Code review", hint: "Detailed review with improvements (Max)" },
  { id: "generate", label: "Make exercises", hint: "Personalised practice set on a topic (Max)" },
];

const STORE = "pynest-tutor-history";

export function TutorChat({ compact = false, context, listen = false }: { compact?: boolean; context?: string; listen?: boolean }) {
  const p = useProgress();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<AiFeature>("chat");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "warn" | "error" | "info"; text: string; cta?: "signin" | "upgrade" } | null>(null);
  const [engine, setEngine] = useState<"claude" | "lite" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/tutor").then((r) => r.json()).then((d) => setEngine(d.mode)).catch(() => {});
  }, []);
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40))); } catch {}
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = useCallback(async (text: string, feature: AiFeature = mode) => {
    const content = text.trim();
    if (!content || busy) return;
    if (engine !== "lite" && !planAtLeast(p.plan, AI_FEATURE_MIN_PLAN[feature])) {
      setNotice({ kind: "info", text: `${MODES.find((m) => m.id === feature)?.label} is part of the ${AI_FEATURE_MIN_PLAN[feature]} plan.`, cta: "upgrade" });
      return;
    }
    setNotice(null);
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: "user", content }];
    setMessages([...messages, { role: "user", content }, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), feature, context }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        setMessages((m) => m.slice(0, -1));
        if (d.configured === false) setNotice({ kind: "warn", text: d.error });
        else if (d.signIn) setNotice({ kind: "info", text: d.error, cta: "signin" });
        else if (d.limitReached || d.upgrade) setNotice({ kind: "info", text: d.error, cta: p.plan === "MAX" ? undefined : "upgrade" });
        else setNotice({ kind: "error", text: d.error ?? "Something went wrong. Please try again." });
        return;
      }
      const remaining = Number(res.headers.get("X-AI-Remaining"));
      const limit = Number(res.headers.get("X-AI-Limit"));
      if (!Number.isNaN(limit) && limit > 0) p.setAiUsage(limit - remaining, limit);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        const errIdx = acc.indexOf("[[error]]");
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = errIdx >= 0
            ? { role: "assistant", content: acc.slice(errIdx + 9).trim(), error: true }
            : { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setMessages((m) => [...m.slice(0, -1), { role: "assistant", content: "Connection lost. Please try again.", error: true }]);
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, [busy, context, messages, mode, p, engine]);

  useEffect(() => {
    if (!listen) return;
    const handler = () => {
      const d = takePendingTutorRequest();
      if (!d) return;
      if (d.feature) setMode(d.feature);
      send(d.message, d.feature ?? "chat");
    };
    handler(); // a request may have been queued before this panel mounted
    window.addEventListener(TUTOR_EVENT, handler);
    return () => window.removeEventListener(TUTOR_EVENT, handler);
  }, [listen, send]);

  const aiLabel = engine === "lite" ? "PyBuddy Lite · free" : p.mode === "account" ? `${Math.max(0, p.ai.limit - p.ai.used)} of ${p.ai.limit} messages left today` : p.authConfigured ? "Sign in to chat" : "Demo mode";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`flex flex-wrap items-center gap-1.5 border-b border-border ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
        {MODES.map((m) => {
          const locked = engine !== "lite" && !planAtLeast(p.plan, AI_FEATURE_MIN_PLAN[m.id]);
          return (
            <button key={m.id} onClick={() => setMode(m.id)} title={m.hint}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${mode === m.id ? "bg-accent text-white" : "text-muted hover:bg-elevated hover:text-fg"}`}>
              {m.label}{locked && <Crown className="ml-1 inline h-3 w-3" />}
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-muted">{aiLabel}</span>
        {messages.length > 0 && (
          <button onClick={() => { abortRef.current?.abort(); setMessages([]); setNotice(null); }} className="btn-ghost btn-sm" title="Clear conversation" aria-label="Clear conversation"><Trash2 className="h-3.5 w-3.5" /></button>
        )}
      </div>

      <div className="thin-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="mx-auto max-w-lg py-4 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white"><Bot className="h-6 w-6" /></span>
            <p className="mt-3 font-semibold">Hi! I'm {engine === "lite" ? "PyBuddy Lite" : "PyBuddy"}, your Python tutor.</p>
            <p className="mt-1 text-sm text-muted">Ask me anything — no question is too small. You can paste code too.</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {SUGGESTIONS.slice(0, compact ? 4 : 6).map((s) => (
                <button key={s} onClick={() => send(s, "chat")} className="rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm hover:border-accent/50 hover:bg-elevated">{s}</button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-elevated" : "bg-gradient-to-br from-accent to-accent2 text-white"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </span>
              <div className={`min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-accent text-white" : m.error ? "border border-danger/30 bg-danger/5" : "border border-border bg-surface"}`}>
                {m.role === "user" ? (
                  <p className="whitespace-pre-wrap break-words text-[14.5px]">{m.content}</p>
                ) : m.content ? (
                  <Markdown text={m.content} />
                ) : (
                  <span className="flex items-center gap-2 py-1 text-sm text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={endRef} />
      </div>

      {notice && (
        <div className="px-4 pb-2">
          <Notice kind={notice.kind}>
            {notice.text}{" "}
            {notice.cta === "signin" && <Link href="/signin" className="link font-medium">Sign in</Link>}
            {notice.cta === "upgrade" && <Link href="/pricing" className="link font-medium">See plans</Link>}
          </Notice>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
          <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} rows={compact ? 2 : 3}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={MODES.find((m) => m.id === mode)?.hint + " — Shift+Enter for a new line"}
            className="max-h-48 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none" aria-label="Message PyBuddy" maxLength={12000} />
          {busy ? (
            <button type="button" onClick={() => abortRef.current?.abort()} className="btn-secondary h-9 w-9 !p-0" aria-label="Stop"><Square className="h-4 w-4" /></button>
          ) : (
            <button type="submit" disabled={!input.trim()} className="btn-primary h-9 w-9 !p-0" aria-label="Send"><ArrowUp className="h-4 w-4" /></button>
          )}
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">{engine === "lite" ? "PyBuddy Lite answers from PyNest's lessons and only covers Python — free, no limits." : "PyBuddy can make mistakes — run the code to check. Fair-use daily limits apply."}</p>
      </form>
    </div>
  );
}
