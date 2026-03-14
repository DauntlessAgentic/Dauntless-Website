import { MarketingNav } from "@/components/marketing/marketing-nav";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { CTASection } from "@/components/marketing/cta-section";
import { MarketingFooter } from "@/components/marketing/footer";

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />
      <HeroSection />
      <FeatureGrid />
      <CTASection />
      <MarketingFooter />
    </div>
  );
}
