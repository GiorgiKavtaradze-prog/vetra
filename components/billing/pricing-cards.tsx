"use client";

import { useState } from "react";
import { Show } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BillingPlan } from "@/lib/billing";

const FREE_FEATURES = [
  { slug: "jobs", name: "1 open job" },
  { slug: "candidates", name: "Up to 25 candidates" },
  { slug: "pipeline", name: "Pipeline board with drift flags" },
  { slug: "debriefs", name: "Interview debriefs" },
];

function price(cents: number, symbol: string): string {
  const whole = cents / 100;
  return `${symbol}${Number.isInteger(whole) ? whole : whole.toFixed(2)}`;
}

export function PricingCards({
  plans,
  currentPlanSlug,
}: {
  plans: BillingPlan[];
  currentPlanSlug: string;
}) {
  const [period, setPeriod] = useState<"month" | "annual">("month");

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-muted flex w-fit items-center gap-1 rounded-lg p-1">
        {(
          [
            { value: "month", label: "Monthly" },
            { value: "annual", label: "Annual" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setPeriod(option.value)}
            aria-pressed={period === option.value}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              period === option.value
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
        <span className="text-muted-foreground px-2 text-xs">
          Annual saves about two months
        </span>
      </div>

      <div className="grid items-start gap-4 pt-3 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isFree = plan.monthlyCents === 0;
          const isPopular = plan.slug === "pro";
          const cents =
            period === "annual" ? plan.annualMonthlyCents : plan.monthlyCents;

          return (
            <div
              key={plan.id}
              className={cn(
                "bg-card relative flex flex-col rounded-lg border p-5",
                isPopular && "border-ai/40",
              )}
            >
              {isPopular ? (
                <span className="bg-ai text-ai-foreground absolute -top-2.5 left-5 rounded-md px-2 py-0.5 text-xs font-medium">
                  Most popular
                </span>
              ) : null}

              <h3 className="text-base font-semibold tracking-tight">
                {plan.name}
              </h3>

              <p className="mt-2 text-2xl font-semibold tabular-nums">
                {price(cents, plan.currencySymbol)}
                <span className="text-muted-foreground text-[13px] font-medium">
                  /mo
                </span>
              </p>
              <p className="text-muted-foreground mt-1 min-h-4 text-xs">
                {isFree
                  ? "Always free"
                  : period === "annual"
                    ? "Billed annually"
                    : "Billed monthly"}
              </p>
              {plan.description ? (
                <p className="text-muted-foreground mt-2 text-sm">
                  {plan.description}
                </p>
              ) : null}

              <ul className="mt-4 flex-1 space-y-2 text-[13px]">
                {(isFree ? FREE_FEATURES : plan.features).map((feature) => (
                  <li key={feature.slug} className="flex gap-2.5">
                    <span
                      className={cn(
                        "mt-2 size-1 shrink-0 rounded-full",
                        feature.slug === "ai_agent"
                          ? "bg-ai"
                          : "bg-foreground/40",
                      )}
                    />
                    <span
                      className={cn(
                        feature.slug === "ai_agent" && "text-ai font-medium",
                      )}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                {isCurrent ? (
                  <Button
                    size="sm"
                    className="w-full"
                    variant="outline"
                    disabled
                  >
                    Current plan
                  </Button>
                ) : isFree ? (
                  <p className="text-muted-foreground text-center text-xs">
                    Downgrades happen from your plan settings once subscribed.
                  </p>
                ) : (
                  <Show when="signed-in">
                    <CheckoutButton
                      planId={plan.id}
                      planPeriod={period}
                      for="organization"
                      newSubscriptionRedirectUrl="/dashboard/billing"
                    >
                      <Button
                        size="sm"
                        className="w-full"
                        variant={isPopular ? "default" : "outline"}
                      >
                        Upgrade to {plan.name}
                      </Button>
                    </CheckoutButton>
                  </Show>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
