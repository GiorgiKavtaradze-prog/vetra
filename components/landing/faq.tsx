import { Reveal } from "@/components/landing/reveal";
import { FAQS } from "@/constants";

export function Faq() {
  return (
    <section className="border-t">
      <div className="mx-auto w-full max-w-3xl px-6 py-20">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
            Questions, answered
          </h2>
        </Reveal>
        <div className="mt-8 divide-y">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium">
                {faq.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
