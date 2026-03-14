"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, Settings2,
  ClipboardList, Cpu,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Tooltip } from "@/components/ui/tooltip";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/dashboard" },
  { icon: BarChart3,       label: "Analytics",  href: "/analytics" },
  { icon: ClipboardList,   label: "Intake",     href: "/intake" },
];

const bottomItems = [
  { icon: Settings2, label: "Settings", href: "/settings" },
];

export function SideRail() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-12 shrink-0 bg-[--chrome-bg] border-r border-[--border-subtle]">
      {/* Logo mark */}
      <div className="flex h-11 items-center justify-center border-b border-[--border-subtle]">
        <div className="flex h-6 w-6 items-center justify-center rounded-[--radius-sm] bg-[--accent-dim] border border-[--border-active]">
          <Cpu className="h-3.5 w-3.5 text-[--accent-vivid]" />
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 p-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Tooltip key={item.href} content={item.label} side="right">
              <Link
                href={item.href}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[--radius-md]",
                  "transition-all duration-[--duration-fast]",
                  isActive
                    ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                    : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated]"
                )}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-0.5 p-1.5 border-t border-[--border-subtle]">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Tooltip key={item.href} content={item.label} side="right">
              <Link
                href={item.href}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[--radius-md]",
                  "transition-all duration-[--duration-fast]",
                  isActive
                    ? "bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active]"
                    : "text-[--text-muted] hover:text-[--text-primary] hover:bg-[--elevated]"
                )}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
