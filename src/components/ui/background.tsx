"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const grid = gridRef.current;

      if (!container || !grid) return;

      // Parallax Logic
      const xToGrid = gsap.quickTo(grid, "x", {
        duration: 0.6,
        ease: "power2.out",
      });
      const yToGrid = gsap.quickTo(grid, "y", {
        duration: 0.6,
        ease: "power2.out",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        const xOffset = (clientX - innerWidth / 2) / -25;
        const yOffset = (clientY - innerHeight / 2) / -25;

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
      className="fixed inset-0 z-0 h-full w-full overflow-hidden bg-black pointer-events-none"
    >
      {/* LAYER 1: The Cyan Grid */}
      <div
        ref={gridRef}
        className={cn(
          "absolute inset-[-50%] h-[200%] w-[200%]",
          // ⚡ CHANGE: Use Cyan-900 for the grid lines instead of white
          "bg-[linear-gradient(to_right,#083344_1px,transparent_1px),linear-gradient(to_bottom,#083344_1px,transparent_1px)]",
          "bg-[size:40px_40px]",
          // Fade out edges
          "mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]",
          "opacity-40"
        )}
      />

      {/* LAYER 2: Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen opacity-30" />

      {/* LAYER 3: Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none">
        <svg className="h-full w-full">
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>
    </div>
  );
}