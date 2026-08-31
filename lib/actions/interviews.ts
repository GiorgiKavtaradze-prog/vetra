"use server";

import { revalidatePath } from "next/cache";
import { assertOwned, requireOrg, orgRef } from "@/lib/tenant";
import { readClient, writeClient } from "@/lib/sanity/client";

const OUTCOMES = ["pending", "pass", "fail"] as const;
type Outcome = (typeof OUTCOMES)[number];

export type CreateInterviewInput = {
  candidateId: string;
  applicationId: string;
  roundName: string;
  scheduledAt?: string;
  interviewer?: string;
  feedbackText?: string;
  outcome?: string;
};

export type CreateInterviewResult = {
  id?: string;
  error?: string;
};

export async function createInterview(
  input: CreateInterviewInput,
): Promise<CreateInterviewResult> {
  const { orgId } = await requireOrg();

  if (!input.applicationId) return { error: "Choose an application." };
  const roundName = input.roundName?.trim();
  if (!roundName) return { error: "Round name is required." };

  await assertOwned(input.applicationId, orgId);

  const applicationId = await readClient.fetch<string | null>(
    `*[_type == "application" && _id == $applicationId && orgId == $orgId && candidate._ref == $candidateId][0]._id`,
    {
      applicationId: input.applicationId,
      orgId,
      candidateId: input.candidateId,
    },
  );
  if (!applicationId) {
    return { error: "That application does not belong to this candidate." };
  }

  const outcome: Outcome =
    input.outcome && (OUTCOMES as readonly string[]).includes(input.outcome)
      ? (input.outcome as Outcome)
      : "pending";

  let scheduledAt: string | undefined;
  if (input.scheduledAt) {
    const parsed = new Date(input.scheduledAt);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Enter a valid date and time." };
    }
    scheduledAt = parsed.toISOString();
  }

  const doc = await writeClient.create({
    _type: "interview",
    orgId,
    organization: orgRef(orgId),
    application: { _type: "reference", _ref: applicationId },
    roundName,
    scheduledAt,
    interviewer: input.interviewer?.trim() || undefined,
    feedbackText: input.feedbackText?.trim() || undefined,
    outcome,
  });

  revalidatePath(`/dashboard/candidates/${input.candidateId}`);
  return { id: doc._id };
}
