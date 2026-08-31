"use server";

import { revalidatePath } from "next/cache";
import { requireOrg, assertOwned, orgRef } from "@/lib/tenant";
import { writeClient } from "@/lib/sanity/client";
import { FREE_JOB_LIMIT, countJobs } from "@/lib/plan-limits";

const SENIORITIES = [
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "executive",
] as const;

export type CreateJobResult =
  | { ok: true }
  | { error: string; upgrade?: boolean };

export async function createJob(formData: FormData): Promise<CreateJobResult> {
  const { orgId, has } = await requireOrg();

  if (!has({ feature: "unlimited_jobs" })) {
    const total = await countJobs(orgId);
    if (total >= FREE_JOB_LIMIT) {
      return {
        error:
          "Free plan includes 1 job — closing a job does not free the slot.",
        upgrade: true,
      };
    }
  }

  const title = String(formData.get("title") ?? "").trim();
  const companyId = String(formData.get("companyId") ?? "");
  if (!title) return { error: "Give the job a title." };
  if (!companyId) return { error: "Choose a client company." };

  try {
    await assertOwned(companyId, orgId);
  } catch {
    return { error: "That company is not in this workspace." };
  }

  const description = String(formData.get("description") ?? "").trim();
  const seniority = String(formData.get("seniority") ?? "");
  const salaryRange = String(formData.get("salaryRange") ?? "").trim();

  await writeClient.create({
    _type: "job",
    orgId,
    organization: orgRef(orgId),
    title,
    status: "open",
    company: { _type: "reference", _ref: companyId },
    createdAt: new Date().toISOString(),
    ...(description ? { description } : {}),
    ...(SENIORITIES.includes(seniority as (typeof SENIORITIES)[number])
      ? { seniority }
      : {}),
    ...(salaryRange ? { salaryRange } : {}),
  });

  revalidatePath("/dashboard/jobs");
  return { ok: true };
}

export async function closeJob(id: string): Promise<void> {
  const { orgId } = await requireOrg();
  await assertOwned(id, orgId);
  await writeClient.patch(id).set({ status: "closed" }).commit();
  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${id}`);
}

export async function reopenJob(id: string): Promise<void> {
  const { orgId } = await requireOrg();
  await assertOwned(id, orgId);
  await writeClient.patch(id).set({ status: "open" }).commit();
  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${id}`);
}

export type UpdateJobResult = { ok: true } | { error: string };

export async function updateJob(
  id: string,
  formData: FormData,
): Promise<UpdateJobResult> {
  const { orgId } = await requireOrg();
  try {
    await assertOwned(id, orgId);
  } catch {
    return { error: "That job is not in this workspace." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Give the job a title." };

  const companyId = String(formData.get("companyId") ?? "");
  if (companyId) {
    try {
      await assertOwned(companyId, orgId);
    } catch {
      return { error: "That company is not in this workspace." };
    }
  }

  const description = String(formData.get("description") ?? "").trim();
  const seniority = String(formData.get("seniority") ?? "");
  const salaryRange = String(formData.get("salaryRange") ?? "").trim();

  await writeClient
    .patch(id)
    .set({
      title,
      description: description || null,
      salaryRange: salaryRange || null,
      ...(SENIORITIES.includes(seniority as (typeof SENIORITIES)[number])
        ? { seniority }
        : { seniority: null }),
      ...(companyId
        ? { company: { _type: "reference", _ref: companyId } }
        : {}),
    })
    .commit();

  revalidatePath("/dashboard/jobs");
  revalidatePath(`/dashboard/jobs/${id}`);
  return { ok: true };
}
