"use client";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "da-theme";
type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  // Lazy initializer reads stored/system preference synchronously on first render.
  // On the server, window is undefined → falls back to "dark" (matches SSR HTML).
  // On the client, the correct theme is read before the first paint → no FOUT.
  // suppressHydrationWarning on the wrapper div handles the server/client class mismatch.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") return stored;
      if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
    } catch {}
    return "dark";
  });

  // Belt-and-suspenders: also sync in useEffect for edge cases (e.g. storage events)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
  }, []);

  const toggle = () => {
    setTheme(prev => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {/* suppressHydrationWarning: className resolves to "dark" on both server + initial client */}
      <div
        className={theme}
        style={{ background: "var(--mkt-bg)", color: "var(--text-primary)", minHeight: "100vh" }}
        suppressHydrationWarning
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
