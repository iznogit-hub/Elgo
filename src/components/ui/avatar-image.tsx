"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";

gsap.registerPlugin(useGSAP);

interface AvatarImageProps {
  startAnimation?: boolean;
}

export function AvatarImage({ startAnimation = true }: AvatarImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !startAnimation) return;

      const DELAY = 1.3;

      gsap.fromTo(
        container,
        { x: -150, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.0, ease: "power3.out", delay: DELAY },
      );
    },
    { scope: containerRef, dependencies: [startAnimation] },
  );

  const triggerChat = () => {
    // ⚡ DIRECT TRIGGER: Matches the event listener in cyber-chat.tsx
    window.dispatchEvent(new Event("open-ai-chat"));
  };

  return (
    <aside
      ref={containerRef}
      className="fixed bottom-0 left-0 z-40 hidden xl:block opacity-0"
    >
      <button
        onClick={() => {
          play("click");
          triggerChat();
        }}
        onMouseEnter={() => play("hover")}
        className="relative block h-64 w-[256px] cursor-none transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Open Neural Interface"
      >
        {/* ⚠️ REPLACE THIS SRC with your own transparent PNG in /public folder */}
        {/* If you don't have one, this placeholder will work */}
        <Image
          src="/assets/avatar-placeholder.png" 
          alt="Operative"
          width={256}
          height={256}
          className="object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          priority
        />
      </button>
    </aside>
  );
}