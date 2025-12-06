"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, MousePointer2 } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export function SoundPrompter() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Setup the "Click Anywhere" Listener
  useEffect(() => {
    if (!isVisible) return;

    const handleGlobalClick = () => {
      play("success");
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          x: 20,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => setIsVisible(false),
        });
      }
    };

    window.addEventListener("click", handleGlobalClick, { once: true });
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [isVisible, play]);

  useGSAP(
    () => {
      if (isVisible && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        );
      }
    },
    { dependencies: [isVisible], scope: containerRef }
  );

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Sound Controls"
      ref={containerRef}
      className={cn(
        // Base Layout (Mobile)
        "fixed z-90 pointer-events-none select-none",
        "top-20 right-4", // Tighter spacing for mobile
        "max-w-[calc(100vw-2rem)]", // Prevent overflow on small screens

        // Desktop Breakpoint
        "md:top-24 md:right-6"
      )}
    >
      <div
        className={cn(
          "flex items-center rounded-lg",
          "bg-background/80 backdrop-blur-md border border-border/50",
          "shadow-lg shadow-black/5",
          // Adaptive Padding
          "gap-3 px-3 py-2.5 pr-5",
          "md:gap-4 md:px-4 md:py-3 md:pr-6"
        )}
      >
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary">
          <Volume2 className="w-4 h-4" />
          <span className="absolute inset-0 rounded-full border border-primary/40 animate-ping opacity-20" />
        </div>

        {/* Text Content */}
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-foreground tracking-tight whitespace-nowrap">
            Sound Standby
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MousePointer2 className="w-3 h-3 text-muted-foreground animate-bounce" />
            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
              Tap anywhere to enable
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
