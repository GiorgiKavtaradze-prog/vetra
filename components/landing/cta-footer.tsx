import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CtaFooter({ cta }: { cta: string }) {
  return (
    <section className="grain relative overflow-hidden border-t border-foreground/10 bg-foreground/3">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-30%] h-120 w-240 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.08),transparent)] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.06),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-8 font-display text-[16rem] leading-none font-bold tracking-tight text-foreground/4 select-none sm:text-[20rem]"
      >
        V
      </div>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20">
        <div className="rounded-2xl border border-foreground/10 bg-background/70 p-8 shadow-sm backdrop-blur-sm sm:p-12">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <Reveal className="max-w-xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                Remember everyone. Place faster
                <span className="text-foreground/40">.</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
                One desk, one AI, every candidate you&apos;ve ever spoken to —
                searchable, linked, ready when the next mandate lands.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/85"
                nativeButton={false}
                render={<Link href={cta} />}
              >
                Start free
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
      <footer className="relative z-10 border-t border-foreground/10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-foreground/60">
          <span className="font-display font-bold text-foreground">
            Vetra<span className="text-foreground/40">.</span>
          </span>
          <span className="font-mono text-xs">
            Next.js · Clerk · Sanity Context
          </span>
        </div>
      </footer>
    </section>
  );
}
