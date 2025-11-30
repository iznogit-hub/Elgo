"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface PreloaderProps {
  contentLoaded: boolean;
}

export function Preloader({ contentLoaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  const counterTween = useRef<gsap.core.Tween | null>(null);
  const counterObj = useRef({ value: 0 });

  useGSAP(
    () => {
      // Initial Load: Animate 0 -> 85% slowly
      counterTween.current = gsap.to(counterObj.current, {
        value: 85,
        duration: 3.5,
        ease: "power1.out",
        onUpdate: () => {
          setCount(Math.floor(counterObj.current.value));
        },
      });
    },
    { scope: containerRef }
  );

  useEffect(() => {
    if (contentLoaded && containerRef.current) {
      if (counterTween.current) counterTween.current.kill();

      const tl = gsap.timeline();

      // Fast completion to 100%
      tl.to(counterObj.current, {
        value: 100,
        duration: 0.5,
        ease: "power2.out",
        onUpdate: () => {
          setCount(Math.floor(counterObj.current.value));
        },
      });

      // Exit Animation
      tl.to(".preloader-content", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      });

      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "expo.inOut",
      });

      tl.set(containerRef.current, { display: "none" });
    }
  }, [contentLoaded]);

  return (
    <div
      ref={containerRef}
      // UPDATED: 'justify-center items-center' forces true center
      // Removed px-6 md:px-12 to avoid offset
      className="fixed inset-0 z-99999 flex h-screen w-full items-center justify-center bg-background"
    >
      {/* UPDATED: 'items-center' to center text block */}
      <div className="preloader-content flex flex-col items-center justify-center text-center">
        <div className="text-6xl font-bold tracking-tighter md:text-8xl lg:text-9xl">
          {count}%
        </div>

        <div className="mt-4 h-0.5 w-48 bg-primary/20 overflow-hidden rounded-full">
          <div
            className="h-full bg-primary transition-all duration-75 ease-linear"
            style={{ width: `${count}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground animate-pulse">
          {count < 100 ? "INITIALIZING..." : "SYSTEM READY"}
        </p>
      </div>
    </div>
  );
}
