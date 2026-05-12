"use client";

// ============================================================
// Workspace switcher (Phase 8.0)
//
// Surfaces the active workspace + sibling workspaces under the
// same org. Phase 8.0 routes the switcher to the rollup view;
// Phase 8.1 will actually swap the live repository workspace.
// ============================================================

import React from "react";
import Link from "next/link";
import { ChevronDown, Building2, Layers } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface WorkspaceSwitcherItem {
  id: string;
  name: string;
  visibility: string;
  active: boolean;
}

interface WorkspaceSwitcherProps {
  orgName: string;
  items: WorkspaceSwitcherItem[];
}

export function WorkspaceSwitcher({ orgName, items }: WorkspaceSwitcherProps) {
  if (items.length === 0) return null;
  const active = items.find((w) => w.active) ?? items[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 h-7 px-2 rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] hover:border-[--border-default] transition-colors text-xs"
          aria-label="Switch workspace"
        >
          <Building2 className="h-3 w-3 text-[--accent-bright]" />
          <span className="hidden md:block text-[--text-primary] truncate max-w-[160px]">
            {active.name}
          </span>
          <ChevronDown className="h-3 w-3 text-[--text-muted]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span>{orgName}</span>
          <span className="text-[10px] font-normal text-[--text-muted]">
            {items.length} workspace{items.length === 1 ? "" : "s"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((item) => (
          <DropdownMenuItem
            key={item.id}
            className="flex items-center justify-between gap-2"
            disabled={!item.active}
          >
            <span className="flex flex-col">
              <span className="text-xs font-medium">{item.name}</span>
              <span className="text-[10px] text-[--text-muted]">{item.visibility}</span>
            </span>
            {item.active ? (
              <span className="text-[10px] font-bold uppercase tracking-wide text-[--accent-vivid]">active</span>
            ) : (
              <span className="text-[10px] text-[--text-muted]">read-only</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/portal/org" className="flex items-center gap-2 cursor-pointer">
            <Layers className="h-3.5 w-3.5" />
            <span>Org rollup view</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
