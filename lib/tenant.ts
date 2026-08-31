import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { readClient } from "./sanity/client";

export async function requireOrg() {
  const { userId, orgId, has } = await auth();
  if (!userId) redirect("/sign-in");
  if (!orgId) redirect("/onboarding");
  assertValidOrgId(orgId);
  return { userId, orgId, has };
}

export function orgDocId(orgId: string): string {
  return `org.${orgId}`;
}

export function orgRef(orgId: string) {
  return { _type: "reference" as const, _ref: orgDocId(orgId), _weak: true };
}

export function assertValidOrgId(orgId: string) {
  if (!/^org_[A-Za-z0-9]+$/.test(orgId)) {
    throw new Error("Invalid organization id");
  }
}

export async function assertOwned(id: string, orgId: string): Promise<string> {
  assertValidOrgId(orgId);
  const hit = await readClient.fetch<string | null>(
    `*[_id == $id && orgId == $orgId][0]._id`,
    { id, orgId },
  );
  if (!hit) throw new Error("Not found in this organization");
  return hit;
}
