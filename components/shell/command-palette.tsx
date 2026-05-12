"use client";

// ============================================================
// Command Palette (closeout)
//
// Cmd+K / Ctrl+K opens a workspace-wide jumper across the 24
// portal routes + quick actions. Uses the `cmdk` primitive
// already in dependencies.
// ============================================================

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  ArrowRight, Search, Sparkles, BarChart3, FileText, Calendar, GitBranch,
  Network, ShieldCheck, Plug, Bot, BookOpen, Users, Briefcase,
  Activity, Layers, Code2, Brain, Star, Coins, BookOpenCheck, Workflow,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  href: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ITEMS: CommandItem[] = [
  // Core surfaces
  { id: "go-portal",         label: "Command Center",          href: "/portal",                       group: "Core",        icon: Sparkles },
  { id: "go-engagements",    label: "Engagements",             href: "/portal/engagements",           group: "Core",        icon: Briefcase },
  { id: "go-deliverables",   label: "Living Deliverables",    href: "/portal/deliverables",          group: "Core",        icon: FileText },
  { id: "go-decisions",      label: "Decision Register",      href: "/portal/decisions",             group: "Core",        icon: GitBranch },
  { id: "go-agents",         label: "Agent fleet",            href: "/portal/agents",                group: "Core",        icon: Bot },
  { id: "go-knowledge",      label: "Knowledge architecture", href: "/portal/knowledge",             group: "Core",        icon: BookOpen },
  { id: "go-outcomes",       label: "Outcomes",               href: "/portal/outcomes",              group: "Core",        icon: BarChart3 },
  { id: "go-governance",     label: "Governance",             href: "/portal/governance",            group: "Core",        icon: ShieldCheck },

  // Advanced surfaces
  { id: "go-search",         label: "Workspace search",       href: "/portal/search",                group: "Advanced",    icon: Search },
  { id: "go-schedule",       label: "Schedule",               href: "/portal/schedule",              group: "Advanced",    icon: Calendar },
  { id: "go-innovation",     label: "Innovation Studio",      href: "/portal/innovation",            group: "Advanced",    icon: Star },
  { id: "go-impact-report",  label: "Quarterly Impact Report", href: "/portal/outcomes/impact-report", group: "Advanced", icon: BookOpenCheck },

  // Enterprise / Network
  { id: "go-org",            label: "Org rollup",             href: "/portal/org",                   group: "Enterprise",  icon: Users },
  { id: "go-api",             label: "API & SDK",             href: "/portal/api",                   group: "Enterprise",  icon: Code2 },
  { id: "go-actions",        label: "Outbound actions",       href: "/portal/actions",               group: "Enterprise",  icon: Plug },
  { id: "go-compliance",     label: "Compliance posture",     href: "/portal/compliance",            group: "Enterprise",  icon: ShieldCheck },
  { id: "go-federation",     label: "Federation",             href: "/portal/federation",            group: "Enterprise",  icon: Network },
  { id: "go-models",         label: "Model registry",         href: "/portal/models",                group: "Enterprise",  icon: Brain },
  { id: "go-marketplace",    label: "Marketplace",            href: "/portal/marketplace",           group: "Enterprise",  icon: Workflow },
  { id: "go-portfolio",      label: "Dauntless Portfolio",    href: "/portal/portfolio",             group: "Enterprise",  icon: Coins },

  // Self-documenting
  { id: "go-about",          label: "About this portal",      href: "/portal/about",                 group: "About",       icon: Layers },
  { id: "go-changelog",      label: "Workspace changelog",    href: "/portal/changelog",             group: "About",       icon: Activity },

  // Quick actions
  { id: "do-search-query",   label: "Search the workspace…",  hint: "open /portal/search", href: "/portal/search", group: "Actions", icon: Search },
  { id: "do-run-agent",      label: "Run an agent…",          hint: "open /portal/agents", href: "/portal/agents", group: "Actions", icon: Sparkles },
  { id: "do-propose-action", label: "Propose outbound action…", hint: "open /portal/actions", href: "/portal/actions", group: "Actions", icon: Plug },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Expose a global toggle so TopBar can open the palette on click.
  useEffect(() => {
    type WithPortalPalette = Window & { __dauntlessPortalPalette?: { open: () => void } };
    const win = window as WithPortalPalette;
    win.__dauntlessPortalPalette = { open: () => setOpen(true) };
    return () => {
      win.__dauntlessPortalPalette = undefined;
    };
  }, []);

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center p-4 md:p-16 bg-[--app-bg]/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] shadow-[--shadow-elevated] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Portal command palette" loop>
          <div className="flex items-center gap-2 border-b border-[--border-subtle] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[--text-muted]" />
            <Command.Input
              placeholder="Type to search routes, actions, surfaces…"
              className="flex-1 bg-transparent text-sm text-[--text-primary] placeholder:text-[--text-muted] outline-none"
            />
            <kbd className="text-[10px] font-mono text-[--text-muted] bg-[--elevated] border border-[--border-subtle] rounded px-1 py-0.5">
              esc
            </kbd>
          </div>
          <Command.List className="max-h-[60vh] overflow-y-auto py-1">
            <Command.Empty className="px-3 py-6 text-center text-xs text-[--text-muted]">
              No matches.
            </Command.Empty>
            {Array.from(new Set(ITEMS.map((i) => i.group))).map((group) => (
              <Command.Group
                key={group}
                heading={group}
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[--text-muted]"
              >
                {ITEMS.filter((i) => i.group === group).map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.href}`}
                    onSelect={() => handleSelect(item.href)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-[--radius-md] cursor-pointer text-xs text-[--text-secondary] data-[selected=true]:bg-[--accent-dim] data-[selected=true]:text-[--text-primary]"
                  >
                    <item.icon className="h-3.5 w-3.5 text-[--accent-vivid]" />
                    <span className="flex-1">{item.label}</span>
                    {item.hint && <span className="text-xs text-[--text-muted]">{item.hint}</span>}
                    <ArrowRight className="h-3 w-3 text-[--text-muted]" />
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
          <div className="border-t border-[--border-subtle] px-3 py-1.5 flex items-center justify-between text-[10px] text-[--text-muted]">
            <span>
              <kbd className="font-mono bg-[--elevated] border border-[--border-subtle] rounded px-1">↑</kbd>{" "}
              <kbd className="font-mono bg-[--elevated] border border-[--border-subtle] rounded px-1">↓</kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="font-mono bg-[--elevated] border border-[--border-subtle] rounded px-1">↵</kbd>{" "}
              jump
            </span>
            <span>
              <kbd className="font-mono bg-[--elevated] border border-[--border-subtle] rounded px-1">⌘K</kbd>{" "}
              toggle
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
