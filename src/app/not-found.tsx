"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";

export default function NotFound() {
  const pathname = usePathname();
  const { play } = useSfx();

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-red-500 font-mono">
      {/* Scanline Background */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 animate-scanline" />
      </div>

      <div className="z-10 flex flex-col items-center justify-center relative w-full max-w-4xl px-4 text-center">
        <div className="relative mb-8">
            <AlertTriangle className="w-20 h-20 text-red-600 animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 bg-red-500/20 blur-xl animate-pulse" />
        </div>
        
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-4 text-white font-orbitron glitch-text">
          SIGNAL_LOST
        </h1>
        
        <div className="border border-red-900 bg-red-950/20 p-6 rounded mb-8 max-w-md w-full backdrop-blur-sm">
          <p className="text-red-400 mb-2 font-bold">[ CRITICAL_ERROR: 404_VOID ]</p>
          <p className="text-xs text-red-600 uppercase tracking-widest border-t border-red-900/50 pt-2">
            Target Frequency: {pathname}
          </p>
          <p className="mt-4 text-sm text-gray-400">
            The requested sector does not exist within the Zaibatsu network.
          </p>
        </div>

        <MagneticWrapper>
            <Link href="/">
                <Button 
                    onClick={() => play("click")}
                    onMouseEnter={() => play("hover")}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-6 tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                >
                    <Home className="w-4 h-4 mr-2" /> RETURN TO BASE
                </Button>
            </Link>
        </MagneticWrapper>
      </div>
    </div>
  );
}