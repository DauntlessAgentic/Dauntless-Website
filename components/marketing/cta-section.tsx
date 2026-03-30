import React from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";

export function CTASection() {
  return (
    <section className="bg-[--mkt-bg] py-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.1) 0%, transparent 60%)" }} />
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(var(--accent-bright-rgb),0.2), transparent)" }} />
      </div>
      <div className="relative max-w-3xl mx-auto">
        {/* Gradient border card */}
        <div
          className="rounded-3xl p-12 md:p-16 text-center space-y-8"
          style={{
            background: "linear-gradient(var(--mkt-card), var(--mkt-card)) padding-box, linear-gradient(135deg, rgba(var(--accent-bright-rgb),0.6) 0%, rgba(var(--accent-vivid-rgb),0.3) 50%, rgba(var(--accent-bright-rgb),0.6) 100%) border-box",
            border: "1px solid transparent",
            boxShadow: "0 0 60px rgba(var(--accent-rgb),0.12), 0 25px 50px -12px rgba(0,0,0,0.6)",
          }}
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-semibold text-[--text-primary] leading-tight">
              Ready to Build Something{" "}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright) 0%, var(--accent-vivid) 100%)" }}>
                Dauntless?
              </span>
            </h2>
            <p className="text-[--text-secondary] text-base leading-relaxed max-w-xl mx-auto">
              Every engagement starts with a conversation. No pitch decks. No sales scripts. Just a real discussion about where you are, where you want to be, and whether we're the right partner for the journey.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
              boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.4)",
            }}
          >
            <MessageSquare className="h-4 w-4" />
            Start a Conversation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
