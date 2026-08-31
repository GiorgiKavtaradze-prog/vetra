import { Skeleton } from "@/components/ui/skeleton";

/** Route-level fallback shown while any /dashboard page loads its data. */
export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-8 pt-5 pb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
