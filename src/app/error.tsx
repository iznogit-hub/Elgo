"use client";

import { useEffect } from "react";
import { RefreshCcw, AlertOctagon, Terminal } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 p-4 text-center md:p-12">
      {/* Icon Graphic */}
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20 duration-1000" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background border-2 border-red-500 shadow-[0_0_40px_-10px_rgba(239,68,68,0.5)]">
          <AlertOctagon className="h-10 w-10 text-red-500" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-red-500">
          <HackerText text="SYSTEM_MALFUNCTION" />
        </h2>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          ERR_CODE: {error.digest || "UNKNOWN_EXCEPTION"}
        </p>
      </div>

      {/* Mock Terminal Output */}
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-red-900/50 bg-black/80 font-mono text-xs text-red-400 shadow-inner">
        <div className="flex items-center gap-2 border-b border-red-900/50 bg-red-950/20 px-4 py-2">
          <Terminal className="h-3 w-3" />
          <span className="opacity-70">panic.log</span>
        </div>
        <ScrollArea className="h-32 w-full p-4 text-left opacity-80">
          <p className="mb-2 text-red-500 font-bold">
            &gt; FATAL_EXCEPTION_OCCURRED
          </p>
          <p>&gt; {error.message}</p>
          {error.stack && (
            <p className="mt-2 text-[10px] text-red-500/50 whitespace-pre-wrap">
              {error.stack.split("\n").slice(0, 3).join("\n")}...
            </p>
          )}
          <p className="mt-2 animate-pulse text-red-500">
            &gt; WAITING_FOR_INPUT_
          </p>
        </ScrollArea>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={reset}
          variant="default"
          className="bg-red-600 text-white hover:bg-red-700 font-mono shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          REBOOT_SYSTEM
        </Button>
      </div>
    </div>
  );
}
