"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const grid = gridRef.current;
      const spotlight = spotlightRef.current;

      if (!container || !grid || !spotlight) return;

      // 1. Setup GSAP quickSetter/quickTo for high performance
      // These functions are optimized for frequent updates (like mousemove)
      const xToSpotlight = gsap.quickTo(spotlight, "x", {
        duration: 0.2,
        ease: "power3.out",
      });
      const yToSpotlight = gsap.quickTo(spotlight, "y", {
        duration: 0.2,
        ease: "power3.out",
      });

      const xToGrid = gsap.quickTo(grid, "x", {
        duration: 0.6,
        ease: "power2.out",
      });
      const yToGrid = gsap.quickTo(grid, "y", {
        duration: 0.6,
        ease: "power2.out",
      });

      // 2. Initial Center Position
      const onResize = () => {
        const { innerWidth, innerHeight } = window;
        xToSpotlight(innerWidth / 2);
        yToSpotlight(innerHeight / 2);
      };
      window.addEventListener("resize", onResize);
      onResize(); // Init

      // 3. Mouse Movement Handler
      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Move spotlight to mouse position
        xToSpotlight(clientX);
        yToSpotlight(clientY);

        // Parallax Effect: Move grid opposite to mouse
        // "20" determines the strength of the parallax (lower = stronger)
        const xOffset = (clientX - innerWidth / 2) / -25;
        const yOffset = (clientY - innerHeight / 2) / -25;

        xToGrid(xOffset);
        yToGrid(yOffset);
      };

      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", onResize);
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
        We apply the pattern here. It is larger than the screen (110%) to prevent
        gaps appearing at the edges during movement.
      */}
      <div
        ref={gridRef}
        className={cn(
          "absolute -inset-[10%] w-[120%] h-[120%] opacity-40 will-change-transform",
          // Light Mode Grid: Darker lines
          "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]",
          // Dark Mode Grid: Lighter lines
          "dark:bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]",
          "bg-size-[40px_40px]"
        )}
      />

      {/* LAYER 2: The Spotlight Overlay 
        This div sits on top and follows the mouse. It uses a radial gradient 
        to "reveal" the area underneath while darkening the rest slightly.
      */}
      <div
        ref={spotlightRef}
        className="pointer-events-none absolute -top-[250px] -left-[250px] h-[500px] w-[500px] will-change-transform"
        style={{
          background:
            "radial-gradient(circle closest-side, rgba(var(--primary), 0.15), transparent)",
        }}
      />

      {/* LAYER 3: Film Grain Texture 
        Kept from original design for that "architect/technical" feel.
      */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay">
        <div
          className="absolute inset-0 h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* LAYER 4: Vignette
        Softens the edges of the screen to focus attention on the center.
      */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
