import { Skeleton } from "@/components/ui/skeleton";

/** Fallback for the job pipeline page: header, stat strip, board columns. */
export default function JobPipelineLoading() {
  return (
    <div className="flex flex-1 flex-col pt-5 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-44" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <Skeleton className="mt-6 h-16 w-full" />
      <div className="mt-6 grid flex-1 auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="min-h-56 flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
