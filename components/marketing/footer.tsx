import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "AI Literacy Training",   href: "/services/training" },
    { label: "AI Ops Consulting",      href: "/services/consulting" },
    { label: "Agentic Systems",        href: "/services/agentic-systems" },
  ],
  Company: [
    { label: "Platform",  href: "/platform" },
    { label: "Method",    href: "/method" },
    { label: "About",     href: "/about" },
    { label: "Manifesto", href: "/about/manifesto" },
  ],
  Connect: [
    { label: "LinkedIn",  href: "https://linkedin.com/in/craigmarchand" },
    { label: "Insights",  href: "/insights" },
    { label: "Email",     href: "mailto:craig@dauntlessagentic.com" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="bg-[--mkt-bg] border-t border-[--mkt-border] py-14 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row gap-10 md:gap-20">
          <div className="md:w-64 space-y-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-[--accent-dim] border border-[--border-active]">
                <Zap className="h-4 w-4 text-[--accent-vivid]" />
              </div>
              <span className="text-sm font-bold text-[--text-primary] tracking-tight">
                Dauntless <span className="text-[--accent-vivid]">Agentic</span>
              </span>
            </Link>
            <p className="text-xs text-[--text-muted] leading-relaxed">
              Elevating human potential by redesigning how people and organizations think, decide,
              and build in the age of AI.
            </p>
            <p className="text-xs text-[--text-muted]">Ottawa, Canada</p>
            <a
              href="mailto:craig@dauntlessagentic.com"
              className="block text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors"
            >
              craig@dauntlessagentic.com
            </a>
          </div>
          <div className="grid grid-cols-3 gap-8 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[--text-muted]">
                  {category}
                </p>
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 border-t border-[--mkt-border]">
          <p className="text-xs text-[--text-muted]">
            © 2026 Dauntless Agentic · Ottawa, Canada · Built with conviction.
          </p>
          <p className="text-xs text-[--text-muted]">www.dauntlessagentic.com</p>
        </div>
      </div>
    </footer>
  );
}
