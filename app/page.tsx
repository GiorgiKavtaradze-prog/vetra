import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { HeroDemo } from "@/components/landing/hero-demo";
import { Reveal } from "@/components/landing/reveal";
import { PipelineFlow } from "@/components/landing/pipeline-flow";
import { cn } from "@/lib/utils";

const QUERIES = [
  "who's stalled in screening?",
  "React candidates with fintech experience",
  "who gave strong system-design answers?",
  "move Priya to offer",
  "which clients have no active candidates?",
  "log that Henrik passed his tech screen",
  "who mentioned competing offers?",
  "source candidates for the Lumapay role",
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    blurb: "Run one live search",
    features: [
      "1 open job",
      "Up to 25 candidates",
      "Pipeline board with drift flags",
      "Interview debriefs",
    ],
  },
  {
    name: "Pro",
    price: "$39",
    blurb: "The full desk, with the AI",
    features: [
      "Unlimited jobs & candidates",
      "AI Talent Agent",
      "One-button candidate sourcing",
      "Semantic search over CVs & debriefs",
      "5 recruiter seats",
    ],
    highlight: true,
  },
  {
    name: "Scale",
    price: "$99",
    blurb: "For bigger agencies",
    features: ["Everything in Pro", "20 recruiter seats", "Priority support"],
  },
] as const;

const FAQS = [
  {
    q: "Where do the AI's answers come from?",
    a: "Only from your workspace — the CVs, debriefs and pipeline your team has logged. Every answer links to its source records.",
  },
  {
    q: "Can the AI reject candidates?",
    a: "No. It retrieves, summarises and carries out explicit instructions like moving a stage. Hiring judgements stay with people.",
  },
  {
    q: "How do seats work?",
    a: "Plans are per agency workspace. Pro includes 5 recruiter seats, Scale 20 — invites beyond the cap are blocked automatically.",
  },
  {
    q: "Do I need to reformat our CVs?",
    a: "No. Paste them as they are — the semantic search works on real, messy text, and gets sharper as debriefs accumulate.",
  },
  {
    q: "What happens on the Free plan?",
    a: "A full working desk with one open job and up to 25 candidates. Upgrade when you want the AI and unlimited volume.",
  },
] as const;

