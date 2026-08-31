import { Reveal } from "@/components/landing/reveal";
import { USE_CASES } from "@/constants";

export function UseCases() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-7xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Built for every desk
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {USE_CASES.map((useCase, i) => (
            <Reveal key={useCase.t} delay={i * 100}>
              <span className="block h-0.5 w-8 rounded-full bg-linear-to-r from-neutral-300 to-neutral-900" />
              <h3 className="mt-3 text-base font-semibold tracking-tight">
                {useCase.t}
              </h3>
              <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                {useCase.b}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
