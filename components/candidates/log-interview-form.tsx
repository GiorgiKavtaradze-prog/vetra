"use client";

import * as React from "react";
import { ClipboardPen } from "lucide-react";
import { createInterview } from "@/lib/actions/interviews";
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
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const OUTCOME_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "pass", label: "Pass" },
  { value: "fail", label: "Fail" },
] as const;

export type ApplicationOption = {
  id: string;
  jobTitle: string;
};

function LogInterviewFields({
  candidateId,
  applications,
  onDone,
}: {
  candidateId: string;
  applications: ApplicationOption[];
  onDone: () => void;
}) {
  const [applicationId, setApplicationId] = React.useState<string | null>(
    applications.length === 1 ? applications[0].id : null,
  );
  const [outcome, setOutcome] = React.useState<string>("pending");
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!applicationId) {
      setError("Choose an application.");
      return;
    }

    // datetime-local values carry no timezone — convert to a UTC instant here,
    // where the user's timezone is known, so the server never reinterprets it.
    const scheduledAtRaw = String(data.get("scheduledAt") ?? "");
    const scheduledAtDate = scheduledAtRaw ? new Date(scheduledAtRaw) : null;
    const scheduledAt =
      scheduledAtDate && !Number.isNaN(scheduledAtDate.getTime())
        ? scheduledAtDate.toISOString()
        : "";

    startTransition(async () => {
      const result = await createInterview({
        candidateId,
        applicationId,
        roundName: String(data.get("roundName") ?? ""),
        scheduledAt,
        interviewer: String(data.get("interviewer") ?? ""),
        feedbackText: String(data.get("feedbackText") ?? ""),
        outcome,
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="interview-application">Application</Label>
          <Select
            value={applicationId}
            onValueChange={(value) => setApplicationId(value)}
            items={applications.map((application) => ({
              value: application.id,
              label: application.jobTitle,
            }))}
          >
            <SelectTrigger id="interview-application" className="w-full">
              <SelectValue placeholder="Select an application" />
            </SelectTrigger>
            <SelectContent>
              {applications.map((application) => (
                <SelectItem key={application.id} value={application.id}>
                  {application.jobTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="interview-round">Round</Label>
          <Input
            id="interview-round"
            name="roundName"
            placeholder="Technical interview"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="interview-scheduled">Scheduled at</Label>
          <Input
            id="interview-scheduled"
            name="scheduledAt"
            type="datetime-local"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interview-interviewer">Interviewer</Label>
          <Input id="interview-interviewer" name="interviewer" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interview-outcome">Outcome</Label>
          <Select
            value={outcome}
            onValueChange={(value) => setOutcome(value ?? "pending")}
            items={OUTCOME_OPTIONS.map((option) => ({ ...option }))}
          >
            <SelectTrigger id="interview-outcome" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTCOME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="interview-feedback">Feedback</Label>
        <Textarea
          id="interview-feedback"
          name="feedbackText"
          className="min-h-28"
          placeholder="The interviewer's written debrief"
        />
        <p className="text-muted-foreground text-xs">
          Written debriefs are searchable by the AI agent later — the sharper
          the notes, the better the recall.
        </p>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner /> : null}
          {isPending ? "Logging…" : "Log interview"}
        </Button>
      </div>
    </form>
  );
}

/** The page's primary action: a solid button that opens the log-interview modal. */
export function LogInterviewModal({
  candidateId,
  applications,
}: {
  candidateId: string;
  applications: ApplicationOption[];
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button>
            <ClipboardPen className="size-4" />
            Log interview
          </Button>
        }
      />
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Log interview</DialogTitle>
          <DialogDescription>
            Record a round and its feedback for this candidate.
          </DialogDescription>
        </DialogHeader>
        {applications.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-[13px]">
            Add this candidate to a job before logging an interview.
          </p>
        ) : (
          <LogInterviewFields
            // Remount per open so a fresh dialog starts with clean fields.
            key={String(open)}
            candidateId={candidateId}
            applications={applications}
            onDone={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
