import React from "react";
import Link from "next/link";
import { Cpu } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[--mkt-bg] border-t border-[--mkt-border] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[--accent-dim] border border-[--border-active]">
            <Cpu className="h-3.5 w-3.5 text-[--accent-vivid]" />
          </div>
          <span className="text-sm font-bold text-[--text-primary]">App Chassis</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-[--text-muted]">
          <Link href="/dashboard" className="hover:text-[--text-secondary] transition-colors">Dashboard</Link>
          <Link href="/agents"    className="hover:text-[--text-secondary] transition-colors">Agents</Link>
          <Link href="/showcase"  className="hover:text-[--text-secondary] transition-colors">Showcase</Link>
        </div>
        <p className="text-xs text-[--text-muted]">© 2026 App Chassis · MIT License</p>
      </div>
    </footer>
  );
}
