import Link from "next/link";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { type Stage } from "@/sanity/schemas/stages";
import { StageMixBar } from "@/components/stage-mix-bar";
import { InitialsChip } from "@/components/initials-chip";
import { FilterChips, FilterSelect } from "@/components/filter-chips";
import { JobsGantt } from "@/components/jobs-gantt";
import { ViewToggle } from "@/components/view-toggle";
import { PageHeader } from "@/components/shell/panels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JobCard = {
  _id: string;
  title: string;
  status: "open" | "closed";
  createdAt: string;
  companyName: string | null;
  companyId: string | null;
  applications: { stage: Stage; stageUpdatedAt: string }[];
};

const JOBS_QUERY = `*[_type == "job" && orgId == $orgId] | order(createdAt desc) {
  _id,
  title,
  status,
  createdAt,
  "companyName": company->name,
  "companyId": company->_id,
  "applications": *[_type == "application" && orgId == $orgId && job._ref == ^._id]{ stage, stageUpdatedAt }
}`;

/** Same drift rule as the board cards: >14 days sitting in a live stage. */
function isStale(application: { stage: Stage; stageUpdatedAt: string }) {
  if (application.stage === "hired" || application.stage === "rejected") {
    return false;
  }
  const elapsed = Date.now() - new Date(application.stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000)) > 14;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string | string[];
    company?: string | string[];
    view?: string | string[];
  }>;
}) {
  const { orgId } = await requireOrg();
  const params = await searchParams;
  const status = (Array.isArray(params.status) ? params.status[0] : params.status) ?? "";
  const company = (Array.isArray(params.company) ? params.company[0] : params.company) ?? "";
  const view = (Array.isArray(params.view) ? params.view[0] : params.view) ?? "grid";

  const allJobs = await readClient.fetch<JobCard[]>(JOBS_QUERY, { orgId });

  const companyOptions = [
    ...new Map(
      allJobs
        .filter((job) => job.companyId && job.companyName)
        .map((job) => [job.companyId!, job.companyName!]),
    ).entries(),
  ]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));

  const jobs = allJobs.filter(
    (job) =>
      (!status || job.status === status) &&
      (!company || job.companyId === company),
  );

  const openCount = allJobs.filter((job) => job.status === "open").length;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <PageHeader
        title="Jobs"
        description={
          jobs.length > 0
            ? `${openCount} open ${openCount === 1 ? "role" : "roles"} across your clients`
            : "Open roles across your client companies"
        }
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/jobs/new" />}
          >
            Add job
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
        <FilterChips
          param="status"
          options={[
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
          ]}
        />
        <div className="flex items-center gap-2">
          <ViewToggle
            defaultValue="grid"
            options={[
              { value: "grid", label: "Grid view", icon: "grid" },
              { value: "timeline", label: "Timeline view", icon: "timeline" },
            ]}
          />
          <FilterSelect
            param="company"
            options={companyOptions}
            placeholder="All companies"
          />
          <span className="text-muted-foreground font-mono text-xs tabular-nums whitespace-nowrap">
            {jobs.length} shown
          </span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No jobs yet — open your first role.
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/jobs/new" />}
          >
            Add job
          </Button>
        </div>
      ) : view === "timeline" ? (
        <JobsGantt jobs={jobs} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jobs.map((job) => {
            const stageCounts: Partial<Record<Stage, number>> = {};
            for (const application of job.applications) {
              stageCounts[application.stage] =
                (stageCounts[application.stage] ?? 0) + 1;
            }
            const applicationCount = job.applications.length;
            const staleCount = job.applications.filter(isStale).length;

            const closed = job.status === "closed";

            return (
              <div
                key={job._id}
                className={cn(
                  "group hover:border-foreground/20 hover:bg-muted/30 relative rounded-lg border px-4 py-3.5 transition-colors",
                  closed && "opacity-60",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <InitialsChip
                    name={job.companyName ?? job.title}
                    size="sm"
                  />
                  <h2 className="min-w-0 flex-1 truncate text-[13px] leading-snug font-semibold">
                    <Link
                      href={`/dashboard/jobs/${job._id}`}
                      className="after:absolute after:inset-0"
                    >
                      {job.title}
                    </Link>
                  </h2>
                  <span
                    aria-label={closed ? "Closed" : "Open"}
                    title={closed ? "Closed" : "Open"}
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      closed ? "bg-foreground/25" : "bg-stage-hired",
                    )}
                  />
                </div>

                <p className="text-muted-foreground mt-1.5 truncate pl-[34px] text-xs">
                  {job.companyName ?? "No company"}
                  <span className="text-muted-foreground/50"> · </span>
                  {applicationCount === 0
                    ? "No candidates yet"
                    : `${applicationCount} in pipeline`}
                  {staleCount > 0 ? (
                    <>
                      <span className="text-muted-foreground/50"> · </span>
                      <span className="text-stage-offer font-medium tabular-nums">
                        {staleCount} stale
                      </span>
                    </>
                  ) : null}
                </p>

                {applicationCount > 0 && !closed ? (
                  <div className="mt-2.5 pl-[34px]">
                    <StageMixBar
                      counts={stageCounts}
                      className="h-1 max-w-40 gap-px opacity-70"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
