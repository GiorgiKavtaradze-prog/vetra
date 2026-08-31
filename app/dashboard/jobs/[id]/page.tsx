import Link from "next/link";
import { type ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { closeJob, reopenJob } from "@/lib/actions/jobs";
import { type Stage } from "@/sanity/schemas/stages";
import { FilterChips } from "@/components/filter-chips";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { type BoardApplication } from "@/components/kanban/kanban-card";
import {
  AddCandidateModal,
  type AvailableCandidate,
} from "@/components/kanban/add-candidate-modal";
import { SourceCandidatesModal } from "@/components/sourcing/source-candidates-modal";
import { StageMixBar } from "@/components/stage-mix-bar";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type JobDetail = {
  _id: string;
  title: string;
  description: string | null;
  seniority: string | null;
  salaryRange: string | null;
  status: "open" | "closed";
  companyName: string | null;
  companyId: string | null;
};

const JOB_QUERY = `*[_type == "job" && _id == $id && orgId == $orgId][0]{
  _id,
  title,
  description,
  seniority,
  salaryRange,
  status,
  "companyName": company->name,
  "companyId": company->_id
}`;

/** Same embedding scorer as sourcing, but over the candidates already on this board. */
const BOARD_SCORES_QUERY = `*[
  _type == "candidate" &&
  orgId == $orgId &&
  count(*[_type == "application" && orgId == $orgId && job._ref == $jobId && candidate._ref == ^._id]) > 0
] | score(text::semanticSimilarity($queryText)) | order(_score desc) { _id, _score }`;

const APPLICATIONS_QUERY = `*[_type == "application" && orgId == $orgId && job._ref == $jobId] | order(stageUpdatedAt desc) {
  _id,
  stage,
  stageUpdatedAt,
  "candidateId": candidate->_id,
  "candidateName": candidate->name,
  "candidateHeadline": candidate->headline,
  "candidateAvatarUrl": candidate->avatarUrl,
  offerAmount,
  offerNote
}`;

const AVAILABLE_CANDIDATES_QUERY = `*[
  _type == "candidate" &&
  orgId == $orgId &&
  archived != true &&
  count(*[_type == "application" && orgId == $orgId && job._ref == $jobId && candidate._ref == ^._id]) == 0
] | order(createdAt desc) { _id, name, headline, avatarUrl, createdAt }`;

const SENIORITY_LABELS: Record<string, string> = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  staff: "Staff",
  lead: "Lead",
  executive: "Executive",
};

/** Same drift rule as the board cards: >14 days sitting in a live stage. */
function isStale(application: { stage: Stage; stageUpdatedAt: string }) {
  if (application.stage === "hired" || application.stage === "rejected") {
    return false;
  }
  const elapsed = Date.now() - new Date(application.stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000)) > 14;
}

