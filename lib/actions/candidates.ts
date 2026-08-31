"use server";

import { revalidatePath } from "next/cache";
import { assertOwned, requireOrg, orgRef } from "@/lib/tenant";
import { writeClient } from "@/lib/sanity/client";
import { countCandidates, FREE_CANDIDATE_LIMIT } from "@/lib/plan-limits";

const SOURCES = [
  "referral",
  "linkedin",
  "job-board",
  "outreach",
  "other",
] as const;

export type CreateCandidateInput = {
  name: string;
  email?: string;
  headline?: string;
  skills?: string[];
  cvText?: string;
  source?: string;
};

export type CreateCandidateResult = {
  id?: string;
  error?: string;
  limitReached?: boolean;
};

export async function createCandidate(
  input: CreateCandidateInput,
): Promise<CreateCandidateResult> {
  const { orgId, has } = await requireOrg();

  const name = input.name?.trim();
  if (!name) return { error: "Name is required." };

  if (!has({ feature: "unlimited_candidates" })) {
    const count = await countCandidates(orgId);
    if (count >= FREE_CANDIDATE_LIMIT) {
      return {
        error: `Free plan is limited to ${FREE_CANDIDATE_LIMIT} candidates — upgrade for unlimited.`,
        limitReached: true,
      };
    }
  }

  const skills = (input.skills ?? []).map((s) => s.trim()).filter(Boolean);
  const source =
    input.source && (SOURCES as readonly string[]).includes(input.source)
      ? input.source
      : undefined;

  const doc = await writeClient.create({
    _type: "candidate",
    orgId,
    organization: orgRef(orgId),
    name,
    email: input.email?.trim() || undefined,
    headline: input.headline?.trim() || undefined,
    skills: skills.length > 0 ? skills : undefined,
    cvText: input.cvText?.trim() || undefined,
    source,
    archived: false,
    createdAt: new Date().toISOString(),
  });

  revalidatePath("/dashboard/candidates");
  return { id: doc._id };
}

export async function archiveCandidate(id: string): Promise<void> {
  const { orgId } = await requireOrg();
  await assertOwned(id, orgId);

  await writeClient.patch(id).set({ archived: true }).commit();

  revalidatePath("/dashboard/candidates");
  revalidatePath(`/dashboard/candidates/${id}`);
}

export type UpdateCandidateResult = { ok: true } | { error: string };

export async function updateCandidate(
  id: string,
  input: CreateCandidateInput,
): Promise<UpdateCandidateResult> {
  const { orgId } = await requireOrg();
  try {
    await assertOwned(id, orgId);
  } catch {
    return { error: "That candidate is not in this workspace." };
  }

  const name = input.name?.trim();
  if (!name) return { error: "Name is required." };

  const skills = (input.skills ?? []).map((s) => s.trim()).filter(Boolean);
  const source =
    input.source && (SOURCES as readonly string[]).includes(input.source)
      ? input.source
      : null;

  await writeClient
    .patch(id)
    .set({
      name,
      email: input.email?.trim() || null,
      headline: input.headline?.trim() || null,
      skills: skills.length > 0 ? skills : null,
      cvText: input.cvText?.trim() || null,
      source,
    })
    .commit();

  revalidatePath("/dashboard/candidates");
  revalidatePath(`/dashboard/candidates/${id}`);
  return { ok: true };
}
