import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

interface KpiTileProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  trendLabel?: string;
  status?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const statusStyles = {
  default: { value: "text-[--text-primary]", indicator: "" },
  success: { value: "text-[--success]", indicator: "bg-[--success]" },
  warning: { value: "text-[--warning]", indicator: "bg-[--warning]" },
  danger:  { value: "text-[--danger]",  indicator: "bg-[--danger]" },
  info:    { value: "text-[--info]",    indicator: "bg-[--info]" },
};

const trendConfig = {
  up:   { icon: TrendingUp,   color: "text-[--success]" },
  down: { icon: TrendingDown, color: "text-[--danger]" },
  flat: { icon: Minus,        color: "text-[--text-muted]" },
};

export function KpiTile({
  label, value, unit, trend, trendValue, trendLabel,
  status = "default", className,
}: KpiTileProps) {
  const styles = statusStyles[status];
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <div className={cn("flex flex-col gap-1 p-3 h-full", className)}>
      <div className="flex items-center gap-1.5">
        {status !== "default" && (
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", styles.indicator)} />
        )}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[--text-muted] truncate">
          {label}
        </p>
      </div>

      <div className="flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold tabular-nums leading-none", styles.value)}>
          {value}
        </span>
        {unit && <span className="text-xs text-[--text-muted]">{unit}</span>}
      </div>

      {(trend || trendValue) && (
        <div className="flex items-center gap-1 mt-auto">
          {TrendIcon && trend && (
            <TrendIcon className={cn("h-3 w-3", trendConfig[trend].color)} />
          )}
          {trendValue && (
            <span className={cn("text-xs font-medium", trend ? trendConfig[trend].color : "text-[--text-muted]")}>
              {trendValue}
            </span>
          )}
          {trendLabel && (
            <span className="text-[10px] text-[--text-muted]">{trendLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
