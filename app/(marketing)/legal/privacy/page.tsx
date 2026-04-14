import React from "react";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { identity } from "@/config/identity";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Dauntless collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />
      <div className="min-h-screen bg-[--mkt-bg]">
        {/* Hero */}
        <section className="pt-32 pb-12 px-6 border-b border-[--mkt-border]">
          <div className="max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Legal</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[--text-primary]">Privacy Policy</h1>
            <p className="text-sm text-[--text-muted]">Last updated: March 2026</p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto prose prose-invert prose-sm max-w-none space-y-10">

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">1. Who We Are</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                Dauntless (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) is a consulting and AI operations firm
                based in Ottawa, Ontario, Canada. We provide AI literacy training, strategic consulting, and
                agentic system development services to government and private sector organizations.
              </p>
              <p className="text-[--text-secondary] leading-relaxed">
                Questions about this policy can be directed to:{" "}
                <a href={`mailto:${identity.email}`} className="text-[--accent-vivid] hover:underline">
                  {identity.email}
                </a>
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">2. What We Collect</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                We collect information you voluntarily provide through our contact form, including your
                name, email address, organization, and the content of your message. We may also collect
                standard technical information (IP address, browser type, pages visited) through analytics
                tools for site improvement purposes.
              </p>
              <p className="text-[--text-secondary] leading-relaxed">
                We do not sell, rent, or share your personal information with third parties for marketing
                purposes.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">3. How We Use Your Information</h2>
              <ul className="text-[--text-secondary] leading-relaxed space-y-2 list-disc list-inside">
                <li>To respond to your inquiry and conduct a potential engagement</li>
                <li>To send occasional relevant updates or insights (only if you subscribe)</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">4. Client Confidentiality</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                All client engagement information is held in strict confidence. We do not reference,
                discuss, or use client materials, findings, or deliverables beyond the scope of the
                engagement without explicit written consent. Standard NDAs are available on request.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">5. Data Retention</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                We retain contact form submissions for up to 24 months for engagement tracking purposes.
                You may request deletion of your data at any time by emailing{" "}
                <a href={`mailto:${identity.email}`} className="text-[--accent-vivid] hover:underline">
                  {identity.email}
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">6. Cookies</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                This site may use minimal analytics cookies to understand visitor behaviour. No advertising
                cookies are used. You can disable cookies in your browser settings without affecting your
                ability to use this site.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">7. Your Rights</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                Under Canadian privacy law (PIPEDA) and applicable provincial legislation, you have the
                right to access, correct, or request deletion of your personal information. To exercise
                these rights, contact us at{" "}
                <a href={`mailto:${identity.email}`} className="text-[--accent-vivid] hover:underline">
                  {identity.email}
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-[--text-primary]">8. Changes to This Policy</h2>
              <p className="text-[--text-secondary] leading-relaxed">
                We may update this policy periodically. The &ldquo;Last updated&rdquo; date at the top of this
                page will reflect any changes. Continued use of this site constitutes acceptance of the
                current policy.
              </p>
            </div>

          </div>
        </section>
      </div>
      <MarketingFooter />
    </>
  );
}
