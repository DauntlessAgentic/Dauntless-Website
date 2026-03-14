"use client";
import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, Cell,
} from "recharts";

interface BarChartVizProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  bars: Array<{ key: string; color: string; label?: string }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-[--border-strong] bg-[--elevated-2] px-2.5 py-2 shadow-[--shadow-md]">
      <p className="text-[10px] text-[--text-muted] mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.fill || entry.color }} />
          <span className="text-[--text-secondary]">{entry.name}:</span>
          <span className="font-medium tabular-nums text-[--text-primary]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function BarChartViz({ data, xKey, bars }: BarChartVizProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }} barSize={12}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey={xKey} tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false} axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false} axisLine={false}
        />
        <ReTooltip content={<CustomTooltip />} cursor={{ fill: "var(--elevated)", opacity: 0.5 }} />
        {bars.map((bar) => (
          <Bar key={bar.key} dataKey={bar.key} name={bar.label || bar.key} fill={bar.color} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
