"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(false);
  const pointerInteractionMovement = useRef(0);
  const phiRef = useRef(3.5);

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

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [0.1, 0.8, 1],
      glowColor: [1, 1, 1],
      markers: [{ location: [21.5433, 39.1728], size: 0.1 }],
      onRender: (state) => {
        if (!pointerInteracting.current) {
          phiRef.current += 0.001;
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
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = true;
          pointerInteractionMovement.current = e.clientX;
          // REMOVED: style.cursor = 'grabbing'
        }}
        onPointerUp={() => {
          pointerInteracting.current = false;
          // REMOVED: style.cursor = 'grab'
        }}
        onPointerOut={() => {
          pointerInteracting.current = false;
          // REMOVED: style.cursor = 'grab'
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
        // UPDATED: 'cursor-none' hides the default arrow/hand
        className="cursor-none opacity-0 transition-opacity duration-1000"
      />
    </div>
  );
}
