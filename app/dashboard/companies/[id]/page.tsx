import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { STAGES, STAGE_LABELS, type Stage } from "@/sanity/schemas/stages";
import { FilterChips } from "@/components/filter-chips";
import { StagePill, StageRail } from "@/components/stage-rail";
import { InitialsChip } from "@/components/initials-chip";
import { StageMixBar } from "@/components/stage-mix-bar";
import { Section, FieldRow } from "@/components/shell/panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type CompanyDoc = {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  notes?: string;
};

type JobRow = {
  _id: string;
  title: string;
  status: "open" | "closed";
  createdAt: string;
  applicationCount: number;
  stageCounts: Partial<Record<Stage, number>>;
};

type ApplicationRow = {
  _id: string;
  stage: Stage;
  stageUpdatedAt: string;
  candidate: {
    _id: string;
    name: string;
    headline?: string;
    avatarUrl?: string;
    orgId: string;
  } | null;
  job: { _id: string; title: string; orgId: string } | null;
};

const COMPANY_QUERY = `*[_type == "company" && _id == $id && orgId == $orgId][0]{
  _id, name, website, industry, notes
}`;

const JOBS_QUERY = `*[_type == "job" && orgId == $orgId && company._ref == $id]
  | order(createdAt desc){
    _id, title, status, createdAt,
    "applicationCount": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id]),
    "stageCounts": {
      "applied": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "applied"]),
      "screening": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "screening"]),
      "interviewing": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "interviewing"]),
      "offer": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "offer"]),
      "hired": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "hired"]),
      "rejected": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage == "rejected"])
    }
  }`;

const APPLICATIONS_QUERY = `*[_type == "application" && orgId == $orgId && job->company._ref == $id]
  | order(stageUpdatedAt desc)[0...25]{
    _id, stage, stageUpdatedAt,
    "candidate": candidate->{ _id, name, headline, avatarUrl, orgId },
    "job": job->{ _id, title, orgId }
  }`;

function displayUrl(website: string) {
  return website.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

/** "3d ago"-style relative time from an ISO string. */
function timeAgo(iso: string) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 60000),
  );
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { orgId } = await requireOrg();
  const { id } = await params;
  const { stage } = await searchParams;

  const [company, jobs, applications] = await Promise.all([
    readClient.fetch<CompanyDoc | null>(COMPANY_QUERY, { id, orgId }),
    readClient.fetch<JobRow[]>(JOBS_QUERY, { id, orgId }),
    readClient.fetch<ApplicationRow[]>(APPLICATIONS_QUERY, { id, orgId }),
  ]);

  if (!company) notFound();

  const ownedApplications = applications.filter(
    (application) =>
      application.candidate &&
      application.candidate.orgId === orgId &&
      application.job &&
      application.job.orgId === orgId,
  );

  const activeStage =
    typeof stage === "string" && (STAGES as readonly string[]).includes(stage)
      ? (stage as Stage)
      : null;

  const visibleApplications = activeStage
    ? ownedApplications.filter(
        (application) => application.stage === activeStage,
      )
    : ownedApplications;

  return (
    <div className="pt-5">
      <Link
        href="/dashboard/companies"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to companies
      </Link>

      {/* Flat record header — no card box */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <InitialsChip name={company.name} size="lg" className="mt-1" />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {company.name}
            </h1>
            {company.industry || company.website ? (
              <div className="text-muted-foreground/80 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
                {company.industry ? <span>{company.industry}</span> : null}
                {company.industry && company.website ? (
                  <span aria-hidden>·</span>
                ) : null}
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline underline-offset-4"
                  >
                    {displayUrl(company.website)}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={`/dashboard/companies/${company._id}/edit`} />}
          >
            Edit
          </Button>
        </div>
      </div>

      {/* Record body — one vertical divider between main and rail */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main zone */}
        <div className="min-w-0">
          <Section
            title="Candidates in play"
            count={visibleApplications.length}
            action={
              <FilterChips
                param="stage"
                options={STAGES.map((value) => ({
                  value,
                  label: STAGE_LABELS[value],
                }))}
                allLabel="All"
              />
            }
          >
            {ownedApplications.length === 0 ? (
              <p className="text-muted-foreground py-4 text-[13px]">
                No candidates in play yet — add candidates from one of this
                client&apos;s job pages.
              </p>
            ) : visibleApplications.length === 0 ? (
              <p className="text-muted-foreground border-t py-4 text-[13px]">
                No candidates in this stage.
              </p>
            ) : (
              <div className="divide-y border-t">
                {visibleApplications.map((application) => (
                  <div
                    key={application._id}
                    className="hover:bg-muted/40 relative flex cursor-pointer items-center gap-3 py-2.5 text-[13px] transition-colors"
                  >
                    <InitialsChip
                      name={application.candidate!.name}
                      src={application.candidate!.avatarUrl}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <Link
                          href={`/dashboard/candidates/${application.candidate!._id}`}
                          className="text-sm font-medium hover:underline after:absolute after:inset-0"
                        >
                          {application.candidate!.name}
                        </Link>
                        {application.candidate!.headline ? (
                          <span className="text-muted-foreground min-w-0 truncate text-xs">
                            {application.candidate!.headline}
                          </span>
                        ) : null}
                      </div>
                      <Link
                        href={`/dashboard/jobs/${application.job!._id}`}
                        className="text-muted-foreground hover:text-foreground relative z-10 text-xs transition-colors"
                      >
                        {application.job!.title}
                      </Link>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StageRail
                        stage={application.stage}
                        className="hidden sm:flex"
                      />
                      <StagePill stage={application.stage} />
                      <span className="text-muted-foreground font-mono text-xs tabular-nums">
                        {timeAgo(application.stageUpdatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Details rail */}
        <div className="lg:border-l lg:pl-6">
          <Section title="Details">
            <FieldRow label="Industry">
              {company.industry ? (
                company.industry
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldRow>
            <FieldRow label="Website">
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all hover:underline"
                >
                  {displayUrl(company.website)}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldRow>
          </Section>

          <Section title="Notes" className="mt-8">
            {company.notes ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {company.notes}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                No notes for this client yet.
              </p>
            )}
          </Section>

          <Section
            title="Jobs"
            count={jobs.length}
            className="mt-8"
            action={
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/jobs/new" />}
              >
                Add job
              </Button>
            }
          >
            {jobs.length === 0 ? (
              <p className="text-muted-foreground py-4 text-[13px]">
                No jobs for this client yet — open the first role.
              </p>
            ) : (
              <div className="divide-y border-t">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="hover:bg-muted/40 relative cursor-pointer py-2.5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Link
                          href={`/dashboard/jobs/${job._id}`}
                          className="min-w-0 truncate text-[13px] font-medium hover:underline after:absolute after:inset-0"
                        >
                          {job.title}
                        </Link>
                        <Badge
                          variant={
                            job.status === "open" ? "secondary" : "outline"
                          }
                        >
                          {job.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
                        {job.applicationCount}
                      </span>
                    </div>
                    <StageMixBar counts={job.stageCounts} className="mt-2" />
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
