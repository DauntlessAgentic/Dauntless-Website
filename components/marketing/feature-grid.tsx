import React from "react";
import {
  Bot, Workflow, Plug, BrainCircuit, Shield, BarChart3, Clock, Users,
} from "lucide-react";

const services = [
  {
    icon: Bot,
    title: "Custom AI Agent Development",
    description: "Purpose-built agents that reason, plan, and execute multi-step workflows autonomously. We architect agents that actually solve your specific problem — not generic demos.",
    accent: "var(--accent-bright)",
    tag: "Core Service",
  },
  {
    icon: Workflow,
    title: "Agentic Workflow Automation",
    description: "Replace manual, repetitive processes with intelligent agent pipelines. Data extraction, document processing, research, communication — running 24/7 without supervision.",
    accent: "var(--info)",
    tag: "Core Service",
  },
  {
    icon: Plug,
    title: "AI Integration & Systems Design",
    description: "Embed AI agents into your existing stack — CRMs, ERPs, databases, APIs. We design clean integration architectures that won't break six months from now.",
    accent: "var(--chart-3)",
    tag: "Integration",
  },
  {
    icon: BrainCircuit,
    title: "LLM Selection & Fine-Tuning",
    description: "Right model for the right job: Claude, GPT-4o, Gemini, open-source. Prompt engineering, RAG pipelines, context optimization, and fine-tuning when it's warranted.",
    accent: "var(--accent-vivid)",
    tag: "Strategy",
  },
  {
    icon: Shield,
    title: "Enterprise AI Governance",
    description: "Security-first deployments with audit trails, rate limiting, and human-in-the-loop guardrails. AI you can trust in regulated environments.",
    accent: "var(--success)",
    tag: "Enterprise",
  },
  {
    icon: BarChart3,
    title: "Agent Performance & Analytics",
    description: "Custom dashboards to track agent output, error rates, throughput, and ROI in real time. Know exactly what your AI is doing — and how well it's working.",
    accent: "var(--chart-5)",
    tag: "Monitoring",
  },
  {
    icon: Clock,
    title: "Rapid Prototype to Production",
    description: "Two-week sprints from idea to working agent. We move fast without cutting corners on architecture. Most clients have something live in 4–6 weeks.",
    accent: "var(--warning)",
    tag: "Process",
  },
  {
    icon: Users,
    title: "Team Enablement & Training",
    description: "We don't just build — we transfer knowledge. Your team learns to manage, extend, and own the AI systems we ship together.",
    accent: "var(--chart-6)",
    tag: "Enablement",
  },
];

export function FeatureGrid() {
  return (
    <section id="services" className="bg-[--mkt-section] py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">What we build</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[--text-primary]">
            AI that works for your business.
          </h2>
          <p className="text-sm text-[--text-secondary] max-w-lg mx-auto">
            Not pre-packaged SaaS. Custom-engineered agents designed around your exact workflow, stack, and goals.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="relative rounded-[--radius-xl] border border-[--mkt-border] bg-[--mkt-card] p-5 space-y-3 hover:border-[--border-default] transition-all duration-200 group hover:shadow-[var(--shadow-md)]"
            >
              {/* Tag */}
              <div className="flex items-center justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] transition-colors"
                  style={{
                    background: `color-mix(in srgb, ${service.accent} 15%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${service.accent} 40%, transparent)`,
                  }}
                >
                  <service.icon className="h-4 w-4" style={{ color: service.accent }} />
                </div>
                <span
                  className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-[--radius-sm]"
                  style={{
                    color: service.accent,
                    background: `color-mix(in srgb, ${service.accent} 10%, transparent)`,
                  }}
                >
                  {service.tag}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[--text-primary] leading-snug">{service.title}</h3>
                <p className="text-xs text-[--text-muted] leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
