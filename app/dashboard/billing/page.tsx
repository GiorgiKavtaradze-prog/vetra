import { requireOrg } from "@/lib/tenant";
import { fetchOrgPlans } from "@/lib/billing";
import { PricingCards } from "@/components/billing/pricing-cards";
import { PageHeader } from "@/components/shell/panels";
import { Badge } from "@/components/ui/badge";

export default async function BillingPage() {
  const { has } = await requireOrg();

  const currentPlanSlug = has({ plan: "scale" })
    ? "scale"
    : has({ plan: "pro" })
      ? "pro"
      : "free_org";

  let plans: Awaited<ReturnType<typeof fetchOrgPlans>> = [];
  let plansError = false;
  try {
    plans = await fetchOrgPlans();
  } catch {
    plansError = true;
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Billing"
        description="Plans are billed per agency workspace. Seat limits are enforced when inviting teammates."
        actions={
          <Badge variant="outline">
            {currentPlanSlug === "free_org"
              ? "Free plan"
              : currentPlanSlug === "pro"
                ? "Pro plan"
                : "Scale plan"}
          </Badge>
        }
      />

      {plansError ? (
        <p className="text-muted-foreground text-sm">
          Plans could not be loaded right now. Try again in a moment.
        </p>
      ) : (
        <PricingCards plans={plans} currentPlanSlug={currentPlanSlug} />
      )}

      <p className="text-muted-foreground text-xs">
        Checkout opens in Clerk&apos;s secure drawer. Manage members, invoices
        and cancellations from the Team page.
      </p>
    </div>
  );
}
