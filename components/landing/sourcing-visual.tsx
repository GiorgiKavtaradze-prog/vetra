import { cn } from "@/lib/utils";
import { SOURCING_ROWS } from "@/constants";

export function SourcingVisual() {
  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex flex-col gap-2">
        {SOURCING_ROWS.map((row, i) => (
          <div
            key={row.name}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              i === 0 ? "border-foreground/25 bg-foreground/5" : "bg-card",
            )}
          >
            <span className="font-display w-11 text-base font-bold text-foreground tabular-nums">
              {row.pct}%
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{row.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {row.note}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold",
                i === 0
                  ? "bg-foreground text-background"
                  : "text-muted-foreground border",
              )}
            >
              Add
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
