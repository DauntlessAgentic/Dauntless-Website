"use client";
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

// Minimal theme toggle — no next-themes dependency needed.
// Reads/writes localStorage and toggles class on <html>.
// next-themes can replace this if needed, but this avoids hydration flicker
// and works cleanly with our CSS class strategy.
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Read saved preference; default to dark
    const saved = localStorage.getItem("app-chassis-theme");
    const dark = saved ? saved === "dark" : true;
    setIsDark(dark);
    applyTheme(dark);
  }, []);

  function applyTheme(dark: boolean) {
    const html = document.documentElement;
    html.classList.remove("light", "dark");
    html.classList.add(dark ? "dark" : "light");
  }

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    applyTheme(next);
    localStorage.setItem("app-chassis-theme", next ? "dark" : "light");
  }

  return (
    <IconButton
      icon={isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      size="sm"
      onClick={toggle}
    />
  );
}
