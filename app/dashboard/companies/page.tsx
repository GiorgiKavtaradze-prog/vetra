import Link from "next/link";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { type Stage } from "@/sanity/schemas/stages";
import { FilterSelect } from "@/components/filter-chips";
import { LedgerRows, type LedgerRow } from "@/components/ledger/ledger-rows";
import { AskButton } from "@/components/today/ask-vetra";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;

type AppRow = {
  stage: Stage;
  stageUpdatedAt: string | null;
  candidateName: string | null;
  candidateId: string | null;
};

type CompanyRow = {
  _id: string;
  name: string;
  industry: string | null;
  openJobs: {
    _id: string;
    title: string;
    createdAt: string;
    salaryRange: string | null;
    apps: { stage: Stage; stageUpdatedAt: string | null }[];
  }[];
  apps: AppRow[];
};

const LEDGER_QUERY = `*[_type == "company" && orgId == $orgId] | order(name asc) {
  _id, name, industry,
  "openJobs": *[_type == "job" && orgId == $orgId && company._ref == ^._id && status == "open"] | order(createdAt asc) {
    _id, title, createdAt, salaryRange,
    "apps": *[_type == "application" && orgId == $orgId && job._ref == ^._id]{ stage, stageUpdatedAt }
  },
  "apps": *[_type == "application" && orgId == $orgId && job->company._ref == ^._id] | order(stageUpdatedAt desc) {
    stage, stageUpdatedAt,
    "candidateName": candidate->name,
    "candidateId": candidate->_id
  }
}`;

const LIVE: Stage[] = ["applied", "screening", "interviewing", "offer"];

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY));
}

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

const MOVE_TEXT: Record<Stage, string> = {
  applied: "applied.",
  screening: "entered screening.",
  interviewing: "moved to interviewing.",
  offer: "received an offer.",
  hired: "accepted — placed.",
  rejected: "came out of the running.",
};

