import "server-only";
import { readClient } from "./sanity/client";

export const FREE_JOB_LIMIT = 1;
export const FREE_CANDIDATE_LIMIT = 25;

export function countJobs(orgId: string): Promise<number> {
  return readClient.fetch<number>(
    `count(*[_type == "job" && orgId == $orgId])`,
    { orgId },
  );
}

export function countCandidates(orgId: string): Promise<number> {
  return readClient.fetch<number>(
    `count(*[_type == "candidate" && orgId == $orgId && archived != true])`,
    { orgId },
  );
}
