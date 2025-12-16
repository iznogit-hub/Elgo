"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { TransitionLink } from "@/components/ui/transition-link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";

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
      // UPDATED CLASS:
      // 'hidden' by default
      // 'xl:block' -> Only show on XL screens (Desktop) to keep mobile clean
      // OR 'lg:block' if you want it on smaller laptops.
      // I recommend hiding it on mobile/tablet to give text full focus.
      className="fixed bottom-0 left-0 z-50 hidden xl:block opacity-0"
    >
      <TransitionLink
        href="/about"
        onClick={() => play("click")}
        onMouseEnter={() => play("hover")}
        className="relative block h-64 w-[256px] cursor-none magnetic-target transition-transform hover:scale-105 active:scale-95"
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
      </TransitionLink>
    </aside>
  );
}
