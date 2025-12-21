import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <main className="relative flex min-h-dvh md:h-dvh w-full flex-col items-center pt-24 md:pt-40 pb-20 px-6 overflow-hidden">
      {/* 1. Mimic Header Positioning (Left: Abort, Right: Live Feed) */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-2 w-20" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-12 pt-24 md:pt-12">
        {/* 2. Main Title Area */}
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 md:h-14 md:w-96 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-48 mx-auto rounded-md opacity-40" />
        </div>

        {/* 3. Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARD 1: SYSTEM INFRA */}
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
                <div className="space-y-1">
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
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

          {/* CARD 2: DEV ACTIVITY */}
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

          {/* CARD 3: COMBAT RECORDS */}
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
      </div>
    </main>
  );
}
