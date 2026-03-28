import React from "react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { TrustedBy } from "@/components/marketing/trusted-by";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WhyDauntless } from "@/components/marketing/why-dauntless";
import { WorkPreview } from "@/components/marketing/work-preview";
import { Testimonials } from "@/components/marketing/testimonials";
import { ManifestoTeaser } from "@/components/marketing/manifesto-teaser";
import { CTASection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/footer";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Dauntless",
  description:
    "AI operations consulting, training, and agentic systems for government and enterprise organizations.",
  url: "https://dauntless.ai",
  logo: "https://dauntless.ai/images/logo.png",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ottawa",
    addressRegion: "ON",
    addressCountry: "CA",
  },
  sameAs: ["https://linkedin.com/company/dauntless-agentic"],
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
      <TrustedBy />
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
