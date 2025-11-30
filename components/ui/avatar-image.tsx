"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface AvatarImageProps {
  onImageLoad?: () => void;
  startAnimation: boolean; // Added prop for synchronization
}

export function AvatarImage({ onImageLoad, startAnimation }: AvatarImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !startAnimation) return; // Wait for signal

      // TIMING CALCULATION:
      // Preloader Sequence:
      // 0.0s -> 0.5s: Counter finishes
      // 0.5s -> 1.0s: Text fades
      // 1.0s -> 1.8s: Curtain slides up
      //
      // We want the avatar (bottom-left) to slide in just as the curtain
      // lifts past the bottom edge (approx 1.1s mark).
      const DELAY = 1.3;

      gsap.fromTo(
        container,
        { x: -150, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: DELAY }
      );
    },
    { scope: containerRef, dependencies: [startAnimation] }
  );

  return (
    // Set initial opacity to 0 via class to ensure it's hidden before JS loads
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 z-50 hidden md:block opacity-0"
    >
      <div className="relative h-64 w-[256px]">
        <Image
          src="/me.png"
          alt="Avatar"
          fill
          className="object-contain object-bottom-left drop-shadow-2xl"
          priority
          draggable={false}
          onLoad={onImageLoad}
        />
      </div>
    </div>
  );
}
