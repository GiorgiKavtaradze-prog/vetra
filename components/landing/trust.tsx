import { Reveal } from "@/components/landing/reveal";
import { TRUST_ITEMS } from "@/constants";

export function Trust() {
  return (
    <section className="border-t">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-3">
        {TRUST_ITEMS.map((item, i) => (
          <Reveal key={item.t} delay={i * 100}>
            <div className="bg-card h-full rounded-2xl border p-6 shadow-xs">
              <span className="flex size-7 items-center justify-center rounded-full bg-foreground/5 text-xs font-bold text-foreground">
                ✓
              </span>
              <h3 className="mt-3 text-base font-semibold tracking-tight">
                {item.t}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                {item.b}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
