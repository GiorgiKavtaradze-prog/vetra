import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { PLANS } from "@/constants";
import type { Plan } from "@/types/types.d";

export function Pricing({ cta }: { cta: string }) {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-7xl px-6 py-24">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Pricing that scales with your desk
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md text-sm">
            Per agency workspace. Seats enforced automatically.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {(PLANS as readonly Plan[]).map((plan, i) => {
            const highlight = "highlight" in plan && plan.highlight;
            return (
              <Reveal key={plan.name} delay={i * 120} className="h-full">
                <div
                  className={cn(
                    "bg-card relative flex h-full flex-col rounded-2xl border p-7",
                    highlight
                      ? "border-foreground/30 shadow-[0_0_50px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_0_50px_-12px_rgba(255,255,255,0.25)] md:-mt-4"
                      : "shadow-xs",
                  )}
                >
                  {highlight ? (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-[10px] font-bold tracking-wide text-background uppercase">
                      Most popular
                    </span>
                  ) : null}
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-lg font-bold">
                      {plan.name}
                    </h3>
                    <p className="font-display text-4xl font-extrabold tabular-nums">
                      {plan.price}
                      <span className="text-muted-foreground text-sm font-medium">
                        /mo
                      </span>
                    </p>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {plan.blurb}
                  </p>
                  <ul className="mt-5 mb-6 space-y-2 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2.5">
                        <span
                          className={cn(
                            "mt-2 size-1 shrink-0 rounded-full",
                            highlight ? "bg-foreground" : "bg-foreground/40",
                          )}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={cn(
                      "mt-auto w-full",
                      highlight &&
                        "bg-foreground text-background hover:bg-foreground/85",
                    )}
                    variant={highlight ? "default" : "outline"}
                    nativeButton={false}
                    render={<Link href={cta} />}
                  >
                    Start free
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
