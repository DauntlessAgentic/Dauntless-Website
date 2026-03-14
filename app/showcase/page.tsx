"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import {
  Settings, Search, Bell, Bot, Cpu, LayoutGrid, ArrowLeft,
  Zap, Info, AlertTriangle, Check, X,
} from "lucide-react";
import { kpiData, timeSeriesData, barData, donutData, feedItems, summaryContent, tableData } from "@/lib/mock-data";

const SECTION_CLASSES = "space-y-4";
const LABEL_CLASSES = "text-[10px] font-bold uppercase tracking-widest text-[--text-muted] mb-3 block";

function ShowcaseSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="py-10 border-b border-[--border-subtle]">
      <h2 className="text-base font-semibold text-[--text-primary] mb-6">{title}</h2>
      {children}
    </section>
  );
}

function TokenSwatch({ name, value, type }: { name: string; value: string; type: "color" | "text" | "border" }) {
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
        <p className="text-[10px] text-[--text-muted] font-mono">{value}</p>
      </div>
    </div>
  );
}


export default function ShowcasePage() {
  const [sw, setSw] = useState(false);

  return (
    <div className="min-h-screen bg-[--app-bg]">
      {/* Nav bar */}
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

        {/* Badges */}
        <ShowcaseSection id="badges" title="Badges">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </ShowcaseSection>

        {/* Inputs */}
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
        </ShowcaseSection>

        {/* Skeletons */}
        <ShowcaseSection id="skeletons" title="Loading States">
          <div className="space-y-2 max-w-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </ShowcaseSection>

        {/* Empty state */}
        <ShowcaseSection id="empty" title="Empty States">
          <div className="border border-[--border-subtle] rounded-[--radius-lg] bg-[--panel-bg]">
            <EmptyState
              icon={<Bot className="h-5 w-5" />}
              title="No agents running"
              description="Dispatch an agent to begin processing tasks"
              action={<Button variant="accent" size="sm"><Zap className="h-3.5 w-3.5 mr-1.5" />Start Agent</Button>}
            />
          </div>
        </ShowcaseSection>

        {/* KPI tiles */}
        <ShowcaseSection id="kpi" title="KPI Tiles">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {kpiData.map((k) => (
              <div key={k.id} className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg]">
                <KpiTile {...k} />
              </div>
            ))}
          </div>
        </ShowcaseSection>

        {/* Charts */}
        <ShowcaseSection id="charts" title="Visualization Components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] p-3 h-52">
              <span className={LABEL_CLASSES}>Line Chart</span>
              <div className="h-36">
                <LineChartViz data={timeSeriesData.slice(0, 12)} xKey="time"
                  lines={[{ key: "value", color: "var(--chart-1)", label: "Sessions" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] p-3 h-52">
              <span className={LABEL_CLASSES}>Bar Chart</span>
              <div className="h-36">
                <BarChartViz data={barData} xKey="name"
                  bars={[{ key: "value", color: "var(--chart-1)", label: "Value" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] p-3 h-52">
              <span className={LABEL_CLASSES}>Area Chart</span>
              <div className="h-36">
                <AreaChartViz data={timeSeriesData.slice(0, 12)} xKey="time"
                  areas={[{ key: "value", color: "var(--chart-1)", label: "Sessions" }]} />
              </div>
            </div>
            <div className="rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] p-3 h-52">
              <span className={LABEL_CLASSES}>Donut Chart</span>
              <div className="h-36">
                <DonutChartViz data={donutData} innerRadius={40} outerRadius={60} />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Cards */}
        <ShowcaseSection id="cards" title="Card System">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["idle","active","thinking","blocked","complete"] as const).map(state => (
              <div key={state} className="h-24">
                <DashboardCard id={`demo-${state}`} title={`Agent Card — ${state}`} eyebrow="AGENT" agentState={state} agentId="demo">
                  <div className="flex items-center justify-center h-full text-xs text-[--text-muted]">
                    Agent state: <span className="ml-1 font-mono text-[--text-secondary]">{state}</span>
                  </div>
                </DashboardCard>
              </div>
            ))}
          </div>
        </ShowcaseSection>

        {/* Data table */}
        <ShowcaseSection id="table" title="Data Table">
          <div className="h-72 rounded-[--radius-lg] border border-[--border-default] bg-[--panel-bg] overflow-hidden">
            <DataTable data={tableData.slice(0, 8)} columns={defaultTableColumns} />
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
