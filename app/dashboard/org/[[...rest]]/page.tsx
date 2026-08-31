import { OrganizationProfile } from "@clerk/nextjs";
import { PageHeader } from "@/components/shell/panels";
import { requireOrg } from "@/lib/tenant";

export default async function TeamPage() {
  await requireOrg();

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Team"
        description="Invite recruiters and manage roles for your agency's workspace."
      />
      <div className="flex justify-center">
        <OrganizationProfile routing="path" path="/dashboard/org" />
      </div>
    </div>
  );
}
