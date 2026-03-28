import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, GitBranch, Users, TrendingUp } from "lucide-react";

const stats = [
  { icon: Clock,      value: "18+",    label: "Years designing AI & systems architecture" },
  { icon: GitBranch,  value: "180+",   label: "AI-augmented workflows designed" },
  { icon: Users,      value: "5,000+", label: "Professionals served" },
  { icon: TrendingUp, value: "$50M+",   label: "In documented value delivered" },
];

export function WhyDauntless() {
  return (
    <section className="relative bg-[--mkt-bg] py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
      </div>
      <div className="relative max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[--accent-vivid]">Credentials</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-[--text-primary]">The Track Record.</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="group soft-card soft-card-lift p-6 space-y-4 text-center"
            >
              <div className="flex justify-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <Icon className="h-4 w-4" style={{ color: "#a78bfa" }} strokeWidth={1.75} />
                </div>
              </div>
              <p
                className="text-3xl font-bold text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #c4b5fd 100%)" }}
              >
                {value}
              </p>
              <p className="text-xs text-[--text-muted] leading-snug">{label}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div
            className="relative rounded-2xl p-8 space-y-4"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(16,16,30,0.6) 100%)", border: "1px solid rgba(139,92,246,0.15)" }}
          >
            <div className="flex items-start gap-4">
              <div
                className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white mt-0.5"
                style={{ background: "linear-gradient(135deg, #7c3aed, #8b5cf6)" }}
              >
                CM
              </div>
              <div className="space-y-2">
                <p className="text-[--text-primary] font-medium text-sm">Craig Marchand</p>
                <p className="text-[11px] text-[--accent-vivid] uppercase tracking-wider font-medium">Founder, Dauntless Agentic</p>
              </div>
            </div>
            <p className="text-[--text-secondary] text-sm leading-relaxed">
              Former VP Innovation at BDO Canada, FutureCraft program architect, systems thinker, and builder of operating architectures at the intersection of AI, human capability, and organizational design.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[--accent-vivid] hover:text-[--accent-bright] transition-colors"
            >
              Full story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
