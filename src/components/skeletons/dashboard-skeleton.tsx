import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    // JUST THE GRID. The Shell around it is permanent.
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* CARD 1 SKELETON */}
      <div className="p-6 rounded-xl border border-white/5 bg-white/5 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-1.5 w-full rounded-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
          <div className="pt-2 space-y-1">
            <div className="flex items-end gap-0.5 h-8 w-full mt-2 opacity-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-1"
                  style={{ height: `${30 + ((i * 13) % 70)}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2 SKELETON */}
      <div className="p-6 rounded-xl border border-white/5 bg-white/5 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-1.5 w-full rounded-full" />
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <Skeleton className="h-3 w-32" />
            <div className="grid grid-rows-7 grid-flow-col gap-1 w-full h-24 opacity-30">
              {Array.from({ length: 84 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 rounded-[1px] w-full h-full"
                  style={{ opacity: i % 3 === 0 ? 0.3 : 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3 SKELETON */}
      <div className="p-6 rounded-xl border border-white/5 bg-white/5 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <div className="p-3 rounded border border-white/5 bg-white/5 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-1 h-1.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-full rounded-sm" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2 border-t border-white/5 pt-4">
            <Skeleton className="h-3 w-full" />
            <div className="p-3 rounded border border-white/5 bg-white/5 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
