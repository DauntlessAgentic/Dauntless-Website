"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Send, Play } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTag } from "@/components/ui/content-tag";
import { AgentFleetPanel } from "@/components/patterns/agent-fleet-panel";
import type { PortalSnapshot } from "@/lib/portal/types";
import type { MembershipContext } from "@/lib/auth/session";
import { runAgentAction, type AgentRunSummary } from "@/lib/portal/agents/actions";

const STATE_TAG: Record<string, React.ComponentProps<typeof ContentTag>["variant"]> = {
  idle: "default", active: "success", thinking: "info",
  blocked: "warning", complete: "success", updated: "accent",
};

interface AgentsViewProps {
  snapshot: PortalSnapshot;
  membership: MembershipContext;
}

export function AgentsView({ snapshot, membership }: AgentsViewProps) {
  const {
    agents: mockAgents,
    conversations: mockConversations,
    signals: mockSignals,
    auditLog: mockAuditLog,
  } = snapshot;
  const [selectedId, setSelectedId] = useState(mockAgents[0]?.id ?? "");
  const selected = mockAgents.find((a) => a.id === selectedId) ?? mockAgents[0];
  const conversation = mockConversations.find((c) => c.agentId === selected.id);
  const recentRuns = mockAuditLog
    .filter((entry) => entry.actorKind === "agent" && entry.refId === selected.id)
    .slice(0, 6);
  const relatedSignals = mockSignals
    .filter((s) => s.kind === "agent-action" && s.refId === selected.id)
    .slice(0, 6);

  const canRun = roleCanRun(membership.role, selected.archetype);
  const [steeringPrompt, setSteeringPrompt] = useState("");
  const [lastRun, setLastRun] = useState<AgentRunSummary | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, startRun] = useTransition();

  const handleRun = () => {
    setRunError(null);
    startRun(async () => {
      try {
        const result = await runAgentAction({
          agentId: selected.id,
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
        eyebrow="Contextual Agents"
        title="Agent fleet"
        description={`${mockAgents.length} agents · separation of powers enforced — no agent both routes and executes.`}
        badge={`${mockAgents.filter((a) => a.state === "thinking" || a.state === "active").length} active`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">

        <DashboardCard
            id="agent-runner"
            eyebrow="LIVE RUNTIME"
            title={`Run the ${selected.name}`}
            subtitle={canRun
              ? archetypeRunSubtitle(selected.archetype)
              : `Your role (${membership.role}) can read agent state but cannot trigger ${selected.archetype} runs.`}
            agentId={selected.id}
            agentState={isRunning ? "thinking" : selected.state}
            badge={lastRun?.status === "stub" ? "Stub mode" : lastRun?.status ?? "Idle"}
            badgeVariant={lastRun?.status === "errored" ? "danger" : lastRun?.status === "completed" ? "success" : "accent"}
          >
            <div className="px-3 py-3 space-y-3">
              <div className="flex flex-col gap-2">
                <Textarea
                  placeholder="Optional steering prompt (e.g. 'Focus on the Agentic Systems engagement; weigh the GCKey identity gap')."
                  value={steeringPrompt}
                  onChange={(e) => setSteeringPrompt(e.target.value)}
                  disabled={!canRun || isRunning}
                  className="min-h-[60px] text-xs"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    className="gap-1.5"
                    disabled={!canRun || isRunning}
                    onClick={handleRun}
                  >
                    <Play className="h-3 w-3" />
                    {isRunning ? "Running…" : "Run agent"}
                  </Button>
                  {runError && (
                    <p className="text-xs text-[--danger] leading-snug">{runError}</p>
                  )}
                </div>
              </div>

              {lastRun && (
                <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Last run</p>
                    <ContentTag variant={lastRun.status === "errored" ? "danger" : lastRun.status === "completed" ? "success" : "accent"} dot>
                      {lastRun.status}
                    </ContentTag>
                  </div>
                  <p className="text-xs text-[--text-primary] leading-relaxed">{lastRun.summary}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <Field label="Model">{lastRun.model}</Field>
                    <Field label="Cost">{lastRun.costUsd}</Field>
                    <Field label="Cache hit">{Math.round(lastRun.cacheHitRate * 100)}%</Field>
                    <Field label="In / out tokens">{lastRun.inputTokens} / {lastRun.outputTokens}</Field>
                  </div>
                  {lastRun.toolCalls.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Tools called</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lastRun.toolCalls.map((t, idx) => (
                          <ContentTag
                            key={`${t.tool}-${idx}`}
                            variant={t.isError ? "danger" : t.tool === "propose_decision" ? "accent" : "info"}
                          >
                            {t.tool}
                          </ContentTag>
                        ))}
                      </div>
                    </div>
                  )}
                  {lastRun.decisionId && (
                    <p className="text-xs text-[--text-secondary]">
                      Decision <span className="font-mono">{lastRun.decisionId}</span> queued in the{" "}
                      <Link href="/portal/decisions" className="text-[--accent-vivid] hover:underline">
                        Decision Register
                      </Link>{" "}
                      for approval.
                    </p>
                  )}
                </div>
              )}
            </div>
          </DashboardCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-1 min-h-[500px]">
            <DashboardCard
              id="agent-fleet-panel"
              eyebrow="FLEET"
              title="Archetypes"
              subtitle="Strategist · Operator · Auditor · Chief of Staff"
              agentId={selected.id}
              agentState={selected.state}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <AgentFleetPanel
                  agents={mockAgents}
                  selectedAgentId={selected.id}
                  onSelect={(agent) => setSelectedId(agent.id)}
                />
              </ScrollArea>
            </DashboardCard>
          </div>

          <div className="lg:col-span-2 min-h-[500px] flex flex-col gap-3">
            <DashboardCard
              id="agent-profile"
              eyebrow="AGENT"
              title={selected.name}
              subtitle={selected.role}
              badge={selected.archetype.replace("-", " ")}
              badgeVariant="accent"
              agentId={selected.id}
              agentState={selected.state}
              bodyClassName="overflow-hidden"
            >
              <ScrollArea className="h-full">
                <div className="px-3 py-3 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Field label="Model">{selected.model}</Field>
                    <Field label="State"><ContentTag variant={STATE_TAG[selected.state]} dot>{selected.state}</ContentTag></Field>
                    <Field label="Decisions touched">{selected.decisionsTouched}</Field>
                    <Field label="Conversations / 7d">{selected.conversationsLast7d}</Field>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Tools</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tools.map((tool) => (
                        <ContentTag key={tool} variant="info">{tool}</ContentTag>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Scope</p>
                    <p className="text-xs text-[--text-secondary]">
                      {selected.scope.length === 0
                        ? "Workspace-wide"
                        : selected.scope.join(" · ")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Try asking</p>
                    <ul className="flex flex-col gap-1">
                      {selected.exampleQuestions.map((q) => (
                        <li key={q} className="text-xs text-[--text-secondary] italic leading-snug pl-2 border-l-2 border-[--border-active]">
                          &ldquo;{q}&rdquo;
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollArea>
            </DashboardCard>

            <DashboardCard
              id="agent-conversation"
              eyebrow="THREAD"
              title={conversation?.title ?? "Start a conversation"}
              subtitle="Read-only preview · sending is wired up when the agent runtime lands"
              agentId={selected.id}
              agentState={selected.state}
              bodyClassName="overflow-hidden"
            >
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 px-3 py-2">
                  <div className="flex flex-col gap-3">
                    {conversation?.messages.length ? (
                      conversation.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                          {msg.role === "assistant" && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--elevated-2] border border-[--border-default] mt-0.5">
                              <Sparkles className="h-3 w-3 text-[--accent-vivid]" />
                            </div>
                          )}
                          <div
                            className={`max-w-[88%] rounded-[8px] px-2.5 py-2 text-xs leading-relaxed whitespace-pre-line ${
                              msg.role === "user"
                                ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary] rounded-tr-[3px]"
                                : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary] rounded-tl-[3px]"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[--text-muted] italic">No conversation history yet for this agent.</p>
                    )}
                  </div>
                </ScrollArea>
                <div className="px-3 py-2 border-t border-[--border-subtle] flex items-end gap-2">
                  <Textarea
                    placeholder={`Message ${selected.name}…`}
                    className="min-h-[44px] max-h-[120px] resize-none text-xs"
                    disabled
                  />
                  <Button variant="primary" size="sm" disabled aria-label="Send">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="agent-runs"
            eyebrow="RUNS"
            title="Recent audited actions"
            subtitle={`${recentRuns.length} entries`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {recentRuns.length === 0 ? (
                  <li className="px-3 py-6 text-center text-xs text-[--text-muted]">No audited runs for this agent yet.</li>
                ) : (
                  recentRuns.map((entry) => (
                    <li key={entry.id} className="flex flex-col gap-0.5 px-3 py-2">
                      <p className="text-xs font-semibold text-[--text-primary] leading-snug">{entry.detail}</p>
                      <p className="text-xs text-[--text-muted]">
                        {entry.action.replace("-", " ")} · {entry.riskTier} risk · {relativeAgo(entry.at)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>

          <DashboardCard
            id="agent-signals"
            eyebrow="SIGNALS"
            title="Signals this agent has emitted"
            subtitle={`${relatedSignals.length} in the last cycle`}
            bodyClassName="overflow-hidden"
          >
            <ScrollArea className="h-full">
              <ul className="flex flex-col divide-y divide-[--border-subtle]">
                {relatedSignals.length === 0 ? (
                  <li className="px-3 py-6 text-center text-xs text-[--text-muted]">No signals for this agent yet.</li>
                ) : (
                  relatedSignals.map((signal) => (
                    <li key={signal.id} className="flex flex-col gap-0.5 px-3 py-2">
                      <p className="text-xs font-semibold text-[--text-primary] leading-snug">{signal.title}</p>
                      <p className="text-xs text-[--text-muted] leading-snug">{signal.detail}</p>
                    </li>
                  ))
                )}
              </ul>
            </ScrollArea>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] px-2 py-1.5">
      <p className="text-xs uppercase tracking-widest text-[--text-muted]">{label}</p>
      <div className="text-xs text-[--text-primary]">{children}</div>
    </div>
  );
}

function roleCanRun(role: string, archetype: string): boolean {
  if (role === "owner" || role === "executive" || role === "lead") return true;
  if (role === "auditor" && (archetype === "auditor" || archetype === "chief-of-staff")) return true;
  return false;
}

function archetypeRunSubtitle(archetype: string): string {
  switch (archetype) {
    case "strategist":     return "Propose a new decision against the workspace. Every run is audited; the proposal lands in pending-approval status.";
    case "operator":       return "Draft a new artifact version. Operators must hand off to an Auditor before publication.";
    case "auditor":        return "Run an evidence-completeness audit. Verdicts ride through to the Decision Register.";
    case "chief-of-staff": return "Generate an executive briefing from current workspace state.";
    default:               return "Run the agent against the workspace.";
  }
}

function relativeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hrs = Math.round(diff / 3600_000);
  if (hrs < 1) return "just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
