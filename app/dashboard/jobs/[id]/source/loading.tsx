import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

/** The sourcing page runs a slow semantic match — say so while it works. */
export default function SourceCandidatesLoading() {
  return (
    <div className="flex flex-col pb-6">
      <div className="pt-5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-7 w-60" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <div className="text-muted-foreground mt-8 flex items-center gap-2 text-[13px]">
        <Spinner className="text-ai size-4" />
        Matching your pool against this role…
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
