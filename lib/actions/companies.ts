"use server";

import { revalidatePath } from "next/cache";
import { requireOrg, orgRef, assertOwned } from "@/lib/tenant";
import { writeClient } from "@/lib/sanity/client";

function optionalText(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export async function createCompany(formData: FormData) {
  const { orgId } = await requireOrg();

  const name = optionalText(formData, "name");
  if (!name) throw new Error("Name is required");

  let website = optionalText(formData, "website");
  if (website && !/^https?:\/\//i.test(website)) {
    website = `https://${website}`;
  }

  const industry = optionalText(formData, "industry");
  const notes = optionalText(formData, "notes");

  await writeClient.create({
    _type: "company",
    orgId,
    organization: orgRef(orgId),
    name,
    ...(website ? { website } : {}),
    ...(industry ? { industry } : {}),
    ...(notes ? { notes } : {}),
  });

  revalidatePath("/dashboard/companies");
}

export type UpdateCompanyResult = { ok: true } | { error: string };

export async function updateCompany(
  id: string,
  formData: FormData,
): Promise<UpdateCompanyResult> {
  const { orgId } = await requireOrg();
  try {
    await assertOwned(id, orgId);
  } catch {
    return { error: "That company is not in this workspace." };
  }

  const name = optionalText(formData, "name");
  if (!name) return { error: "Name is required." };

  let website = optionalText(formData, "website");
  if (website && !/^https?:\/\//i.test(website)) {
    website = `https://${website}`;
  }

  await writeClient
    .patch(id)
    .set({
      name,
      website: website ?? null,
      industry: optionalText(formData, "industry") ?? null,
      notes: optionalText(formData, "notes") ?? null,
    })
    .commit();

  revalidatePath("/dashboard/companies");
  revalidatePath(`/dashboard/companies/${id}`);
  return { ok: true };
}
