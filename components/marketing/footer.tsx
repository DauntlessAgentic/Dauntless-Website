import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "AI Agent Development", href: "#services" },
    { label: "Workflow Automation",  href: "#services" },
    { label: "AI Integration",       href: "#services" },
    { label: "Enterprise AI",        href: "#services" },
  ],
  Company: [
    { label: "About",    href: "#about" },
    { label: "Process",  href: "#how-it-works" },
    { label: "Contact",  href: "#contact" },
    { label: "Blog",     href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[--mkt-bg] border-t border-[--mkt-border] py-14 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-20">
          {/* Brand */}
          <div className="md:w-64 space-y-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[--accent-dim] border border-[--border-active]">
                <Zap className="h-4 w-4 text-[--accent-vivid]" />
              </div>
              <span className="text-sm font-bold text-[--text-primary]">
                Dauntless <span className="text-[--accent-vivid]">Agentic</span>
              </span>
            </Link>
            <p className="text-xs text-[--text-muted] leading-relaxed">
              Custom AI agents and agentic workflows for ambitious teams.
              We build the AI that works while you focus on what matters.
            </p>
            <p className="text-xs text-[--text-muted]">
              <a href="mailto:hello@dauntlessagentic.com" className="hover:text-[--text-secondary] transition-colors">
                hello@dauntlessagentic.com
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted]">{category}</p>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-[--mkt-border]">
          <p className="text-xs text-[--text-muted]">
            © 2026 Dauntless Agentic Inc. All rights reserved.
          </p>
          <p className="text-xs text-[--text-muted]">
            Built with{" "}
            <span className="text-[--accent-vivid]">Neo-WebChassis</span>
            {" "}· Deployed on Vercel
          </p>
        </div>
      </div>
    </footer>
  );
}
