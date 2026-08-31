"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function askVetra(text: string) {
  window.dispatchEvent(new CustomEvent("vetra:ask", { detail: { text } }));
}

export function AskButton({
  prompt,
  children,
  className,
}: {
  prompt: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        "border-foreground/25 text-foreground hover:text-foreground",
        className,
      )}
      onClick={() => askVetra(prompt)}
    >
      <Sparkles className="size-3.5" />
      {children}
    </Button>
  );
}

export function AskChip({
  prompt,
  className,
}: {
  prompt: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => askVetra(prompt)}
      className={cn(
        "bg-muted text-foreground/90 hover:text-foreground cursor-pointer rounded-md px-2 py-1 text-left font-mono text-[11px] transition-colors",
        className,
      )}
    >
      {prompt}
    </button>
  );
}
