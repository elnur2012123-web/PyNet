"use client";
import type { AiFeature } from "@/lib/plans";

export interface TutorRequest { message: string; feature?: AiFeature }
export const TUTOR_EVENT = "pynest:ask-tutor";

/** Open the floating PyBuddy panel and send a message (used by "Ask PyBuddy" buttons). */
let pending: TutorRequest | null = null;
export function takePendingTutorRequest() {
  const p = pending;
  pending = null;
  return p;
}

export function askTutor(req: TutorRequest) {
  pending = req;
  window.dispatchEvent(new CustomEvent<TutorRequest>(TUTOR_EVENT, { detail: req }));
}
