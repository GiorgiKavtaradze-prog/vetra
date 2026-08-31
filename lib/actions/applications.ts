"use server";

import { revalidatePath } from "next/cache";
import { requireOrg, assertOwned, orgRef } from "@/lib/tenant";
import { readClient, writeClient } from "@/lib/sanity/client";
import { STAGES, type Stage } from "@/sanity/schemas/stages";

export type MoveApplicationResult =
  | { stage: Stage; stageUpdatedAt: string }
  | { error: string };

export async function moveApplication(
  id: string,
  stage: Stage,
): Promise<MoveApplicationResult> {
  if (!(STAGES as readonly string[]).includes(stage)) {
    return { error: "Unknown stage." };
  }
  const { orgId } = await requireOrg();
  try {
    await assertOwned(id, orgId);
    const stageUpdatedAt = new Date().toISOString();
    await writeClient.patch(id).set({ stage, stageUpdatedAt }).commit();
    return { stage, stageUpdatedAt };
  } catch {
    return { error: "Could not move the candidate. Try again." };
  }
}

export type CreateApplicationResult = { ok: true } | { error: string };

export async function createApplication(
  jobId: string,
  candidateId: string,
): Promise<CreateApplicationResult> {
  const { orgId } = await requireOrg();

  try {
    await Promise.all([
      assertOwned(jobId, orgId),
      assertOwned(candidateId, orgId),
    ]);
  } catch {
    return { error: "Candidate or job is not in this workspace." };
  }

  const check = await readClient.fetch<{
    jobOk: boolean;
    candidateOk: boolean;
    dupes: number;
  }>(
    `{
      "jobOk": count(*[_id == $jobId && _type == "job" && orgId == $orgId]) == 1,
      "candidateOk": count(*[_id == $candidateId && _type == "candidate" && orgId == $orgId && archived != true]) == 1,
      "dupes": count(*[_type == "application" && orgId == $orgId && job._ref == $jobId && candidate._ref == $candidateId])
    }`,
    { jobId, candidateId, orgId },
  );

  if (!check.jobOk || !check.candidateOk) {
    return { error: "Candidate or job is not available." };
  }
  if (check.dupes > 0) {
    return { error: "This candidate is already in the pipeline." };
  }

  const now = new Date().toISOString();
  await writeClient.create({
    _type: "application",
    orgId,
    organization: orgRef(orgId),
    candidate: { _type: "reference", _ref: candidateId },
    job: { _type: "reference", _ref: jobId },
    stage: "applied",
    appliedAt: now,
    stageUpdatedAt: now,
  });

  revalidatePath(`/dashboard/jobs/${jobId}`);
  return { ok: true };
}

export type RecordOfferResult = { ok: true } | { error: string };

export async function recordOffer(
  applicationId: string,
  input: { amount: string; note?: string },
): Promise<RecordOfferResult> {
  const { orgId } = await requireOrg();

  try {
    await assertOwned(applicationId, orgId);
  } catch {
    return { error: "That application is not in this workspace." };
  }

  const amount = input.amount.trim();
  if (!amount) return { error: "Enter the offer amount." };

  const current = await readClient.fetch<{
    stage: Stage;
    offerSentAt: string | null;
  } | null>(`*[_id == $id && orgId == $orgId][0]{ stage, offerSentAt }`, {
    id: applicationId,
    orgId,
  });
  if (!current) return { error: "Application not found." };

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    offerAmount: amount,
    offerSentAt: current.offerSentAt ?? now,
  };
  const note = input.note?.trim();
  if (note) patch.offerNote = note;
  if (current.stage !== "offer" && current.stage !== "hired") {
    patch.stage = "offer" satisfies Stage;
    patch.stageUpdatedAt = now;
  }

  await writeClient.patch(applicationId).set(patch).commit();

  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
