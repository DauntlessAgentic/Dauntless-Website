"use client";
import React from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as ReTooltip,
} from "recharts";

interface AreaChartVizProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  areas: Array<{ key: string; color: string; label?: string }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-[--border-strong] bg-[--elevated-2] px-2.5 py-2 shadow-[--shadow-md]">
      <p className="text-[10px] text-[--text-muted] mb-1.5 font-mono">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: entry.stroke }} />
          <span className="text-[--text-secondary]">{entry.name}:</span>
          <span className="font-medium tabular-nums text-[--text-primary]">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AreaChartViz({ data, xKey, areas }: AreaChartVizProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
        <defs>
          {areas.map((area) => (
            <linearGradient key={area.key} id={`grad-${area.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={area.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={area.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis
          dataKey={xKey} tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono-code)" }}
          tickLine={false} axisLine={false} interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "var(--text-muted)" }}
          tickLine={false} axisLine={false}
        />
        <ReTooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
        {areas.map((area) => (
          <Area
            key={area.key} type="monotone" dataKey={area.key} name={area.label || area.key}
            stroke={area.color} strokeWidth={1.5}
            fill={`url(#grad-${area.key})`}
            dot={false} activeDot={{ r: 3, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
