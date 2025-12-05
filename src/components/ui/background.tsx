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

      // Parallax Grid Movement (Preserved)
      // We kept this as it adds depth without the "flashlight" feel
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

        // Calculate parallax offset from center
        const xOffset = (clientX - innerWidth / 2) / -25;
        const yOffset = (clientY - innerHeight / 2) / -25;

        xToGrid(xOffset);
        yToGrid(yOffset);
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
      };
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-background"
    >
      {/* LAYER 1: The Parallax Grid 
          - Restored the 'mask' property to create the "Dark to Light" fade.
          - Maintained the high-contrast grid lines for Light Mode visibility.
      */}
      <div
        ref={gridRef}
        className={cn(
          "absolute -inset-[10%] w-[120%] h-[120%] opacity-40 will-change-transform",
          // Light Mode Grid: Darker lines for visibility
          "bg-[linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_1px)]",
          // Dark Mode Grid: Lighter lines
          "dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]",
          "bg-size-[40px_40px]",
          // RESTORED: The gradient mask (Fade out from top-center)
          "mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        )}
      />

      {/* LAYER 2: Static Top Glow (Restored)
          This replaces the "flashlight" with a stable ambient light source at the top.
      */}
      <div className="absolute left-0 right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px] opacity-20 mx-auto pointer-events-none" />

      {/* LAYER 3: Film Grain Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* LAYER 4: Vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
