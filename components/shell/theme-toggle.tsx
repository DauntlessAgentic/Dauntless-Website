"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

// Minimal theme toggle — no next-themes dependency needed.
// Reads/writes localStorage and toggles class on <html>.
// next-themes can replace this if needed, but this avoids hydration flicker
// and works cleanly with our CSS class strategy.
function applyTheme(dark: boolean) {
  const html = document.documentElement;
  html.classList.remove("light", "dark");
  html.classList.add(dark ? "dark" : "light");
}

export function ThemeToggle() {
  // Lazy initializer reads saved preference once on mount; on the server
  // (where window is undefined) we default to dark to match the SSR class.
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const saved = window.localStorage.getItem("app-chassis-theme");
    return saved ? saved === "dark" : true;
  });

  // Sync the <html> class with current preference. This is the external-system
  // write that effects exist for; it does not call setState.
  useEffect(() => {
    applyTheme(isDark);
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((current) => {
      const next = !current;
      window.localStorage.setItem("app-chassis-theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  return (
    <IconButton
      icon={isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      size="sm"
      onClick={toggle}
    />
  );
}
