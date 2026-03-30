"use client";
import React from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip,
} from "recharts";

interface DonutChartVizProps {
  data: Array<{ name: string; value: number; color: string }>;
  innerRadius?: number;
  outerRadius?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[6px] border border-[--border-strong] bg-[--elevated-2] px-2.5 py-2 shadow-[--shadow-md]">
      <div className="flex items-center gap-2 text-xs">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: payload[0].payload.color }} />
        <span className="text-[--text-secondary]">{payload[0].name}:</span>
        <span className="font-medium tabular-nums text-[--text-primary]">{payload[0].value}%</span>
      </div>
    </div>
  );
};

export function DonutChartViz({ data, innerRadius = 55, outerRadius = 75 }: DonutChartVizProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={innerRadius} outerRadius={outerRadius}
            dataKey="value" strokeWidth={1} stroke="var(--panel-bg)"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <ReTooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-[--text-primary] tabular-nums">{total}</span>
        <span className="text-xs text-[--text-muted] uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
}
