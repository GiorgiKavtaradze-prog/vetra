import type { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { writeClient } from "@/lib/sanity/client";
import { orgDocId } from "@/lib/tenant";

type OrganizationEventData = {
  id?: string;
  name?: string;
  image_url?: string;
  created_at?: number;
};

type BillingEventData = {
  id?: string;
  status?: string;
  payer?: { organization_id?: string };
  plan?: { slug?: string };
  items?: Array<{ plan?: { slug?: string } }>;
};

export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;
  try {
    evt = await verifyWebhook(req);
  } catch {
    return new Response("Verification failed", { status: 400 });
  }

  const type = evt.type as string;

  if (type === "organization.created" || type === "organization.updated") {
    const data = evt.data as OrganizationEventData;
    if (data.id) {
      const _id = orgDocId(data.id);
      await writeClient.createOrReplace({
        _id,
        _type: "organization",
        name: data.name ?? data.id,
        clerkOrgId: data.id,
        ...(data.image_url ? { imageUrl: data.image_url } : {}),
        ...(data.created_at
          ? { createdAt: new Date(data.created_at).toISOString() }
          : {}),
        syncedAt: new Date().toISOString(),
      });
      console.log("[clerk-org-sync]", { type, orgId: data.id, doc: _id });
    }
  } else if (type === "organization.deleted") {
    const data = evt.data as OrganizationEventData;
    if (data.id) {
      await writeClient
        .patch(orgDocId(data.id))
        .set({ deletedAt: new Date().toISOString() })
        .commit()
        .catch(() => {});
      console.log("[clerk-org-sync]", { type, orgId: data.id });
    }
  } else if (
    type === "subscription.created" ||
    type === "subscription.updated" ||
    type === "subscription.active" ||
    type === "subscription.pastDue"
  ) {
    const data = evt.data as BillingEventData;
    console.log("[clerk-billing]", {
      type,
      subscriptionId: data.id,
      orgId: data.payer?.organization_id,
      plan: data.items?.[0]?.plan?.slug,
      status: data.status,
    });
  } else if (type.startsWith("subscriptionItem.")) {
    const data = evt.data as BillingEventData;
    console.log("[clerk-billing]", {
      type,
      itemId: data.id,
      orgId: data.payer?.organization_id,
      plan: data.plan?.slug,
      status: data.status,
    });
  }

  return new Response("OK", { status: 200 });
}
