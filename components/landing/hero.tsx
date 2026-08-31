import { Button } from "@/components/ui/button";
import { HeroDemo } from "@/components/landing/hero-demo";
import Link from "next/link";

export function Hero({ cta }: { cta: string }) {
  return (
    <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-28">
      <p className="fade-up inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-foreground/70">
        <span className="size-1.5 rounded-full bg-foreground" />
        AI-native CRM for recruitment agencies
      </p>
      <h1 className="fade-up fade-up-2 font-display mt-6 max-w-4xl text-[11vw] leading-[1.04] font-semibold tracking-[-0.03em] text-balance sm:text-6xl xl:text-7xl">
        The CRM every recruiter{" "}
        <span className="relative inline-block whitespace-nowrap">
          deserves.
          <svg
            aria-hidden
            viewBox="0 0 220 24"
            preserveAspectRatio="none"
            className="absolute -bottom-2 left-0 h-4 w-full"
          >
            <path
              d="M6 16 C 60 6, 140 4, 214 12"
              fill="none"
              stroke="#d4d4d4"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </h1>
      <p className="fade-up fade-up-3 mt-6 max-w-2xl text-lg text-balance text-foreground/65 sm:text-xl">
        Driven by AI that never forgets a candidate. Ask your pipeline questions
        in plain English and place people faster.
      </p>
      <div className="fade-up fade-up-3 mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="bg-foreground text-background shadow-lg shadow-black/25 hover:bg-foreground/85"
          nativeButton={false}
          render={<Link href={cta} />}
        >
          Start free
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-foreground/15 bg-background/70 text-foreground hover:bg-background"
          nativeButton={false}
          render={<Link href="#product" />}
        >
          See it in action
        </Button>
      </div>
      <p className="fade-up fade-up-4 mt-7 text-[11px] font-semibold tracking-[0.28em] text-foreground/40 uppercase">
        No card needed&ensp;·&ensp;Track candidates&ensp;·&ensp;Never lose a
        lead
      </p>
      <div className="fade-up fade-up-4 relative mx-auto mt-14 w-full max-w-2xl">
        <div className="absolute -left-44 top-8 hidden -rotate-3 xl:block">
          <div className="animate-float rounded-xl bg-background p-3.5 text-left shadow-xl shadow-black/10 ring-1 ring-foreground/5">
            <p aria-hidden className="text-sm tracking-[0.2em] text-foreground">
              ★★★★★
            </p>
            <p className="mt-1 text-xs font-semibold text-foreground/80">
              Trusted by 100+ agencies
            </p>
          </div>
        </div>
        <div className="absolute -right-48 top-1/3 hidden rotate-2 xl:block">
          <div className="animate-float-delay w-44 rounded-xl bg-foreground p-4 text-left text-background shadow-xl shadow-black/20">
            <p className="text-[11px] font-semibold tracking-wide text-background/80 uppercase">
              Time to fill
            </p>
            <p className="font-display mt-1 text-3xl font-bold">19 days</p>
            <p className="mt-1 text-xs text-background/80">
              8 days faster than last quarter
            </p>
          </div>
        </div>
        <div className="absolute bottom-16 -left-36 z-10 hidden rotate-1 xl:block">
          <div className="animate-float flex items-center gap-2.5 rounded-xl bg-background px-3.5 py-3 shadow-xl shadow-black/10 ring-1 ring-foreground/5">
            <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              ✓
            </span>
            <p className="text-xs font-semibold text-foreground/80">
              Follow-up nudged · quiet for 12 days
            </p>
          </div>
        </div>
        <HeroDemo />
      </div>
    </section>
  );
}
