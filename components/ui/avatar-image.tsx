"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function AvatarImage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container) return;

      // Entrance Animation: Slide in from Left
      // Starts -100px off-screen to the left, slides to 0
      gsap.fromTo(
        container,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: "power3.out", delay: 1 }
      );
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 z-50 hidden md:block"
    >
      <div className="relative h-64 w-[256px]">
        {/* REMOVED: Background glow div */}

        <Image
          src="/me.png"
          alt="Avatar"
          fill
          className="object-contain object-bottom-left drop-shadow-2xl"
          priority
          draggable={false}
        />
      </div>
    </div>
  );
}
