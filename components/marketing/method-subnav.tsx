"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

const sections = [
  { id: "principles",  label: "Principles" },
  { id: "intelligence", label: "CI + AI" },
  { id: "phases",      label: "Engagement Phases" },
  { id: "trust",       label: "Trust Architecture" },
];

export function MethodSubnav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id);
        },
        // Trigger when section top crosses 30% from the top of the viewport
        { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      className="hidden md:block sticky top-[72px] z-40 border-b border-[--mkt-border]"
      style={{ background: "var(--mkt-section)" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-1">
        {sections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150",
                isActive
                  ? "text-[--accent-vivid] bg-[rgba(124,58,237,0.1)]"
                  : "text-[--text-secondary] hover:text-[--text-primary] hover:bg-[rgba(0,0,0,0.04)]"
              )}
            >
              {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
