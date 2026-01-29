"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phiRef = useRef(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1200,
      height: 1200,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.1],
      markerColor: [236/255, 72/255, 153/255], // Vivid Pink
      glowColor: [6/255, 182/255, 212/255],   // Neon Cyan
      markers: [
        { location: [37.7595, -122.4367], size: 0.03 },
        { location: [40.7128, -74.006], size: 0.1 },
        { location: [35.6762, 139.6503], size: 0.07 },
        { location: [28.6139, 77.2090], size: 0.05 },
      ],
      onRender: (state) => {
        phiRef.current += 0.005;
        state.phi = phiRef.current;
      },
    });

    setTimeout(() => { if (canvasRef.current) canvasRef.current.style.opacity = "1"; });
    return () => globe.destroy();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-1000">
      <canvas ref={canvasRef} style={{ width: 800, height: 800, maxWidth: "100%", aspectRatio: 1 }} />
    </div>
  );
}