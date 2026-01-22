"use client";

import { useEffect } from "react";
import { Terminal, RefreshCcw, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";
import * as Sentry from "@sentry/nextjs";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { play } = useSfx();

  useEffect(() => {
    // Log to Sentry
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500 font-mono p-4 overflow-hidden relative">
      
      {/* Glitch Overlay */}
      <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/oEI9uBYSzLpBK/giphy.gif')] opacity-[0.03] pointer-events-none mix-blend-screen" />

      <div className="border-2 border-red-600 p-8 md:p-12 max-w-2xl w-full bg-black/90 backdrop-blur-xl shadow-[0_0_50px_rgba(220,38,38,0.2)] relative z-10">
        
        <div className="flex items-center gap-4 mb-8 border-b border-red-900/50 pb-4">
          <Terminal className="h-8 w-8 text-red-500" />
          <h2 className="text-3xl font-bold tracking-widest font-orbitron text-white">
            <HackerText text="SYSTEM_MALFUNCTION" />
          </h2>
        </div>

        <div className="bg-red-950/20 p-4 border-l-4 border-red-600 mb-8 font-mono text-sm">
          <p className="opacity-70 mb-2 text-xs uppercase tracking-widest"> DIAGNOSTIC_TOOL_RUNNING...</p>
          <p className="text-white font-bold break-all">FATAL EXCEPTION: {error.message || "Unknown Error"}</p>
          {error.digest && (
             <p className="text-red-400 text-xs mt-2">HASH: {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <MagneticWrapper>
            <Button
              onClick={() => { play("click"); reset(); }}
              onMouseEnter={() => play("hover")}
              className="w-full bg-red-600 text-white font-bold hover:bg-red-500 h-12"
            >
              <RefreshCcw className="w-4 h-4 mr-2" /> ATTEMPT_RECOVERY
            </Button>
          </MagneticWrapper>

          <MagneticWrapper>
            <Button
              onClick={() => { play("click"); window.location.href = "/"; }}
              onMouseEnter={() => play("hover")}
              variant="outline"
              className="w-full border-red-600 text-red-500 hover:bg-red-900/20 h-12"
            >
              <Power className="w-4 h-4 mr-2" /> EMERGENCY_REBOOT
            </Button>
          </MagneticWrapper>
        </div>

        <div className="absolute bottom-2 right-4 text-[10px] opacity-40">
           SYS_HALT_CODE: 0xDEAD_BEEF
        </div>
      </div>
    </div>
  );
}