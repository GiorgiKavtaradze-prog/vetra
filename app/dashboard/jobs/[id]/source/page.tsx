import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { requireOrg } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";
import { sourceCandidates } from "@/lib/actions/sourcing";
import { AddToPipelineButton } from "@/components/sourcing/add-to-pipeline-button";
import { InitialsChip } from "@/components/initials-chip";
import { Section } from "@/components/shell/panels";
import { Button } from "@/components/ui/button";

const JOB_TITLE_QUERY = `*[_type == "job" && _id == $id && orgId == $orgId][0]{ title }`;

export default async function SourceCandidatesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { orgId } = await requireOrg();

  const job = await readClient.fetch<{ title: string } | null>(
    JOB_TITLE_QUERY,
    { id, orgId },
  );
  if (!job) notFound();

  const result = await sourceCandidates(id);

  return (
    <div className="flex flex-col pb-6">
      <div className="pt-5">
        <Link
          href={`/dashboard/jobs/${id}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[13px] transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to {job.title}
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Suggested candidates
          </h1>
          <span className="bg-ai-soft text-ai rounded-md px-1.5 py-0.5 text-xs font-medium">
            AI sourcing
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-[13px] sm:text-sm">
          {job.title}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {"upgrade" in result ? (
            <div className="border-ai/30 bg-ai-soft/50 rounded-lg border p-5">
              <span className="bg-ai-soft text-ai inline-block rounded-md px-2 py-0.5 text-xs font-medium">
                AI · Pro
              </span>
              <p className="mt-3 text-base font-semibold tracking-tight">
                Candidate sourcing is part of the AI Talent Agent on Pro.
              </p>
              <p className="text-muted-foreground mt-1 text-[13px]">
                Upgrade to match this role against every CV in your pool.
              </p>
              <Button
                size="sm"
                className="bg-ai text-ai-foreground hover:bg-ai/90 mt-4"
                nativeButton={false}
                render={<Link href="/dashboard/billing" />}
              >
                See plans
              </Button>
            </div>
          ) : "error" in result ? (
            <Section title="Matches">
              <p role="alert" className="text-destructive border-t pt-3 text-sm">
                {result.error}
              </p>
            </Section>
          ) : result.matches.length === 0 ? (
            <Section title="Matches" count={0}>
              <div className="flex flex-col items-center gap-3 border-t px-6 py-10 text-center">
                <p className="text-muted-foreground text-sm">
                  No candidates to match — everyone eligible is already in this
                  pipeline, or your pool is empty.
                </p>
                <Button
                  size="sm"
                  nativeButton={false}
                  render={<Link href="/dashboard/candidates" />}
                >
                  Go to candidates
                </Button>
              </div>
            </Section>
          ) : (
            <Section title="Matches" count={result.matches.length}>
              <div className="divide-y border-t">
                {result.matches.map((candidate) => (
                  <div
                    key={candidate._id}
                    className="hover:bg-muted/40 flex items-center gap-3 py-2.5 text-[13px] transition-colors"
                  >
                    <InitialsChip name={candidate.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/dashboard/candidates/${candidate._id}`}
                        className="text-[13px] font-medium hover:underline"
                      >
                        {candidate.name}
                      </Link>
                      {candidate.headline ? (
                        <p className="text-muted-foreground truncate text-xs">
                          {candidate.headline}
                        </p>
                      ) : null}
                    </div>
                    {/* Match strength — violet, the AI's verdict */}
                    <div className="w-24 shrink-0">
                      <p className="text-ai text-right text-sm font-semibold tabular-nums">
                        {candidate.pct}%
                      </p>
                      <div className="bg-muted mt-1 h-1 overflow-hidden rounded-full">
                        <div
                          className="bg-ai h-full rounded-full"
                          style={{ width: `${candidate.pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="shrink-0">
                      <AddToPipelineButton
                        jobId={id}
                        candidateId={candidate._id}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="lg:border-l lg:pl-6">
          <Section title="How matching works">
            <div className="text-muted-foreground space-y-3 text-[13px] leading-relaxed">
              <p>
                Each score is a semantic match of the role description against a
                candidate&apos;s CV — meaning, not keyword overlap.
              </p>
              <p>
                Scores are relative to your current pool. Treat them as a place
                to start looking, not a ranking of people.
              </p>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}
