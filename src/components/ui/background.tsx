"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

/**
 * ⚡ HUD OVERLAY BACKGROUND
 * Re-engineered to sit on top of 9:16 video signals.
 * Removed solid black base to allow video visibility.
 */
export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const grid = gridRef.current;
      if (!container || !grid) return;

      // Smooth parallax for the grid based on mouse movement
      const xToGrid = gsap.quickTo(grid, "x", { duration: 0.8, ease: "power3.out" });
      const yToGrid = gsap.quickTo(grid, "y", { duration: 0.8, ease: "power3.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xOffset = (clientX - innerWidth / 2) / -40; // Reduced intensity
        const yOffset = (clientY - innerHeight / 2) / -40;
        xToGrid(xOffset);
        yToGrid(yOffset);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: containerRef }
  );

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-10 h-full w-full overflow-hidden bg-transparent pointer-events-none"
    >
      {/* 🧪 DYNAMIC NEURAL GRID: Transparent base with high-contrast lines */}
      <div
        ref={gridRef}
        className={cn(
          "absolute inset-[-20%] h-[140%] w-[140%]",
          "bg-[linear-gradient(to_right,rgba(6,182,212,0.12)_1px,transparent:1px),linear-gradient(to_bottom,rgba(6,182,212,0.12)_1px,transparent_1px)]",
          "bg-[size:60px_60px]",
          "mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"
        )}
      />

      {/* 🧪 SYSTEM GLOWS: Subtle hard-light accents that interact with the video color */}
      <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full mix-blend-hard-light animate-pulse" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full mix-blend-hard-light animate-pulse [animation-delay:1.5s]" />

      {/* 🧪 DIGITAL GRAIN: Enhances the "Mad Scientist" surveillance look */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay brightness-125">
        <svg className="h-full w-full">
          <filter id="hudNoise">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.80" 
              numOctaves="4" 
              stitchTiles="stitch" 
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hudNoise)" />
        </svg>
      </div>
      
      {/* 📱 MOBILE SIDE BARS: Visual framing for the 9:16 app feel */}
      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  );
}