"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Tooltip as ReTooltip,
} from "recharts";
import { cn } from "@/lib/cn";

interface RadarData {
  subject: string;
  A: number;
  B?: number;
}

interface RadarPanelProps {
  data: RadarData[];
  className?: string;
  showSweep?: boolean;
}

export function RadarPanel({ data, className, showSweep = true }: RadarPanelProps) {
  return (
    <div className={cn("relative h-full flex flex-col", className)}>
      {/* Background radar rings decoration */}
      {showSweep && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-[inherit]">
          <div className="relative h-32 w-32 opacity-10">
            {[1, 0.67, 0.33].map((scale, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border border-[--accent]"
                style={{ transform: `scale(${scale})`, margin: "auto", top: 0, right: 0, bottom: 0, left: 0 }}
              />
            ))}
            {/* Sweep line */}
            <div
              className="absolute inset-0 rounded-full overflow-hidden animate-radar"
              style={{ transformOrigin: "center" }}
            >
              <div
                className="absolute left-1/2 top-0 bottom-1/2 w-[1px]"
                style={{
                  background: "linear-gradient(to top, var(--accent), transparent)",
                  transformOrigin: "bottom center",
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <PolarGrid
            stroke="var(--border-subtle)"
            radialLines={true}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 10, fill: "var(--text-muted)", fontFamily: "var(--font-mono-code)" }}
          />
          <PolarRadiusAxis
            angle={90} domain={[0, 100]}
            tick={{ fontSize: 9, fill: "var(--text-muted)" }}
            tickCount={4}
            axisLine={false}
          />
          <Radar
            name="Primary" dataKey="A"
            stroke="var(--accent-bright)" fill="var(--accent)"
            fillOpacity={0.15} strokeWidth={1.5}
          />
          {data[0]?.B !== undefined && (
            <Radar
              name="Secondary" dataKey="B"
              stroke="var(--info)" fill="var(--info)"
              fillOpacity={0.08} strokeWidth={1} strokeDasharray="4 2"
            />
          )}
          <ReTooltip
            contentStyle={{
              background: "var(--elevated-2)",
              border: "1px solid var(--border-strong)",
              borderRadius: "6px",
              fontSize: "11px",
              color: "var(--text-primary)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
