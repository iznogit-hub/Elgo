"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function Ping() {
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const measure = async () => {
      const start = performance.now();
      try {
        // Simple HEAD request to minimize data transfer
        await fetch("/api/health", { method: "HEAD", cache: "no-store" });
        setLatency(Math.round(performance.now() - start));
      } catch {
        setLatency(null);
      }
    };

    measure();
    // Optional: Re-measure every 30 seconds
    const interval = setInterval(measure, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!latency) return null;

  // Color coding based on speed
  const isLaggy = latency > 200;

  return (
    <div
      className="group flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/60 transition-colors hover:text-foreground cursor-pointer select-none"
      title="Server Latency"
    >
      <Activity
        className={cn(
          "h-3 w-3",
          isLaggy ? "text-yellow-500" : "text-green-500"
        )}
      />
      <span>{latency}ms</span>
    </div>
  );
}