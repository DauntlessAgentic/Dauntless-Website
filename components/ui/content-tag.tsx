import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/**
 * ContentTag — compact semantic tag pill for labeling content items.
 *
 * Inspired by SitDeck's inline classification chips (e.g. "OSINT GL",
 * "Military & Defense"). Denser and bolder than Badge — no border,
 * uppercase by default, designed for tight feed/table/list contexts.
 *
 * Usage:
 *   <ContentTag variant="info">OSINT GL</ContentTag>
 *   <ContentTag variant="warning" dot>Military & Defense</ContentTag>
 *   <ContentTag variant="danger" dot>High Severity</ContentTag>
 *   <ContentTag variant="accent">Active</ContentTag>
 */
const contentTagVariants = cva(
  [
    "inline-flex items-center gap-1",
    "px-1.5 py-0.5",
    "rounded-[--radius-sm]",
    "text-[9px] font-bold uppercase tracking-wide leading-none",
    "whitespace-nowrap select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:  "bg-[--elevated-2] text-[--text-muted]",
        accent:   "bg-[--accent-dim] text-[--accent-vivid]",
        info:     "bg-[--info-dim] text-[--info]",
        success:  "bg-[--success-dim] text-[--success]",
        warning:  "bg-[--warning-dim] text-[--warning]",
        danger:   "bg-[--danger-dim] text-[--danger]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

const DOT_COLORS: Record<string, string> = {
  default: "bg-[--text-muted]",
  accent:  "bg-[--accent-vivid]",
  info:    "bg-[--info]",
  success: "bg-[--success]",
  warning: "bg-[--warning]",
  danger:  "bg-[--danger]",
};

export interface ContentTagProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof contentTagVariants> {
  /** Show a small status dot before the label */
  dot?: boolean;
}

function ContentTag({ className, variant = "default", dot, children, ...props }: ContentTagProps) {
  return (
    <span className={cn(contentTagVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1 w-1 rounded-full shrink-0",
            DOT_COLORS[variant ?? "default"],
          )}
        />
      )}
      {children}
    </span>
  );
}

export { ContentTag, contentTagVariants };
