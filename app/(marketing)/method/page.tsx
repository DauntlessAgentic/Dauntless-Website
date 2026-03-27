import React from "react";
import Link from "next/link";
import { ArrowRight, Target, Layers, RefreshCw, Shield, Users, BarChart3, Search, FileText, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

const principles = [
  { icon: Target, title: "Start With the Problem, Not the Technology", description: "We don't show up with a hammer looking for nails. Every engagement starts by deeply understanding your challenge — the people, the processes, the politics, the constraints. AI is the answer only when it's the right answer." },
  { icon: Layers, title: "Architecture Over Tools", description: "Tools come and go. Architecture endures. We design systems, governance models, and operating patterns that survive the next wave of AI innovation — because the architecture is the strategy." },
  { icon: RefreshCw, title: "Build to Compound", description: "Every deliverable we produce is designed to be built upon. Training creates capability that deepens over time. Architectures are designed to learn from their own operation. Nothing we build is a dead end." },
  { icon: Shield, title: "Governance From Day One", description: "AI without governance is a liability. Every solution includes the decision frameworks, risk tiers, and human-in-the-loop patterns that make AI safe to scale — built in from the start, not bolted on after something breaks." },
  { icon: Users, title: "Transfer Capability, Not Dependency", description: "The goal of every engagement is for your team to own what we've built — to understand it, operate it, and evolve it without us. We encode knowledge into systems, not into consultants' heads." },
  { icon: BarChart3, title: "Prove It, Don't Promise It", description: "Every engagement defines clear success criteria upfront. We measure before states and after states. If the needle didn't move, we own that. Outcomes over activities, always." },
];

const phases = [
  {
    num: "1",
    icon: Search,
    title: "Discovery — Understand Before We Prescribe",
    description: "We invest upfront in understanding your world — your organization, your people, your constraints, your ambitions. No generic frameworks. No assumptions carried over from the last client. Your situation gets its own analysis.",
    items: ["Stakeholder conversations to map the real landscape (not just the org chart)", "Current state assessment — what's working, what's stuck, what's been tried", "Opportunity mapping — where AI adds genuine value vs. where it's hype", "Readiness evaluation — people, process, technology, and governance gaps"],
    outcome: "A clear-eyed picture of where you are and a prioritized path to where you want to be.",
  },
  {
    num: "2",
    icon: Layers,
    title: "Design — Architect the Right Solution",
    description: "We design solutions that fit your reality — not ours. Every architecture accounts for your constraints, your culture, and your capacity to absorb change.",
    items: ["Solution architecture tailored to your specific challenge and context", "Governance frameworks with appropriate decision gates and risk management", "Implementation planning with realistic phases and milestones", "Success criteria defined upfront — measurable, specific, and agreed upon"],
    outcome: "A solution blueprint you understand and believe in, with a clear path to implementation.",
  },
  {
    num: "3",
    icon: Target,
    title: "Deliver — Execute With Discipline and Transparency",
    description: "Delivery is not ad-hoc. Every engagement follows proven patterns refined through real-world use — consistent quality, full transparency, and no surprises.",
    items: ["Structured delivery with clear milestones and checkpoints", "Real-time visibility through your Client Intelligence Portal", "Quality assurance built into the process, not just the final review", "Continuous communication — you always know where things stand"],
    outcome: "Consistent, high-quality delivery with full traceability and zero ambiguity.",
  },
  {
    num: "4",
    icon: Users,
    title: "Activate — Make It Stick",
    description: "A deliverable that sits on a shelf is a failure. We ensure what we build actually works in the real world — with your people, in your environment, under your constraints.",
    items: ["Hands-on activation with your team — not a handoff and a wave goodbye", "Training and enablement so your people can own and operate the solution", "Calibration period where we fine-tune based on real-world feedback", "Knowledge transfer encoded into your portal for long-term reference"],
    outcome: "A solution that's live, working, and owned by your team.",
  },
  {
    num: "5",
    icon: Repeat,
    title: "Compound — Get Better Every Time",
    description: "The real magic happens after the engagement. Everything we deliver is designed to improve with use — and when you return for the next engagement, we start from a position of compounded intelligence, not from scratch.",
    items: ["Post-engagement portal access with AI agents that know your context", "Outcomes captured and available for future reference and planning", "Patterns and insights from your engagement enrich future work", "Return engagements start faster and go deeper because the platform remembers"],
    outcome: "An investment that appreciates over time instead of depreciating.",
  },
];

const trustPillars = [
  { icon: Search, title: "Full Transparency", description: "You see how the work happens. Your portal gives you real-time visibility into deliverables as they're built — not a big reveal at the end." },
  { icon: RefreshCw, title: "Reversibility", description: "Our solutions are designed to be tested before they're permanent. Pilot → Validate → Scale. You don't bet the farm on day one." },
  { icon: FileText, title: "Artifact Proof", description: "Every engagement produces tangible artifacts — frameworks, architectures, playbooks, assessments — that prove value was delivered, not just hours logged." },
  { icon: Target, title: "Accountability", description: "Clear success criteria defined before we start. We track outcomes, not activities. If the needle didn't move, that's a conversation we initiate — not one you have to demand." },
];

export default function MethodPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Method</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Built to Solve.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              Designed to Last.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Our method isn't a sales pitch dressed up as a framework. It's the operating architecture behind every engagement — a disciplined approach to solving complex problems with AI that produces durable, compounding results.
          </p>
        </div>
      </section>

      {/* Core Promise */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4 bg-[--mkt-card] border border-[--border-active] rounded-[--radius-xl] p-8">
          <h2 className="text-2xl font-semibold text-[--text-primary]">Every Engagement Should Leave You Stronger Than It Found You.</h2>
          <p className="text-[--text-secondary]">Not just with deliverables — with capability. The ability to understand, operate, and evolve what we built together. We don't create dependency. We create compounding advantage.</p>
        </div>
      </section>

      {/* Principles */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Principles</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Principles That Shape Every Engagement</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">These aren't aspirational values. They're hard constraints we apply to every piece of work. If a solution violates any of these, the solution is wrong.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {principles.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Phases */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Engagement Experience</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">What It&apos;s Like to Work With Us</h2>
          </div>
          <div className="space-y-4">
            {phases.map(({ num, icon: Icon, title, description, items, outcome }) => (
              <div key={num} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-4 hover:border-[--border-active] transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[--accent-dim] border border-[--border-active] text-sm font-bold text-[--accent-vivid] shrink-0">{num}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-[--accent-vivid]" />
                      <h3 className="font-bold text-[--text-primary]">{title}</h3>
                    </div>
                    <p className="text-sm text-[--text-secondary]">{description}</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start pl-14">
                  <ul className="space-y-1">
                    {items.map(item => (<li key={item} className="text-xs text-[--text-secondary] flex gap-1.5"><span className="text-[--accent-vivid] shrink-0">·</span>{item}</li>))}
                  </ul>
                  <div className="bg-[--mkt-bg] border border-[--mkt-border] rounded-[--radius-lg] p-3 md:w-56 shrink-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid] mb-1">What you get</p>
                    <p className="text-xs text-[--text-secondary]">{outcome}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Architecture */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Trust Architecture</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Engineered Confidence. Not Sales Promises.</h2>
            <p className="max-w-2xl mx-auto text-[--text-secondary]">We know that hiring an AI consultancy requires trust — and trust isn't built with pitch decks. It's built with structure.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustPillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary] text-sm">{title}</h3>
                <p className="text-xs text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-semibold text-[--text-primary]">Experience the Method.</h2>
          <p className="text-[--text-secondary]">The best way to understand how we work is to work with us. Every engagement begins with a conversation — no pitch decks, no pressure, just a real discussion about your challenges.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Start a Conversation <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/services"><Button variant="outline" size="lg">See Our Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
