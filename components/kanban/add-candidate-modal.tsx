"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

export type AvailableCandidate = {
  _id: string;
  name: string;
  headline: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

type RowState = "idle" | "adding" | "added" | "failed";

function AddRow({
  candidate,
  jobId,
  onAdded,
}: {
  candidate: AvailableCandidate;
  jobId: string;
  onAdded: () => void;
}) {
  const [state, setState] = useState<RowState>("idle");
  const [pending, startTransition] = useTransition();

  const added = new Date(candidate.createdAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="hover:bg-muted/40 flex items-center gap-3 rounded-md px-2 py-2 transition-colors">
      <InitialsChip name={candidate.name} src={candidate.avatarUrl} size="md" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{candidate.name}</p>
        {candidate.headline ? (
          <p className="text-muted-foreground truncate text-xs">
            {candidate.headline}
          </p>
        ) : null}
      </div>
      <span className="text-muted-foreground shrink-0 font-mono text-[11px]">
        Added {added}
      </span>
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

export function AddCandidateModal({
  jobId,
  candidates,
}: {
  jobId: string;
  candidates: AvailableCandidate[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(q) ||
        (candidate.headline ?? "").toLowerCase().includes(q),
    );
  }, [candidates, query]);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            Add candidate
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to pipeline</DialogTitle>
          <DialogDescription>
            Candidates in your pool who aren&apos;t on this job yet.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or headline"
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="-mx-2 flex max-h-96 flex-col overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground px-2 py-6 text-center text-[13px]">
              {candidates.length === 0
                ? "Everyone in your pool is already on this job."
                : "No candidates match that search."}
            </p>
          ) : (
            filtered.map((candidate) => (
              <AddRow
                key={candidate._id}
                candidate={candidate}
                jobId={jobId}
                onAdded={() => router.refresh()}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
