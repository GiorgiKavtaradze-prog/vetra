import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { type Stage } from "@/sanity/schemas/stages";
import { FilterChips, FilterSelect } from "@/components/filter-chips";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { type BoardApplication } from "@/components/kanban/kanban-card";
import { PageHeader } from "@/components/shell/panels";

/** The whole desk on one board — every live application across every client. */
const FLOOR_QUERY = `*[
  _type == "application" && orgId == $orgId &&
  !(stage in ["hired", "rejected"])
] | order(stageUpdatedAt desc) {
  _id,
  stage,
  stageUpdatedAt,
  "candidateId": candidate->_id,
  "candidateName": candidate->name,
  "candidateAvatarUrl": candidate->avatarUrl,
  offerAmount,
  offerNote,
  "jobTitle": job->title,
  "companyId": job->company->_id,
  "companyName": job->company->name
}`;

type FloorRow = BoardApplication & {
  jobTitle: string | null;
  companyId: string | null;
  companyName: string | null;
};

const LANES: readonly Stage[] = [
  "applied",
  "screening",
  "interviewing",
  "offer",
];

function isStale(application: { stageUpdatedAt: string }) {
  const elapsed = Date.now() - new Date(application.stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000)) > 14;
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[]; company?: string | string[] }>;
}) {
  const { orgId } = await requireOrg();
  const params = await searchParams;
  const view = (Array.isArray(params.view) ? params.view[0] : params.view) ?? "";
  const company =
    (Array.isArray(params.company) ? params.company[0] : params.company) ?? "";

  const all = await readClient.fetch<FloorRow[]>(FLOOR_QUERY, { orgId });

  const companyOptions = [
    ...new Map(
      all
        .filter((row) => row.companyId && row.companyName)
        .map((row) => [row.companyId!, row.companyName!]),
    ).entries(),
  ]
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([value, label]) => ({ value, label }));

  const filtered = all.filter(
    (row) =>
      (!company || row.companyId === company) &&
      (view !== "stale" || isStale(row)),
  );

  // Cross-job board: the card's context line is the role · client, not the CV headline.
  const applications: BoardApplication[] = filtered.map((row) => ({
    _id: row._id,
    stage: row.stage,
    stageUpdatedAt: row.stageUpdatedAt,
    candidateId: row.candidateId,
    candidateName: row.candidateName,
    candidateAvatarUrl: row.candidateAvatarUrl,
    offerAmount: row.offerAmount,
    offerNote: row.offerNote,
    candidateHeadline: [row.jobTitle, row.companyName]
      .filter(Boolean)
      .join(" · "),
  }));

  const staleCount = all.filter(isStale).length;

  return (
    <div className="flex flex-1 flex-col pb-4">
      <PageHeader
        title="Pipeline"
        description={`${all.length} in play across every client${staleCount > 0 ? ` · ${staleCount} stalled` : ""} — drag to move stages.`}
      />

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pb-3">
        <FilterChips
          param="view"
          options={[{ value: "stale", label: "Stale only" }]}
          allLabel="All candidates"
        />
        <div className="flex items-center gap-2">
          <FilterSelect
            param="company"
            options={companyOptions}
            placeholder="All clients"
          />
          <span className="text-muted-foreground font-mono text-xs tabular-nums whitespace-nowrap">
            {filtered.length} shown
          </span>
        </div>
      </div>

      <KanbanBoard initialApplications={applications} lanes={LANES} />
    </div>
  );
}
