"use client";

import { useDraggable } from "@dnd-kit/core";
import { type Stage } from "@/sanity/schemas/stages";
import { InitialsChip } from "@/components/initials-chip";
import { RecordOfferDialog } from "@/components/offers/record-offer-dialog";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type BoardApplication = {
  _id: string;
  stage: Stage;
  stageUpdatedAt: string;
  candidateId: string | null;
  candidateName: string | null;
  candidateHeadline: string | null;
  candidateAvatarUrl?: string | null;
  /** Embedding match vs the role's brief, relative to this board's pool. Pro-only. */
  matchPct?: number | null;
  /** The offer figure, once one is out. */
  offerAmount?: string | null;
  /** The note that went with the offer — so editing from a board keeps it. */
  offerNote?: string | null;
};

function daysInStage(stageUpdatedAt: string): number {
  const elapsed = Date.now() - new Date(stageUpdatedAt).getTime();
  return Math.max(0, Math.floor(elapsed / 86_400_000));
}

/** Presentational card — also rendered inside the DragOverlay. */
export function KanbanCardContent({
  application,
  dragging = false,
  pending = false,
  action = null,
}: {
  application: BoardApplication;
  dragging?: boolean;
  /** The card's stage move is still committing on the server. */
  pending?: boolean;
  /** Interactive footer control. Omitted in the DragOverlay copy. */
  action?: React.ReactNode;
}) {
  const days = daysInStage(application.stageUpdatedAt);
  const stale =
    days > 14 &&
    application.stage !== "hired" &&
    application.stage !== "rejected";

  return (
    <div
      className={cn(
        "bg-card rounded-md border p-3",
        dragging && "ring-ring/20 shadow-md ring-1",
      )}
    >
      <div className="flex items-center gap-2">
        <InitialsChip
          name={application.candidateName ?? "Unknown candidate"}
          src={application.candidateAvatarUrl}
          size="sm"
        />
        <p className="min-w-0 flex-1 truncate text-[13px] leading-tight font-medium">
          {application.candidateName ?? "Unknown candidate"}
        </p>
        {typeof application.matchPct === "number" ? (
          <span
            className="text-ai shrink-0 font-mono text-[11px] font-medium tabular-nums"
            title="Match vs the role's brief, relative to this board"
          >
            {application.matchPct}%
          </span>
        ) : null}
      </div>
      {application.candidateHeadline ? (
        <p className="text-muted-foreground mt-1.5 truncate text-xs">
          {application.candidateHeadline}
        </p>
      ) : null}
      {application.offerAmount ? (
        <p className="text-stage-offer mt-1.5 font-mono text-xs font-medium tabular-nums">
          {application.offerAmount}
          <span className="text-stage-offer/70 font-sans font-normal">
            {" "}
            {application.stage === "hired" ? "accepted" : "offered"}
          </span>
        </p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {pending ? (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
            <Spinner className="size-3" />
            Moving…
          </span>
        ) : (
          <span
            className="text-muted-foreground text-[11px] tabular-nums"
            suppressHydrationWarning
          >
            {days === 0 ? "Moved today" : `${days}d in stage`}
          </span>
        )}
        {stale ? (
          <span
            className="text-stage-offer bg-stage-offer/10 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums"
            suppressHydrationWarning
          >
            stale {days}d
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function KanbanCard({
  application,
  pending = false,
  readOnly,
  onOpen,
}: {
  application: BoardApplication;
  /** The card's stage move is still committing on the server. */
  pending?: boolean;
  readOnly: boolean;
  /** Open the candidate record — suppressed by the board right after a drag. */
  onOpen?: (application: BoardApplication) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: application._id,
    disabled: readOnly,
  });

  // Recording the offer belongs where you drag someone into Offer — not three
  // clicks away on their record.
  const offerable =
    !readOnly &&
    (application.stage === "offer" || application.stage === "hired");

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Base UI's dialog trigger manages its own click, so don't rely on
        // propagation alone — never open the record from a card control.
        if ((e.target as HTMLElement).closest("[data-card-action]")) return;
        onOpen?.(application);
      }}
      className={cn(
        "cursor-pointer",
        !readOnly && "touch-none",
        isDragging && "opacity-40",
      )}
    >
      <KanbanCardContent
        application={application}
        pending={pending}
        action={
          offerable ? (
            // The card is both a drag handle and a click-to-open target, so the
            // dialog's own events must not reach either.
            <div data-card-action onPointerDown={(e) => e.stopPropagation()}>
              <RecordOfferDialog
                applicationId={application._id}
                candidateName={application.candidateName ?? "this candidate"}
                existingAmount={application.offerAmount}
                existingNote={application.offerNote}
              />
            </div>
          ) : null
        }
      />
    </div>
  );
}
