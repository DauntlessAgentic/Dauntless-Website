"use client";
import React from "react";
import { SideRail } from "./side-rail";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
  topBarTitle?: string;
  topBarSubtitle?: string;
  topBarActions?: React.ReactNode;
}

export function AppShell({ children, topBarTitle, topBarSubtitle, topBarActions }: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[--app-bg]">
      {/* Side rail — hidden on mobile, shown on md+ */}
      <div className="hidden md:flex">
        <SideRail />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          title={topBarTitle}
          subtitle={topBarSubtitle}
          actions={topBarActions}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}

// ── Mobile bottom navigation bar ────────────────────────────
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, Settings2, ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/cn";

const mobileNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: BarChart3,       label: "Analytics",  href: "/analytics" },
  { icon: ClipboardList,   label: "Intake",     href: "/intake" },
  { icon: Settings2,       label: "Settings",   href: "/settings" },
];

function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center bg-[--chrome-bg] border-t border-[--border-subtle] safe-bottom">
      {mobileNavItems.map(item => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              isActive ? "text-[--accent-vivid]" : "text-[--text-muted] hover:text-[--text-secondary]"
            )}>
            <item.icon className={cn("h-4.5 w-4.5", isActive && "text-[--accent-bright]")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
