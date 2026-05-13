"use client";

// Lightweight client-side state for v1 decision interactions.
//
// The portal's mock data is module-level and read-only.  Until the Phase 2
// wire-up routes decisions through the repository layer with real
// persistence, we overlay a transient per-page state map so that clicking
// Approve / Defer / Reject on the list page actually transitions the
// visible status.  Navigating away resets — that's intentional for v1.

import { useCallback, useMemo, useState } from "react";
import type { Decision, DecisionStatus } from "./types";
import { DECISION_ACTION_TRANSITIONS, type DecisionAction } from "@/components/patterns/decision-list";

export interface DecisionOverridesController {
  /** Apply overrides on top of the underlying decisions and return the
   *  display-ready list. */
  apply: (decisions: Decision[]) => Decision[];
  /** Transition a decision via one of the canonical actions. */
  act: (decisionId: string, action: DecisionAction) => void;
  /** Force a specific status (used by detail-page status pickers). */
  setStatus: (decisionId: string, status: DecisionStatus) => void;
  /** Reset all overrides. */
  reset: () => void;
}

export function useDecisionOverrides(): DecisionOverridesController {
  const [overrides, setOverrides] = useState<Record<string, DecisionStatus>>({});

  const apply = useCallback(
    (decisions: Decision[]): Decision[] =>
      decisions.map((decision) => {
        const next = overrides[decision.id];
        if (!next || next === decision.status) return decision;
        return {
          ...decision,
          status: next,
          decidedAt: decision.decidedAt ?? new Date(),
          decidedBy: decision.decidedBy ?? "You (this session)",
        };
      }),
    [overrides],
  );

  const act = useCallback((decisionId: string, action: DecisionAction) => {
    setOverrides((current) => ({
      ...current,
      [decisionId]: DECISION_ACTION_TRANSITIONS[action],
    }));
  }, []);

  const setStatus = useCallback((decisionId: string, status: DecisionStatus) => {
    setOverrides((current) => ({ ...current, [decisionId]: status }));
  }, []);

  const reset = useCallback(() => setOverrides({}), []);

  return useMemo(
    () => ({ apply, act, setStatus, reset }),
    [apply, act, setStatus, reset],
  );
}
