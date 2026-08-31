import Link from "next/link";
import { type Stage } from "@/sanity/schemas/stages";
import { hueIndexFor } from "@/components/initials-chip";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

const BAR_HUES = [
  "bg-slate-200/80 text-slate-800",
  "bg-blue-100 text-blue-900",
  "bg-violet-100 text-violet-900",
  "bg-amber-100 text-amber-900",
  "bg-emerald-100 text-emerald-900",
  "bg-rose-100 text-rose-900",
] as const;

type GanttJob = {
  _id: string;
  title: string;
  status: "open" | "closed";
  createdAt: string;
  companyName: string | null;
  applications: { stage: Stage; stageUpdatedAt: string }[];
};

function isStale(application: { stage: Stage; stageUpdatedAt: string }) {
  if (application.stage === "hired" || application.stage === "rejected") {
    return false;
  }
  const elapsed = Date.now() - new Date(application.stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / DAY)) > 14;
}

function tickLabel(time: number) {
  return new Date(time).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function JobsGantt({ jobs }: { jobs: GanttJob[] }) {
  const now = Date.now();

  const rows = jobs
    .map((job) => {
      const start = new Date(job.createdAt).getTime();
      const lastActivity = job.applications.reduce(
        (max, app) => Math.max(max, new Date(app.stageUpdatedAt).getTime()),
        start,
      );
      const end =
        job.status === "closed"
          ? Math.min(Math.max(lastActivity, start + 5 * DAY), now)
          : now;
      return {
        job,
        start,
        end,
        staleCount: job.applications.filter(isStale).length,
      };
    })
    .sort((a, b) => a.start - b.start);

  const minStart = Math.min(...rows.map((row) => row.start));
  const span = Math.max(now - minStart, 14 * DAY);
  const axisStart = minStart - span * 0.03;
  const axisEnd = now + span * 0.06;
  const pct = (time: number) =>
    ((time - axisStart) / (axisEnd - axisStart)) * 100;

  const TICKS = 6;
  const ticks = Array.from(
    { length: TICKS + 1 },
    (_, i) => axisStart + ((axisEnd - axisStart) * i) / TICKS,
  );

  return (
    <div className="relative border-t pt-6">
      <div className="pointer-events-none absolute inset-x-0 top-6 bottom-7">
        {ticks.slice(1, -1).map((tick) => (
          <span
            key={tick}
            style={{ left: `${pct(tick)}%` }}
            className="bg-border/70 absolute inset-y-0 w-px"
            aria-hidden
          />
        ))}
        <span
          style={{ left: `${pct(now)}%` }}
          className="bg-foreground/50 absolute inset-y-0 w-px"
          aria-hidden
        />
      </div>
      <span
        style={{ left: `${pct(now)}%` }}
        className="text-muted-foreground absolute top-1 -translate-x-1/2 font-mono text-[10px] tracking-wide"
      >
        Today
      </span>
      <div className="relative flex flex-col gap-1.5 pb-3">
        {rows.map(({ job, start, end, staleCount }) => {
          const left = Math.min(pct(start), 96);
          const width = Math.max(pct(end) - pct(start), 4);
          const closed = job.status === "closed";
          return (
            <div key={job._id} className="relative h-8">
              <Link
                href={`/dashboard/jobs/${job._id}`}
                title={`${job.title}${job.companyName ? ` — ${job.companyName}` : ""}${closed ? " (closed)" : ""}${staleCount > 0 ? ` · ${staleCount} stale` : ""}`}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  maxWidth: `${100 - left}%`,
                }}
                className={cn(
                  "absolute inset-y-0 flex min-w-28 items-center gap-1.5 rounded-md px-2.5 text-xs transition-[filter] hover:brightness-[0.96]",
                  BAR_HUES[hueIndexFor(job.companyName ?? job.title)],
                  closed && "opacity-55",
                )}
              >
                <span className="truncate font-medium">{job.title}</span>
                {job.companyName ? (
                  <span className="hidden truncate opacity-60 sm:inline">
                    {job.companyName}
                  </span>
                ) : null}
                {staleCount > 0 && !closed ? (
                  <span
                    className="bg-stage-offer ml-auto size-1.5 shrink-0 rounded-full"
                    title={`${staleCount} stale`}
                  />
                ) : null}
              </Link>
            </div>
          );
        })}
      </div>
      <div className="text-muted-foreground relative h-5 font-mono text-[11px] tabular-nums">
        {ticks.map((tick, i) => (
          <span
            key={tick}
            style={{ left: `${pct(tick)}%` }}
            className={cn(
              "absolute whitespace-nowrap",
              i === 0
                ? "translate-x-0"
                : i === ticks.length - 1
                  ? "-translate-x-full"
                  : "-translate-x-1/2",
            )}
          >
            {tickLabel(tick)}
          </span>
        ))}
      </div>
    </div>
  );
}
