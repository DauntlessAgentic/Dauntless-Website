"use client";
import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/cn";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    color?: "accent" | "info" | "success" | "warning" | "danger";
  }
>(({ className, value, color = "accent", ...props }, ref) => {
  const colorMap = {
    accent: "bg-[--accent-bright]",
    info: "bg-[--info]",
    success: "bg-[--success]",
    warning: "bg-[--warning]",
    danger: "bg-[--danger]",
  };
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-[--elevated-2]", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn("h-full transition-all duration-[--duration-slow] ease-out", colorMap[color])}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = "Progress";

export { Progress };
