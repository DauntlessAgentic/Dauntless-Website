import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Building2, Bot, Search, Layers, Hammer, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

const trainingTiers = [
  { tier: "Executive Briefing", format: "Leadership alignment", duration: "Half Day", outcome: "Aligned leadership with a clear-eyed view of AI opportunity, risk, and strategic next steps" },
  { tier: "AI Boot Camp", format: "Intensive hands-on", duration: "2 Days", outcome: "Confident, capable teams ready to integrate AI into their daily work immediately" },
  { tier: "AI Practitioner Program", format: "Deep capability build", duration: "5 Days", outcome: "Practitioners who can design, implement, and optimize AI-augmented workflows in their domain" },
  { tier: "AI Transformation", format: "Full organizational transformation", duration: "10 Days", outcome: "Organization-wide AI capability with governance frameworks, internal champions, and compounding knowledge systems" },
];

const consultingModels = [
  { model: "Discovery Sprint", scope: "Assess current state, identify opportunities, map the path", duration: "2–4 weeks", outcome: "Strategic AI roadmap with prioritized opportunities and governance framework" },
  { model: "Design Sprint", scope: "Architect the operating model for a specific AI initiative", duration: "4–8 weeks", outcome: "Complete operating architecture with workflows, roles, decision gates, and implementation plan" },
  { model: "Build Sprint", scope: "Implement and operationalize the designed architecture", duration: "8–16 weeks", outcome: "Operational AI system with trained team, encoded patterns, and compounding knowledge base" },
  { model: "Advisory Retainer", scope: "Ongoing strategic guidance and architecture evolution", duration: "Quarterly", outcome: "Continuous optimization, pattern refinement, and strategic steering as your AI capability matures" },
];

const agenticLayers = [
  { layer: "Agent Fleet", what: "Specialized agents: Strategists, Operators, Auditors, Chief of Staff", why: "Constitutional separation of powers" },
  { layer: "Decision Architecture", what: "Risk tiers, decision gates, PROPOSE → APPROVE → COMMIT", why: "Governance that enables speed" },
  { layer: "Knowledge Systems", what: "Three Shelves model, memory tiers, canonical promotion", why: "Compounding organizational intelligence" },
  { layer: "Observability", what: "Decision surface dashboards, workflow logs, health monitoring", why: "A cockpit, not a black box" },
];

const trustMechanisms = [
  { icon: Search, title: "Process Transparency", description: "You see exactly how the work happens. No black boxes. Full traceability from signal to outcome." },
  { icon: BookOpen, title: "Artifact Proof", description: "Every engagement produces tangible artifacts — frameworks, scorecards, playbooks — that prove value was delivered." },
  { icon: Layers, title: "Reversibility", description: "Our recommendations are designed to be testable before they're permanent. Pilot → Validate → Scale." },
  { icon: Hammer, title: "Accountability Hooks", description: "Clear success criteria defined upfront. We track outcomes, not activities. If it didn't move the needle, we own that." },
];


