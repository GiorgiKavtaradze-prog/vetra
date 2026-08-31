import Link from "next/link";
import { Search, Users } from "lucide-react";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { InitialsChip } from "@/components/initials-chip";
import { FilterSelect } from "@/components/filter-chips";
import { PageHeader } from "@/components/shell/panels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CandidateRow = {
  _id: string;
  name: string;
  headline?: string;
  avatarUrl?: string | null;
  skills?: string[];
  source?: string;
  createdAt: string;
};

const SOURCE_LABELS: Record<string, string> = {
  referral: "Referral",
  linkedin: "LinkedIn",
  "job-board": "Job board",
  outreach: "Outreach",
  other: "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    source?: string | string[];
    skill?: string | string[];
  }>;
}) {
  const { orgId } = await requireOrg();
  const params = await searchParams;
  const q = first(params.q);
  const source = first(params.source);
  const skill = first(params.skill);

  const allCandidates = await readClient.fetch<CandidateRow[]>(
    q
      ? `*[_type == "candidate" && orgId == $orgId && archived != true && name match $q + "*"]
          | order(createdAt desc){ _id, name, headline, avatarUrl, skills, source, createdAt }`
      : `*[_type == "candidate" && orgId == $orgId && archived != true]
          | order(createdAt desc){ _id, name, headline, avatarUrl, skills, source, createdAt }`,
    q ? { orgId, q } : { orgId },
  );

  // Filter options come from the full pool; filtering happens here in JS.
  const skillCounts = new Map<string, number>();
  for (const candidate of allCandidates) {
    for (const s of candidate.skills ?? []) {
      skillCounts.set(s, (skillCounts.get(s) ?? 0) + 1);
    }
  }
  const topSkills = [...skillCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([value]) => ({ value, label: value }));

  const candidates = allCandidates.filter(
    (candidate) =>
      (!source || candidate.source === source) &&
      (!skill || (candidate.skills ?? []).includes(skill)),
  );

  return (
    <div className="flex flex-col pb-4">
      <PageHeader
        eyebrow="Talent"
        title="Candidates"
        description="Every person your agency has met — searchable and ready to match."
        actions={
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/candidates/new" />}
          >
            Add candidate
          </Button>
        }
      />

      {/* ── Slim toolbar: search inline, count mono ── */}
      <div className="mt-2 flex items-center justify-between gap-3 pb-2">
        <form action="/dashboard/candidates" className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name"
            aria-label="Search candidates by name"
            className="h-8 w-40 pl-8 text-sm sm:w-64"
          />
        </form>
        <div className="flex items-center gap-2">
          <FilterSelect
            param="skill"
            options={topSkills}
            placeholder="All skills"
          />
          <FilterSelect
            param="source"
            options={Object.entries(SOURCE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            placeholder="All sources"
          />
          <span className="text-muted-foreground font-mono text-xs tabular-nums whitespace-nowrap">
            {candidates.length} shown
          </span>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-t px-6 py-14 text-center">
          <Users className="text-muted-foreground size-4" aria-hidden="true" />
          {q ? (
            <>
              <p className="text-muted-foreground text-[13px]">
                No candidates match &quot;{q}&quot;.
              </p>
              <Button
                className="mt-1"
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/dashboard/candidates" />}
              >
                Clear search
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground text-[13px]">
                No candidates yet — add your first candidate to start building
                the pool.
              </p>
              <Button
                className="mt-1"
                size="sm"
                nativeButton={false}
                render={<Link href="/dashboard/candidates/new" />}
              >
                Add candidate
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="divide-y border-t">
          {candidates.map((candidate) => {
            const skills = candidate.skills ?? [];
            return (
              <div
                key={candidate._id}
                className="hover:bg-muted/40 relative flex cursor-pointer items-center gap-3 py-2.5 text-[13px] transition-colors"
              >
                <InitialsChip
                  name={candidate.name}
                  src={candidate.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/candidates/${candidate._id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {candidate.name}
                    <span className="absolute inset-0" aria-hidden />
                  </Link>
                  <p className="text-muted-foreground truncate text-xs">
                    {candidate.headline ?? "—"}
                  </p>
                </div>
                {skills.length > 0 ? (
                  <div className="hidden shrink-0 items-center gap-1 md:flex">
                    {skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {skills.length > 3 && (
                      <span className="text-muted-foreground font-mono text-xs">
                        +{skills.length - 3}
                      </span>
                    )}
                  </div>
                ) : null}
                <span className="text-muted-foreground hidden w-20 shrink-0 truncate text-xs lg:inline">
                  {candidate.source
                    ? (SOURCE_LABELS[candidate.source] ?? candidate.source)
                    : "—"}
                </span>
                <span className="text-muted-foreground w-24 shrink-0 text-right font-mono text-xs tabular-nums">
                  {formatDate(candidate.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
