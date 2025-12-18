"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { useCyberChat } from "@/hooks/use-cyber-chat"; // 1. Import the hook

gsap.registerPlugin(useGSAP);

interface AvatarImageProps {
  onImageLoad?: () => void;
  startAnimation?: boolean;
}

export function AvatarImage({
  onImageLoad,
  startAnimation = true,
}: AvatarImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const { openChat } = useCyberChat(); // 2. Initialize hook

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

  return (
    <aside
      aria-label="Avatar Image"
      ref={containerRef}
      className="fixed bottom-0 left-0 z-50 hidden xl:block opacity-0"
    >
      {/* 3. Changed to button (interactive element) */}
      <button
        onClick={() => {
          play("click");
          openChat(); // 4. Trigger the chat opening
        }}
        onMouseEnter={() => play("hover")}
        className="relative block h-64 w-[256px] cursor-none magnetic-target transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Open Neural Interface"
      >
        <Image
          src="/Avatar_waving.png"
          alt="Avatar"
          fill
          sizes="(max-width: 768px) 100vw, 256px"
          className="object-contain object-bottom-left drop-shadow-2xl"
          priority
          draggable={false}
          onLoad={onImageLoad}
        />
      </button>
    </aside>
  );
}
