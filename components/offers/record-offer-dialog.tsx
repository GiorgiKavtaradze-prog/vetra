"use client";

import * as React from "react";
import { BadgePoundSterling } from "lucide-react";
import { recordOffer } from "@/lib/actions/applications";
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
import { Textarea } from "@/components/ui/textarea";

export function RecordOfferDialog({
  applicationId,
  candidateName,
  existingAmount,
  existingNote,
}: {
  applicationId: string;
  candidateName: string;
  existingAmount?: string | null;
  existingNote?: string | null;
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const editing = Boolean(existingAmount);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await recordOffer(applicationId, {
        amount: String(data.get("amount") ?? ""),
        note: String(data.get("note") ?? ""),
      });
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError(null);
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="border-stage-offer/40 text-stage-offer hover:text-stage-offer relative z-10 h-6.5 px-2 text-xs"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <BadgePoundSterling className="size-3.5" />
            {editing ? "Edit offer" : "Record offer"}
          </Button>
        }
      />
      <DialogContent
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit the offer" : "Record the offer"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Update the offer out to ${candidateName}.`
              : `Log what was offered to ${candidateName} — this moves them to the Offer stage.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="offer-amount">Amount</Label>
            <Input
              id="offer-amount"
              name="amount"
              defaultValue={existingAmount ?? ""}
              placeholder="£68,000"
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="offer-note">Note</Label>
            <Textarea
              id="offer-note"
              name="note"
              defaultValue={existingNote ?? ""}
              className="min-h-20"
              placeholder="Terms, deadline, competing offers…"
            />
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner /> : null}
              {isPending ? "Saving…" : editing ? "Save offer" : "Record offer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
