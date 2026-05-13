"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentTag } from "@/components/ui/content-tag";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardTabs, CardTabsList, CardTabsTrigger, CardTabsContent } from "@/components/ui/card-tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip } from "@/components/ui/tooltip";
import { IconButton } from "@/components/ui/icon-button";
import { EmptyState } from "@/components/ui/empty-state";
import { KpiTile } from "@/components/patterns/kpi-tile";
import { FeedPanel } from "@/components/patterns/feed-panel";
import { SummaryCard } from "@/components/patterns/summary-card";
import { LineChartViz } from "@/components/viz/line-chart";
import { BarChartViz } from "@/components/viz/bar-chart";
import { DonutChartViz } from "@/components/viz/donut-chart";
import { AreaChartViz } from "@/components/viz/area-chart";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { DataTable, defaultTableColumns } from "@/components/patterns/data-table";
import { PortalStatusCard } from "@/components/patterns/portal-status-card";
import { DecisionList } from "@/components/patterns/decision-list";
import { ArtifactList } from "@/components/patterns/artifact-list";
import { AgentFleetPanel } from "@/components/patterns/agent-fleet-panel";
import { EvidenceLink } from "@/components/patterns/evidence-link";
import { KnowledgeShelf } from "@/components/patterns/knowledge-shelf";
import {
  Settings, Search, Bell, Bot, ArrowLeft, Zap,
} from "lucide-react";
import { kpiData, timeSeriesData, barData, donutData, feedItems, summaryContent, tableData } from "@/lib/mock-data";
import {
  mockAgents, mockArtifacts, mockDecisions, mockEngagements, mockKnowledge,
} from "@/lib/portal/mock-data";

const LABEL_CLASSES = "text-xs font-bold uppercase tracking-widest text-[--text-muted] mb-3 block";

function ShowcaseSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-10 border-b border-[--border-subtle]">
      <h2 className="text-base font-semibold text-[--text-primary] mb-6">{title}</h2>
      {children}
    </section>
  );
}

function TokenSwatch({ name, value, type }: { name: string; value: string; type: "color" | "border" }) {
  return (
    <div className="flex items-center gap-3">
      {type === "color" && (
        <div className="h-8 w-8 rounded-[--radius-md] border border-[--border-subtle] shrink-0" style={{ background: value }} />
      )}
      {type === "border" && (
        <div className="h-8 w-8 rounded-[--radius-md] shrink-0 bg-[--elevated]" style={{ border: `1px solid ${value}` }} />
      )}
      <div>
        <p className="text-xs font-mono text-[--text-primary]">{name}</p>
        <p className="text-xs text-[--text-muted] font-mono">{value}</p>
      </div>
    </div>
  );
}

