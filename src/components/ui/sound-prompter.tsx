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

  // ⚡ Logic: Smart Timer
  useEffect(() => {
    const abortController = new AbortController();

    const handleEarlyInteraction = () => {
      clearTimeout(timer);
      abortController.abort();
    };

    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      window.addEventListener(event, handleEarlyInteraction, {
        signal: abortController.signal,
        once: true,
      });
    });

    const timer = setTimeout(() => {
      setIsVisible(true);
      abortController.abort();
    }, 1500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, []);

  // ⚡ Logic: Dismissal & Feedback
  useEffect(() => {
    if (!isVisible) return;

    const handleInteraction = () => {
      play("success");

      const events = ["click", "touchstart", "keydown"];
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });

      // Animate Exit (Slide Up)
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          y: -20, // Slide up
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => setIsVisible(false),
        });
      }
    };

    const events = ["click", "touchstart", "keydown"];
    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { once: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, [isVisible, play]);

  // Entrance Animation (Slide Down)
  useGSAP(
    () => {
      if (isVisible && containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { y: -30, opacity: 0 }, // Start slightly above
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
        );
      }
    },
    { dependencies: [isVisible], scope: containerRef },
  );

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Sound Controls"
      ref={containerRef}
      className={cn(
        "fixed z-50 pointer-events-none select-none",
        // Position: Top Center
        "top-8 left-1/2 -translate-x-1/2",
        "w-max max-w-[90vw]",
      )}
    >
      <div
        className={cn(
          "flex items-center rounded-xl", // More rounded
          "bg-background/90 backdrop-blur-xl border border-border/60",
          "shadow-2xl shadow-black/10",
          // Redesigned Sizing (Bigger)
          "gap-5 px-6 py-4",
          "md:gap-6 md:px-8 md:py-5",
        )}
      >
        {/* Bigger Icon Container */}
        <div className="relative flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-primary/10 text-primary">
          <Volume2 className="w-6 h-6" /> {/* Bigger Icon */}
          <span className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-20" />
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm md:text-base font-bold text-foreground tracking-tight whitespace-nowrap">
            Sound Standby
          </span>
          <div className="flex items-center gap-2 mt-1">
            <MousePointer2 className="w-3.5 h-3.5 text-muted-foreground animate-bounce" />
            <span className="text-xs md:text-sm font-medium font-mono text-muted-foreground whitespace-nowrap">
              Tap anywhere to enable
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
