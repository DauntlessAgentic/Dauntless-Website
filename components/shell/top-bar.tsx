"use client";
import React from "react";
import { Bell, Search, ChevronDown } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

interface TopBarProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="flex h-11 items-center gap-3 px-3 bg-[--chrome-bg] border-b border-[--border-subtle] shrink-0">
      {/* Title slot */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {title && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-[--text-primary] truncate">{title}</span>
            {subtitle && (
              <>
                <ChevronDown className="h-3 w-3 text-[--text-muted] rotate-[-90deg]" />
                <span className="text-xs text-[--text-muted] truncate">{subtitle}</span>
              </>
            )}
          </div>
        )}
      </div>

      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Right controls */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Search */}
        <button className="flex items-center gap-2 h-7 px-2 rounded-[--radius-md] bg-[--elevated] border border-[--border-subtle] text-[--text-muted] hover:text-[--text-secondary] hover:border-[--border-default] transition-colors text-xs">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden md:block">Search</span>
          <kbd className="hidden md:block text-xs bg-[--elevated-2] px-1 rounded border border-[--border-default]">⌘K</kbd>
        </button>

        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <IconButton icon={<Bell className="h-3.5 w-3.5" />} label="Notifications" size="sm" />
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[--accent] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[--accent-bright]" />
          </span>
        </div>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 h-7 px-1.5 rounded-[--radius-md] hover:bg-[--elevated] transition-colors ml-0.5">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-xs">OP</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-[--text-muted]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Operator</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>API Keys</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem danger>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
