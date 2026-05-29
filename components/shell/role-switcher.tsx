"use client";

// ============================================================
// Role switcher (Phase 2)
//
// A dev-bypass-only escape hatch that lets Dauntless staff (and
// designers) walk through every persona's view of the portal
// without standing up real OAuth. The switcher is hidden once the
// portal is configured with real auth.
// ============================================================

import React, { useTransition } from "react";
import { Check, ChevronDown, ShieldHalf } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContentTag } from "@/components/ui/content-tag";
import type { MembershipRole } from "@/lib/portal/types";
import {
  describeRole,
  roleBadgeTone,
} from "@/lib/auth/membership-gate";
import { switchRole } from "@/lib/auth/actions";

interface RoleSwitcherProps {
  currentRole: MembershipRole;
  displayName: string;
  visible: boolean;
  modeLabel?: string;
}

const ROLES: MembershipRole[] = ["owner", "executive", "lead", "viewer", "auditor"];

export function RoleSwitcher({ currentRole, displayName, visible, modeLabel = "Dev-bypass mode" }: RoleSwitcherProps) {
  const [isPending, startTransition] = useTransition();

  if (!visible) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 h-7 px-2 rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] hover:border-[--border-default] transition-colors text-xs disabled:opacity-60"
          disabled={isPending}
          aria-label="Switch impersonated role"
        >
          <ShieldHalf className="h-3 w-3 text-[--accent-bright]" />
          <ContentTag variant={roleBadgeTone(currentRole)}>
            {roleLabel(currentRole)}
          </ContentTag>
          <ChevronDown className="h-3 w-3 text-[--text-muted]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span>{modeLabel === "Demo mode" ? "Demo role" : "Impersonate role"}</span>
          <span className="text-[10px] font-normal text-[--text-muted]">
            Active: {displayName}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onSelect={(e) => {
              e.preventDefault();
              startTransition(async () => {
                await switchRole(role);
              });
            }}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex flex-col">
              <span className="text-xs font-medium">{roleLabel(role)}</span>
              <span className="text-[10px] text-[--text-muted]">
                {describeRole(role)}
              </span>
            </span>
            {role === currentRole && <Check className="h-3 w-3 text-[--accent-bright]" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] font-normal text-[--text-muted] uppercase tracking-wider">
          {modeLabel}
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function roleLabel(role: MembershipRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
