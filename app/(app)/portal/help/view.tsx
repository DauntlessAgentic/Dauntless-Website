"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Keyboard, Sparkles } from "lucide-react";

import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { ContentTag } from "@/components/ui/content-tag";

import type { MembershipContext } from "@/lib/auth/session";

interface HelpViewProps {
  membership: MembershipContext;
}

interface TourStop {
  href: string;
  title: string;
  purpose: string;
}

const TOUR: TourStop[] = [
  { href: "/portal", title: "Command Center", purpose: "Decision Surface, NBA, signals. Start every session here." },
  { href: "/portal/engagements", title: "Engagements", purpose: "Success criteria + risks + cross-engagement intelligence per engagement." },
  { href: "/portal/decisions", title: "Decision Register", purpose: "Approve / defer / reject pending decisions; every approval is audited." },
  { href: "/portal/deliverables", title: "Living Deliverables", purpose: "Open an artifact → edit body → mint a new version → propose for canonical." },
  { href: "/portal/agents", title: "Agent fleet", purpose: "Run any agent against the workspace; separation of powers enforced at the tool catalog." },
  { href: "/portal/knowledge", title: "Knowledge architecture", purpose: "Desk / Bookshelf / Cabinet · revalidation queue with urgency." },
  { href: "/portal/governance", title: "Governance", purpose: "Audit log + agent telemetry + repository activation status." },
  { href: "/portal/outcomes/impact-report", title: "Quarterly Impact Report", purpose: "Board-ready briefing assembled from the telemetry event bus." },
  { href: "/portal/innovation", title: "Innovation Studio", purpose: "Pattern library, roadmap simulator, decision-tree visualization." },
  { href: "/portal/compliance", title: "Compliance posture", purpose: "Cross-framework readiness with sector packs." },
  { href: "/portal/about", title: "About this portal", purpose: "Self-documenting roadmap status (15 phases shipped)." },
];

const SHORTCUTS: Array<{ keys: string; what: string }> = [
  { keys: "⌘K / Ctrl+K", what: "Open the command palette; jump anywhere." },
  { keys: "Esc", what: "Close the palette." },
  { keys: "↑ / ↓ / ↵", what: "Navigate + select inside the palette." },
];

export function HelpView({ membership }: HelpViewProps) {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Getting started"
        title="Learn the portal in five minutes"
        description="A guided tour of the 24 surfaces, the role gating, and the keyboard shortcuts. Read top-to-bottom or jump."
        badge={`as ${membership.role}`}
        badgeVariant="accent"
        actions={
          <Link href="/portal" className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1">
            Command Center <ArrowRight className="h-3 w-3" />
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        <DashboardCard
          id="help-intro"
          eyebrow="ORIENT"
          title="One sentence each — what every surface is for"
        >
          <div className="px-3 py-3 text-xs text-[--text-secondary] space-y-2 leading-relaxed">
            <p>
              The portal is a <strong className="text-[--text-primary]">premium AI strategy and operations cockpit</strong>. Every surface
              answers one of the seven engagement questions: <em>what are we trying to accomplish?</em>, <em>what have we delivered?</em>,
              <em> what decisions need attention?</em>, <em>what evidence supports them?</em>, <em>what changed?</em>, <em>what should we do next?</em>,
              <em> what capability have we retained?</em>
            </p>
            <p>
              Mutations are <strong className="text-[--text-primary]">propose → approve → commit</strong>. Every approval is audited. Every
              agent runs through a tool catalog that enforces <strong className="text-[--text-primary]">separation of powers</strong> — no agent
              both produces and audits.
            </p>
          </div>
        </DashboardCard>

        <DashboardCard
          id="help-tour"
          eyebrow="TOUR"
          title={`${TOUR.length} stops · ~5 min`}
          subtitle="Each stop has one job. Click through in order on your first session."
          bodyClassName="overflow-hidden"
        >
          <ul className="flex flex-col divide-y divide-[--border-subtle]">
            {TOUR.map((stop, idx) => (
              <li key={stop.href} className="flex items-start gap-3 px-3 py-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--accent-dim] text-[--accent-vivid] border border-[--border-active] shrink-0 text-xs font-mono font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Compass className="h-3.5 w-3.5 text-[--accent-vivid]" />
                    <Link href={stop.href} className="text-xs font-semibold text-[--text-primary] hover:underline">
                      {stop.title}
                    </Link>
                  </div>
                  <p className="text-xs text-[--text-secondary] leading-snug">{stop.purpose}</p>
                </div>
                <Link
                  href={stop.href}
                  className="text-xs text-[--accent-vivid] hover:underline inline-flex items-center gap-1 shrink-0"
                >
                  open <ArrowRight className="h-3 w-3" />
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DashboardCard
            id="help-shortcuts"
            eyebrow="SHORTCUTS"
            title="Keyboard"
          >
            <ul className="px-3 py-2.5 space-y-1.5 text-xs">
              {SHORTCUTS.map((row) => (
                <li key={row.keys} className="flex items-center gap-3 text-[--text-secondary]">
                  <Keyboard className="h-3.5 w-3.5 text-[--accent-vivid] shrink-0" />
                  <code className="font-mono text-[--text-primary] bg-[--elevated] border border-[--border-subtle] rounded px-1.5 py-0.5">
                    {row.keys}
                  </code>
                  <span>{row.what}</span>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard
            id="help-roles"
            eyebrow="ROLE GATING"
            title="What your role can do"
          >
            <div className="px-3 py-2.5 text-xs text-[--text-secondary] space-y-2 leading-snug">
              <p>
                <ContentTag variant="accent">owner</ContentTag>{" "}— Dauntless staff. Read + write everywhere; only owners see the Portfolio + can run marketplace evals + publish + killswitch.
              </p>
              <p>
                <ContentTag variant="success">executive</ContentTag>{" "}— Client sponsor. Approve / defer / reject decisions; publish artifacts; export evidence; approve canonical promotions; install marketplace listings.
              </p>
              <p>
                <ContentTag variant="info">lead</ContentTag>{" "}— Client engagement lead. Edit artifacts, propose decisions, run agents, propose outbound actions.
              </p>
              <p>
                <ContentTag variant="default">viewer</ContentTag>{" "}— Read-only across most surfaces (Governance hidden).
              </p>
              <p>
                <ContentTag variant="warning">auditor</ContentTag>{" "}— Read everywhere; can export audit log; cannot mutate artifacts or decisions.
              </p>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard
          id="help-next"
          eyebrow="DEEP DIVE"
          title="When you're ready"
        >
          <div className="px-3 py-2.5 text-xs text-[--text-secondary] space-y-1.5">
            <p>
              <BookOpen className="inline h-3 w-3 mr-1 text-[--accent-vivid]" />
              <Link href="/portal/about" className="text-[--accent-vivid] hover:underline">/portal/about</Link>{" "}
              — full 15-phase roadmap status with PR links.
            </p>
            <p>
              <Sparkles className="inline h-3 w-3 mr-1 text-[--accent-vivid]" />
              <Link href="/portal/changelog" className="text-[--accent-vivid] hover:underline">/portal/changelog</Link>{" "}
              — unified activity stream across every signal source.
            </p>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
