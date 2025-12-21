import { Skeleton } from "@/components/ui/skeleton";

export function GuestbookSkeleton() {
  return (
    <div className="w-full h-full overflow-hidden">
      <div className="flex gap-4 p-1 pt-2 pb-4 items-start h-full px-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="relative shrink-0 flex flex-col justify-between rounded-2xl border border-white/5 bg-zinc-50/5 p-4 w-70 h-42.5"
          >
            {/* Header: Avatar + Name */}
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-25" />
            </div>

            {/* Message Body */}
            <div className="flex-1 my-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-[90%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>

            {/* Footer: Date */}
            <div className="flex items-center justify-between shrink-0 pt-2 border-t border-white/5">
              <Skeleton className="h-2 w-15" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
