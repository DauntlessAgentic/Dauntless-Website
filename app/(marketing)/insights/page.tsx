import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Zap, Layers, GraduationCap, RefreshCw, Globe, Linkedin, Users, CalendarClock } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { PageCTA } from "@/components/marketing/page-cta";

const categories = [
  { icon: Brain, title: "AI & Human Intelligence", description: "How humans and AI work together — augmentation patterns, decision-making, the role of judgment in an automated world." },
  { icon: Zap, title: "Agentic Architecture", description: "Designing agent fleets, decision frameworks, governance patterns, and the operating systems that make AI work at scale." },
  { icon: Layers, title: "Systems Thinking", description: "The architecture of organizations, the design of operating models, and why systems beat tools every time." },
  { icon: GraduationCap, title: "Capability Development", description: "Building AI literacy, training methodologies, cohort-based learning, and what actually works in developing people." },
  { icon: RefreshCw, title: "The Compounding Advantage", description: "Knowledge management, pattern encoding, proof harvesting, and the architecture of exponential improvement." },
  { icon: Globe, title: "The Future of Work", description: "The disruption of traditional models, the evolution of professional services, and what comes next for humans in the economy." },
  { icon: Users, title: "Collective Intelligence", description: "Is CI real? Does diversity actually make organizations smarter? The science and practice of harnessing collective human intelligence alongside AI." },
  { icon: CalendarClock, title: "Meeting Productivity", description: "71% of meetings are unproductive. Here's what the other 29% look like — and how AI-augmented facilitation changes the economics of collaboration." },
];


export const metadata: Metadata = {
  title: "Insights — AI, Systems & the Future of Work",
  description: "Writing on AI operations, collective intelligence, agentic architecture, and what actually works in complex organizations.",
};

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-[--mkt-bg]">
      <MarketingNav />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, rgba(var(--accent-rgb),0.14) 0%, transparent 65%)" }} />
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Insights</p>
          <h1 className="text-4xl md:text-6xl font-bold text-[--text-primary] leading-tight">
            Insights from{" "}
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, var(--accent-bright), var(--accent-vivid))" }}>
              the Frontier.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-[--text-secondary] leading-relaxed">
            Thinking on AI, systems architecture, human capability, and the future of work — grounded in real experience building and operating agentic systems.
          </p>
        </div>
      </section>

      {/* Featured: Manifesto */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="soft-card-accent p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest rounded-full bg-[--accent-dim] text-[--accent-vivid]">Featured</span>
                <span className="text-xs text-[--text-muted]">9-part series</span>
              </div>
              <h2 className="text-2xl font-semibold text-[--text-primary]">The Dauntless Manifesto: 9 Theses for the Age of AI</h2>
              <p className="text-[--text-secondary]">A series of provocations about work, intelligence, and human potential in an era of profound disruption. Released as a 9-part LinkedIn series.</p>
            </div>
            <Link
              href="/about/manifesto"
              className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
                boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
              }}
            >
              Read the Manifesto <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Topics</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">What We Write About</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(({ icon: Icon, title, description }) => (
              <div key={title} className="soft-card p-5 space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Icon className="h-4 w-4 text-[--accent-vivid]" /></div>
                <h3 className="font-bold text-[--text-primary]">{title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="bg-[--mkt-section] py-16 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Articles</p>
            <h2 className="text-3xl font-semibold text-[--text-primary]">Latest Thinking</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">

            {/* Published article 1 */}
            <div className="soft-card overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-bright))" }} />
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">AI &amp; Human Intelligence</span>
                <h3 className="font-bold text-[--text-primary] leading-snug">The Case Against AI-First Thinking</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">
                  Every organization rushing to &ldquo;become AI-first&rdquo; is solving the wrong problem.
                  The organizations that will win aren&apos;t the ones that adopt AI fastest &mdash; they&apos;re
                  the ones that build the human operating systems that make AI worth having.
                </p>
                <Link href="/about/manifesto" className="inline-flex items-center gap-1 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
                  Read the full argument <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Published article 2 */}
            <div className="soft-card overflow-hidden">
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #6d28d9, var(--accent))" }} />
              <div className="p-6 space-y-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Agentic Architecture</span>
                <h3 className="font-bold text-[--text-primary] leading-snug">The Four Layers of a Constitutional Agentic System</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">
                  Why the architecture of your agent fleet matters as much as the agents themselves &mdash;
                  and how separation of powers prevents the most common failure modes in production AI systems.
                </p>
                <Link href="/about/manifesto" className="inline-flex items-center gap-1 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
                  Explore the manifesto <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Subscribe card */}
            <div className="bg-[rgba(124,58,237,0.06)] border border-[rgba(139,92,246,0.2)] rounded-[--radius-xl] p-6 flex flex-col justify-center space-y-4">
              <p className="text-sm font-semibold text-[--text-primary]">New insights publish monthly.</p>
              <p className="text-sm text-[--text-secondary] leading-relaxed">
                No fluff. No sales emails. Just thinking worth your time &mdash; on AI operations,
                systems design, and the future of human capability.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 rounded-lg text-sm bg-[--mkt-card] border border-[--mkt-border] text-[--text-primary] placeholder-[--text-muted] focus:outline-none focus:border-[--accent-vivid]"
                />
                <button
                  className="w-full px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-bright))" }}
                >
                  Subscribe
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[--mkt-bg] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6 soft-card p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Newsletter</p>
          <h2 className="text-3xl font-semibold text-[--text-primary]">Get the Signal, Not the Noise.</h2>
          <p className="text-[--text-secondary]">A periodic dispatch from the frontier — frameworks, provocations, and practical insights on building in the age of AI. No spam. No filler. Just signal.</p>
          <p className="text-xs text-[--text-muted]">Join 500+ leaders building at the intersection of AI and human capability.</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)",
              boxShadow: "0 0 0 1px rgba(var(--accent-bright-rgb),0.5), 0 8px 32px rgba(var(--accent-rgb),0.35)",
            }}
          >
            Subscribe via Contact <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Connect */}
      <section className="bg-[--mkt-section] py-14 px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Connect</p>
            <h2 className="text-2xl font-semibold text-[--text-primary]">Where the Real-Time Thinking Happens</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="soft-card p-5 space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Linkedin className="h-4 w-4 text-[--accent-vivid]" /></div>
              <h3 className="font-bold text-[--text-primary]">LinkedIn</h3>
              <p className="text-sm text-[--text-secondary]">Follow for daily insights, manifesto drops, and conversations about the future of work.</p>
              <a href="https://linkedin.com/in/craigmarchand" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
                Follow Craig <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="soft-card p-5 space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[--radius-lg] bg-[--accent-dim]"><Zap className="h-4 w-4 text-[--accent-vivid]" /></div>
              <h3 className="font-bold text-[--text-primary]">Speaking</h3>
              <p className="text-sm text-[--text-secondary]">Craig speaks on AI strategy, agentic architecture, and the future of human capability. Available for keynotes, panels, and executive briefings.</p>
              <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors">
                Book a Speaking Engagement <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PageCTA heading="Curious how this thinking applies to your organization?" />
      <MarketingFooter />
    </div>
  );
}
