import React from "react";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Services: [
    { label: "AI Literacy Training",   href: "/services/training" },
    { label: "AI Ops Consulting",      href: "/services/consulting" },
    { label: "Agentic Systems",        href: "/services/agentic-systems" },
  ],
  Resources: [
    { label: "Our Work",      href: "/work" },
    { label: "Case Studies",  href: "/case-studies" },
    { label: "Insights",      href: "/insights" },
    { label: "Manifesto",     href: "/about/manifesto" },
    { label: "FAQ",           href: "/faq" },
  ],
  Company: [
    { label: "Platform",  href: "/platform" },
    { label: "Method",    href: "/method" },
    { label: "Pricing",   href: "/pricing" },
    { label: "About",     href: "/about" },
    { label: "Contact",   href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Use",   href: "/legal/terms" },
  ],
};

function FooterLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <div
        className="shrink-0 flex items-center justify-center rounded-xl p-1.5"
        style={{
          background: "#10101e",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 2px 12px rgba(0,0,0,0.3)",
        }}
      >
        <Image
          src="/images/logo-icon.png"
          alt="Dauntless Agentic"
          width={28}
          height={28}
          className="shrink-0"
          unoptimized
        />
      </div>
      <span className="text-sm font-semibold tracking-tight text-[--text-primary]">
        Dauntless{" "}
        <span
          className="text-transparent bg-clip-text"
          style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" }}
        >
          Agentic
        </span>
      </span>
    </Link>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative bg-[--mkt-bg] border-t border-[--mkt-border] px-6">
      <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
      <div className="max-w-6xl mx-auto">

        {/* Main footer content */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 py-12">
          <div className="md:w-64 space-y-3 shrink-0">
            <FooterLogo />
            <p className="text-xs text-[--text-muted] leading-relaxed">
              Elevating human potential by redesigning how people and organizations think, decide, and build in the age of AI.
            </p>
            <p className="text-xs text-[--text-muted]">Ottawa, Canada</p>
            <a
              href="mailto:craig@dauntlessagentic.com"
              className="block text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors"
            >
              craig@dauntlessagentic.com
            </a>
            <a
              href="https://linkedin.com/in/craigmarchand"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[--text-muted]">{category}</p>
                <ul className="space-y-2">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-xs text-[--text-muted] hover:text-[--text-secondary] transition-colors">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 py-6 border-t border-[--mkt-border]">
          <p className="text-xs text-[--text-muted]">&copy; {new Date().getFullYear()} Dauntless Agentic &middot; Ottawa, Canada &middot; Built with conviction.</p>
          <p className="text-xs text-[--text-muted]">www.dauntlessagentic.com</p>
        </div>

      </div>
    </footer>
  );
}
