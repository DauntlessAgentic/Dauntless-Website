"use client";
import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmActionProps {
  /** The trigger button or element. */
  children: React.ReactNode;
  /** Title of the confirmation dialog. */
  title: string;
  /** One or two sentences describing what will happen. Plain language. */
  description: string;
  /** Bulleted list of concrete side effects. Each is one short sentence. */
  effects: string[];
  /** Label of the confirm button. Default "Confirm". */
  confirmLabel?: string;
  /** Variant of the confirm button. Default "primary". */
  confirmVariant?: "primary" | "secondary" | "destructive";
  /** Called when the user confirms. */
  onConfirm: () => void | Promise<void>;
  /** Optional asChild to wrap the trigger element. */
  asChild?: boolean;
}

/**
 * Confirmation modal for destructive or system-visible actions.
 * Advisory-board action #22: Marie's "show me what this button does
 * without doing it" affordance. Use for: commit outbound action,
 * freeze workspace, sign export, promote to canonical, disable
 * connector.
 */
export function ConfirmAction({
  children,
  title,
  description,
  effects,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  onConfirm,
  asChild = true,
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handle = async () => {
    setPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  // Audit-3 §H3: the side-effects list is the safety-critical content.
  // Wire it into the dialog's accessible description via aria-describedby
  // so SR users hear the bullets, not just the one-sentence summary.
  const effectsId = React.useId();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
      <DialogContent className="max-w-md" aria-describedby={effectsId}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div id={effectsId} className="text-xs text-[--text-secondary] leading-snug space-y-2">
          <p className="font-semibold text-[--text-primary]">Here's exactly what will happen:</p>
          <ul className="list-disc pl-5 space-y-1">
            {effects.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant === "destructive" ? "destructive" : confirmVariant}
            size="sm"
            onClick={handle}
            disabled={pending}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
