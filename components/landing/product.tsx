import { Reveal } from "@/components/landing/reveal";
import { PipelineFlow } from "@/components/landing/pipeline-flow";
import { AskVisual } from "@/components/landing/ask-visual";
import { SourcingVisual } from "@/components/landing/sourcing-visual";

export function Product() {
  return (
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
              Vetra reads your pipeline and the texture of your interview notes
              together. Every answer is a person, linked, with the evidence
              beside them.
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
              pool is scored against the brief, with one-click add to pipeline.
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
  );
}
