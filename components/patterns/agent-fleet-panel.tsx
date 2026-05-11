"use client";
import React from "react";
import { Bot, Compass, Cog, ShieldCheck, UserCog } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Agent, AgentArchetype } from "@/lib/portal/types";
import type { AgentState } from "@/lib/types";

const ARCHETYPE_META: Record<AgentArchetype, { Icon: React.ComponentType<{ className?: string }>; label: string; description: string }> = {
  strategist:        { Icon: Compass,     label: "Strategists",     description: "Route, plan, propose" },
  operator:          { Icon: Cog,         label: "Operators",       description: "Draft, render, execute" },
  auditor:           { Icon: ShieldCheck, label: "Auditors",        description: "Verify, enforce, flag" },
  "chief-of-staff":  { Icon: UserCog,     label: "Chief of Staff",  description: "Bridge, escalate, mediate" },
};

const STATE_DOT: Record<AgentState, string> = {
  idle:     "bg-[--agent-idle]",
  active:   "bg-[--agent-active] animate-pulse-glow",
  thinking: "bg-[--agent-thinking] animate-thinking",
  blocked:  "bg-[--agent-blocked]",
  complete: "bg-[--agent-complete]",
  updated:  "bg-[--agent-updated]",
};

const STATE_LABEL: Record<AgentState, string> = {
  idle: "Idle", active: "Active", thinking: "Thinking",
  blocked: "Blocked", complete: "Complete", updated: "Updated",
};

const ARCHETYPE_ORDER: AgentArchetype[] = ["chief-of-staff", "strategist", "operator", "auditor"];

interface AgentFleetPanelProps {
  agents: Agent[];
  onSelect?: (agent: Agent) => void;
  selectedAgentId?: string;
  className?: string;
}

export function AgentFleetPanel({ agents, onSelect, selectedAgentId, className }: AgentFleetPanelProps) {
  const grouped = ARCHETYPE_ORDER.map((arch) => ({
    archetype: arch,
    meta: ARCHETYPE_META[arch],
    agents: agents.filter((a) => a.archetype === arch),
  })).filter((g) => g.agents.length > 0);

  return (
    <div className={cn("flex flex-col divide-y divide-[--border-subtle]", className)}>
      {grouped.map(({ archetype, meta, agents: groupAgents }) => {
        const HeaderIcon = meta.Icon;
        return (
          <section key={archetype} className="flex flex-col gap-1.5 px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <HeaderIcon className="h-3 w-3 text-[--text-muted]" />
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">{meta.label}</p>
              <p className="text-xs text-[--text-muted]">· {meta.description}</p>
            </div>
            <ul className="space-y-1">
              {groupAgents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                return (
                  <li key={agent.id}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(agent)}
                      className={cn(
                        "w-full flex items-center gap-2 rounded-[--radius-md] px-2 py-1.5 text-left",
                        "transition-colors duration-[--duration-fast]",
                        isSelected
                          ? "bg-[--accent-dim] border border-[--border-active]"
                          : "hover:bg-[--elevated] border border-transparent",
                      )}
                    >
                      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--elevated-2] border border-[--border-default]">
                        <Bot className="h-3 w-3 text-[--accent-vivid]" />
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-[--panel-bg]",
                            STATE_DOT[agent.state],
                          )}
                        />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[--text-primary] truncate">{agent.name}</span>
                          <span className="text-xs text-[--text-muted] truncate">· {agent.role}</span>
                        </span>
                        <span className="flex items-center gap-2 text-xs text-[--text-muted]">
                          <span className="font-mono tabular-nums">{agent.model}</span>
                          <span>· {STATE_LABEL[agent.state]}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
