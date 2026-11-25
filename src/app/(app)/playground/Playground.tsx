"use client";

import { useT } from "@/components/i18n/LocaleProvider";
import { T } from "@/components/i18n/T";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Info, Save, Trash2 } from "lucide-react";
import { PythonRunner } from "@/components/editor/PythonRunner";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { EmptyState, Spinner } from "@/components/ui/States";

const EXAMPLES = [
  { title: "Hello, World!", code: 'print("Hello, World!")' },
  { title: "Variables & f-strings", code: 'name = "Ada"\nage = 36\nprint(f"{name} is {age} years old")\nprint(f"In 10 years: {age + 10}")' },
  { title: "Ask for input", code: 'name = input("What is your name? ")\nprint("Nice to meet you,", name)' },
  { title: "Loops: multiplication table", code: "n = 7\nfor i in range(1, 11):\n    print(f\"{n} x {i} = {n * i}\")" },
  { title: "Lists & dictionaries", code: 'scores = {"Ana": 91, "Ben": 78, "Cy": 85}\nfor name, s in sorted(scores.items(), key=lambda kv: -kv[1]):\n    print(f"{name:<5}{s:>4}")\nprint("Average:", sum(scores.values()) / len(scores))' },
  { title: "Functions", code: "def is_prime(n):\n    if n < 2:\n        return False\n    for d in range(2, int(n ** 0.5) + 1):\n        if n % d == 0:\n            return False\n    return True\n\nprint([n for n in range(30) if is_prime(n)])" },
  { title: "Classes", code: 'class Dog:\n    def __init__(self, name):\n        self.name = name\n\n    def bark(self):\n        return f"{self.name} says woof!"\n\nprint(Dog("Rex").bark())' },
  { title: "An error to explore", code: 'age = 15\nprint("Age: " + age)' },
  { title: "Files", code: 'with open("notes.txt", "w") as f:\n    f.write("Line 1\\nLine 2\\n")\n\nwith open("notes.txt") as f:\n    for line in f:\n        print(line.strip())' },
];

interface Snippet { id: string; title: string; description: string | null; code: string; updated_at: string }

export function Playground() {
  const tx = useT();
  const p = useProgress();
  const toast = useToast();
  const [code, setCode] = useState(EXAMPLES[1].code);
  const [runnerKey, setRunnerKey] = useState(0);
  const [initial, setInitial] = useState(EXAMPLES[1].code);
  const [snippets, setSnippets] = useState<Snippet[] | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const account = p.mode === "account";

  const load = useCallback(async () => {
    if (!account) return;
    const { data } = await getBrowserSupabase()!.from("saved_code").select("id,title,description,code,updated_at").order("updated_at", { ascending: false });
    setSnippets(data ?? []);
  }, [account]);
  useEffect(() => { load(); }, [load]);

  const open = (c: string) => { setInitial(c); setCode(c); setRunnerKey((k) => k + 1); try { localStorage.removeItem("pn-playground"); } catch {} };

  const save = async () => {
    if (!p.profile) return;
    setSaving(true);
    const { error } = await getBrowserSupabase()!.from("saved_code").insert({ user_id: p.profile.id, title: title.trim(), description: desc.trim() || null, code });
    setSaving(false);
    if (error) {
      toast({ kind: "error", title: tx("Could not save"), body: error.message.includes("up to 5") ? error.message : "Please try again." });
      return;
    }
    toast({ kind: "success", title: tx("Snippet saved") });
    setSaveOpen(false); setTitle(""); setDesc("");
    load();
  };

  const remove = async (id: string) => {
    const { error } = await getBrowserSupabase()!.from("saved_code").delete().eq("id", id);
    if (!error) setSnippets((s) => s?.filter((x) => x.id !== id) ?? null);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">
        <div>
          <h1 className="h1"><T k="Python playground" /></h1>
          <p className="mt-1 text-muted"><T k="Write and run real Python 3 in your browser. Your draft is kept in this browser automatically." /></p>
        </div>
        <PythonRunner
          key={runnerKey}
          initialCode={initial}
          storageKey="pn-playground"
          minHeight="380px"
          examples={EXAMPLES}
          onCodeChange={setCode}
          toolbarExtra={account ? <button onClick={() => setSaveOpen(true)} className="btn-ghost btn-sm"><Save className="h-3.5 w-3.5" /> <T k="Save" /></button> : null}
        />
        <div className="flex gap-2 rounded-xl border border-border bg-surface p-3 text-xs text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <T k="Runs on" />{" "}<a className="link" href="https://pyodide.org" target="_blank" rel="noreferrer"><T k="Pyodide" /></a> <T k="(CPython compiled to WebAssembly). Limitations: only the standard library is available (no pip)," /><code className="mx-1 font-mono">input()</code> <T k="reads lines from the Input box, files live in a temporary in-browser folder, and programs are stopped after 10 seconds. Shortcuts:" />{" "}<span className="kbd"><T k="Ctrl/⌘ + Enter" /></span> <T k="run ·" />{" "}<span className="kbd"><T k="Tab" /></span> <T k="indent." /></p>
        </div>
      </div>

      <aside className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold"><FolderOpen className="h-4 w-4" /> <T k="Saved snippets" /></h2>
        {!account ? (
          <EmptyState title={tx("Save your programs")} body={p.authConfigured ? tx("Sign in to save snippets to your account and open them on any device.") : tx("Accounts are not configured on this deployment.")}
            action={p.authConfigured ? <Link href="/signin?next=/playground" className="btn-primary btn-sm"><T k="Sign in" /></Link> : undefined} />
        ) : snippets === null ? (
          <div className="flex justify-center py-6"><Spinner /></div>
        ) : snippets.length === 0 ? (
          <EmptyState title={tx("No snippets yet")} body={tx("Press Save in the editor toolbar to keep a program.")} />
        ) : (
          <ul className="space-y-2">
            {snippets.map((s) => (
              <li key={s.id} className="card-flat group p-3">
                <button onClick={() => open(s.code)} className="block w-full text-left">
                  <p className="truncate text-sm font-medium">{s.title}</p>
                  {s.description && <p className="truncate text-xs text-muted">{s.description}</p>}
                  <p className="mt-1 text-[11px] text-muted">{new Date(s.updated_at).toLocaleString()}</p>
                </button>
                <button onClick={() => remove(s.id)} className="mt-1 text-xs text-muted hover:text-danger"><Trash2 className="mr-1 inline h-3 w-3" /><T k="Delete" /></button>
              </li>
            ))}
          </ul>
        )}
        {account && p.plan === "FREE" && <p className="text-xs text-muted"><T k="Free plan: up to 5 snippets." />{" "}<Link href="/pricing" className="link"><T k="Pro" /></Link> <T k="saves unlimited." /></p>}
      </aside>

      <Modal open={saveOpen} onClose={() => setSaveOpen(false)} title={tx("Save snippet")}>
        <form onSubmit={(e) => { e.preventDefault(); if (title.trim()) save(); }} className="space-y-4">
          <div><label className="label" htmlFor="sn-title"><T k="Title" /></label><input id="sn-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required /></div>
          <div><label className="label" htmlFor="sn-desc"><T k="Description" />{" "}<span className="text-muted"><T k="(optional)" /></span></label><input id="sn-desc" className="input" value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={300} /></div>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setSaveOpen(false)} className="btn-secondary"><T k="Cancel" /></button><button className="btn-primary" disabled={saving || !title.trim()}>{saving && <Spinner />} <T k="Save" /></button></div>
        </form>
      </Modal>
    </div>
  );
}
