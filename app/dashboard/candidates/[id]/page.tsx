import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { archiveCandidate } from "@/lib/actions/candidates";
import { type Stage } from "@/sanity/schemas/stages";
import { StagePill } from "@/components/stage-rail";
import { InitialsChip } from "@/components/initials-chip";
import { LogInterviewModal } from "@/components/candidates/log-interview-form";
import { RecordOfferDialog } from "@/components/offers/record-offer-dialog";
import { Section, FieldRow } from "@/components/shell/panels";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CandidateDoc = {
  _id: string;
  name: string;
  email?: string;
  headline?: string;
  avatarUrl?: string;
  skills?: string[];
  cvText?: string;
  source?: string;
  archived?: boolean;
  createdAt: string;
};

type ApplicationRow = {
  _id: string;
  stage: Stage;
  appliedAt: string;
  stageUpdatedAt: string | null;
  offerAmount: string | null;
  offerSentAt: string | null;
  offerNote: string | null;
  job: {
    _id: string;
    title: string;
    orgId: string;
    companyName: string | null;
  } | null;
};

type InterviewRow = {
  _id: string;
  roundName: string;
  scheduledAt?: string;
  interviewer?: string;
  feedbackText?: string;
  outcome?: "pending" | "pass" | "fail";
};

const SOURCE_LABELS: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  "job-board": "Job board",
  outreach: "Outreach",
  other: "Other",
};

const OUTCOME_LABELS: Record<string, string> = {
  pending: "Pending",
  pass: "Pass",
  fail: "Fail",
};

/** Soft tinted outcome pills, consistent with StagePill hues. */
const OUTCOME_BADGE: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  pass: "bg-green-500/10 text-green-700 dark:text-green-300",
  fail: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Whole days an application has sat in its current stage. */
function daysInStage(iso: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000),
  );
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