export default function ShowcasePage() {
  const [sw, setSw] = useState(false);

  return (
    <div className="min-h-screen bg-[--app-bg]">
      <header className="sticky top-0 z-50 flex h-11 items-center gap-3 px-6 bg-[--chrome-bg] border-b border-[--border-subtle]">
        <Link href="/" className="flex items-center gap-1.5 text-[--text-muted] hover:text-[--text-primary] transition-colors text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
        <span className="text-[--border-default]">/</span>
        <span className="text-xs font-semibold text-[--text-primary]">Component Showcase</span>
        <Badge variant="accent" className="ml-auto">Style Guide</Badge>
      </header>

      <div className="max-w-5xl mx-auto px-6">

        {/* Color Tokens */}
        <ShowcaseSection id="tokens" title="Design Tokens — Color System">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <span className={LABEL_CLASSES}>Surface Stack</span>
              {[
                { name: "--app-bg",     value: "#09090e" },
                { name: "--chrome-bg",  value: "#0d0d16" },
                { name: "--panel-bg",   value: "#111120" },
                { name: "--elevated",   value: "#16162a" },
                { name: "--elevated-2", value: "#1c1c33" },
              ].map(t => <TokenSwatch key={t.name} {...t} type="color" />)}
            </div>
            <div className="space-y-3">
              <span className={LABEL_CLASSES}>Accent System</span>
              {[
                { name: "--accent",        value: "#7c3aed" },
                { name: "--accent-bright", value: "#8b5cf6" },
                { name: "--accent-vivid",  value: "#a78bfa" },
                { name: "--info",          value: "#22d3ee" },
                { name: "--success",       value: "#22c55e" },
                { name: "--warning",       value: "#f59e0b" },
                { name: "--danger",        value: "#ef4444" },
              ].map(t => <TokenSwatch key={t.name} {...t} type="color" />)}
            </div>
            <div className="space-y-3">
              <span className={LABEL_CLASSES}>Agent States</span>
              {[
                { name: "--agent-idle",     value: "#52526a" },
                { name: "--agent-active",   value: "#8b5cf6" },
                { name: "--agent-thinking", value: "#22d3ee" },
                { name: "--agent-blocked",  value: "#f59e0b" },
                { name: "--agent-complete", value: "#22c55e" },
                { name: "--agent-updated",  value: "#a78bfa" },
              ].map(t => <TokenSwatch key={t.name} {...t} type="color" />)}
            </div>
          </div>
        </ShowcaseSection>

        {/* Buttons */}
        <ShowcaseSection id="buttons" title="Buttons">
          <div className="space-y-4">
            <div>
              <span className={LABEL_CLASSES}>Variants</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>
            <div>
              <span className={LABEL_CLASSES}>Sizes</span>
              <div className="flex flex-wrap items-end gap-2">
                <Button size="xs">XSmall</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <span className={LABEL_CLASSES}>Icon Buttons</span>
              <div className="flex items-center gap-2">
                <Tooltip content="Settings"><IconButton icon={<Settings className="h-3.5 w-3.5" />} label="Settings" /></Tooltip>
                <IconButton icon={<Bell className="h-3.5 w-3.5" />} label="Notifications" variant="outline" />
                <IconButton icon={<Zap className="h-3.5 w-3.5" />} label="Activate" variant="accent" />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Badges & Tags */}
        <ShowcaseSection id="badges" title="Badges &amp; Tags">
          <div className="space-y-5">
            <div>
              <span className={LABEL_CLASSES}>Badge — bordered, for status labels</span>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Default</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            <div>
              <span className={LABEL_CLASSES}>ContentTag — compact pill for inline content labeling</span>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ContentTag>Default</ContentTag>
                  <ContentTag variant="accent">Accent</ContentTag>
                  <ContentTag variant="info">Info</ContentTag>
                  <ContentTag variant="success">Live</ContentTag>
                  <ContentTag variant="warning">Warning</ContentTag>
                  <ContentTag variant="danger">Danger</ContentTag>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ContentTag variant="info" dot>OSINT GL</ContentTag>
                  <ContentTag variant="warning" dot>Conflict &amp; Security</ContentTag>
                  <ContentTag variant="danger" dot>High Severity</ContentTag>
                  <ContentTag variant="success" dot>Connected</ContentTag>
                  <ContentTag variant="accent" dot>Active</ContentTag>
                </div>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Form Controls */}
        <ShowcaseSection id="inputs" title="Form Controls">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Input placeholder="Default input" />
              <Input icon={<Search className="h-3.5 w-3.5" />} placeholder="With icon" />
              <Textarea placeholder="Textarea…" className="min-h-[80px]" />
              <Select defaultValue="opt1">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="opt1">Option 1</SelectItem>
                  <SelectItem value="opt2">Option 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch checked={sw} onCheckedChange={setSw} />
                <span className="text-xs text-[--text-secondary]">Switch {sw ? "On" : "Off"}</span>
              </div>
              <div className="space-y-2">
                <Progress value={75} color="accent" />
                <Progress value={45} color="info" />
                <Progress value={90} color="success" />
                <Progress value={30} color="warning" />
              </div>
              <div className="flex items-center gap-2">
                <Avatar><AvatarFallback>OP</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
                <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Tabs */}
        <ShowcaseSection id="tabs" title="Tabs">
          <div className="space-y-6">
            <div>
              <span className={LABEL_CLASSES}>Standard Tabs — page-level navigation</span>
              <Tabs defaultValue="one">
                <TabsList>
                  <TabsTrigger value="one">Overview</TabsTrigger>
                  <TabsTrigger value="two">Analytics</TabsTrigger>
                  <TabsTrigger value="three">Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="one" className="mt-4">
                  <p className="text-xs text-[--text-secondary]">Overview tab content. Tabs animate in cleanly.</p>
                </TabsContent>
                <TabsContent value="two" className="mt-4">
                  <p className="text-xs text-[--text-secondary]">Analytics content here.</p>
                </TabsContent>
              </Tabs>
            </div>
            <div>
              <span className={LABEL_CLASSES}>CardTabs — compact underline tabs for card interiors</span>
              <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden h-40">
                <CardTabs defaultValue="all" className="flex flex-col h-full">
                  <CardTabsList>
                    <CardTabsTrigger value="all">All</CardTabsTrigger>
                    <CardTabsTrigger value="active">Active</CardTabsTrigger>
                    <CardTabsTrigger value="done">Done</CardTabsTrigger>
                    <CardTabsTrigger value="blocked" disabled>Blocked</CardTabsTrigger>
                  </CardTabsList>
                  <CardTabsContent value="all" className="p-3">
                    <p className="text-xs text-[--text-secondary]">All items — 12 total</p>
                    <p className="text-xs text-[--text-muted] mt-1">CardTabs use underline indicator, no pill background. Sit flush to card header.</p>
                  </CardTabsContent>
                  <CardTabsContent value="active" className="p-3">
                    <p className="text-xs text-[--text-secondary]">Active items — 4 running</p>
                  </CardTabsContent>
                  <CardTabsContent value="done" className="p-3">
                    <p className="text-xs text-[--text-secondary]">Completed items — 8 done</p>
                  </CardTabsContent>
                </CardTabs>
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Loading States */}
        <ShowcaseSection id="skeletons" title="Loading States">
          <div className="space-y-2 max-w-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </ShowcaseSection>

        {/* Empty States */}
        <ShowcaseSection id="empty" title="Empty States">
          <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)]">
            <EmptyState
              icon={<Bot className="h-5 w-5" />}
              title="Nothing here yet"
              description="Add content to get started"
              action={<Button variant="accent" size="sm"><Zap className="h-3.5 w-3.5 mr-1.5" />Get Started</Button>}
            />
          </div>
        </ShowcaseSection>

        {/* KPI Tiles */}
        <ShowcaseSection id="kpi" title="KPI Tiles">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiData.map((k) => (
              <div key={k.id} className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)]">
                <KpiTile {...k} />
              </div>
            ))}
          </div>
        </ShowcaseSection>

        {/* Charts */}
        <ShowcaseSection id="charts" title="Visualization Components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-3 h-52">
              <span className={LABEL_CLASSES}>Line Chart</span>
              <div className="h-36">
                <LineChartViz data={timeSeriesData.slice(0, 12)} xKey="time"
                  lines={[{ key: "value", color: "var(--chart-1)", label: "Sessions" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-3 h-52">
              <span className={LABEL_CLASSES}>Bar Chart</span>
              <div className="h-36">
                <BarChartViz data={barData} xKey="name"
                  bars={[{ key: "value", color: "var(--chart-1)", label: "Value" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-3 h-52">
              <span className={LABEL_CLASSES}>Area Chart</span>
              <div className="h-36">
                <AreaChartViz data={timeSeriesData.slice(0, 12)} xKey="time"
                  areas={[{ key: "value", color: "var(--chart-1)", label: "Sessions" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-3 h-52">
              <span className={LABEL_CLASSES}>Donut Chart</span>
              <div className="h-36">
                <DonutChartViz data={donutData} innerRadius={40} outerRadius={60} />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Card System */}
        <ShowcaseSection id="cards" title="Card System">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["idle","active","thinking","blocked","complete"] as const).map(state => (
              <div key={state} className="h-24">
                <DashboardCard id={`demo-${state}`} title={`Card — ${state}`} eyebrow="STATUS" agentState={state}>
                  <div className="flex items-center justify-center h-full text-xs text-[--text-muted]">
                    State: <span className="ml-1 font-mono text-[--text-secondary]">{state}</span>
                  </div>
                </DashboardCard>
              </div>
            ))}
            <div className="h-24">
              <DashboardCard id="demo-plain" title="Plain Card" eyebrow="NO AGENT STATE" subtitle="Hover to see controls">
                <div className="flex items-center justify-center h-full text-xs text-[--text-muted]">
                  Share · Expand · Close on hover
                </div>
              </DashboardCard>
            </div>
          </div>
        </ShowcaseSection>

        {/* Data Table */}
        <ShowcaseSection id="table" title="Data Table">
          <div className="h-72 rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
            <DataTable data={tableData.slice(0, 8)} columns={defaultTableColumns} />
          </div>
        </ShowcaseSection>

        {/* Portal Patterns — Phase 1 reusables that the Client Intelligence
            Portal leans on across every surface. Documented here so new
            contributors (human or agent) can identify the right primitive
            without grepping. */}
        <ShowcaseSection id="portal-patterns" title="Portal Patterns">
          <p className="text-xs text-[--text-muted] mb-4 leading-relaxed">
            Six reusable patterns power the Client Intelligence Portal. Each is used by ≥2 portal surfaces. Source:{" "}
            <code className="font-mono text-[--text-secondary]">components/patterns/</code>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">PortalStatusCard</span>
                <code className="text-xs font-mono text-[--text-muted]">portal-status-card</code>
              </div>
              <PortalStatusCard engagement={mockEngagements[0]} />
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">DecisionList</span>
                <code className="text-xs font-mono text-[--text-muted]">decision-list</code>
              </div>
              <DecisionList decisions={mockDecisions.slice(0, 2)} />
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">ArtifactList</span>
                <code className="text-xs font-mono text-[--text-muted]">artifact-list</code>
              </div>
              <ArtifactList artifacts={mockArtifacts.slice(0, 3)} />
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">AgentFleetPanel</span>
                <code className="text-xs font-mono text-[--text-muted]">agent-fleet-panel</code>
              </div>
              <AgentFleetPanel agents={mockAgents.slice(0, 4)} />
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-3 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">EvidenceLink</span>
                <code className="text-xs font-mono text-[--text-muted]">evidence-link</code>
              </div>
              <p className="text-xs text-[--text-muted]">Each variant maps to one EvidenceKind:</p>
              <div className="flex flex-col gap-1.5">
                <EvidenceLink kind="artifact" title="Strategic AI Roadmap" source="Cassandra Reyes" />
                <EvidenceLink kind="metric" title="Cycle time decreased 12%" source="Telemetry bus" />
                <EvidenceLink kind="signal" title="Decision proposed by Engagement Analyst" source="Agent run" />
                <EvidenceLink kind="source" title="TBS AI Modernization Brief" source="External PDF" />
                <EvidenceLink kind="workflow-log" title="Workspace search trace" source="Phase 4 mem-palace" />
              </div>
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] overflow-hidden">
              <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-[--border-subtle]">
                <span className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">KnowledgeShelf</span>
                <code className="text-xs font-mono text-[--text-muted]">knowledge-shelf</code>
              </div>
              <KnowledgeShelf shelf="bookshelf" items={mockKnowledge.filter((k) => k.shelf === "bookshelf").slice(0, 3)} compact />
            </div>
          </div>
        </ShowcaseSection>

        {/* Vocabulary — the portal's identity vocabulary lives in copy and
            doc tone. Spelling it out here keeps it honest. */}
        <ShowcaseSection id="vocabulary" title="Portal Vocabulary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs leading-relaxed">
            {[
              ["Client Intelligence Portal", "the cockpit; never \"the dashboard\""],
              ["Living Deliverables", "artifacts that compound; never \"reports\" or \"deliverables\""],
              ["Decision Surface", "the five-section judgment view"],
              ["Decision Register", "the queryable history of every decision"],
              ["Evidence Vault", "the linked-evidence list per decision/artifact"],
              ["Engagement Continuity", "what the portal preserves across engagements"],
              ["Artifact Proof", "the chain of evidence behind an artifact's canonical promotion"],
              ["Contextual Agents", "the fleet; never \"chatbots\" or \"assistants\""],
              ["Knowledge Architecture", "Desk / Bookshelf / Filing Cabinet + M0–M4 tiers"],
              ["Activation Plan", "the post-engagement enablement track"],
              ["Outcome Evidence", "the telemetry-backed proof"],
              ["Governance Layer", "audit log + role gating + risk tiers"],
              ["Trust Architecture", "the four pillars on the marketing site"],
              ["Compounding Intelligence", "the platform's flywheel"],
            ].map(([term, definition]) => (
              <div key={term} className="flex gap-2">
                <span className="text-[--accent-vivid] font-semibold shrink-0">{term}</span>
                <span className="text-[--text-secondary]">— {definition}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[--text-muted] mt-4 leading-relaxed">
            <strong className="text-[--text-secondary]">Avoid</strong>: SaaS-CRM verbs (submit, ticket, form, record, entry).
          </p>
        </ShowcaseSection>

        {/* How to extend — the actual contract for adding new patterns,
            cards, or routes. Pulled from AGENTS.md so it's discoverable
            from the showcase rather than only in repo root. */}
        <ShowcaseSection id="extend" title="How to extend the system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Adding a portal route</p>
              <ol className="list-decimal list-inside text-xs text-[--text-secondary] space-y-1 leading-relaxed">
                <li>Create <code className="font-mono text-[--accent-vivid]">app/(app)/portal/&lt;surface&gt;/page.tsx</code> as a server component.</li>
                <li>Inside it, <code className="font-mono text-[--accent-vivid]">await loadPortalContext()</code> and pass <code className="font-mono text-[--accent-vivid]">&#123; snapshot, membership &#125;</code> to a sibling client view.</li>
                <li>Add a smoke test under <code className="font-mono text-[--accent-vivid]">tests/portal/&lt;feature&gt;.test.mjs</code>; append it to the test list in <code className="font-mono text-[--accent-vivid]">package.json</code>.</li>
                <li>Append a record to <code className="font-mono text-[--accent-vivid]">lib/portal/roadmap-status.ts</code> so <code className="font-mono text-[--accent-vivid]">/portal/about</code> reflects it.</li>
                <li>Update the route map in <code className="font-mono text-[--accent-vivid]">README.md</code>.</li>
              </ol>
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Adding a card variant</p>
              <ol className="list-decimal list-inside text-xs text-[--text-secondary] space-y-1 leading-relaxed">
                <li>Wrap in <code className="font-mono text-[--accent-vivid]">DashboardCard</code>. Never roll a new container.</li>
                <li>If the card hosts an agent, set both <code className="font-mono text-[--accent-vivid]">agentId</code> and <code className="font-mono text-[--accent-vivid]">agentState</code>.</li>
                <li>Tokens only — no hex values. Charts use <code className="font-mono text-[--accent-vivid]">--chart-1</code> through <code className="font-mono text-[--accent-vivid]">--chart-6</code>.</li>
              </ol>
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Adding a repository write path</p>
              <ol className="list-decimal list-inside text-xs text-[--text-secondary] space-y-1 leading-relaxed">
                <li>Add the method signature to <code className="font-mono text-[--accent-vivid]">lib/portal/repositories/types.ts</code>.</li>
                <li>Implement in <code className="font-mono text-[--accent-vivid]">lib/portal/repositories/in-memory.ts</code>. Emit an audit entry and a typed <code className="font-mono text-[--accent-vivid]">PortalEvent</code> atomically.</li>
                <li>Wrap in a server action under <code className="font-mono text-[--accent-vivid]">lib/portal/&lt;feature&gt;-actions.ts</code>. Always check <code className="font-mono text-[--accent-vivid]">canPerform(membership.role, action)</code> first.</li>
                <li>Add a write-path test that asserts both the state change and the emission.</li>
              </ol>
            </div>

            <div className="rounded-[--radius-lg] bg-[--panel-bg] shadow-[var(--shadow-sm)] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[--text-muted]">Adding an agent</p>
              <ol className="list-decimal list-inside text-xs text-[--text-secondary] space-y-1 leading-relaxed">
                <li>Append an <code className="font-mono text-[--accent-vivid]">AgentDefinition</code> to <code className="font-mono text-[--accent-vivid]">lib/portal/agents/registry.ts</code>.</li>
                <li>Pick one archetype (Strategist / Operator / Auditor / Chief of Staff). The agent inherits the archetype's tool surface.</li>
                <li>If the agent needs a new tool, add it to <code className="font-mono text-[--accent-vivid]">tool-catalog.ts</code> under one archetype's surface.</li>
                <li><strong>Add a separation-of-powers test</strong> proving no other archetype can reach it.</li>
              </ol>
            </div>
          </div>

          <div className="mt-4 rounded-[--radius-lg] bg-[--accent-dim] border border-[--border-active] p-4 space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-widest text-[--accent-vivid]">Read these before extending</p>
            <ul className="text-xs text-[--text-secondary] space-y-0.5">
              <li>· <code className="font-mono text-[--text-primary]">AGENTS.md</code> — binding chassis rules</li>
              <li>· <code className="font-mono text-[--text-primary]">docs/client-portal-target-architecture.md</code> — domain + surfaces</li>
              <li>· <code className="font-mono text-[--text-primary]">docs/client-portal-roadmap.md</code> — phase ordering + launch posture</li>
              <li>· <code className="font-mono text-[--text-primary]">docs/pre-launch-plan.md</code> — what to attack this quarter</li>
            </ul>
          </div>
        </ShowcaseSection>

        <div className="py-10 text-center">
          <p className="text-xs text-[--text-muted]">
            Web Chassis Component Showcase — All components use design tokens only. No hardcoded hex values.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/dashboard"><Button variant="accent" size="sm">Open Dashboard</Button></Link>
            <Link href="/analytics"><Button variant="outline" size="sm">Analytics</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
