"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const COLS = [
  { label: "Screening", rail: "bg-foreground/40" },
  { label: "Interviewing", rail: "bg-foreground/60" },
  { label: "Offer", rail: "bg-foreground" },
] as const;

const PHASE_MS = 2200;

const COL_WIDTH = "calc((100% - 1.5rem) / 3)";

export function PipelineFlow() {
  const [tick, setTick] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setTick(1);
      return;
    }
    const t = setInterval(() => setTick((p) => p + 1), PHASE_MS);
    return () => clearInterval(t);
  }, []);

  const phase = tick % 4;
  const cycle = Math.floor(tick / 4);
  const movingCol = phase === 3 ? 2 : phase;
  const staleVisible = phase >= 2 || reduced;

  const movingCard = (
    <div
      className={cn(
        "rounded-lg border bg-card p-2.5 shadow-sm transition-colors duration-500",
        movingCol === 2 && phase !== 3 && "border-foreground/40",
      )}
    >
      <p className="truncate text-xs font-semibold">Priya Raghavan</p>
      <p className="text-muted-foreground truncate text-[10px]">
        Senior React · fintech
      </p>
      <span
        className={cn(
          "text-foreground block text-[9px] font-bold transition-opacity duration-500",
          movingCol === 2 && phase !== 3 ? "opacity-100" : "opacity-0",
        )}
      >
        offer out
      </span>
    </div>
  );

  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="grid grid-cols-3 gap-3">
        {COLS.map((col) => (
          <div key={col.label} className="min-w-0">
            <span className={cn("block h-1 w-full rounded-full", col.rail)} />
            <p className="text-muted-foreground mt-2 mb-2 truncate text-[10px] font-semibold tracking-wider uppercase">
              {col.label}
            </p>
          </div>
        ))}
      </div>
      <div className="relative">
        <div className="grid min-h-26 grid-cols-3 gap-3">
          {COLS.map((col, colIndex) => (
            <div key={col.label} className="flex min-w-0 flex-col gap-2">
              {colIndex === 0 ? (
                <>
                  <div aria-hidden className="invisible">
                    {movingCard}
                  </div>
                  <div className="bg-card rounded-lg border p-2.5 shadow-sm">
                    <p className="truncate text-xs font-semibold">
                      Marcus Bell
                    </p>
                    <p className="text-muted-foreground truncate text-[10px]">
                      Contract React
                    </p>
                    <span
                      className={cn(
                        "text-foreground inline-block text-[9px] font-bold transition-opacity duration-500",
                        staleVisible
                          ? "animate-pulse opacity-100"
                          : "opacity-0",
                      )}
                    >
                      stale 14d — nudge?
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </div>
        <div
          key={cycle}
          className={cn(
            "absolute top-0 transition-[left,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            phase === 0 && "fade-up",
            phase === 3 ? "opacity-0" : "opacity-100",
          )}
          style={{
            width: COL_WIDTH,
            left: `calc(${movingCol} * (${COL_WIDTH} + 0.75rem))`,
          }}
        >
          {movingCard}
        </div>
      </div>
    </div>
  );
}
