"use server";

import { requireOrg, assertOwned } from "@/lib/tenant";
import { readClient } from "@/lib/sanity/client";

export type SourcedCandidate = {
  _id: string;
  name: string;
  headline: string | null;
  avatarUrl: string | null;
  skills: string[] | null;
  pct: number;
};

export type SourceCandidatesResult =
  | { matches: SourcedCandidate[] }
  | { upgrade: true }
  | { error: string };

const SCORED_QUERY = `*[
  _type == "candidate" &&
  orgId == $orgId &&
  archived != true &&
  count(*[_type == "application" && orgId == $orgId && job._ref == $jobId && candidate._ref == ^._id]) == 0
] | score(text::semanticSimilarity($queryText)) | order(_score desc) [0...30] {
  _id, name, headline, avatarUrl, skills, _score
}`;

export async function sourceCandidates(
  jobId: string,
): Promise<SourceCandidatesResult> {
  const { orgId, has } = await requireOrg();

  if (!has({ feature: "ai_agent" })) return { upgrade: true };

  try {
    await assertOwned(jobId, orgId);
  } catch {
    return { error: "That job is not in this workspace." };
  }

  const job = await readClient.fetch<{
    title: string;
    description: string | null;
    seniority: string | null;
  } | null>(
    `*[_type == "job" && _id == $jobId && orgId == $orgId][0]{ title, description, seniority }`,
    { jobId, orgId },
  );
  if (!job) return { error: "Job not found." };

  const queryText = [job.title, job.seniority, job.description]
    .filter(Boolean)
    .join(". ")
    .slice(0, 1200);

  const scored = await readClient.fetch<
    (Omit<SourcedCandidate, "pct"> & { _score: number })[]
  >(SCORED_QUERY, { orgId, jobId, queryText });

  if (scored.length === 0) return { matches: [] };

  const max = scored[0]._score;
  const min = scored[scored.length - 1]._score;
  const spread = max - min;

  const matches = scored.slice(0, 8).map(({ _score, ...candidate }) => ({
    ...candidate,
    pct: spread > 0 ? Math.round(35 + 60 * ((_score - min) / spread)) : 75,
  }));

  return { matches };
}
