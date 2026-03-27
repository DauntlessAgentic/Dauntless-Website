import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ManifestoTeaser() {
  return (
    <section className="relative bg-[--mkt-section] py-28 px-6 overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)" }} />
      <div className="relative max-w-3xl mx-auto">
        <div className="space-y-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">The Manifesto</p>
          <div className="relative">
            <div
              className="text-[180px] leading-none font-bold select-none absolute -top-10 left-1/2 -translate-x-1/2 opacity-[0.04] pointer-events-none"
              aria-hidden="true"
              style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6, #a78bfa)", WebkitBackgroundClip: "text", color: "transparent" }}
            >
              &ldquo;
            </div>
            <blockquote className="relative text-2xl md:text-3xl font-medium text-[--text-primary] leading-snug">
              Don&apos;t build a faster horse. Build the thing that lets humans fly.
            </blockquote>
          </div>
          <div className="space-y-1">
            <div className="h-px w-12 mx-auto"
              style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
            <p className="text-[--text-muted] text-xs pt-2 uppercase tracking-widest font-medium">
              Thesis IX &middot; The Dauntless Manifesto
            </p>
          </div>
          <p className="text-[--text-secondary] text-sm leading-relaxed max-w-xl mx-auto">
            9 theses on work, intelligence, and human potential in the age of AI. A declaration for the undaunted.
          </p>
          <Link href="/about/manifesto"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
              boxShadow: "0 0 0 1px rgba(139,92,246,0.4), 0 8px 24px rgba(124,58,237,0.3)",
            }}>
            Read the Full Manifesto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
