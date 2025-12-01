"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/coming-soon/background";
import { Cursor } from "@/components/ui/cursor";

export default function NotFound() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground">
      <Cursor />
      <Background />

      {/* Glitch Overlay Effect */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-scanline" />
      </div>

      <div className="z-10 flex flex-col items-center space-y-6 text-center px-4">
        {/* Icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-red-500/20 blur-xl rounded-full animate-pulse" />
          <AlertTriangle className="h-16 w-16 text-red-500 relative z-10" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/50">
            404
          </h1>
          <p className="text-xl font-mono text-red-400">
            SYSTEM_FAILURE: ROUTE_NOT_FOUND
          </p>
          <p className="text-muted-foreground max-w-[400px]">
            The coordinates you are trying to access do not exist in this
            sector.
          </p>
        </div>

        {/* Action */}
        <Link href="/">
          <Button
            variant="outline"
            className="gap-2 cursor-none hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Base
          </Button>
        </Link>
      </div>
    </div>
  );
}
