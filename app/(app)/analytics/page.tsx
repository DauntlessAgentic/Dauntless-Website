"use client";
import React, { useState } from "react";
import { Download, Filter, Calendar } from "lucide-react";
import { WorkspaceHeader } from "@/components/shell/workspace-header";
import { DashboardCard } from "@/components/cards/dashboard-card";
import { LineChartViz } from "@/components/viz/line-chart";
import { BarChartViz } from "@/components/viz/bar-chart";
import { AreaChartViz } from "@/components/viz/area-chart";
import { DonutChartViz } from "@/components/viz/donut-chart";
import { DataTable, defaultTableColumns } from "@/components/patterns/data-table";
import { KpiTile } from "@/components/patterns/kpi-tile";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { timeSeriesData, barData, donutData, tableData, kpiData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7d");

  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader
        eyebrow="Reporting"
        title="Analytics"
        description="Performance metrics and trend analysis"
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-28 h-7">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-auto p-4 space-y-4 pb-20 md:pb-4">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiData.map((kpi, i) => (
            <DashboardCard key={i} id={`kpi-a${i}`} title={kpi.label} eyebrow="METRIC">
              <KpiTile label={kpi.label} value={kpi.value}
                trend={kpi.trend} trendValue={kpi.trendValue}
                trendLabel={kpi.trendLabel} status={kpi.status} />
            </DashboardCard>
          ))}
        </div>

        {/* Area chart + donut */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 h-64">
            <DashboardCard id="area-1" title="Volume Trend" eyebrow="TIMESERIES"
              subtitle="Sessions & tasks, 24h" bodyClassName="p-2">
              <AreaChartViz data={timeSeriesData} xKey="time"
                areas={[
                  { key: "value",     color: "var(--chart-1)", label: "Sessions" },
                  { key: "secondary", color: "var(--chart-2)", label: "Tasks" },
                ]} />
            </DashboardCard>
          </div>
          <div className="h-64">
            <DashboardCard id="donut-1" title="Resolution Status" eyebrow="DISTRIBUTION">
              <div className="flex flex-col h-full">
                <div className="flex-1 min-h-0">
                  <DonutChartViz data={donutData} />
                </div>
                <div className="px-3 pb-2 flex flex-wrap gap-2 shrink-0">
                  {donutData.map(d => (
                    <div key={d.name} className="flex items-center gap-1 text-[10px]">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-[--text-muted]">{d.name}: {d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>

        {/* Bar + line row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-56">
            <DashboardCard id="bar-1" title="Category Breakdown" eyebrow="BAR CHART" bodyClassName="p-2">
              <BarChartViz data={barData} xKey="name"
                bars={[
                  { key: "value",     color: "var(--chart-1)", label: "Primary" },
                  { key: "secondary", color: "var(--chart-2)", label: "Secondary" },
                ]} />
            </DashboardCard>
          </div>
          <div className="h-56">
            <DashboardCard id="line-2" title="Trend Comparison" eyebrow="LINE CHART" bodyClassName="p-2">
              <LineChartViz data={timeSeriesData.slice(0, 12)} xKey="time"
                lines={[
                  { key: "value",     color: "var(--chart-3)", label: "Current" },
                  { key: "secondary", color: "var(--chart-4)", label: "Prior period" },
                ]} />
            </DashboardCard>
          </div>
        </div>

        {/* Table */}
        <div className="h-72">
          <DashboardCard id="table-a" title="Detailed Records" eyebrow="TABLE"
            subtitle={`${tableData.length} items`}>
            <DataTable data={tableData} columns={defaultTableColumns}
              searchPlaceholder="Search records…" />
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
