import type { Metadata } from "next";
import { Bot } from "lucide-react";
import { TutorChat } from "@/components/tutor/TutorChat";

export const metadata: Metadata = { title: "PyBuddy — your personal Python tutor" };

export default function TutorPage() {
  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-4xl flex-col">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white"><Bot className="h-6 w-6" /></span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">PyBuddy — Your Personal Python Tutor</h1>
          <p className="text-sm text-muted">Explanations in plain English, line-by-line code walkthroughs, debugging help and hints.</p>
        </div>
      </div>
      <div className="card min-h-0 flex-1 overflow-hidden"><TutorChat listen context="/tutor" /></div>
    </div>
  );
}
