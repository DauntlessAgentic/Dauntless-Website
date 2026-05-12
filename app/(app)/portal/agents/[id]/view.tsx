"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, Bot, Play, Wrench } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";
import type { Agent, Conversation } from "@/lib/portal/types";
import type { AgentDefinition } from "@/lib/portal/agents/registry";
import type { AnthropicToolDefinition } from "@/lib/portal/agents/runtime/anthropic";
import { runAgentAction, type AgentRunSummary } from "@/lib/portal/agents/actions";

interface AgentRunDetailProps {
  id: string;
  model: string;
  status: "completed" | "errored" | "stub";
  finishedAt: Date;
  proposedDecisionId?: string;
  inputTokens: number;
  outputTokens: number;
  cacheHitRate: number;
  totalUsd: number;
  notes?: string;
  error?: string;
}

interface AgentDetailViewProps {
  agent: Agent;
  definition: AgentDefinition | null;
  tools: AnthropicToolDefinition[];
  runs: AgentRunDetailProps[];
  conversation?: Conversation;
  membership: MembershipContext;
}

const STATE_TONE: Record<Agent["state"], React.ComponentProps<typeof ContentTag>["variant"]> = {
  idle: "default",
  active: "success",
  thinking: "info",
  blocked: "warning",
  complete: "success",
  updated: "accent",
};

const STATUS_TONE: Record<"completed" | "errored" | "stub", React.ComponentProps<typeof ContentTag>["variant"]> = {
  completed: "success",
  errored: "danger",
  stub: "info",
};

