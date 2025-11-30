"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";

interface PreloaderProps {
  contentLoaded: boolean;
}

export function Preloader({ contentLoaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { play } = useSfx();

  const counterTween = useRef<gsap.core.Tween | null>(null);
  const counterObj = useRef({ value: 0 });

  // 1. Prevent Hydration Mismatch
  useEffect(() => {
    // This double-render is intentional to ensure the component
    // only mounts on the client side.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted) return;

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
    { scope: containerRef, dependencies: [mounted] }
  );

  useEffect(() => {
    if (mounted && contentLoaded && containerRef.current) {
      play("success");

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
  }, [contentLoaded, play, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-99999 flex h-screen w-full items-center justify-center bg-background"
    >
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