export const metadata: Metadata = {
  title: "Services — Training, Consulting & Agentic Systems",
  description: "Three ways to work with Dauntless: AI literacy training, strategic consulting, and full agentic system builds.",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Services</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Three Services.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              One Compounding System.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            We deliver AI capability through three channels — immersive training that transforms how people think, strategic consulting that transforms how organizations operate, and agentic systems that give organizations autonomous intelligence architectures.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-semibold text-[--text-primary]">Your Problems Are Complex. Your Solutions Should Be Durable.</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Organizations don't need more AI demos. They need solutions that solve real problems, survive contact with reality, and get better over time.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="soft-card-danger p-6 space-y-3">
              <p className="text-sm font-bold text-[--danger] uppercase tracking-wider">What Doesn't Work</p>
              {["One-off workshops that create buzz but not capability", "Pilots that die when the consultant leaves", "Generic frameworks that don't fit your reality", "Solutions that require constant hand-holding", "AI implementations with no governance or trust model"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--danger] mt-0.5 shrink-0">✕</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
            <div className="soft-card-success p-6 space-y-3">
              <p className="text-sm font-bold text-[--success] uppercase tracking-wider">What We Build Instead</p>
              {["Capability that compounds after we leave", "Architecture designed for your constraints, not ours", "Governance baked in from day one", "Solutions your team can own, operate, and evolve", "Measurable outcomes with clear before/after proof"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--success] mt-0.5 shrink-0">✓</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active] shrink-0">
              <GraduationCap className="h-6 w-6 text-[--accent-vivid]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI Literacy Training</p>
              <h2 className="text-2xl font-semibold text-[--text-primary] mt-1">For organizations ready to build real AI capability across their teams.</h2>
            </div>
          </div>
          <p className="text-[--text-secondary] leading-relaxed">Cohort-based learning programs delivered through the FC5 Platform — a purpose-built training delivery system with integrated assessment, practice environments, and outcome tracking.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--mkt-border]">
                  {["Tier", "Format", "Duration", "Outcome"].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-[--text-muted]">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {trainingTiers.map(({ tier, format, duration, outcome }) => (
                  <tr key={tier} className="border-b border-[--mkt-border] hover:bg-[--mkt-card] transition-colors">
                    <td className="py-3 px-4 font-bold text-[--text-primary]">{tier}</td>
                    <td className="py-3 px-4 text-[--text-secondary]">{format}</td>
                    <td className="py-3 px-4 text-[--accent-vivid] font-mono text-xs">{duration}</td>
                    <td className="py-3 px-4 text-[--text-secondary]">{outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/services/training"><Button variant="primary" className="gap-2">Explore AI Training <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* Consulting */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active] shrink-0">
              <Building2 className="h-6 w-6 text-[--accent-vivid]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI Ops Consulting</p>
              <h2 className="text-2xl font-semibold text-[--text-primary] mt-1">For organizations ready to operationalize AI — not just experiment with it.</h2>
            </div>
          </div>
          <p className="text-[--text-secondary] leading-relaxed">Strategic advisory engagements that help organizations move from AI curiosity to AI operations. We don't build prototypes that die in pilot. We build the architecture for AI to actually work inside your organization.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--mkt-border]">
                  {["Model", "Scope", "Duration", "Outcome"].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-[--text-muted]">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {consultingModels.map(({ model, scope, duration, outcome }) => (
                  <tr key={model} className="border-b border-[--mkt-border] hover:bg-[--mkt-card] transition-colors">
                    <td className="py-3 px-4 font-bold text-[--text-primary]">{model}</td>
                    <td className="py-3 px-4 text-[--text-secondary]">{scope}</td>
                    <td className="py-3 px-4 text-[--accent-vivid] font-mono text-xs">{duration}</td>
                    <td className="py-3 px-4 text-[--text-secondary]">{outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/services/consulting"><Button variant="primary" className="gap-2">Explore AI Consulting <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* Trust Architecture */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Trust Architecture</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Engineered Risk Absorption. Not Sales Promises.</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">Every engagement includes explicit Trust Mechanisms — structured patterns that absorb the risk of working with us. Trust isn't persuaded. It's engineered.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustMechanisms.map(({ icon: Icon, title, description }) => (
              <div key={title} className="soft-card p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary] text-sm">{title}</h3>
                <p className="text-xs text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agentic */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active] shrink-0">
              <Bot className="h-6 w-6 text-[--accent-vivid]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Agentic Systems</p>
              <h2 className="text-2xl font-semibold text-[--text-primary] mt-1">For organizations ready to move beyond tools and automation into autonomous AI architectures.</h2>
            </div>
          </div>
          <p className="text-[--text-secondary] leading-relaxed">We design and build agentic systems — constellations of specialized AI agents that sense, propose, execute, and learn within structured governance. Not science fiction. Operating architecture.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--mkt-border]">
                  {["Layer", "What It Does", "Why It Matters"].map(h => (<th key={h} className="text-left py-3 px-4 text-xs font-bold uppercase tracking-widest text-[--text-muted]">{h}</th>))}
                </tr>
              </thead>
              <tbody>
                {agenticLayers.map(({ layer, what, why }) => (
                  <tr key={layer} className="border-b border-[--mkt-border] hover:bg-[--mkt-card] transition-colors">
                    <td className="py-3 px-4 font-bold text-[--text-primary]">{layer}</td>
                    <td className="py-3 px-4 text-[--text-secondary]">{what}</td>
                    <td className="py-3 px-4 text-[--accent-vivid] text-xs">{why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/services/agentic-systems"><Button variant="primary" className="gap-2">Explore Agentic Systems <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Not Sure Where to Start?</h2>
          <p className="text-[--text-secondary]">Every engagement begins with a conversation. We'll help you identify the highest-leverage starting point for your organization.</p>
          <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Start a Conversation <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
