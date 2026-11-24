"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = !mounted ? Monitor : theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <button onClick={() => setTheme(next)} className="btn-ghost btn-sm h-9 w-9 !p-0" aria-label={`Theme: ${mounted ? theme : "system"}. Switch to ${next}`} title={`Theme: ${mounted ? theme : "system"}`}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
