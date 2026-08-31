import { STAGES, type Stage } from "@/sanity/schemas/stages";
import { STAGE_BG } from "@/components/stage-rail";
import { cn } from "@/lib/utils";

export function StageMixBar({
  counts,
  className,
}: {
  counts: Partial<Record<Stage, number>>;
  className?: string;
}) {
  const total = STAGES.reduce((sum, stage) => sum + (counts[stage] ?? 0), 0);
  if (total === 0) {
    return (
      <div
        className={cn("bg-muted h-1.5 w-full rounded-full", className)}
        aria-label="No applications yet"
      />
    );
  }
  return (
    <div
      className={cn(
        "flex h-1.5 w-full overflow-hidden rounded-full",
        className,
      )}
      aria-label={`${total} applications across stages`}
    >
      {STAGES.map((stage) => {
        const count = counts[stage] ?? 0;
        if (count === 0) return null;
        return (
          <span
            key={stage}
            className={cn("h-full", STAGE_BG[stage])}
            style={{ width: `${(count / total) * 100}%` }}
          />
        );
      })}
    </div>
  );
}