export default async function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireOrg();
  const { id } = await params;

  const [candidate, applications, interviews] = await Promise.all([
    readClient.fetch<CandidateDoc | null>(
      `*[_type == "candidate" && _id == $id && orgId == $orgId][0]{
        _id, name, email, headline, avatarUrl, skills, cvText, source, archived, createdAt
      }`,
      { id, orgId },
    ),
    readClient.fetch<ApplicationRow[]>(
      `*[_type == "application" && orgId == $orgId && candidate._ref == $id]
        | order(appliedAt desc){
          _id, stage, appliedAt, stageUpdatedAt,
          offerAmount, offerSentAt, offerNote,
          "job": job->{ _id, title, orgId, "companyName": company->name }
        }`,
      { id, orgId },
    ),
    readClient.fetch<InterviewRow[]>(
      `*[_type == "interview" && orgId == $orgId && application->candidate._ref == $id]
        | order(scheduledAt desc){
          _id, roundName, scheduledAt, interviewer, feedbackText, outcome
        }`,
      { id, orgId },
    ),
  ]);

  if (!candidate) notFound();

  const ownedApplications = applications.filter(
    (application) => application.job && application.job.orgId === orgId,
  );

  return (
    <div className="pt-5">
      <Link
        href="/dashboard/candidates"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to candidates
      </Link>

      {/* Flat record header — no card box */}
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <InitialsChip
            name={candidate.name}
            src={candidate.avatarUrl}
            size="lg"
            className="mt-1"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                {candidate.name}
              </h1>
              {candidate.archived ? (
                <Badge variant="outline">Archived</Badge>
              ) : null}
            </div>
            {candidate.headline ? (
              <p className="text-muted-foreground mt-1 max-w-xl text-[13px] sm:text-sm">
                {candidate.headline}
              </p>
            ) : null}
            <div className="text-muted-foreground/80 mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
              {candidate.email ? (
                <>
                  <a
                    href={`mailto:${candidate.email}`}
                    className="hover:text-foreground underline underline-offset-2"
                  >
                    {candidate.email}
                  </a>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              {candidate.source ? (
                <>
                  <span>
                    {SOURCE_LABELS[candidate.source] ?? candidate.source}
                  </span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <span>Added {formatDate(candidate.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LogInterviewModal
            candidateId={candidate._id}
            applications={ownedApplications.map((application) => ({
              id: application._id,
              jobTitle: application.job!.title,
            }))}
          />
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/dashboard/candidates/${candidate._id}/edit`} />}
          >
            Edit
          </Button>
          {!candidate.archived && (
            <form action={archiveCandidate.bind(null, candidate._id)}>
              <SubmitButton variant="outline">Archive</SubmitButton>
            </form>
          )}
        </div>
      </div>

      {/* Skills chips row */}
      {(candidate.skills?.length ?? 0) > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills!.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {/* Record body — one vertical divider between main and rail */}
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main zone */}
        <div className="min-w-0">
          {/* Applications lead the record — where this person is, right now */}
          <Section title="Applications" count={ownedApplications.length}>
            {ownedApplications.length === 0 ? (
              <p className="text-muted-foreground border-t py-4 text-[13px]">
                Not in any pipeline yet — add them to a role from the job page.
              </p>
            ) : (
              <div className="divide-y border-t">
                {ownedApplications.map((application) => {
                  const inStage = daysInStage(
                    application.stageUpdatedAt ?? application.appliedAt,
                  );
                  return (
                    <div
                      key={application._id}
                      className="hover:bg-muted/40 relative flex cursor-pointer items-center gap-3 py-3 transition-colors"
                    >
                      <InitialsChip
                        name={
                          application.job!.companyName ?? application.job!.title
                        }
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/dashboard/jobs/${application.job!._id}`}
                          className="block truncate text-[13px] font-medium hover:underline after:absolute after:inset-0"
                        >
                          {application.job!.title}
                        </Link>
                        <p className="text-muted-foreground truncate text-xs">
                          {application.job!.companyName ?? "—"}
                          <span className="text-muted-foreground/50"> · </span>
                          applied {timeAgo(application.appliedAt)}
                          {application.offerAmount ? (
                            <>
                              <span className="text-muted-foreground/50"> · </span>
                              <span className="text-stage-offer font-mono font-medium tabular-nums">
                                {application.offerAmount}
                              </span>{" "}
                              {application.stage === "hired"
                                ? "accepted"
                                : `offered${application.offerSentAt ? ` ${timeAgo(application.offerSentAt)}` : ""}`}
                            </>
                          ) : null}
                        </p>
                      </div>
                      {["interviewing", "offer", "hired"].includes(
                        application.stage,
                      ) ? (
                        <RecordOfferDialog
                          applicationId={application._id}
                          candidateName={candidate.name}
                          existingAmount={application.offerAmount}
                          existingNote={application.offerNote}
                        />
                      ) : null}
                      <StagePill
                        stage={application.stage}
                        className="shrink-0"
                      />
                      <span
                        className={cn(
                          "w-20 shrink-0 text-right font-mono text-xs tabular-nums",
                          inStage > 14 &&
                            application.stage !== "hired" &&
                            application.stage !== "rejected"
                            ? "text-stage-offer"
                            : "text-muted-foreground",
                        )}
                      >
                        {inStage}d in stage
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Profile" className="mt-8">
            {candidate.cvText ? (
              <div className="max-h-96 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                {candidate.cvText}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No CV on file yet.
              </p>
            )}
          </Section>

          <Section title="Interviews" count={interviews.length} className="mt-8">
            {interviews.length === 0 ? (
              <p className="text-muted-foreground py-4 text-[13px]">
                No interviews logged yet — the first debrief starts this
                candidate&apos;s record.
              </p>
            ) : (
              <div className="divide-y border-t">
                {interviews.map((interview) => {
                  const outcome = interview.outcome ?? "pending";
                  return (
                    <div key={interview._id} className="py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[13px] font-semibold">
                          {interview.roundName}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium",
                            OUTCOME_BADGE[outcome] ?? OUTCOME_BADGE.pending,
                          )}
                        >
                          {OUTCOME_LABELS[outcome] ?? outcome}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                        {interview.interviewer ? (
                          <span>{interview.interviewer}</span>
                        ) : null}
                        <span className="font-mono text-xs tabular-nums">
                          {interview.scheduledAt
                            ? formatDateTime(interview.scheduledAt)
                            : "Not scheduled"}
                        </span>
                      </p>
                      {interview.feedbackText ? (
                        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
                          {interview.feedbackText}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </Section>

        </div>

        {/* Details rail */}
        <div className="lg:border-l lg:pl-6">
          <Section title="Details">
            <FieldRow label="Email">
              {candidate.email ? (
                <a
                  href={`mailto:${candidate.email}`}
                  className="break-all hover:underline"
                >
                  {candidate.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldRow>
            <FieldRow label="Source">
              {candidate.source ? (
                (SOURCE_LABELS[candidate.source] ?? candidate.source)
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </FieldRow>
            <FieldRow label="Added">
              <span className="font-mono text-xs tabular-nums">
                {formatDate(candidate.createdAt)}
              </span>
            </FieldRow>
          </Section>

        </div>
      </div>
    </div>
  );
}
