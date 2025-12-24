import { Skeleton } from "@/components/ui/skeleton";

export function AchievementsSkeleton() {
  return (
    <div className="z-10 w-full max-w-4xl flex flex-col gap-8 md:gap-12 mt-4">
      {/* --- Player Stats HUD Skeleton --- */}
      <div className="w-full relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xl p-5 md:p-6">
        <div className="relative flex flex-col md:flex-row gap-6 md:items-center justify-between">
          {/* Rank Info Left */}
          <div className="flex items-center gap-5">
            {/* Rank Icon */}
            <Skeleton className="h-16 w-16 rounded-xl border-2 shrink-0" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-20" /> {/* "Current Rank" */}
                <div className="h-px w-6 bg-border" />
              </div>
              <Skeleton className="h-8 w-48" /> {/* Rank Title */}
              <Skeleton className="h-3 w-32" /> {/* XP Text */}
            </div>
          </div>

          {/* XP Progress Right */}
          <div className="w-full md:w-72 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            {/* Bar */}
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Achievement Grid Skeleton --- */}
      {/* REMOVED pb-24 here as well */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="relative flex flex-col p-4 rounded-lg border bg-secondary/5 h-35"
          >
            {/* Header: Icon + XP */}
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-5 w-12 rounded" />
            </div>

            {/* Content */}
            <div className="space-y-2 mt-auto">
              <Skeleton className="h-4 w-3/4" /> {/* Title */}
              <div className="space-y-1">
                <Skeleton className="h-2 w-full" /> {/* Desc line 1 */}
                <Skeleton className="h-2 w-5/6" /> {/* Desc line 2 */}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
