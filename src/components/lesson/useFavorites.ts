"use client";
import { useCallback, useEffect, useState } from "react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { getBrowserSupabase } from "@/lib/supabase/client";

const KEY = "pynest-favorites";

/** Bookmarked lessons: stored in Supabase for accounts, localStorage for guests. */
export function useFavorites() {
  const p = useProgress();
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const account = p.mode === "account" && p.profile;

  useEffect(() => {
    if (!p.ready) return;
    if (account) {
      getBrowserSupabase()?.from("favorite_lessons").select("lesson_id").then(({ data }) => setFavs(new Set((data ?? []).map((r) => r.lesson_id))));
    } else {
      try { setFavs(new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"))); } catch { setFavs(new Set()); }
    }
  }, [p.ready, account]);

  const toggle = useCallback(async (lessonId: string) => {
    const has = favs.has(lessonId);
    const next = new Set(favs);
    if (has) next.delete(lessonId); else next.add(lessonId);
    setFavs(next);
    if (account && p.profile) {
      const sb = getBrowserSupabase();
      const { error } = has
        ? await sb!.from("favorite_lessons").delete().eq("lesson_id", lessonId)
        : await sb!.from("favorite_lessons").insert({ user_id: p.profile.id, lesson_id: lessonId });
      if (error) setFavs(favs);
    } else {
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
    }
  }, [favs, account, p.profile]);

  return { favs, toggle };
}
