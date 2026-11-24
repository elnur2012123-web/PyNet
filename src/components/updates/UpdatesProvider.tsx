"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UpdateEntry } from "@/content/updates";

const SEEN_KEY = "pn-updates-seen";
const POPUP_KEY = "pn-updates-popup";

interface Ctx {
  updates: UpdateEntry[];
  unread: UpdateEntry[];
  markAllRead: () => void;
  popup: UpdateEntry | null;
  dismissPopup: () => void;
}
const UpdatesCtx = createContext<Ctx>({ updates: [], unread: [], markAllRead: () => {}, popup: null, dismissPopup: () => {} });
export const useUpdates = () => useContext(UpdatesCtx);

const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

/** Loads release notes and tracks which ones this browser has already seen. */
export function UpdatesProvider({ children }: { children: React.ReactNode }) {
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [seen, setSeen] = useState<string | null>(null);
  const [popup, setPopup] = useState<UpdateEntry | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/updates").then((r) => r.json()).then((d: { updates: UpdateEntry[] }) => {
      if (!alive) return;
      const list = d.updates ?? [];
      setUpdates(list);
      let lastSeen = read(SEEN_KEY);
      if (!lastSeen) {
        // First visit: start fresh, only show what comes next.
        lastSeen = list[0]?.date ?? new Date().toISOString();
        write(SEEN_KEY, lastSeen);
        write(POPUP_KEY, lastSeen);
      }
      setSeen(lastSeen);
      const popupSeen = read(POPUP_KEY) ?? "";
      const newest = list[0];
      if (newest && newest.date > lastSeen && newest.date > popupSeen) setPopup(newest);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const markAllRead = useCallback(() => {
    if (!updates[0]) return;
    write(SEEN_KEY, updates[0].date);
    write(POPUP_KEY, updates[0].date);
    setSeen(updates[0].date);
    setPopup(null);
  }, [updates]);

  const dismissPopup = useCallback(() => {
    if (popup) write(POPUP_KEY, popup.date);
    setPopup(null);
  }, [popup]);

  const unread = seen ? updates.filter((u) => u.date > seen) : [];
  return <UpdatesCtx.Provider value={{ updates, unread, markAllRead, popup, dismissPopup }}>{children}</UpdatesCtx.Provider>;
}