/** Inline stat for the flat strip — hairline-divided, no box. */
function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="px-5 first:pl-0">
      <p className="text-muted-foreground text-[11px] font-medium">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-xl font-semibold tabular-nums",
          accent && "text-stage-offer",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export default async function JobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { view } = await searchParams;
  const { orgId, has } = await requireOrg();

  const [job, applications, availableCandidates] = await Promise.all([
    readClient.fetch<JobDetail | null>(JOB_QUERY, { id, orgId }),
    readClient.fetch<BoardApplication[]>(APPLICATIONS_QUERY, {
      orgId,
      jobId: id,
    }),
    readClient.fetch<AvailableCandidate[]>(AVAILABLE_CANDIDATES_QUERY, {
      orgId,
      jobId: id,
    }),
  ]);

  if (!job) notFound();

  // Match % per card — the sourcing scorer, run over the board's own pool.
  // Contrast-stretched across this pool, so it's a relative "who fits the
  // brief best here", never an absolute grade. Pro-only; fails soft.
  const matchByCandidate = new Map<string, number>();
  if (has({ feature: "ai_agent" }) && applications.length > 0) {
    const queryText = [job.title, job.seniority, job.description]
      .filter(Boolean)
      .join(". ")
      .slice(0, 1200);
    try {
      const scored = await readClient.fetch<{ _id: string; _score: number }[]>(
        BOARD_SCORES_QUERY,
        { orgId, jobId: id, queryText },
      );
      if (scored.length > 0) {
        const max = scored[0]._score;
        const min = scored[scored.length - 1]._score;
        const spread = max - min;
        for (const row of scored) {
          matchByCandidate.set(
            row._id,
            spread > 0
              ? Math.round(35 + 60 * ((row._score - min) / spread))
              : 75,
          );
        }
      }
    } catch {
      // Embeddings unavailable — cards simply render without a match figure.
    }
  }
  const applicationsWithMatch = applications.map((application) => ({
    ...application,
    matchPct: application.candidateId
      ? (matchByCandidate.get(application.candidateId) ?? null)
      : null,
  }));

  const isOpen = job.status === "open";

  // Pipeline summary — all computed from the board data already fetched.
  const stageCounts: Partial<Record<Stage, number>> = {};
  for (const application of applications) {
    stageCounts[application.stage] =
      (stageCounts[application.stage] ?? 0) + 1;
  }
  const staleCount = applications.filter(isStale).length;

  const boardApplications =
    view === "stale"
      ? applicationsWithMatch.filter(isStale)
      : applicationsWithMatch;

  const metaItems: ReactNode[] = [];
  if (job.companyName) {
    metaItems.push(
      job.companyId ? (
        <Link
          key="company"
          href={`/dashboard/companies/${job.companyId}`}
          className="text-foreground font-medium hover:underline"
        >
          {job.companyName}
        </Link>
      ) : (
        <span key="company">{job.companyName}</span>
      ),
    );
  }
  if (job.seniority) {
    metaItems.push(
      <span key="seniority">
        {SENIORITY_LABELS[job.seniority] ?? job.seniority}
      </span>,
    );
  }
  if (job.salaryRange) {
    metaItems.push(<span key="salary">{job.salaryRange}</span>);
  }

  return (
    <div className="flex flex-1 flex-col pt-5">
      <Link
        href="/dashboard/jobs"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to jobs
      </Link>

      {/* Flat record header — no card box */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              {job.title}
            </h1>
            <Badge variant={isOpen ? "secondary" : "outline"}>
              {isOpen ? "Open" : "Closed"}
            </Badge>
          </div>
          {metaItems.length > 0 ? (
            <div className="text-muted-foreground/80 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
              {metaItems.flatMap((item, index) =>
                index === 0
                  ? [item]
                  : [
                      <span key={`sep-${index}`} aria-hidden>
                        ·
                      </span>,
                      item,
                    ],
              )}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isOpen ? (
            <>
              <SourceCandidatesModal jobId={job._id} />
              <AddCandidateModal
                jobId={job._id}
                candidates={availableCandidates}
              />
            </>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/dashboard/jobs/${job._id}/edit`} />}
          >
            Edit
          </Button>
          <form action={isOpen ? closeJob.bind(null, job._id) : reopenJob.bind(null, job._id)}>
            <SubmitButton size="sm" variant="outline">
              {isOpen ? "Close job" : "Reopen job"}
            </SubmitButton>
          </form>
        </div>
      </div>

      {/* Stat strip — one inline row, hairline dividers, pipeline mix at the end */}
      <div className="mt-6 flex flex-wrap items-stretch gap-y-3 divide-x">
        <Stat label="Total applications" value={applications.length} />
        <Stat label="Interviewing" value={stageCounts.interviewing ?? 0} />
        <Stat label="Offers" value={stageCounts.offer ?? 0} />
        <Stat label="Stale" value={staleCount} accent={staleCount > 0} />
        <div className="flex min-w-56 flex-1 flex-col justify-center px-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-muted-foreground text-[11px] font-medium">
              Pipeline mix
            </p>
            <p className="text-muted-foreground font-mono text-[11px] tabular-nums">
              {applications.length} in pipeline
            </p>
          </div>
          <StageMixBar counts={stageCounts} className="mt-2" />
        </div>
      </div>

      <div className="mt-6">
        <FilterChips
          param="view"
          options={[{ value: "stale", label: "Stale only" }]}
          allLabel="All candidates"
        />
      </div>

      <div className="mt-3">
        <KanbanBoard
          initialApplications={boardApplications}
          jobId={job._id}
          readOnly={!isOpen}
        />
      </div>
    </div>
  );
}
