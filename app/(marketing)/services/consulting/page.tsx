import React from "react";
import Link from "next/link";
import { ArrowRight, Search, Layers, Zap, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

const whatWeDo = [
  { icon: Layers, title: "Operating Model Design", description: "How should your organization actually work with AI? We design the roles, workflows, decision gates, and governance that turn AI from a tool into an operating capability." },
  { icon: Search, title: "Governance Architecture", description: "AI without governance is a liability. We build the decision frameworks, risk tiers, approval flows, and audit trails that make AI safe to scale — governance that enables speed, not bureaucracy that prevents it." },
  { icon: Zap, title: "Workflow Architecture", description: "Where does AI add the most value in your actual work? We map your processes, identify high-leverage intervention points, and design AI-augmented workflows that produce measurable improvements." },
  { icon: RefreshCw, title: "Knowledge Systems", description: "The real value of AI isn't automation — it's compounding. We design knowledge systems where every AI-assisted output enriches future work. Your organization gets smarter with every project." },
];

const engagementModels = [
  {
    icon: "🔍",
    name: "Discovery Sprint",
    duration: "2–4 weeks",
    best: "Organizations at the beginning of their AI journey, or stuck after failed pilots",
    what: ["Current state assessment — where you are, what's working, what isn't", "Opportunity mapping — where AI adds the most value in your specific context", "Readiness audit — people, process, technology, governance gaps", "Strategic roadmap — prioritized path forward with clear milestones"],
    get: ["AI Opportunity Map with prioritized use cases", "Organizational Readiness Assessment", "Strategic Roadmap with phases, dependencies, and investment estimates", "Governance Framework draft", "Executive briefing with board-ready narrative"],
  },
  {
    icon: "📐",
    name: "Design Sprint",
    duration: "4–8 weeks",
    best: "Organizations ready to architect a specific AI initiative",
    what: ["Deep-dive into the target domain — processes, people, pain points", "Operating model design — roles, workflows, decision gates, human-AI interaction patterns", "Governance architecture — risk tiers, approval flows, audit trails", "Knowledge system design — how the work compounds over time", "Implementation planning — phases, resources, success criteria"],
    get: ["Complete Operating Architecture document", "Workflow specifications with AI integration points", "Governance Framework with decision gates and risk management", "Implementation Plan with phases, milestones, and resource requirements", "Change Management playbook"],
  },
  {
    icon: "🏗️",
    name: "Build Sprint",
    duration: "8–16 weeks",
    best: "Organizations ready to implement and operationalize",
    what: ["Implementation of the designed architecture", "Workflow build-out with real AI integration", "Team training (integrated with AI Literacy programs)", "Pattern encoding — documenting what works so it's repeatable", "Governance activation — decision gates, monitoring, feedback loops"],
    get: ["Operational AI system — live, working, in production", "Trained team capable of operating and evolving the system", "Encoded delivery patterns for consistent quality", "Active governance framework with monitoring", "30-day post-launch support"],
  },
  {
    icon: "🧭",
    name: "Advisory Retainer",
    duration: "Quarterly (ongoing)",
    best: "Organizations with operating AI systems that need strategic steering",
    what: ["Quarterly strategic reviews — what's working, what's evolving, what's next", "Pattern refinement — continuously improving delivery patterns based on outcomes", "Architecture evolution — adapting the operating model as AI capabilities advance", "On-demand strategic guidance for emerging challenges and opportunities"],
    get: ["Continuous optimization of your AI operating architecture", "Early access to emerging patterns and frameworks", "Strategic steering as the AI landscape evolves", "Quarterly outcome reports with compounding metrics"],
  },
];

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI Ops Consulting</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[--text-primary] leading-tight">
            Stop Piloting.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              Start Operating.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Your organization doesn't have an AI tool problem. It has an AI operations problem. The gap between &ldquo;we tried ChatGPT&rdquo; and &ldquo;AI is embedded in how we work&rdquo; is an architecture gap — and architecture is what we build.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      {/* Pilot Graveyard */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-[--text-primary]">The Pilot Graveyard</h2>
            <p className="text-[--text-secondary]">Most organizations are stuck in an endless cycle of AI experimentation.</p>
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            {[
              { num: "1", label: "Excitement", desc: "\"AI will change everything!\"" },
              { num: "2", label: "Pilot", desc: "Build a proof of concept with one team" },
              { num: "3", label: "Success", desc: "\"It works! Let's scale!\"" },
              { num: "4", label: "Reality", desc: "No governance, no integration, no change management" },
              { num: "5", label: "Stall", desc: "Pilot dies. Organization returns to status quo." },
              { num: "6", label: "Repeat", desc: "New tool, new pilot, same outcome." },
            ].map(({ num, label, desc }) => (
              <div key={num} className="flex items-center gap-4 bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-lg] p-4">
                <span className="text-xs font-bold text-[--accent-vivid] w-5 shrink-0">{num}.</span>
                <span className="font-bold text-[--text-primary] w-24 shrink-0">{label}</span>
                <span className="text-sm text-[--text-secondary]">{desc}</span>
              </div>
            ))}
          </div>
          <div className="max-w-2xl mx-auto bg-[--accent-dim] border border-[--border-active] rounded-[--radius-xl] p-5 text-center">
            <p className="font-bold text-[--text-primary]">The hard truth:</p>
            <p className="text-sm text-[--text-secondary] mt-1">The pilot worked. Your organization didn't. You don't need another demo. You need an operating architecture.</p>
          </div>
        </div>
      </section>

      {/* What We Actually Do */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">What We Do</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">Architecture Over Tools. Systems Over Experiments.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {whatWeDo.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]"><Icon className="h-5 w-5 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Engagement Models</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">Four Ways to Work Together</h2>
          </div>
          <div className="space-y-6">
            {engagementModels.map(({ icon, name, duration, best, what, get }) => (
              <div key={name} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-5 hover:border-[--border-active] transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[--text-primary]">{name}</h3>
                      <p className="text-xs text-[--text-muted]">Best for: {best}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[--accent-dim] border border-[--border-active] text-xs font-medium text-[--accent-vivid] shrink-0">{duration}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[--text-muted]">What Happens</p>
                    <ul className="space-y-1">{what.map(w => (<li key={w} className="text-xs text-[--text-secondary] flex gap-1.5"><span className="text-[--accent-vivid] shrink-0">·</span>{w}</li>))}</ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[--text-muted]">What You Get</p>
                    <ul className="space-y-1">{get.map(g => (<li key={g} className="text-xs text-[--text-secondary] flex gap-1.5"><span className="text-[--accent-vivid] shrink-0">✓</span>{g}</li>))}</ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes This Different */}
      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Our Approach</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">What Makes This Different</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Outcome-Based, Not Activity-Based", desc: "We define success as a measurable state change — not hours logged or deliverables produced. Every engagement has clear before/after criteria." },
              { title: "Compounding Knowledge Transfer", desc: "We don't create dependency. We encode capability into your organization's systems. You keep getting smarter after we leave." },
              { title: "Trust Engineered, Not Promised", desc: "Every engagement includes explicit trust mechanisms — process transparency, artifact proof, reversibility, accountability hooks. Trust isn't a feeling. It's architecture." },
              { title: "200+ Encoded Delivery Patterns", desc: "We're not figuring it out as we go. 200+ delivery patterns across strategy, design, and execution — refined through real engagements." },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 space-y-2 hover:border-[--border-active] transition-all duration-300">
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[--mkt-section] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-[--text-primary]">Ready to Move Beyond Pilots?</h2>
          <p className="text-[--text-secondary]">Every consulting engagement starts with a Discovery conversation. We'll assess where you are, identify the highest-leverage opportunities, and design the path forward.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Book a Discovery Call <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/services"><Button variant="outline" size="lg">See All Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