function mixOf(apps: { stage: Stage }[]): Partial<Record<Stage, number>> {
  const mix: Partial<Record<Stage, number>> = {};
  for (const app of apps) mix[app.stage] = (mix[app.stage] ?? 0) + 1;
  return mix;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function searchBlurb(job: CompanyRow["openJobs"][number], apps: AppRow[]): string {
  const jobApps = job.apps;
  const offer = apps.find((app) => app.stage === "offer");
  const offerInJob = jobApps.some((app) => app.stage === "offer");
  if (offerInJob && offer) {
    const d = daysSince(offer.stageUpdatedAt) ?? 0;
    return d > 5
      ? `${offer.candidateName ?? "A candidate"} at offer, ${d} days without a reply.`
      : `Offer out to ${offer.candidateName ?? "a candidate"}.`;
  }
  const past = jobApps.filter((app) =>
    ["interviewing", "offer", "hired"].includes(app.stage),
  ).length;
  const age = daysSince(job.createdAt) ?? 0;
  if (past === 0 && age > 14 && jobApps.length > 0) {
    return "Nobody past screening yet.";
  }
  const stale = jobApps.filter((app) => {
    const d = daysSince(app.stageUpdatedAt);
    return (
      d !== null && d > 14 && !["hired", "rejected"].includes(app.stage)
    );
  }).length;
  if (stale > 0) return `${stale} sitting stale — worth a nudge.`;
  const interviewing = jobApps.filter((a) => a.stage === "interviewing").length;
  const screening = jobApps.filter((a) => a.stage === "screening").length;
  if (jobApps.length === 0) return "No candidates yet — needs sourcing.";
  return `${interviewing} interviewing, ${screening} in screening.`;
}

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ industry?: string | string[] }>;
}) {
  const { orgId, has } = await requireOrg();
  const params = await searchParams;
  const industry =
    (Array.isArray(params.industry) ? params.industry[0] : params.industry) ??
    "";

  const companies = await readClient.fetch<CompanyRow[]>(LEDGER_QUERY, {
    orgId,
  });
  const aiAllowed = has({ feature: "ai_agent" });

  const industryOptions = [
    ...new Set(companies.map((c) => c.industry).filter(Boolean) as string[]),
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value }));

  const shown = industry
    ? companies.filter((c) => c.industry === industry)
    : companies;

  const rows: LedgerRow[] = shown.map((company) => {
    const liveApps = company.apps.filter((app) => LIVE.includes(app.stage));
    const lastSpokeDays = company.apps.length
      ? Math.min(
          ...company.apps.map((app) => daysSince(app.stageUpdatedAt) ?? 9999),
        )
      : null;

    const offerApp = liveApps.find((app) => app.stage === "offer");
    const offerDays = offerApp ? (daysSince(offerApp.stageUpdatedAt) ?? 0) : 0;
    const recentHire = company.apps.find(
      (app) => app.stage === "hired" && (daysSince(app.stageUpdatedAt) ?? 99) <= 7,
    );
    const dormant = company.openJobs.length === 0 && liveApps.length === 0;

    const promise: LedgerRow["promise"] = dormant
      ? { label: "Dormant", tone: "muted" }
      : recentHire
        ? { label: "Offer accepted", tone: "good" }
        : offerApp && offerDays > 5
          ? { label: "Offer chasing reply", tone: "danger" }
          : lastSpokeDays !== null && lastSpokeDays > 10
            ? { label: "Needs an update", tone: "danger" }
            : lastSpokeDays !== null && lastSpokeDays > 6
              ? { label: "Going quiet", tone: "warn" }
              : offerApp
                ? { label: "Offer out, deciding", tone: "muted" }
                : { label: "On track", tone: "muted" };

    return {
      id: company._id,
      name: company.name,
      industry: company.industry,
      rolesOpen: company.openJobs.length,
      inPlay: liveApps.length,
      mix: mixOf(company.apps),
      lastSpokeDays,
      promise,
      searches: company.openJobs.map((job) => ({
        id: job._id,
        title: job.title,
        ageDays: daysSince(job.createdAt) ?? 0,
        salaryRange: job.salaryRange,
        inPlay: job.apps.filter((app) => LIVE.includes(app.stage)).length,
        mix: mixOf(job.apps),
        blurb: searchBlurb(job, company.apps),
      })),
      activity: company.apps.slice(0, 4).map((app) => ({
        date: shortDate(app.stageUpdatedAt),
        name: app.candidateName ?? "A candidate",
        text: MOVE_TEXT[app.stage],
        candidateId: app.candidateId,
      })),
      engagement: [
        {
          label: "Placed with them",
          value: String(company.apps.filter((a) => a.stage === "hired").length),
          mono: true,
        },
        { label: "Live candidates", value: String(liveApps.length), mono: true },
        {
          label: "Median days in stage",
          value: String(
            median(
              liveApps
                .map((app) => daysSince(app.stageUpdatedAt))
                .filter((d): d is number => d !== null),
            ),
          ),
          mono: true,
        },
        {
          label: "Longest-open role",
          value: company.openJobs.length
            ? `${Math.max(...company.openJobs.map((job) => daysSince(job.createdAt) ?? 0))} days`
            : "—",
          mono: true,
        },
      ],
    };
  });

  const inPlayTotal = rows.reduce((sum, row) => sum + row.inPlay, 0);
  const placedTotal = shown.reduce(
    (sum, company) =>
      sum + company.apps.filter((app) => app.stage === "hired").length,
    0,
  );
  const medianDays = median(
    shown
      .flatMap((company) => company.apps)
      .filter((app) => LIVE.includes(app.stage))
      .map((app) => daysSince(app.stageUpdatedAt))
      .filter((d): d is number => d !== null),
  );
  const quietCount = rows.filter(
    (row) => row.lastSpokeDays !== null && row.lastSpokeDays > 6,
  ).length;
  const liveEngagements = rows.filter((row) => row.rolesOpen > 0).length;

  return (
    <div className="flex flex-col pb-4 pt-5">
      {/* ── Ledger header: the desk's totals in the display face ── */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight">
            Ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-[13px]">
            {liveEngagements} live engagement{liveEngagements === 1 ? "" : "s"}.
            {quietCount > 0
              ? ` ${quietCount} client${quietCount === 1 ? " has" : "s have"} not heard from you in over a week.`
              : " Every client has heard from you this week."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-x-7 gap-y-3">
          {[
            { label: "In play", value: inPlayTotal },
            { label: "Placed", value: placedTotal },
            { label: "Median days in stage", value: medianDays },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-muted-foreground text-[11px]">{stat.label}</p>
              <p className="font-display mt-0.5 text-2xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </p>
            </div>
          ))}
          {aiAllowed ? (
            <AskButton prompt="Draft this week's client updates — for each client with movement in the last 7 days, a short update I can edit and send.">
              Draft this week&apos;s updates
            </AskButton>
          ) : null}
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/companies/new" />}
          >
            Add client
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pb-2">
        <FilterSelect
          param="industry"
          options={industryOptions}
          placeholder="All industries"
        />
        <span className="text-muted-foreground font-mono text-xs tabular-nums whitespace-nowrap">
          {rows.length} client{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {rows.length === 0 ? (
        <div
          className={cn(
            "flex flex-col items-center gap-3 border-t px-6 py-14 text-center",
          )}
        >
          <p className="text-muted-foreground text-[13px]">
            {industry
              ? "No clients match this industry."
              : "No clients yet — add the first company you recruit for."}
          </p>
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link
                href={
                  industry ? "/dashboard/companies" : "/dashboard/companies/new"
                }
              />
            }
          >
            {industry ? "Clear filter" : "Add client"}
          </Button>
        </div>
      ) : (
        <LedgerRows rows={rows} aiAllowed={aiAllowed} />
      )}
    </div>
  );
}
