import { STAGES, STAGE_LABELS, type Stage } from "@/sanity/schemas/stages";
import { cn } from "@/lib/utils";

export const STAGE_BG: Record<Stage, string> = {
  applied: "bg-stage-applied",
  screening: "bg-stage-screening",
  interviewing: "bg-stage-interviewing",
  offer: "bg-stage-offer",
  hired: "bg-stage-hired",
  rejected: "bg-stage-rejected",
};

export const STAGE_TEXT: Record<Stage, string> = {
  applied: "text-stage-applied",
  screening: "text-stage-screening",
  interviewing: "text-stage-interviewing",
  offer: "text-stage-offer",
  hired: "text-stage-hired",
  rejected: "text-stage-rejected",
};

export const STAGE_PILL: Record<Stage, string> = {
  applied: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  screening: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  interviewing: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  offer: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  hired: "bg-green-500/10 text-green-700 dark:text-green-300",
  rejected: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export function StagePill({
  stage,
  className,
}: {
  stage: Stage;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
        STAGE_PILL[stage],
        className,
      )}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

export function StageRail({
  stage,
  className,
}: {
  stage: Stage;
  className?: string;
}) {
  const idx = STAGES.indexOf(stage);
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-label={`Stage: ${stage}`}
    >
      {STAGES.map((s, i) => (
        <span
          key={s}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === idx
              ? cn("w-4", STAGE_BG[s])
              : i < idx
                ? cn("w-1.5 opacity-40", STAGE_BG[s])
                : "w-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}
