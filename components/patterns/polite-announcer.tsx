"use client";
import React, { useEffect, useState } from "react";

/**
 * Visually-hidden ARIA live region. Mount once per page; call
 * `announce(message)` to push a polite SR announcement. The text is
 * cleared after a beat so the same message can be re-announced.
 *
 * Audit-3 §H1: snooze, freeze, comment-post, and other dynamic state
 * changes had no SR feedback. This component is the seam.
 */
type Listener = (message: string, tone: "polite" | "assertive") => void;
const listeners = new Set<Listener>();

export function announce(message: string, tone: "polite" | "assertive" = "polite"): void {
  for (const fn of listeners) {
    try {
      fn(message, tone);
    } catch {
      // listeners must not crash callers
    }
  }
}

export function PoliteAnnouncer() {
  const [polite, setPolite] = useState("");
  const [assertive, setAssertive] = useState("");

  useEffect(() => {
    const listener: Listener = (message, tone) => {
      if (tone === "assertive") {
        setAssertive("");
        // double-set so screen readers re-read identical strings
        requestAnimationFrame(() => setAssertive(message));
      } else {
        setPolite("");
        requestAnimationFrame(() => setPolite(message));
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <>
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {polite}
      </span>
      <span
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertive}
      </span>
    </>
  );
}
