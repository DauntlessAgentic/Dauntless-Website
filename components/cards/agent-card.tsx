"use client";
import React, { useState } from "react";
import { Bot, Send, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { AgentConfig } from "@/lib/types";

// ── Agent Status Strip ────────────────────────────────────────

interface AgentStatusStripProps {
  agents: AgentConfig[];
  className?: string;
}

const STATE_STYLES = {
  idle:     { color: "text-[--agent-idle]",     bg: "bg-[--agent-idle]",     label: "IDLE" },
  active:   { color: "text-[--agent-active]",   bg: "bg-[--agent-active]",   label: "ACTIVE" },
  thinking: { color: "text-[--agent-thinking]", bg: "bg-[--agent-thinking]", label: "THINKING" },
  blocked:  { color: "text-[--agent-blocked]",  bg: "bg-[--agent-blocked]",  label: "BLOCKED" },
  complete: { color: "text-[--agent-complete]", bg: "bg-[--agent-complete]", label: "DONE" },
  updated:  { color: "text-[--agent-updated]",  bg: "bg-[--agent-updated]",  label: "UPDATED" },
};

export function AgentStatusStrip({ agents, className }: AgentStatusStripProps) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-1.5 bg-[--chrome-bg] border-b border-[--border-subtle]", className)}>
      <span className="text-[9px] font-bold uppercase tracking-widest text-[--text-muted]">Agents</span>
      <div className="flex items-center gap-2 flex-wrap">
        {agents.map((agent) => {
          const style = STATE_STYLES[agent.state];
          return (
            <div key={agent.id} className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", style.bg,
                agent.state === "thinking" && "animate-thinking",
                agent.state === "active" && "animate-pulse-glow"
              )} />
              <span className="text-[10px] text-[--text-primary]">{agent.name}</span>
              <span className={cn("text-[9px] font-mono", style.color)}>{style.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat Card ─────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  agentId?: string;
  content: string;
  timestamp: Date;
}

interface ChatCardProps {
  messages: ChatMessage[];
  agentName?: string;
  agentState?: keyof typeof STATE_STYLES;
  onSend?: (message: string) => void;
  className?: string;
}

export function ChatCard({ messages, agentName = "Agent", agentState = "idle", onSend, className }: ChatCardProps) {
  const [input, setInput] = useState("");
  const style = STATE_STYLES[agentState];

  const handleSend = () => {
    if (!input.trim() || !onSend) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-2", msg.role === "user" && "flex-row-reverse")}
            >
              {msg.role === "assistant" && (
                <div className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                  "bg-[--elevated-2] border border-[--border-default]"
                )}>
                  <Bot className="h-3 w-3 text-[--accent-vivid]" />
                </div>
              )}
              <div className={cn(
                "max-w-[80%] rounded-[8px] px-2.5 py-2 text-xs leading-relaxed",
                msg.role === "user"
                  ? "bg-[--accent-dim] border border-[--border-active] text-[--text-primary] rounded-tr-[3px]"
                  : "bg-[--elevated] border border-[--border-subtle] text-[--text-secondary] rounded-tl-[3px]"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {agentState === "thinking" && (
            <div className="flex gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[--elevated-2] border border-[--border-default]">
                <Bot className="h-3 w-3 text-[--info]" />
              </div>
              <div className="flex items-center gap-1 bg-[--elevated] border border-[--border-subtle] rounded-[8px] rounded-tl-[3px] px-3 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[--info] dot-blink-1" />
                <span className="h-1.5 w-1.5 rounded-full bg-[--info] dot-blink-2" />
                <span className="h-1.5 w-1.5 rounded-full bg-[--info] dot-blink-3" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-3 py-2 border-t border-[--border-subtle] shrink-0">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message ${agentName}…`}
            className="min-h-[60px] max-h-[120px] resize-none text-xs"
          />
          <Button
            variant="primary" size="sm"
            onClick={handleSend}
            disabled={!input.trim()}
            className="shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────

interface Task {
  id: string;
  title: string;
  status: "pending" | "running" | "complete" | "failed";
  progress?: number;
  detail?: string;
}

interface TaskCardProps {
  tasks: Task[];
  className?: string;
}

const taskStatusStyles = {
  pending:  { dot: "bg-[--text-muted]",    label: "Pending" },
  running:  { dot: "bg-[--info] animate-thinking", label: "Running" },
  complete: { dot: "bg-[--success]",       label: "Done" },
  failed:   { dot: "bg-[--danger]",        label: "Failed" },
};

export function TaskCard({ tasks, className }: TaskCardProps) {
  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="flex flex-col gap-0 divide-y divide-[--border-subtle]">
        {tasks.map((task) => {
          const style = taskStatusStyles[task.status];
          return (
            <div key={task.id} className="flex items-start gap-2.5 px-3 py-2.5 hover:bg-[--elevated] transition-colors">
              <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full shrink-0", style.dot)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-[--text-primary] truncate">{task.title}</p>
                  <span className="text-[9px] text-[--text-muted] shrink-0">{style.label}</span>
                </div>
                {task.detail && <p className="text-[10px] text-[--text-muted] mt-0.5">{task.detail}</p>}
                {task.progress !== undefined && (
                  <div className="mt-1.5 h-0.5 rounded-full bg-[--elevated-2] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500",
                        task.status === "failed" ? "bg-[--danger]" : "bg-[--accent-bright]"
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
