import React from "react";
import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhyDauntless } from "@/components/marketing/why-dauntless";
import { WorkPreview } from "@/components/marketing/work-preview";
import { Testimonials } from "@/components/marketing/testimonials";
import { ManifestoTeaser } from "@/components/marketing/manifesto-teaser";
import { CTASection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/footer";
import { identity } from "@/config/identity";

export const metadata: Metadata = {
  title: { absolute: "Dauntless Agentic — AI Strategy, Systems & Training for Any Scale" },
  description:
    "AI strategy, systems, and training for solopreneurs, growing teams, and national institutions. 18+ years of transformation. $50M+ documented savings. Ottawa, Canada.",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Dauntless Agentic",
  description:
    "AI strategy, systems, and training for solopreneurs, growing teams, and national institutions.",
  url: "https://dauntlessagentic.com",
  logo: "https://dauntlessagentic.com/images/logo-icon.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ottawa",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  sameAs: identity.sameAs,
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Dauntless Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Literacy Training" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "AI Operations Consulting" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Agentic Systems" } },
    ],
  },
};

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <MarketingNav />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <WhyDauntless />
      <WorkPreview />
      <Testimonials />
      <ManifestoTeaser />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
