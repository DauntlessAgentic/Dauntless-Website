import React from "react";
import Image from "next/image";
import {
  Lightbulb, Network, GitBranch, Layers,
  Eye, BarChart2, Briefcase, BookOpen,
} from "lucide-react";

export type WorkCategory =
  | "Strategy Design"
  | "Program Architecture"
  | "Process Design"
  | "Systems Thinking"
  | "Foresight"
  | "Performance Design"
  | "Business Design"
  | "Knowledge Architecture";

export type WorkSector = "federal" | "private" | "international";

export interface WorkCardProps {
  department: string;
  project: string;
  category: WorkCategory;
  sector?: WorkSector;
  image?: string;
}

const categoryConfig: Record<
  WorkCategory,
  { icon: React.ElementType; color: string; bg: string; border: string }
> = {
  "Strategy Design":        { icon: Lightbulb,  color: "#a78bfa", bg: "rgba(139,92,246,0.12)",  border: "rgba(139,92,246,0.25)" },
  "Program Architecture":   { icon: Network,    color: "#8b5cf6", bg: "rgba(124,58,237,0.12)",  border: "rgba(124,58,237,0.25)" },
  "Process Design":         { icon: GitBranch,  color: "#60a5fa", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)" },
  "Systems Thinking":       { icon: Layers,     color: "#22d3ee", bg: "rgba(34,211,238,0.10)",  border: "rgba(34,211,238,0.22)" },
  "Foresight":              { icon: Eye,        color: "#fbbf24", bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.22)" },
  "Performance Design":     { icon: BarChart2,  color: "#34d399", bg: "rgba(34,197,94,0.10)",   border: "rgba(34,197,94,0.22)"  },
  "Business Design":        { icon: Briefcase,  color: "#f472b6", bg: "rgba(236,72,153,0.10)",  border: "rgba(236,72,153,0.22)" },
  "Knowledge Architecture": { icon: BookOpen,   color: "#2dd4bf", bg: "rgba(20,184,166,0.10)",  border: "rgba(20,184,166,0.22)" },
};

const gradientByCategory: Record<WorkCategory, string> = {
  "Strategy Design":        "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
  "Program Architecture":   "linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%)",
  "Process Design":         "linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)",
  "Systems Thinking":       "linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)",
  "Foresight":              "linear-gradient(135deg, #b45309 0%, #f59e0b 100%)",
  "Performance Design":     "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
  "Business Design":        "linear-gradient(135deg, #be185d 0%, #ec4899 100%)",
  "Knowledge Architecture": "linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)",
};

export function WorkCard({ department, project, category, sector, image }: WorkCardProps) {
  const cfg = categoryConfig[category];
  const Icon = cfg.icon;
  const grad = gradientByCategory[category];

  return (
    <div className="group flex flex-col bg-[--mkt-card] border border-[--mkt-border] rounded-xl overflow-hidden transition-all duration-300 hover:border-[rgba(139,92,246,0.3)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">

      {/* Header: real image or gradient+icon fallback */}
      {image ? (
        <div className="relative w-full h-36 shrink-0 overflow-hidden bg-[--mkt-section]">
          <Image
            src={image}
            alt={`${department} — ${project}`}
            fill
            className="object-cover object-top scale-[1.04] transition-transform duration-700 ease-out group-hover:-translate-y-3"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Subtle bottom gradient fade into card bg */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[--mkt-card] to-transparent" />
        </div>
      ) : (
        <div
          className="flex items-center justify-center h-16 w-full shrink-0"
          style={{ background: grad }}
        >
          <Icon className="h-7 w-7 text-white/90" strokeWidth={1.5} />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-sm font-semibold text-[--text-primary] leading-snug">{department}</p>
        <p className="text-xs text-[--text-muted] leading-snug flex-1">{project}</p>

        {/* Category badge */}
        <span
          className="mt-1 self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: cfg.color,
            background: cfg.bg,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {category}
        </span>
      </div>
    </div>
  );
}
