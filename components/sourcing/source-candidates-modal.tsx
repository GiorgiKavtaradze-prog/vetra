"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  sourceCandidates,
  type SourcedCandidate,
} from "@/lib/actions/sourcing";
import { createApplication } from "@/lib/actions/applications";
import { InitialsChip } from "@/components/initials-chip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

type RowState = "idle" | "adding" | "added" | "failed";

function MatchRow({
  candidate,
  jobId,
  onAdded,
}: {
  candidate: SourcedCandidate;
  jobId: string;
  onAdded: () => void;
}) {
  const [state, setState] = useState<RowState>("idle");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 py-2.5">
      <span className="text-ai w-9 shrink-0 text-sm font-semibold tabular-nums">
        {candidate.pct}%
      </span>
      <div className="bg-muted h-1 w-12 shrink-0 overflow-hidden rounded-full">
        <span
          className="bg-ai block h-full rounded-full"
          style={{ width: `${candidate.pct}%` }}
        />
      </div>
      <InitialsChip name={candidate.name} src={candidate.avatarUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/candidates/${candidate._id}`}
          className="block truncate text-[13px] font-medium hover:underline"
        >
          {candidate.name}
        </Link>
        {candidate.headline ? (
          <p className="text-muted-foreground truncate text-xs">
            {candidate.headline}
          </p>
        ) : null}
      </div>
      <div className="w-24 shrink-0 text-right">
        {state === "added" ? (
          <span className="text-stage-hired text-xs font-medium">
            In pipeline
          </span>
        ) : state === "failed" ? (
          <span className="text-destructive text-xs">Failed</span>
        ) : (
          <Button
            size="sm"
            variant="outline"
            disabled={pending || state === "adding"}
            onClick={() => {
              setState("adding");
              startTransition(async () => {
                const result = await createApplication(jobId, candidate._id);
                if ("error" in result) {
                  setState("failed");
                  return;
                }
                setState("added");
                onAdded();
              });
            }}
          >
            {state === "adding" ? <Spinner /> : null}
            {state === "adding" ? "Adding…" : "Add"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SourceCandidatesModal({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, startLoad] = useTransition();
  const [matches, setMatches] = useState<SourcedCandidate[] | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    setUpgrade(false);
    startLoad(async () => {
      const result = await sourceCandidates(jobId);
      if ("upgrade" in result) {
        setUpgrade(true);
        return;
      }
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMatches(result.matches);
    });
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open && matches === null && !upgrade) load();
      }}
    >
      <DialogTrigger
        render={
          <Button size="sm" className="bg-ai text-ai-foreground hover:bg-ai/90">
            Help source candidates
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Suggested candidates</DialogTitle>
          <DialogDescription>
            Your pool, matched against this role&apos;s description.
          </DialogDescription>
        </DialogHeader>

        {upgrade ? (
          <div className="border-ai/30 bg-ai-soft/40 rounded-lg border p-4">
            <p className="text-[13px] font-medium">
              Candidate sourcing is part of the AI Talent Agent on Pro.
            </p>
            <Button
              size="sm"
              className="bg-ai text-ai-foreground hover:bg-ai/90 mt-3"
              nativeButton={false}
              render={<Link href="/dashboard/billing" />}
            >
              See plans
            </Button>
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : loading || matches === null ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-[13px]">
            No available candidates to match — everyone eligible is already in
            this pipeline.
          </p>
        ) : (
          <>
            <div className="-my-1 flex max-h-96 flex-col divide-y overflow-y-auto">
              {matches.map((candidate) => (
                <MatchRow
                  key={candidate._id}
                  candidate={candidate}
                  jobId={jobId}
                  onAdded={() => router.refresh()}
                />
              ))}
            </div>
            <p className="text-muted-foreground text-xs">
              Match strength is relative to your pool — a place to start, not a
              ranking of people.
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
