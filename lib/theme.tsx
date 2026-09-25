"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "set-aside-theme";

interface ThemeContextValue {
  theme: ThemeChoice;
  resolved: ResolvedTheme;
  setTheme: (choice: ThemeChoice) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolve(choice: ThemeChoice, systemPrefersDark: boolean): ResolvedTheme {
  return choice === "system" ? (systemPrefersDark ? "dark" : "light") : choice;
}

export function applyThemeClass(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR-safe snapshot. The browser's saved choice is applied after hydration by
  // the mount effect below; the inline head script owns the pre-paint class.
  const [theme, setThemeChoice] = useState<ThemeChoice>("system");
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage unavailable (private mode) — fall through to "system"
    }
    if (stored === "light" || stored === "dark") {
      setThemeChoice(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(media.matches);
    const onChange = () => setSystemPrefersDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const resolved = resolve(theme, systemPrefersDark);

  useEffect(() => {
    // Before hydration the head script has already set the root class; let it
    // own that paint so a stored "dark" choice never flashes back to light.
    if (!hydrated) return;
    applyThemeClass(resolved);
  }, [resolved, hydrated]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable (private mode) — the session still applies live
    }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolved,
      setTheme: (choice: ThemeChoice) => {
        setThemeChoice(choice);
      },
      toggle: () => setThemeChoice(resolved === "dark" ? "light" : "dark"),
    }),
    [theme, resolved],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}