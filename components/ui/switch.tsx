"use client";
import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/cn";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-5 w-9 items-center rounded-full",
      "border border-[--border-default] bg-[--elevated]",
      "transition-colors duration-[--duration-fast] cursor-pointer",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-bright]",
      "data-[state=checked]:bg-[--accent] data-[state=checked]:border-[--border-active]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "block h-3.5 w-3.5 rounded-full bg-[--text-muted]",
        "transition-transform duration-[--duration-fast]",
        "translate-x-0.5 data-[state=checked]:translate-x-[18px]",
        "data-[state=checked]:bg-white",
        "shadow-sm"
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
