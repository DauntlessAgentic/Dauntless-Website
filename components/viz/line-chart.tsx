"use client";
import React from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip, Legend,
} from "recharts";

interface LineChartCardProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  lines: Array<{ key: string; color: string; label?: string }>;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-[--border-strong] bg-[--elevated-2] px-2.5 py-2 shadow-[--shadow-md]">
      <p className="text-[10px] text-[--text-muted] mb-1.5 font-mono">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-[--text-secondary]">{entry.name || entry.dataKey}:</span>
          <span className="font-medium tabular-nums text-[--text-primary]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function LineChartViz({ data, xKey, lines }: LineChartCardProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey={xKey} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono-code)" }}
          tickLine={false} axisLine={false} interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono-code)" }}
          tickLine={false} axisLine={false}
        />
        <ReTooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
        {lines.map((line) => (
          <Line
            key={line.key} dataKey={line.key} name={line.label || line.key}
            stroke={line.color} strokeWidth={1.5} dot={false}
            activeDot={{ r: 3, fill: line.color, strokeWidth: 0 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
