"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
// We intentionally avoid complex UI components here to ensure stability during critical failures

export default function GlobalError({
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
    <html lang="en">
      <body className="bg-black text-red-500 font-mono overflow-hidden h-screen w-screen flex flex-col items-center justify-center p-4 selection:bg-red-900 selection:text-white">
        <div className="max-w-2xl w-full border-2 border-red-600 p-8 md:p-12 relative shadow-[0_0_50px_rgba(220,38,38,0.3)]">
          {/* Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%]" />

          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 glitch-text">
            CRITICAL_FAILURE
          </h1>

          <div className="space-y-4 mb-8 text-sm md:text-base border-l-2 border-red-800 pl-4 opacity-90">
            <p>
              A fatal exception has occurred at memory address 0x
              {error.digest?.substring(0, 8) || "UNKNOWN"}.
            </p>
            <p className="uppercase">Error: {error.message}</p>
            <p className="text-red-700">
              The current session has been terminated to protect the integrity
              of the system.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-red-600 text-black font-bold hover:bg-red-500 transition-colors uppercase tracking-wider"
            >
              Attempt_Recovery
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-red-600 text-red-600 hover:bg-red-900/20 transition-colors uppercase tracking-wider"
            >
              Hard_Reboot
            </button>
          </div>

          <div className="absolute bottom-2 right-2 text-[10px] opacity-50">
            SYS_HALT_CODE: 0xDEAD_BEEF
          </div>
        </div>

        <style jsx global>{`
          @keyframes glitch {
            0% {
              transform: translate(0);
            }
            20% {
              transform: translate(-2px, 2px);
            }
            40% {
              transform: translate(-2px, -2px);
            }
            60% {
              transform: translate(2px, 2px);
            }
            80% {
              transform: translate(2px, -2px);
            }
            100% {
              transform: translate(0);
            }
          }
          .glitch-text {
            animation: glitch 0.5s infinite;
            text-shadow: 2px 2px #500000;
          }
        `}</style>
      </body>
    </html>
  );
}
