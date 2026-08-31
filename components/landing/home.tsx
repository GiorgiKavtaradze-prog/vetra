import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Marquee } from "@/components/landing/marquee";
import { Product } from "@/components/landing/product";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { Trust } from "@/components/landing/trust";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { CtaFooter } from "@/components/landing/cta-footer";

export default async function LandingPage() {
  const { userId } = await auth();
  const cta = userId ? "/dashboard" : "/sign-up";

  return (
    <main className="flex-1">
      <div className="grain relative overflow-hidden bg-background text-foreground">
        <div
          aria-hidden
          className="animate-drift-slow pointer-events-none absolute -left-40 top-1/3 h-152 w-152 rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.10),transparent_70%)] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.08),transparent_70%)]"
        />
        <div
          aria-hidden
          className="animate-drift pointer-events-none absolute -right-48 top-1/2 h-168 w-2xl rounded-full bg-[radial-gradient(closest-side,rgba(0,0,0,0.08),transparent_70%)] blur-2xl dark:bg-[radial-gradient(closest-side,rgba(255,255,255,0.06),transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-96 bg-[linear-gradient(to_top,rgba(0,0,0,0.06),transparent)] dark:bg-[linear-gradient(to_top,rgba(255,255,255,0.05),transparent)]"
        />
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -left-24 top-24 hidden w-72 -rotate-12 lg:block"
        >
          <path
            d="M40 300 C 60 140, 200 60, 360 80"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>
        <svg
          aria-hidden
          viewBox="0 0 400 400"
          className="pointer-events-none absolute -right-20 top-1/2 hidden w-64 rotate-160 lg:block"
        >
          <path
            d="M40 300 C 60 140, 200 60, 360 80"
            fill="none"
            stroke="#d4d4d4"
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>
        <Header />
        <Hero cta={cta} />
        <Marquee />
      </div>
      <div className="h-0.5 bg-linear-to-r from-neutral-300 to-neutral-900" />
      <Product />
      <HowItWorks />
      <UseCases />
      <Trust />
      <Pricing cta={cta} />
      <Faq />
      <CtaFooter cta={cta} />
    </main>
  );
}
