import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { PageHeader } from "@/components/shell/panels";
import { STAGE_BG } from "@/components/stage-rail";
import { InitialsChip } from "@/components/initials-chip";
import {
  TodayQueue,
  type PeekData,
  type QueueGroup,
  type QueueItem,
} from "@/components/today/today-queue";
import { AskChip } from "@/components/today/ask-vetra";
import { Button } from "@/components/ui/button";
import { type Stage } from "@/sanity/schemas/stages";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

type AppRow = {
  _id: string;
  stage: Stage;
  stageUpdatedAt: string | null;
  appliedAt: string | null;
  candidateId: string | null;
  candidateName: string | null;
  candidateSource: string | null;
  candidateAvatarUrl: string | null;
  offerAmount: string | null;
  jobId: string | null;
  jobTitle: string | null;
  companyName: string | null;
};

type InterviewRow = {
  roundName: string;
  scheduledAt: string;
  outcome: "pending" | "pass" | "fail";
  feedbackText: string | null;
  appId: string;
};

type OpenJobRow = {
  _id: string;
  title: string;
  createdAt: string;
  companyName: string | null;
  total: number;
  past: number;
};

const SOURCE_LABELS: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  "job-board": "Job board",
  outreach: "Outreach",
  other: "Other",
};

function daysSince(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
}

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function timeLabel(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(":00", "")
    .replace(" ", "")
    .toLowerCase();
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export default async function TodayPage() {
  const { orgId, has } = await requireOrg();
  const aiAllowed = has({ feature: "ai_agent" });

  const [apps, interviews, openJobs] = await Promise.all([
    readClient.fetch<AppRow[]>(
      `*[_type == "application" && orgId == $orgId]{
        _id, stage, stageUpdatedAt, appliedAt,
        "candidateId": candidate->_id,
        "candidateName": candidate->name,
        "candidateSource": candidate->source,
        "candidateAvatarUrl": candidate->avatarUrl,
        offerAmount,
        "jobId": job->_id,
        "jobTitle": job->title,
        "companyName": job->company->name
      }`,
      { orgId },
    ),
    readClient.fetch<InterviewRow[]>(
      `*[_type == "interview" && orgId == $orgId]{
        roundName, scheduledAt, outcome, feedbackText,
        "appId": application._ref
      }`,
      { orgId },
    ),
    readClient.fetch<OpenJobRow[]>(
      `*[_type == "job" && orgId == $orgId && status == "open"]{
        _id, title, createdAt,
        "companyName": company->name,
        "total": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id]),
        "past": count(*[_type == "application" && orgId == $orgId && job._ref == ^._id && stage in ["interviewing", "offer", "hired"]])
      }`,
      { orgId },
    ),
  ]);

  const interviewsByApp = new Map<string, InterviewRow[]>();
  for (const interview of interviews) {
    const list = interviewsByApp.get(interview.appId) ?? [];
    list.push(interview);
    interviewsByApp.set(interview.appId, list);
  }
  for (const list of interviewsByApp.values()) {
    list.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
  }

  function peekFor(
    app: AppRow,
    title: string | null,
    body: string | null,
  ): PeekData {
    const ivs = interviewsByApp.get(app._id) ?? [];
    return {
      candidateId: app.candidateId ?? "",
      name: app.candidateName ?? "Unknown candidate",
      avatarUrl: app.candidateAvatarUrl,
      stage: app.stage,

      daysInStage: daysSince(app.stageUpdatedAt ?? app.appliedAt),
      role: app.jobTitle ?? "Untitled role",
      client: app.companyName ?? "—",
      daysInPipeline: daysSince(app.appliedAt ?? app.stageUpdatedAt),
      source: app.candidateSource
        ? (SOURCE_LABELS[app.candidateSource] ?? app.candidateSource)
        : null,
      offerAmount: app.offerAmount,
      blockedTitle: title,
      blockedBody: body,
      interviews: ivs.slice(0, 4).map((iv) => ({
        roundName: iv.roundName,
        outcome: iv.outcome,
        date: shortDate(iv.scheduledAt),
        feedback: iv.feedbackText,
      })),
    };
  }

  const overdue: QueueItem[] = [];
  const dueToday: QueueItem[] = [];
  const waiting: QueueItem[] = [];
  let unreadCvRows = 0;

  const live = apps.filter(
    (app) => app.stage !== "hired" && app.stage !== "rejected",
  );

  for (const app of apps) {
    const d = daysSince(app.stageUpdatedAt ?? app.appliedAt);
    const name = app.candidateName ?? "Unknown candidate";
    const sub = `${app.jobTitle ?? "Untitled role"} · ${app.companyName ?? "—"}`;
    const href = app.candidateId
      ? `/dashboard/candidates/${app.candidateId}`
      : "/dashboard/candidates";
    const ivs = interviewsByApp.get(app._id) ?? [];
    const lastDone = ivs.find((iv) => new Date(iv.scheduledAt) <= new Date());
    const todayIv = ivs.find((iv) => isToday(iv.scheduledAt));
    const futureIv = ivs.find(
      (iv) => new Date(iv.scheduledAt) > new Date() && !isToday(iv.scheduledAt),
    );
    const debriefMissing =
      lastDone &&
      lastDone.outcome === "pending" &&
      !lastDone.feedbackText &&
      daysSince(lastDone.scheduledAt) >= 2;

    const base = {
      kind: "application" as const,
      name,
      sub,
      stage: app.stage,
      href,
      avatarUrl: app.candidateAvatarUrl,
    };

    if (app.stage === "offer" && d >= 5) {
      const reason = `${app.offerAmount ? `${app.offerAmount} offer` : "Offer"} out ${d} days with no decision logged.`;
      overdue.push({
        ...base,
        id: app._id,
        reason,
        actionLabel: "Chase offer",
        ageLabel: `${d}d`,
        ageTone: "danger",
        peek: peekFor(
          app,
          `Blocked ${d} days`,
          `${reason} The client is waiting on an answer before the role can close.`,
        ),
      });
    } else if (app.stage === "interviewing" && debriefMissing) {
      const dd = daysSince(lastDone.scheduledAt);
      const reason = `${lastDone.roundName} ran ${dd} day${dd === 1 ? "" : "s"} ago — no debrief on file.`;
      overdue.push({
        ...base,
        id: app._id,
        reason,
        actionLabel: "Log debrief",
        ageLabel: `${dd}d`,
        ageTone: "danger",
        peek: peekFor(
          app,
          `Blocked ${dd} days`,
          `${reason} The client can't decide until the feedback lands.`,
        ),
      });
    } else if (app.stage === "screening" && d > 14) {
      const reason = `${d} days in screening — decide or release.`;
      overdue.push({
        ...base,
        id: app._id,
        reason,
        actionLabel: "Review",
        ageLabel: `${d}d`,
        ageTone: "danger",
        peek: peekFor(app, `Blocked ${d} days`, `${reason}`),
      });
    } else if (todayIv) {
      const reason = `${todayIv.roundName} today at ${timeLabel(todayIv.scheduledAt)}.`;
      dueToday.push({
        ...base,
        id: app._id,
        reason,
        actionLabel: "Prep brief",
        ageLabel: timeLabel(todayIv.scheduledAt),
        ageTone: "muted",
        peek: peekFor(app, "Due today", reason),
      });
    } else if (app.stage === "applied" && d <= 7 && unreadCvRows < 4) {
      unreadCvRows++;
      const reason = `Applied ${d === 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`} — CV on file, unread.`;
      dueToday.push({
        ...base,
        id: app._id,
        reason,
        actionLabel: "Screen CV",
        ageLabel: `${d}d`,
        ageTone: "muted",
        peek: peekFor(app, "Due today", reason),
      });
    } else if (app.stage === "offer") {
      waiting.push({
        ...base,
        id: app._id,
        reason: `${app.offerAmount ?? "Offer"} out — candidate deciding.`,
        actionLabel: "",
        ageLabel: `${d}d`,
        ageTone: "muted",
        peek: peekFor(app, null, null),
      });
    } else if (app.stage === "interviewing" && futureIv) {
      waiting.push({
        ...base,
        id: app._id,
        reason: `${futureIv.roundName} scheduled for ${shortDate(futureIv.scheduledAt)}.`,
        actionLabel: "",
        ageLabel: `${d}d`,
        ageTone: "muted",
        peek: peekFor(app, null, null),
      });
    } else if (app.stage === "hired" && d <= 10) {
      waiting.push({
        ...base,
        id: app._id,
        reason: "Placed — confirming start date.",
        actionLabel: "",
        ageLabel: `${d}d`,
        ageTone: "muted",
        peek: peekFor(app, null, null),
      });
    } else if (app.stage === "screening" && d >= 3) {
      waiting.push({
        ...base,
        id: app._id,
        reason: "With the client for review.",
        actionLabel: "",
        ageLabel: `${d}d`,
        ageTone: "muted",
        peek: peekFor(app, null, null),
      });
    }
  }

  for (const job of openJobs) {
    const age = daysSince(job.createdAt);
    if (age > 14 && job.total > 0 && job.past === 0) {
      overdue.push({
        id: job._id,
        kind: "job",
        name: job.title,
        sub: job.companyName ?? "—",
        stage: null,
        reason: `Opened ${age} days ago — nobody past screening yet.`,
        actionLabel: "Open role",
        href: `/dashboard/jobs/${job._id}`,
        ageLabel: `${age}d`,
        ageTone: "danger",
        peek: null,
      });
    }
  }

  const thinJob = [...openJobs].sort((a, b) => a.total - b.total)[0];
  if (aiAllowed && thinJob && thinJob.total < 4) {
    dueToday.push({
      id: `ai-${thinJob._id}`,
      kind: "ai",
      name: thinJob.title,
      sub: thinJob.companyName ?? "—",
      stage: null,
      reason:
        "Ask Vetra to shortlist matches for this brief from your existing pool.",
      actionLabel: "Review matches",
      href: `/dashboard/jobs/${thinJob._id}`,
      ageLabel: "",
      ageTone: "muted",
      ask: `Who are the strongest matches for ${thinJob.title}?`,
      peek: null,
    });
  }

  overdue.sort((a, b) => parseInt(b.ageLabel) - parseInt(a.ageLabel) || 0);
  const waitingShown = waiting.slice(0, 6);

  const groups: QueueGroup[] = [
    {
      key: "overdue",
      label: "Overdue",
      hint: "Client is waiting on you",
      dotClass: "bg-rose-600",
      count: overdue.length,
      muted: false,
      items: overdue,
    },
    {
      key: "today",
      label: "Due today",
      hint: null,
      dotClass: "bg-foreground/60",
      count: dueToday.length,
      muted: false,
      items: dueToday,
    },
    {
      key: "waiting",
      label: "Waiting on someone else",
      hint: "Nothing for you to do yet",
      dotClass: "bg-muted-foreground/40",
      count: waiting.length,
      muted: true,
      items: waitingShown,
    },
  ].filter((group) => group.items.length > 0);

  const needAction = overdue.length + dueToday.length;

  const stageCount = (stage: Stage) =>
    apps.filter((app) => app.stage === stage).length;
  const counts = {
    applied: stageCount("applied"),
    screening: stageCount("screening"),
    interviewing: stageCount("interviewing"),
    offer: stageCount("offer"),
  };
  const maxCount = Math.max(1, ...Object.values(counts));
  const hired = stageCount("hired");
  const pastScreening = counts.interviewing + counts.offer + hired;
  const screenConv =
    counts.screening + pastScreening > 0
      ? Math.round((pastScreening / (counts.screening + pastScreening)) * 100)
      : 0;
  const offerConv =
    counts.interviewing + counts.offer + hired > 0
      ? Math.round(
          ((counts.offer + hired) /
            (counts.interviewing + counts.offer + hired)) *
            100,
        )
      : 0;

  const weekMoves = apps.filter(
    (app) => app.stageUpdatedAt && daysSince(app.stageUpdatedAt) < 7,
  ).length;
  const weekDebriefs = interviews.filter(
    (iv) =>
      iv.feedbackText &&
      daysSince(iv.scheduledAt) < 7 &&
      new Date(iv.scheduledAt) <= new Date(),
  ).length;
  const wentStale = live.filter((app) => {
    const d = daysSince(app.stageUpdatedAt ?? app.appliedAt);
    return d > 14 && d <= 21;
  }).length;

  const lastTouchByClient = new Map<string, number>();
  for (const app of apps) {
    if (!app.companyName) continue;
    const d = daysSince(app.stageUpdatedAt ?? app.appliedAt);
    const current = lastTouchByClient.get(app.companyName);
    if (current === undefined || d < current) {
      lastTouchByClient.set(app.companyName, d);
    }
  }
  const clientsToUpdate = [...lastTouchByClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const railStages = [
    { key: "applied" as const, label: "Applied" },
    { key: "screening" as const, label: "Screening" },
    { key: "interviewing" as const, label: "Interviewing" },
    { key: "offer" as const, label: "Offer" },
  ];

  return (
    <div className="flex flex-col pb-4">
      <PageHeader
        title="Today"
        description={
          needAction > 0
            ? `${needAction} thing${needAction === 1 ? "" : "s"} need${needAction === 1 ? "s" : ""} you — in the order they'll hurt.`
            : "Your queue, in the order it will hurt if ignored."
        }
        actions={
          <div className="flex items-center gap-2.5">
            <span className="text-muted-foreground font-mono text-xs tabular-nums whitespace-nowrap">
              {needAction} to clear · {waiting.length} waiting
            </span>
            <span className="bg-muted flex h-1 w-16 overflow-hidden rounded-full">
              <span
                className="bg-foreground/70"
                style={{
                  width: `${Math.round((waiting.length / Math.max(1, needAction + waiting.length)) * 100)}%`,
                }}
              />
            </span>
          </div>
        }
      />
      <div className="@container mt-3">
        <div className="grid grid-cols-1 gap-8 @5xl:grid-cols-[minmax(0,1fr)_296px] @5xl:gap-0">
          <div className="min-w-0 @5xl:pr-6">
            {needAction === 0 ? (
              <div className="border-t px-1 py-14">
                <p className="text-[15px] font-semibold">Nothing is overdue.</p>
                <p className="text-muted-foreground mt-2 max-w-md text-[13px] leading-relaxed">
                  {waiting.length > 0
                    ? `${waiting.length} thing${waiting.length === 1 ? " is" : "s are"} with clients or candidates. The queue refills as work ages — so the honest next move is putting more people in.`
                    : "The queue refills as work ages — so the honest next move is putting more people in."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    nativeButton={false}
                    render={<Link href="/dashboard/candidates/new" />}
                  >
                    Add a candidate
                  </Button>
                  {aiAllowed && thinJob ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-ai/35 text-ai hover:text-ai"
                      nativeButton={false}
                      render={<Link href={`/dashboard/jobs/${thinJob._id}`} />}
                    >
                      <Sparkles className="size-3.5" />
                      Source for an open role
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/dashboard/jobs" />}
                  >
                    Open the roles
                  </Button>
                </div>
                {groups.length > 0 ? (
                  <div className="mt-10">
                    <TodayQueue groups={groups} aiAllowed={aiAllowed} />
                  </div>
                ) : null}
              </div>
            ) : (
              <TodayQueue groups={groups} aiAllowed={aiAllowed} />
            )}
          </div>
          <aside className="@5xl:border-l @5xl:pl-6">
            <div className="border-b pb-5">
              <p className="text-muted-foreground font-mono text-[10px] tracking-[0.14em] uppercase">
                Pipeline
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {railStages.map((stage) => (
                  <div key={stage.key} className="flex items-center gap-2.5">
                    <span className="text-muted-foreground w-18.5 shrink-0 text-xs">
                      {stage.label}
                    </span>
                    <span className="bg-muted flex h-1.5 flex-1 overflow-hidden rounded-full">
                      <span
                        className={cn("rounded-full", STAGE_BG[stage.key])}
                        style={{
                          width: `${Math.round((counts[stage.key] / maxCount) * 100)}%`,
                        }}
                      />
                    </span>
                    <span className="w-5 shrink-0 text-right font-mono text-xs tabular-nums">
                      {counts[stage.key]}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-1.5 border-t border-dashed pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Screen → interview
                  </span>
                  <span className="font-mono text-xs tabular-nums">
                    {screenConv}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    Interview → offer
                  </span>
                  <span className="font-mono text-xs tabular-nums">
                    {offerConv}%
                  </span>
                </div>
              </div>
            </div>
            <div className="border-b py-5">
              <p className="text-muted-foreground font-mono text-[10px] tracking-[0.14em] uppercase">
                Last 7 days
              </p>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3.5">
                {[
                  { value: weekMoves, label: "stage moves" },
                  { value: weekDebriefs, label: "debriefs logged" },
                  { value: counts.offer, label: "offers out" },
                  {
                    value: wentStale,
                    label: "went stale",
                    warn: wentStale > 0,
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p
                      className={cn(
                        "font-mono text-lg font-medium tabular-nums",
                        stat.warn && "text-stage-offer",
                      )}
                    >
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-[11.5px]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {clientsToUpdate.length > 0 ? (
              <div className="border-b py-5">
                <p className="text-muted-foreground font-mono text-[10px] tracking-[0.14em] uppercase">
                  Clients to update
                </p>
                <div className="mt-2.5 flex flex-col gap-2">
                  {clientsToUpdate.map(([client, d]) => (
                    <div key={client} className="flex items-center gap-2">
                      <InitialsChip name={client} size="sm" />
                      <span className="min-w-0 flex-1 truncate text-[12.5px]">
                        {client}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-[11px] tabular-nums",
                          d > 10
                            ? "text-foreground"
                            : d > 6
                              ? "text-foreground/70"
                              : "text-muted-foreground",
                        )}
                      >
                        {d}d
                      </span>
                    </div>
                  ))}
                </div>
                {aiAllowed ? (
                  <AskChip
                    prompt={`Summarize this week's activity for ${clientsToUpdate[0][0]}`}
                    className="mt-3"
                  />
                ) : null}
              </div>
            ) : null}
            <div className="py-5">
              <div className="border-foreground/15 rounded-lg border p-3">
                <p className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                  <Sparkles className="size-3" />
                  Ask from anywhere
                </p>
                {aiAllowed ? (
                  <>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                      One box for questions and commands — these run for real:
                    </p>
                    <div className="mt-2.5 flex flex-col items-start gap-1.5">
                      <AskChip prompt="Who gave strong system-design answers?" />
                      <AskChip prompt="Which roles are going stale?" />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-relaxed">
                      Ask questions across every CV and debrief your agency has
                      logged — on Pro.
                    </p>
                    <Button
                      size="sm"
                      className="bg-foreground text-background hover:bg-foreground/85 mt-2.5"
                      nativeButton={false}
                      render={<Link href="/dashboard/billing" />}
                    >
                      See plans
                    </Button>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
