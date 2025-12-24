"use client";

import { useOthers } from "@liveblocks/react";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Inner component that assumes the RoomProvider is present.
 * This contains the hook that was causing the crash.
 */
function ActiveVisitorsContent({ className }: { className?: string }) {
  const others = useOthers();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const count = others.length + 1;

  return (
    <div
      className={cn(
        "group flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 transition-colors hover:text-foreground select-none",
        className,
      )}
      title="Live Network Users"
    >
      <Users className="h-3 w-3 opacity-50 transition-all group-hover:opacity-100 group-hover:text-primary" />
      <span className="tabular-nums">{count}</span>
    </div>
  );
}

/**
 * Main export that acts as a Safety Guard.
 * It strictly prevents the inner component from mounting if Realtime features are disabled.
 */
export function ActiveVisitors({ className }: { className?: string }) {
  // Must match the check in RealtimeProvider
  const isRealtimeEnabled = !!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

  if (!isRealtimeEnabled) {
    return null;
  }

  return <ActiveVisitorsContent className={className} />;
}
