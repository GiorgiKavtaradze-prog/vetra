"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { STAGES, type Stage } from "@/sanity/schemas/stages";
import { StagePill } from "@/components/stage-rail";
import { moveApplication } from "@/lib/actions/applications";
import { cn } from "@/lib/utils";
import {
  KanbanCard,
  KanbanCardContent,
  type BoardApplication,
} from "./kanban-card";

function byStageUpdatedAtDesc(a: BoardApplication, b: BoardApplication) {
  return b.stageUpdatedAt.localeCompare(a.stageUpdatedAt);
}

export function KanbanBoard({
  initialApplications,
  jobId,
  readOnly = false,
  lanes = STAGES,
}: {
  initialApplications: BoardApplication[];
  /** Set on a job's own board; the global pipeline omits it. */
  jobId?: string;
  readOnly?: boolean;
  /** Stages rendered as columns — the global pipeline folds closed work away. */
  lanes?: readonly Stage[];
}) {
  const router = useRouter();
  const suppressClickRef = useRef(false);
  const [applications, setApplications] =
    useState<BoardApplication[]>(initialApplications);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Cards whose stage move is still committing on the server. Kept as a set
  // because several cards can be in flight at once.
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  function markPending(id: string, pending: boolean) {
    setPendingIds((prev) => {
      const next = new Set(prev);
      if (pending) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // Revalidated server data (e.g. after "Add candidate to pipeline") must win:
  // re-sync local board state whenever the server prop identity changes.
  const [prevInitial, setPrevInitial] = useState(initialApplications);
  if (initialApplications !== prevInitial) {
    setPrevInitial(initialApplications);
    setApplications(initialApplications);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const columns = useMemo(() => {
    const map = new Map<Stage, BoardApplication[]>(
      STAGES.map((stage) => [stage, []]),
    );
    for (const application of applications) {
      map.get(application.stage)?.push(application);
    }
    for (const list of map.values()) list.sort(byStageUpdatedAtDesc);
    return map;
  }, [applications]);

  const activeApplication = activeId
    ? (applications.find((a) => a._id === activeId) ?? null)
    : null;

  function handleDragStart(event: DragStartEvent) {
    suppressClickRef.current = true;
    setActiveId(String(event.active.id));
    setError(null);
  }

  // The click that follows pointerup after a drag must not navigate.
  function releaseClickSuppression() {
    setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function openCandidate(application: BoardApplication) {
    if (suppressClickRef.current || !application.candidateId) return;
    router.push(`/dashboard/candidates/${application.candidateId}`);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    releaseClickSuppression();
    if (!over) return;

    const targetStage = String(over.id) as Stage;
    if (!STAGES.includes(targetStage)) return;

    const application = applications.find((a) => a._id === active.id);
    if (!application || application.stage === targetStage) return;

    // Optimistic move; on failure revert ONLY this card so a concurrent
    // move of another card (already persisted) is not clobbered.
    const revert = () =>
      setApplications((prev) =>
        prev.map((a) =>
          a._id === application._id
            ? {
                ...a,
                stage: application.stage,
                stageUpdatedAt: application.stageUpdatedAt,
              }
            : a,
        ),
      );
    const optimisticAt = new Date().toISOString();
    setApplications((prev) =>
      prev.map((a) =>
        a._id === application._id
          ? { ...a, stage: targetStage, stageUpdatedAt: optimisticAt }
          : a,
      ),
    );

    markPending(application._id, true);
    moveApplication(application._id, targetStage)
      .then((result) => {
        if ("error" in result) {
          revert();
          setError(result.error);
          return;
        }
        setApplications((prev) =>
          prev.map((a) =>
            a._id === application._id
              ? {
                  ...a,
                  stage: result.stage,
                  stageUpdatedAt: result.stageUpdatedAt,
                }
              : a,
          ),
        );
      })
      .catch(() => {
        revert();
        setError("Could not move the candidate. Try again.");
      })
      .finally(() => {
        markPending(application._id, false);
      });
  }

  return (
    <div className="flex flex-1 flex-col gap-3" data-job-id={jobId}>
      {readOnly ? (
        <div className="text-muted-foreground rounded-lg border bg-muted/50 px-4 py-2.5 text-[13px]">
          This job is closed — pipeline is read-only.
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <DndContext
        id="vetra-kanban"
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
          releaseClickSuppression();
        }}
      >
        <div
          className={cn(
            "grid flex-1 auto-rows-fr grid-cols-2 gap-3 overflow-hidden pb-2 md:grid-cols-3",
            lanes.length <= 4 ? "lg:grid-cols-4" : "lg:grid-cols-6",
          )}
        >
          {lanes.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={columns.get(stage) ?? []}
              pendingIds={pendingIds}
              readOnly={readOnly}
              onOpen={openCandidate}
            />
          ))}
        </div>
        <DragOverlay>
          {activeApplication ? (
            <KanbanCardContent application={activeApplication} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  stage,
  applications,
  pendingIds,
  readOnly,
  onOpen,
}: {
  stage: Stage;
  applications: BoardApplication[];
  pendingIds: ReadonlySet<string>;
  readOnly: boolean;
  onOpen: (application: BoardApplication) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    disabled: readOnly,
  });

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <StagePill stage={stage} />
        <span className="text-muted-foreground/80 font-mono text-[11px] font-medium tabular-nums">
          {applications.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "bg-muted/40 flex min-h-56 flex-1 flex-col gap-2.5 rounded-lg p-2 transition-colors",
          isOver && !readOnly && "bg-muted ring-ring/30 ring-1",
        )}
      >
        {applications.map((application) => (
          <KanbanCard
            key={application._id}
            application={application}
            pending={pendingIds.has(application._id)}
            readOnly={readOnly}
            onOpen={onOpen}
          />
        ))}
        {applications.length === 0 ? (
          <p className="text-muted-foreground px-1 py-4 text-center text-xs">
            No candidates
          </p>
        ) : null}
      </div>
    </div>
  );
}
