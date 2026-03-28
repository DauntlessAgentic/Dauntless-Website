import React from "react";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the Dauntless website and services.",
};

export default function TermsPage() {
  return (
    <>
      <MarketingNav />
      <div className="min-h-screen bg-[--mkt-bg]">
        {/* Hero */}
        <section className="pt-32 pb-12 px-6 border-b border-[--mkt-border]">
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[--text-primary]">Terms of Use</h1>
            <p className="text-sm text-[--text-muted]">Last updated: March 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto space-y-10">

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">1. Acceptance</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                By accessing dauntlessagentic.com, you agree to be bound by these Terms of Use. If you do not
                agree, please do not use this site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">2. Intellectual Property</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                All content on this site — including text, graphics, case study descriptions, methodology
                frameworks, and the Dauntless Manifesto — is the intellectual property of Dauntless
                and its principals. You may not reproduce, distribute, or create derivative works from
                this content without written permission.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">3. Engagement Work Product</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                Deliverables created during a consulting engagement (models, frameworks, process maps,
                reports) are owned by the client upon full payment, unless otherwise specified in the
                Statement of Work. Dauntless retains the right to reference the engagement (without
                disclosing confidential details) for portfolio and marketing purposes unless prohibited
                by the client in writing.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">4. No Warranty</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                This site and its content are provided &ldquo;as is&rdquo; without warranty of any kind.
                Dauntless does not warrant that the site will be uninterrupted, error-free, or free of
                viruses or other harmful components.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">5. Limitation of Liability</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                Dauntless shall not be liable for any indirect, incidental, or consequential damages
                arising from use of this site or reliance on its content.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">6. Links to Third Parties</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                This site may link to third-party websites. Dauntless is not responsible for the
                content, accuracy, or privacy practices of those sites.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">7. Governing Law</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                These terms are governed by the laws of the Province of Ontario and the federal laws
                of Canada applicable therein. Any disputes shall be resolved in the courts of Ontario.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">8. Contact</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                Questions about these terms:{" "}
                <a href="mailto:craig@dauntlessagentic.com" className="text-[--accent-vivid] hover:underline">
                  craig@dauntlessagentic.com
                </a>
              </p>
            </div>

          </div>
        </section>
      </div>
      <MarketingFooter />
    </>
  );
}
