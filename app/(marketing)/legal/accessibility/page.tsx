import React from "react";
import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { identity } from "@/config/identity";

export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "Dauntless Agentic accessibility commitment and contact path.",
};

export default function AccessibilityPage() {
  return (
    <>
      <MarketingNav />
      <div className="min-h-screen bg-[--mkt-bg]">
        <section className="border-b border-[--mkt-border] px-6 pb-12 pt-32">
          <div className="mx-auto max-w-3xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Legal</p>
            <h1 className="text-3xl font-bold text-[--text-primary] md:text-4xl">Accessibility Statement</h1>
            <p className="text-sm text-[--text-muted]">Last updated: May 2026</p>
          </div>
        </section>

        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl space-y-10">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">Our Commitment</h2>
              <p className="leading-relaxed text-[--text-secondary]">
                Dauntless Agentic aims for WCAG 2.2 AA conformance across the public website and the
                Client Intelligence Portal. Accessibility is part of launch readiness, not a final polish pass.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">Current Status</h2>
              <p className="leading-relaxed text-[--text-secondary]">
                The May 2026 accessibility hardening pass added real page headings, live-region
                announcements for key interactive flows, stronger form semantics, and improved contrast
                tokens. We continue to test keyboard navigation, responsive layouts, and screen-reader
                labelling as the portal evolves.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">Known Limitations</h2>
              <p className="leading-relaxed text-[--text-secondary]">
                The portal is still in demo mode until production authentication and persistence are active.
                Some advanced data grids and chart views may need additional assistive summaries before real
                client onboarding.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">Feedback</h2>
              <p className="leading-relaxed text-[--text-secondary]">
                If you find an accessibility issue, email{" "}
                <a href={`mailto:${identity.email}`} className="text-[--accent-vivid] hover:underline">
                  {identity.email}
                </a>
                . Please include the page URL, browser, assistive technology if applicable, and a short
                description of what blocked you.
              </p>
            </div>
          </div>
        </section>
      </div>
      <MarketingFooter />
    </>
  );
}
