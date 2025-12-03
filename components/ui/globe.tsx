"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { useTheme } from "next-themes";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(false);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(3.5);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener("resize", onResize);
    onResize();

    if (!canvasRef.current) return;

    // CONFIGURATION BASED ON THEME
    const isLight = resolvedTheme === "light";

    // Light Mode: Dark Globe (0.3), No Glow (or dark glow), Blue/Cyan Markers
    // Dark Mode: Light Globe (0.3), White Glow (1), Cyan Markers
    const baseColor = isLight ? [0.2, 0.2, 0.2] : [0.3, 0.3, 0.3];
    const glowColor = isLight ? [0.8, 0.8, 0.8] : [1, 1, 1];
    const markerColor = isLight ? [0, 0.6, 0.9] : [0.1, 0.8, 1];

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.2,
      dark: isLight ? 0 : 1, // 0 = Light Mode rendering logic in Cobe
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: baseColor as [number, number, number],
      markerColor: markerColor as [number, number, number],
      glowColor: glowColor as [number, number, number],
      markers: [{ location: [21.5433, 39.1728], size: 0.1 }],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.003; // Slightly faster rotation
        }
        state.phi = phiRef.current;
        state.width = width * 2;
        state.height = width * 2;
      },
    });

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    });

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [resolvedTheme]); // Re-run when theme changes

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = true;
          pointerInteractionMovement.current = e.clientX;
        }}
        onPointerUp={() => {
          pointerInteracting.current = false;
        }}
        onPointerOut={() => {
          pointerInteracting.current = false;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current) {
            const delta = e.clientX - pointerInteractionMovement.current;
            pointerInteractionMovement.current = e.clientX;
            phiRef.current += delta * 0.005;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current && e.touches[0]) {
            const delta =
              e.touches[0].clientX - pointerInteractionMovement.current;
            pointerInteractionMovement.current = e.touches[0].clientX;
            phiRef.current += delta * 0.005;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          aspectRatio: 1,
        }}
        className="cursor-none opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
}
