"use client";
/* eslint-disable react-hooks/purity */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Target } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { ContentTag } from "@/components/ui/content-tag";
import type { FeedbackScenario } from "@/lib/portal/feedback/scenarios";

interface RunRecord {
  scenarioId: string;
  startedAt: number;
  completedAt?: number;
  succeeded?: boolean;
  notes?: string;
}

const STORAGE_KEY = "dauntless-feedback-harness";

interface Props {
  scenarios: FeedbackScenario[];
}

export function FeedbackHarnessView({ scenarios }: Props) {
  const [runs, setRuns] = useState<Record<string, RunRecord>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setRuns(JSON.parse(raw));
      } catch {
        // corrupt local state — ignore
      }
    }
  }, []);

  // Tick once a second while a scenario is active so the elapsed
  // counter refreshes without polling Date.now() during render.
  useEffect(() => {
    if (!activeId) return;
    const handle = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(handle);
  }, [activeId]);

  const persist = (next: Record<string, RunRecord>) => {
    setRuns(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const start = (s: FeedbackScenario) => {
    const now = Date.now();
    const next = { ...runs, [s.id]: { scenarioId: s.id, startedAt: now } };
    persist(next);
    setActiveId(s.id);
    setNotes("");
  };

  const complete = (s: FeedbackScenario, succeeded: boolean) => {
    const existing = runs[s.id];
    if (!existing || !existing.startedAt) return;
    const now = Date.now();
    const next = {
      ...runs,
      [s.id]: { ...existing, completedAt: now, succeeded, notes },
    };
    persist(next);
    setActiveId(null);
    setNotes("");
  };

  const reset = () => {
    setRuns({});
    window.localStorage.removeItem(STORAGE_KEY);
    setActiveId(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(runs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-harness-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Internal feedback harness"
        title="Time-on-task: scripted scenarios"
        description="Six scenarios seeded from the May 2026 client advisory board. Used to keep the 'third user' principle measurable across builds."
        badge="Internal"
        badgeVariant="warning"
        actions={
          <Button size="sm" variant="ghost" onClick={exportJson}>
            Export results JSON
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="harness-rules"
          eyebrow="HOW TO USE"
          title="Self-administered usability runs"
          subtitle="One person, one scenario at a time. Click Start, do the task, click Done. Results stay in your browser until you export."
        >
          <ol className="px-3 py-3 list-decimal pl-7 text-xs text-[--text-secondary] leading-snug space-y-1">
            <li>Click <span className="font-mono">Start</span> on a scenario — the timer begins.</li>
            <li>Follow the start path. Don't ask for help.</li>
            <li>When you've met the success criterion, click <span className="font-mono">Done — success</span>. If you got stuck, click <span className="font-mono">Done — failed</span> instead.</li>
            <li>Add a one-sentence note about what tripped you up.</li>
            <li>Export the JSON when finished. Attach to the matching PR.</li>
          </ol>
        </DashboardCard>

        <ul className="flex flex-col gap-3">
          {scenarios.map((s) => {
            const run = runs[s.id];
            const isActive = activeId === s.id;
            const nowRef = tick; // re-evaluated each tick while active
            const liveNow = typeof window === "undefined" ? 0 : Date.now() + nowRef * 0;
            const elapsed =
              run?.completedAt && run.startedAt
                ? Math.round((run.completedAt - run.startedAt) / 1000)
                : isActive && run?.startedAt
                ? Math.round((liveNow - run.startedAt) / 1000)
                : undefined;
            return (
              <li key={s.id}>
                <DashboardCard
                  id={`scenario-${s.id}`}
                  eyebrow={s.persona.toUpperCase()}
                  title={s.title}
                  subtitle={s.task}
                  badge={
                    run?.completedAt
                      ? run.succeeded
                        ? `${elapsed}s · success`
                        : `${elapsed}s · failed`
                      : isActive
                      ? "running"
                      : "ready"
                  }
                  badgeVariant={
                    run?.completedAt
                      ? run.succeeded
                        ? "success"
                        : "warning"
                      : isActive
                      ? "accent"
                      : "default"
                  }
                >
                  <div className="px-3 py-3 flex flex-col gap-2 text-xs text-[--text-secondary] leading-snug">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ContentTag variant="info" dot>
                        <Target className="h-3 w-3 inline mr-0.5" />
                        target ≤ {s.targetSeconds}s
                      </ContentTag>
                      <ContentTag variant="default">starts at <span className="font-mono">{s.startAt}</span></ContentTag>
                      <ContentTag variant="default">
                        <Clock className="h-3 w-3 inline mr-0.5" />
                        {elapsed !== undefined ? `${elapsed}s` : "—"}
                      </ContentTag>
                    </div>
                    <p>
                      <span className="font-semibold text-[--text-primary]">Success criterion:</span> {s.successCriterion}
                    </p>
                    {isActive && (
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What tripped you up? One sentence."
                        rows={2}
                        className="w-full text-xs rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-2 text-[--text-primary]"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      {!isActive && !run?.completedAt && (
                        <>
                          <Button size="sm" variant="primary" className="gap-1.5" onClick={() => start(s)}>
                            Start
                          </Button>
                          <Link
                            href={s.startAt}
                            className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1"
                          >
                            Open start page <ArrowRight className="h-3 w-3" />
                          </Link>
                        </>
                      )}
                      {isActive && (
                        <>
                          <Button size="sm" variant="primary" onClick={() => complete(s, true)}>
                            Done — success
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => complete(s, false)}>
                            Done — failed
                          </Button>
                        </>
                      )}
                      {run?.completedAt && !isActive && (
                        <Button size="sm" variant="ghost" onClick={() => start(s)}>
                          Re-run
                        </Button>
                      )}
                    </div>
                    {run?.completedAt && run?.notes && (
                      <p className="italic text-[--text-muted]">"{run.notes}"</p>
                    )}
                  </div>
                </DashboardCard>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={reset}>
            Reset all
          </Button>
        </div>
      </div>
    </div>
  );
}
