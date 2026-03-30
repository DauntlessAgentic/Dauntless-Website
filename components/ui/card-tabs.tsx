"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/cn";

/**
 * CardTabs — compact underline-style tabs for card interiors.
 *
 * Designed to sit at the top of a card body (or just below the header).
 * Uses a thin underline active indicator rather than a pill background,
 * keeping visual weight minimal inside an already-contained card surface.
 *
 * Usage:
 *   <CardTabs defaultValue="all">
 *     <CardTabsList>
 *       <CardTabsTrigger value="all">All</CardTabsTrigger>
 *       <CardTabsTrigger value="active">Active</CardTabsTrigger>
 *     </CardTabsList>
 *     <CardTabsContent value="all">…</CardTabsContent>
 *     <CardTabsContent value="active">…</CardTabsContent>
 *   </CardTabs>
 */
const CardTabs = TabsPrimitive.Root;

const CardTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center border-b border-[--border-subtle]",
      "px-3 shrink-0",
      className
    )}
    {...props}
  />
));
CardTabsList.displayName = "CardTabsList";

const CardTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Layout
      "px-2.5 py-1.5 -mb-px",
      // Typography
      "text-xs font-bold uppercase tracking-widest",
      // Border — the active indicator
      "border-b-2 border-transparent",
      // Colors — inactive
      "text-[--text-muted]",
      // Hover
      "hover:text-[--text-secondary] transition-colors duration-[--duration-fast]",
      // Active state
      "data-[state=active]:text-[--text-primary]",
      "data-[state=active]:border-[--accent-bright]",
      // Focus
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--accent-bright] focus-visible:rounded-[--radius-sm]",
      // Disabled
      "disabled:pointer-events-none disabled:opacity-40",
      className
    )}
    {...props}
  />
));
CardTabsTrigger.displayName = "CardTabsTrigger";

const CardTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "flex-1 min-h-0 overflow-hidden",
      "animate-fade-in",
      "focus-visible:outline-none",
      className
    )}
    {...props}
  />
));
CardTabsContent.displayName = "CardTabsContent";

export { CardTabs, CardTabsList, CardTabsTrigger, CardTabsContent };
