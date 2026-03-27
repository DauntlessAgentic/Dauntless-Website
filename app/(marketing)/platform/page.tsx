import React from "react";
import Link from "next/link";
import { ArrowRight, FileText, Bot, BarChart3, RefreshCw, MessageSquare, TrendingUp, Compass, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";

const portalFeatures = [
  { icon: FileText, title: "Living Deliverables", description: "Your training materials, strategic roadmaps, architecture documents, and governance frameworks aren't static files — they're living artifacts you can revisit, annotate, and evolve." },
  { icon: Bot, title: "Built-In AI Agents", description: "Your portal includes AI agents trained on your specific engagement context. Ask questions about your deliverables, generate reports, and get strategic advice grounded in your actual situation." },
  { icon: BarChart3, title: "Progress Tracking & Analytics", description: "Track the progress of your AI adoption, capability development, and transformation milestones. See where you've been, where you are, and what the highest-leverage next steps look like." },
  { icon: RefreshCw, title: "Engagement Continuity", description: "When you return for a new engagement, we don't start from zero. Your portal retains full context from every prior interaction. The second engagement is faster, sharper, and more valuable." },
];

const agentCapabilities = [
  { icon: MessageSquare, title: "Ask Anything About Your Deliverables", examples: ["What were the top 3 recommendations from our Discovery Sprint?", "Summarize the governance framework we designed in Q2.", "What training modules had the highest impact scores?"] },
  { icon: TrendingUp, title: "Generate Custom Reports", examples: ["Show me a progress report on our AI adoption roadmap.", "Compare our capability scores from January vs. June.", "Draft an executive summary of this quarter's outcomes."] },
  { icon: Compass, title: "Plan Next Steps", examples: ["Based on our current progress, what should we prioritize next?", "What gaps remain in our governance framework?", "Recommend the highest-leverage engagement for Q3."] },
  { icon: Search, title: "Analyze & Explore", examples: ["Which workflows showed the biggest improvement after training?", "What patterns are emerging across our team's AI usage data?", "Identify the 3 biggest risks in our current AI operating model."] },
];

const tiers = [
  { name: "Core Portal", tag: "Included with all engagements", highlight: false, features: ["Living Deliverables", "Engagement History & Continuity", "1 general AI agent", "Standard progress dashboards", "Basic knowledge compounding"] },
  { name: "Advanced Portal", tag: "Multi-engagement clients", highlight: true, features: ["Everything in Core", "Specialized agent fleet", "Advanced dashboards with custom views", "Cross-engagement intelligence", "Enhanced knowledge architecture"] },
  { name: "Innovation Studio", tag: "Strategic partners", highlight: false, features: ["Everything in Advanced", "Full design-to-delivery pipeline", "Executive decision surface", "Organizational knowledge architecture", "Managed agentic operations"] },
];

const phases = [
  { phase: "Onboarding", what: "Your Client Intelligence Portal is provisioned with your engagement context, deliverables, and AI agents", experience: "A private workspace, ready to use from day one" },
  { phase: "Active Engagement", what: "Deliverables are published live to your portal as work progresses — not dumped at the end", experience: "Real-time visibility into what's being built and why" },
  { phase: "Post-Engagement", what: "Portal remains active. AI agents continue to serve. Knowledge is preserved and queryable.", experience: "Your investment keeps working long after the project ends" },
  { phase: "Return Engagement", what: "Full context retained. New engagement enriches the existing knowledge base. Agents get smarter.", experience: "Faster start, deeper insights, better outcomes every time" },
];

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Platform</p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[--text-primary] leading-tight">
            Your Engagement Doesn&apos;t End.{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              It Compounds.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Most firms deliver a report and disappear. We deliver a living platform — an intelligent client portal where every deliverable, every insight, and every decision accumulates into a compounding knowledge asset that keeps working for you long after the engagement ends.
          </p>
          <Link href="/contact">
            <Button variant="primary" size="lg" className="gap-2">Explore the Platform <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-3xl font-extrabold text-[--text-primary] text-center">Engagements Shouldn&apos;t Evaporate</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[--mkt-card] border border-[--danger]/30 rounded-[--radius-xl] p-6 space-y-3">
              <p className="text-sm font-bold text-[--danger] uppercase tracking-wider">The Industry Standard</p>
              {["Deliverables arrive as static PDFs and slide decks", "Knowledge lives in the consultant's head", "Every new engagement starts from scratch", "No way to revisit, remix, or build on past work", "Insights decay the moment the project closes"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--danger] mt-0.5 shrink-0">✕</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
            <div className="bg-[--mkt-card] border border-[--success]/30 rounded-[--radius-xl] p-6 space-y-3">
              <p className="text-sm font-bold text-[--success] uppercase tracking-wider">The Dauntless Platform</p>
              {["Deliverables are living, interactive, and connected", "Knowledge is encoded into your portal", "Every engagement builds on everything before it", "AI agents help you analyze, extend, and act on your deliverables", "Intelligence compounds with every interaction"].map(item => (
                <div key={item} className="flex items-start gap-2"><span className="text-[--success] mt-0.5 shrink-0">✓</span><p className="text-sm text-[--text-secondary]">{item}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Your Portal</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">A Private Workspace. Built Around You.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {portalFeatures.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex h-10 w-10 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active]"><Icon className="h-5 w-5 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI Agents</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">AI That Knows Your Context</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {agentCapabilities.map(({ icon: Icon, title, examples }) => (
              <div key={title} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-6 space-y-3 hover:border-[--border-active] transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                  <h3 className="font-bold text-[--text-primary]">{title}</h3>
                </div>
                <ul className="space-y-2">
                  {examples.map(ex => (<li key={ex} className="text-sm text-[--text-muted] italic pl-2 border-l border-[--border-subtle]">&ldquo;{ex}&rdquo;</li>))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-bg] py-24 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Platform Tiers</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">Choose the Level That Fits Your Ambition</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map(({ name, tag, features, highlight }) => (
              <div key={name} className={`bg-[--mkt-card] border rounded-[--radius-xl] p-6 space-y-4 ${highlight ? "border-[--border-active] shadow-[var(--shadow-accent)]" : "border-[--mkt-border]"}`}>
                {highlight && <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full bg-[--accent-dim] text-[--accent-vivid]">Most Popular</span>}
                <h3 className="text-lg font-bold text-[--text-primary]">{name}</h3>
                <p className="text-xs text-[--text-muted]">{tag}</p>
                <ul className="space-y-2">{features.map(f => (<li key={f} className="flex items-start gap-2 text-sm text-[--text-secondary]"><span className="text-[--accent-vivid] mt-0.5 shrink-0">✓</span>{f}</li>))}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-section] py-24 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">The Journey</p>
            <h2 className="text-3xl font-extrabold text-[--text-primary]">From First Engagement to Compounding Platform</h2>
          </div>
          <div className="space-y-3">
            {phases.map(({ phase, what, experience }, i) => (
              <div key={phase} className="bg-[--mkt-card] border border-[--mkt-border] rounded-[--radius-xl] p-5 flex gap-4 items-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[--accent-dim] border border-[--border-active] text-xs font-bold text-[--accent-vivid] shrink-0">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[--text-primary] text-sm">{phase}</p>
                  <p className="text-sm text-[--text-secondary] mt-1">{what}</p>
                </div>
                <p className="text-sm text-[--text-muted] italic hidden md:block md:w-48 shrink-0">{experience}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[--mkt-bg] py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-[--text-primary]">Ready to See What a Compounding Platform Looks Like?</h2>
          <p className="text-[--text-secondary]">The platform is included with every engagement. Let&apos;s talk about what your Client Intelligence Portal could look like.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/contact"><Button variant="primary" size="lg" className="gap-2">Start a Conversation <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/services"><Button variant="outline" size="lg">Explore Our Services</Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
