"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { DAILY, EXPERIENCE, GOALS } from "@/lib/profile-options";
import { Spinner } from "@/components/ui/States";
import { LogoMark } from "@/components/ui/Logo";

export default function OnboardingPage() {
  const p = useProgress();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [exp, setExp] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [daily, setDaily] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const finish = async (skip = false) => {
    setSaving(true);
    const sb = getBrowserSupabase();
    if (sb && p.profile) {
      await sb.from("profiles").update(skip ? { onboarded: true } : { onboarded: true, experience_level: exp, learning_goal: goal, daily_goal_minutes: daily ?? 20 }).eq("id", p.profile.id);
      await p.refresh();
    }
    router.push(exp === "other_language" && !skip ? "/learn/m2-variables" : "/dashboard");
  };

  const steps = [
    { title: "What is your programming experience?", options: EXPERIENCE.map((x) => ({ id: x.id as string | number, label: x.label })), value: exp, set: (v: string | number) => setExp(String(v)) },
    { title: "Why are you learning Python?", options: GOALS.map((x) => ({ id: x.id as string | number, label: x.label })), value: goal, set: (v: string | number) => setGoal(String(v)) },
    { title: "How much time can you study daily?", options: DAILY.map((x) => ({ id: x.id as string | number, label: x.label })), value: daily, set: (v: string | number) => setDaily(Number(v)) },
  ];
  const s = steps[step];

  return (
    <div className="mx-auto max-w-xl py-6">
      <div className="mb-8 flex items-center gap-3"><LogoMark size={36} /><div><p className="font-semibold">Let's personalise your path</p><p className="text-sm text-muted">Step {step + 1} of 3</p></div></div>
      <div className="mb-6 flex gap-2">{steps.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-elevated"}`} />)}</div>
      <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
      <div className="mt-6 grid gap-3" role="radiogroup">
        {s.options.map((o) => (
          <button key={o.id} role="radio" aria-checked={s.value === o.id} onClick={() => s.set(o.id)}
            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition ${s.value === o.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/40"}`}>
            <span className="font-medium">{o.label}</span>{s.value === o.id && <Check className="h-5 w-5 text-accent" />}
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        <button onClick={() => finish(true)} className="btn-ghost" disabled={saving}>Skip for now</button>
        <div className="flex gap-2">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="btn-secondary">Back</button>}
          {step < 2 ? (
            <button onClick={() => setStep(step + 1)} disabled={s.value === null} className="btn-primary">Next <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button onClick={() => finish(false)} disabled={s.value === null || saving} className="btn-primary">{saving && <Spinner />} Start learning</button>
          )}
        </div>
      </div>
    </div>
  );
}
