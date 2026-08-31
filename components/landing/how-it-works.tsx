import { Reveal } from "@/components/landing/reveal";
import { STEPS } from "@/constants";

export function HowItWorks() {
  return (
    <section id="how" className="border-t">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Three steps to a faster desk
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 120}>
              <span className="flex size-9 items-center justify-center rounded-full bg-foreground/5 font-mono text-xs font-bold text-foreground">
                {step.n}
              </span>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {step.t}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {step.b}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
