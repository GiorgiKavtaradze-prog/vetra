"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createApplication } from "@/lib/actions/applications";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function AddToPipelineButton({
  jobId,
  candidateId,
}: {
  jobId: string;
  candidateId: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "added" | "failed">("idle");
  const [pending, startTransition] = useTransition();

  function handleAdd() {
    startTransition(async () => {
      const result = await createApplication(jobId, candidateId);
      if ("error" in result) {
        setState("failed");
        return;
      }
      setState("added");
      router.refresh();
    });
  }

  if (state === "added") {
    return (
      <span className="text-stage-hired text-xs font-medium">In pipeline</span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {state === "failed" ? (
        <span className="text-destructive text-xs">Could not add</span>
      ) : null}
      <Button
        size="sm"
        variant="outline"
        onClick={handleAdd}
        disabled={pending}
      >
        {pending ? <Spinner /> : null}
        {pending ? "Adding…" : "Add to pipeline"}
      </Button>
    </div>
  );
}