function AskVisual() {
  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex flex-col gap-3">
        <p className="bg-muted ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-2 text-sm">
          Who fits this brief?
        </p>
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
            V
          </span>
          <div className="text-sm leading-relaxed">
            <p>
              <span className="font-semibold text-foreground underline underline-offset-2">
                Oluwaseun Adeyemi
              </span>{" "}
              — <em>&quot;strongest final round this year&quot;</em>
            </p>
            <p className="mt-1.5">
              <span className="font-semibold text-foreground underline underline-offset-2">
                Priya Raghavan
              </span>{" "}
              — reached offer for a similar role
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourcingVisual() {
  const rows = [
    { pct: 94, name: "Priya Raghavan", note: "Senior React · fintech" },
    { pct: 88, name: "Nadia Hussain", note: "Senior React engineer" },
    { pct: 81, name: "Henrik Dahl", note: "Frontend · web perf" },
  ];
  return (
    <div className="bg-card rounded-2xl border p-5 shadow-xs">
      <div className="flex flex-col gap-2">
        {rows.map((row, i) => (
          <div
            key={row.name}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3",
              i === 0 ? "border-foreground/25 bg-foreground/5" : "bg-card",
            )}
          >
            <span className="font-display w-11 text-base font-bold text-foreground tabular-nums">
              {row.pct}%
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{row.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {row.note}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold",
                i === 0
                  ? "bg-foreground text-background"
                  : "text-muted-foreground border",
              )}
            >
              Add
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
        <header className="fixed inset-x-0 top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
            <Link href="/">
              <span className="font-display text-xl font-bold tracking-tight">
                Vetra<span className="text-foreground">.</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <AnimatedThemeToggler className="inline-flex size-9 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground [&_svg]:size-4.5" />
              {userId ? (
                <Button
                  className="bg-foreground text-background hover:bg-foreground/85"
                  nativeButton={false}
                  render={<Link href="/dashboard" />}
                >
                  Open dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    nativeButton={false}
                    render={<Link href="/sign-in" />}
                  >
                    Sign in
                  </Button>
                  <Button
                    className="bg-foreground text-background hover:bg-foreground/85"
                    nativeButton={false}
                    render={<Link href="/sign-up" />}
                  >
                    Start free
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
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
            Driven by AI that never forgets a candidate. Ask your pipeline
            questions in plain English and place people faster.
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
                <p
                  aria-hidden
                  className="text-sm tracking-[0.2em] text-foreground"
                >
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
        <div className="relative z-10 border-t border-foreground/10 py-4">
          <div className="flex overflow-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
              {[...QUERIES, ...QUERIES].map((query, i) => (
                <span
                  key={i}
                  className="flex items-center gap-8 font-mono text-xs whitespace-nowrap text-foreground/45"
                >
                  “{query}”
                  <span className="size-1 rounded-full bg-foreground/30" />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="h-0.5 bg-linear-to-r from-neutral-300 to-neutral-900" />
      <section id="product" className="bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
                A pipeline that flags drift
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                Every application moves across one board. Sit still too long and
                it&apos;s flagged — before your client asks why the search went
                quiet.
              </p>
              <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
                <li className="flex gap-2.5">
                  <span className="bg-foreground/40 mt-2 size-1 shrink-0 rounded-full" />
                  Six stages, applied to hired — drag between them
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-foreground/40 mt-2 size-1 shrink-0 rounded-full" />
                  Automatic stale flags after 14 quiet days
                </li>
                <li className="flex gap-2.5">
                  <span className="bg-foreground/40 mt-2 size-1 shrink-0 rounded-full" />
                  Every client, role and candidate cross-linked
                </li>
              </ul>
            </Reveal>
            <Reveal delay={140}>
              <PipelineFlow />
            </Reveal>
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal delay={140} className="lg:order-first">
              <AskVisual />
            </Reveal>
            <Reveal>
              <span className="inline-block rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-semibold text-foreground">
                AI · Pro
              </span>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em]">
                Ask your database like a colleague
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                Vetra reads your pipeline and the texture of your interview
                notes together. Every answer is a person, linked, with the
                evidence beside them.
              </p>
              <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  Plain-English questions over CVs and debriefs
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  Acts on instruction: move stages, log interviews
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  Never scores or rejects — humans decide
                </li>
              </ul>
            </Reveal>
          </div>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <Reveal>
              <span className="inline-block rounded-md bg-foreground/5 px-2 py-0.5 text-xs font-semibold text-foreground">
                AI · Pro
              </span>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-[-0.02em]">
                One button. Your shortlist.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md leading-relaxed">
                Open a role and press Help source candidates — every CV in your
                pool is scored against the brief, with one-click add to
                pipeline.
              </p>
              <ul className="text-muted-foreground mt-5 space-y-2 text-sm">
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  Semantic match, not keyword bingo
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  Relative strength across your own pool
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground" />
                  A place to start — never a ranking of people
                </li>
              </ul>
            </Reveal>
            <Reveal delay={140}>
              <SourcingVisual />
            </Reveal>
          </div>
        </div>
      </section>
      <section id="how" className="border-t">
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
              Three steps to a faster desk
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                n: "01",
                t: "Load your pool",
                b: "Clients, roles, candidates. Paste CVs as they are — debriefs become searchable memory.",
              },
              {
                n: "02",
                t: "Ask in plain English",
                b: "Structure and meaning read together. The answer is a person, linked.",
              },
              {
                n: "03",
                t: "Place faster",
                b: "One click to pipeline. Drift gets flagged before searches go cold.",
              },
            ].map((step, i) => (
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
      <section className="border-t">
        <div className="mx-auto w-full max-w-7xl px-6 py-20">
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-[-0.02em]">
              Built for every desk
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Permanent",
                b: "Long pipelines, many clients. Nothing slips between stages.",
              },
              {
                t: "Contract",
                b: "Availability and notice periods, answerable in one question.",
              },
              {
                t: "Executive search",
                b: "Years of confidential debriefs become your edge on the next mandate.",
              },
              {
                t: "Embedded & in-house",
                b: "One workspace per team, seats enforced automatically.",
              },
            ].map((useCase, i) => (
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
      <section className="border-t">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-3">
          {[
            {
              t: "Your data stays yours",
              b: "Every workspace is isolated by design — the AI can only ever see your agency's records, enforced at the query layer.",
            },
            {
              t: "Answers cite their sources",
              b: "Every claim links back to the CV or debrief it came from. No black boxes, no invented candidates.",
            },
            {
              t: "People decide, not models",
              b: "The agent retrieves, summarises and acts on your instruction. It never scores, ranks out, or rejects anyone.",
            },
          ].map((item, i) => (
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
            {PLANS.map((plan, i) => {
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
    </main>
  );
}
