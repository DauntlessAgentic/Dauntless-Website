"use client";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-8 w-full items-center justify-between gap-2 px-3 rounded-[--radius-md]",
      "bg-[--elevated] border border-[--border-default]",
      "text-sm text-[--text-primary] cursor-pointer",
      "transition-colors duration-[--duration-fast]",
      "hover:border-[--border-strong]",
      "focus:outline-none focus:border-[--border-active]",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-3.5 w-3.5 text-[--text-muted] shrink-0" />
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={4}
      className={cn(
        "z-50 min-w-[8rem] p-1 rounded-[--radius-lg]",
        "bg-[--elevated-2] border border-[--border-strong]",
        "shadow-[--shadow-lg] animate-fade-in",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex items-center pl-8 pr-2 py-1.5 rounded-[--radius-sm]",
      "text-sm text-[--text-primary] cursor-pointer select-none outline-none",
      "focus:bg-[--elevated] data-[disabled]:opacity-40 data-[disabled]:pointer-events-none",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-3 w-3 text-[--accent-bright]" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1 text-xs font-medium uppercase tracking-wider text-[--text-muted]", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel };
