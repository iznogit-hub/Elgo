"use client";

import { useOthers } from "@liveblocks/react";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ActiveVisitors({ className }: { className?: string }) {
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
