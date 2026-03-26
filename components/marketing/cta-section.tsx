import React from "react";
import Link from "next/link";
import { ArrowRight, Zap, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="contact" className="bg-[--mkt-section] py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Main CTA card */}
        <div
          className="relative rounded-[--radius-xl] border border-[--border-active] overflow-hidden p-10 md:p-14 text-center space-y-7"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(34,211,238,0.04) 100%)",
          }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%)",
            }}
          />

          <div className="relative space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]"
                style={{ boxShadow: "var(--shadow-accent)" }}
              >
                <Zap className="h-7 w-7 text-[--accent-vivid]" />
              </div>
            </div>

            {/* Copy */}
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-[--text-primary]">
                Ready to go Dauntless?
              </h2>
              <p className="text-sm text-[--text-secondary] max-w-md mx-auto leading-relaxed">
                Book a free 30-minute strategy call. We&apos;ll map out exactly where AI agents
                can save your team the most time — and what it would take to build them.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="mailto:hello@dauntlessagentic.com">
                <Button variant="primary" size="lg" className="gap-2 w-full sm:w-auto" style={{ boxShadow: "var(--shadow-accent)" }}>
                  <Calendar className="h-4 w-4" />
                  Schedule a Discovery Call
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="mailto:hello@dauntlessagentic.com">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <MessageSquare className="h-4 w-4" />
                  Send Us a Message
                </Button>
              </Link>
            </div>

            <p className="text-xs text-[--text-muted]">
              hello@dauntlessagentic.com · No commitment required · Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
