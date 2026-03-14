import React from "react";
import {
  LayoutGrid, Bot, BarChart3, Layers, Zap, Database, Settings2, GitBranch,
} from "lucide-react";

const features = [
  {
    icon: LayoutGrid,
    title: "Draggable Card Workspace",
    description: "React Grid Layout powers a snap-grid of resizable, draggable cards. Quarter-increment resize model. Layout persistence. Three default presets.",
    accent: "var(--accent-bright)",
  },
  {
    icon: Bot,
    title: "Multi-Agent Architecture",
    description: "Cards are first-class agent containers. Commander, worker, critic, analyst patterns. State-aware visual system: idle, active, thinking, blocked, complete.",
    accent: "var(--info)",
  },
  {
    icon: BarChart3,
    title: "Dark-Theme Visualizations",
    description: "Recharts line, bar, area, donut, radar — all styled to the ultraviolet token system. Radar sweep animation included out of the box.",
    accent: "var(--chart-3)",
  },
  {
    icon: Layers,
    title: "Token-Based Design System",
    description: "Every color, shadow, radius, and motion value is a CSS custom property. Tailwind v4 @theme bridge. Zero hardcoded hex values in components.",
    accent: "var(--accent-vivid)",
  },
  {
    icon: Zap,
    title: "Operator-Grade Shell",
    description: "Compact side rail, top bar, workspace headers, breadcrumbs, filter toolbars, inspector panels. Feels like a real product from day one.",
    accent: "var(--warning)",
  },
  {
    icon: Database,
    title: "TanStack Table",
    description: "Searchable, sortable data tables with progress bars, badges, and custom cell renderers. Fully integrated into the card system.",
    accent: "var(--success)",
  },
  {
    icon: Settings2,
    title: "8 Starter Page Templates",
    description: "Dashboard, Workspace, Multi-Agent, Analytics, Settings, Intake, Marketing, and Style Guide. Each fully populated with mock data.",
    accent: "var(--chart-5)",
  },
  {
    icon: GitBranch,
    title: "AI-Agent Extensible",
    description: "AGENTS.md rules ensure future AI coding agents extend the system without style drift. Card registry, typed APIs, clean folder structure.",
    accent: "var(--chart-6)",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="bg-[--mkt-section] py-24 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[--accent-vivid]">What's included</p>
          <h2 className="text-3xl font-bold text-[--text-primary]">Everything a real product needs.</h2>
          <p className="text-sm text-[--text-secondary] max-w-lg mx-auto">
            Not a toy dashboard. Not a template mill. A production starter that sets the tone for everything built on top of it.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative rounded-[--radius-xl] border border-[--mkt-border] bg-[--mkt-card] p-5 space-y-3 hover:border-[--border-default] transition-colors group"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] transition-colors"
                style={{ background: `color-mix(in srgb, ${feature.accent} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${feature.accent} 40%, transparent)` }}
              >
                <feature.icon className="h-4 w-4" style={{ color: feature.accent }} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[--text-primary] leading-snug">{feature.title}</h3>
                <p className="text-xs text-[--text-muted] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