export function AgentDetailView({ agent, definition, tools, runs, conversation, membership }: AgentDetailViewProps) {
  const canRun =
    (membership.role === "owner" || membership.role === "executive" || membership.role === "lead") ||
    (membership.role === "auditor" && (agent.archetype === "auditor" || agent.archetype === "chief-of-staff"));
  const [steeringPrompt, setSteeringPrompt] = useState("");
  const [lastRun, setLastRun] = useState<AgentRunSummary | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, startRun] = useTransition();

  const handleRun = () => {
    setRunError(null);
    startRun(async () => {
      try {
        const result = await runAgentAction({
          agentId: agent.id,
          prompt: steeringPrompt.trim() || undefined,
        });
        setLastRun(result);
        setSteeringPrompt("");
      } catch (err) {
        setRunError(err instanceof Error ? err.message : "Agent run failed.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow={agent.archetype}
        title={agent.name}
        description={definition?.systemPrompt.split("\n").slice(0, 2).join(" ") ?? agent.role}
        badge={agent.state}
        badgeVariant={STATE_TONE[agent.state] ?? undefined}
        actions={
          <Link href="/portal/agents" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" /> Fleet
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <DashboardCard id="agent-id" eyebrow="ID" title={agent.role}>
            <div className="px-3 py-2.5 space-y-2 text-xs">
              <Field label="Model">{agent.model}</Field>
              <Field label="Archetype">{agent.archetype}</Field>
              <Field label="Decisions touched">{agent.decisionsTouched}</Field>
              <Field label="Conversations / 7d">{agent.conversationsLast7d}</Field>
            </div>
          </DashboardCard>

          <DashboardCard
            id="agent-runtime"
            eyebrow="LIVE RUNTIME"
            title="Trigger a run"
            subtitle={canRun ? "Every run is audited. Stub mode produces real state mutations without API spend." : `Your role (${membership.role}) cannot trigger this archetype.`}
            agentId={agent.id}
            agentState={isRunning ? "thinking" : agent.state}
          >
            <div className="px-3 py-2.5 space-y-2">
              <Textarea
                placeholder="Optional steering prompt"
                value={steeringPrompt}
                onChange={(e) => setSteeringPrompt(e.target.value)}
                disabled={!canRun || isRunning}
                className="min-h-[60px] text-xs"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" className="gap-1.5" disabled={!canRun || isRunning} onClick={handleRun}>
                  <Play className="h-3 w-3" /> {isRunning ? "Running…" : "Run agent"}
                </Button>
                {runError && <p className="text-xs text-[--danger]">{runError}</p>}
              </div>
              {lastRun && (
                <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <ContentTag variant={STATUS_TONE[lastRun.status]} dot>
                      {lastRun.status}
                    </ContentTag>
                    <span className="font-mono text-[--text-muted]">{lastRun.model}</span>
                  </div>
                  <p className="text-[--text-secondary] leading-snug">{lastRun.summary}</p>
                  {lastRun.decisionId && (
                    <p>
                      Decision{" "}
                      <Link href={`/portal/decisions/${lastRun.decisionId}`} className="text-[--accent-vivid] hover:underline font-mono">
                        {lastRun.decisionId}
                      </Link>{" "}
                      queued.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DashboardCard>

          <DashboardCard
            id="agent-tools"
            eyebrow="TOOL CATALOG"
            title={`${tools.length} permitted`}
            subtitle="Separation-of-powers is enforced at this catalog. Calls outside the surface return an error before executing."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[280px]">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {tools.map((tool) => (
                  <li key={tool.name} className="flex flex-col gap-0.5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-3 w-3 text-[--accent-vivid] shrink-0" />
                      <code className="text-xs font-mono text-[--text-primary]">{tool.name}</code>
                    </div>
                    <p className="text-xs text-[--text-muted] leading-snug">{tool.description}</p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="agent-runs"
            eyebrow="RUN HISTORY"
            title={`${runs.length} live run${runs.length === 1 ? "" : "s"}`}
            subtitle="Only this server-process; Phase 6.1 persists across restarts."
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              {runs.length === 0 ? (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">
                  No runs yet. Trigger one above to seed the history.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-[--border-subtle]">
                  {runs.map((run) => (
                    <li key={run.id} className="flex flex-col gap-1 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <ContentTag variant={STATUS_TONE[run.status]} dot>
                          {run.status}
                        </ContentTag>
                        <span className="text-xs font-mono text-[--text-muted]">{run.model}</span>
                        <span className="ml-auto text-xs font-mono tabular-nums text-[--text-muted]">
                          {run.finishedAt.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[--text-muted]">
                        <span>${run.totalUsd.toFixed(4)}</span>
                        <span>{run.inputTokens} in / {run.outputTokens} out</span>
                        <span>cache {Math.round(run.cacheHitRate * 100)}%</span>
                        {run.proposedDecisionId && (
                          <Link href={`/portal/decisions/${run.proposedDecisionId}`} className="text-[--accent-vivid] hover:underline font-mono">
                            {run.proposedDecisionId}
                          </Link>
                        )}
                      </div>
                      {run.notes && <p className="text-xs text-[--text-secondary] leading-snug">{run.notes}</p>}
                      {run.error && <p className="text-xs text-[--danger] leading-snug">{run.error}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="agent-conversation"
            eyebrow="CONVERSATION"
            title={conversation?.title ?? "No saved conversation"}
            subtitle="Read-only preview; conversation write paths land in Phase 4.2."
            agentId={agent.id}
            agentState={agent.state}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full max-h-[320px]">
              {conversation?.messages.length ? (
                <div className="flex flex-col gap-3 px-3 py-2">
                  {conversation.messages.map((message) => (
                    <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                      {message.role === "assistant" && (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--elevated-2] border border-[--border-default] mt-0.5">
                          <Bot className="h-3 w-3 text-[--accent-vivid]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[88%] rounded-[8px] px-2.5 py-2 text-xs leading-relaxed whitespace-pre-line ${
                          message.role === "user"
                            ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary] rounded-tr-[3px]"
                            : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary] rounded-tl-[3px]"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-6 text-center text-xs text-[--text-muted]">No saved conversation yet.</p>
              )}
            </ScrollArea>
          </DashboardCard>
        </div>

        <div className="flex items-center justify-end">
          <Link href="/portal/agents" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Back to fleet <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <p className="text-xs text-[--text-primary]">{children}</p>
    </div>
  );
}
