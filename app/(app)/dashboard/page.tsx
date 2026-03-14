"use client";
import React from "react";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { KpiTile } from "@/components/patterns/kpi-tile";
import { FeedPanel } from "@/components/patterns/feed-panel";
import { SummaryCard } from "@/components/patterns/summary-card";
import { DataTable, defaultTableColumns } from "@/components/patterns/data-table";
import { LineChartViz } from "@/components/viz/line-chart";
import { DonutChartViz } from "@/components/viz/donut-chart";
import { Button } from "@/components/ui/button";
import {
  kpiData, timeSeriesData, donutData, feedItems,
  tableData, summaryContent,
} from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Web Chassis"
        title="Dashboard"
        badge="Live"
        badgeVariant="success"
        description="Overview of key metrics and activity"
        actions={
          <>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiData.map((kpi, i) => (
            <DashboardCard key={i} id={`kpi-${i}`} title={kpi.label} eyebrow="METRIC">
              <KpiTile
                label={kpi.label} value={kpi.value}
                trend={kpi.trend} trendValue={kpi.trendValue}
                trendLabel={kpi.trendLabel} status={kpi.status}
              />
            </DashboardCard>
          ))}
        </div>

        {/* Chart + feed row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 h-64">
            <DashboardCard id="chart-1" title="Activity Over Time" eyebrow="TIMESERIES"
              subtitle="Last 24 hours" bodyClassName="p-2">
              <LineChartViz data={timeSeriesData} xKey="time"
                lines={[
                  { key: "value",     color: "var(--chart-1)", label: "Sessions" },
                  { key: "secondary", color: "var(--chart-2)", label: "Tasks" },
                ]} />
            </DashboardCard>
          </div>
          <div className="h-64">
            <DashboardCard id="feed-1" title="Activity Feed" eyebrow="LIVE">
              <FeedPanel items={feedItems} />
            </DashboardCard>
          </div>
        </div>

        {/* Table + donut + summary row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 h-72">
            <DashboardCard id="table-1" title="Work Items" eyebrow="TABLE"
              subtitle={`${tableData.length} items`}>
              <DataTable data={tableData} columns={defaultTableColumns}
                searchPlaceholder="Filter work items…" />
            </DashboardCard>
          </div>
          <div className="flex flex-col gap-3">
            <div className="h-48">
              <DashboardCard id="donut-1" title="Resolution Status" eyebrow="DISTRIBUTION">
                <DonutChartViz data={donutData} />
              </DashboardCard>
            </div>
            <div className="flex-1">
              <DashboardCard id="summ-1" title="Summary" eyebrow="NOTES">
                <SummaryCard title={summaryContent.title} content={summaryContent.content}
                  updated={summaryContent.updated} tags={summaryContent.tags} />
              </DashboardCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
