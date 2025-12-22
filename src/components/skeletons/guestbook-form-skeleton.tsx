import { Skeleton } from "@/components/ui/skeleton";

export function GuestbookFormSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mimics the "Glass Container" of the real form */}
      <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-50/5 min-h-55 flex flex-col items-center justify-center p-8">
        {/* 1. Mimic the "Fingerprint" Icon */}
        <div className="relative mb-8">
          <Skeleton className="h-14 w-14 rounded-2xl opacity-50" />
        </div>

        {/* 2. Mimic the Title & Subtitle */}
        <div className="space-y-3 flex flex-col items-center w-full mb-8">
          <Skeleton className="h-5 w-48 rounded-md" />
          <Skeleton className="h-3 w-64 rounded-md opacity-60" />
        </div>

        {/* 3. Mimic the 3 Auth Buttons (GitHub, Google, Discord) */}
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
