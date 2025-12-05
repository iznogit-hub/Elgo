"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticWrapper({
  children,
  className,
  strength = 0.5,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  // We use a ref to store the bounding box to avoid recalculating it (and causing jitter) on every mouse frame
  const boundsRef = useRef<{
    width: number;
    height: number;
    left: number;
    top: number;
  } | null>(null);
  const { play } = useSfx();

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      const xTo = gsap.quickTo(element, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(element, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handleMouseEnter = () => {
        play("hover");
        // Cache bounds on enter so the magnetic math stays stable even as the element moves
        const rect = element.getBoundingClientRect();
        boundsRef.current = {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          top: rect.top,
        };
      };

      const handleMouseMove = (e: MouseEvent) => {
        const bounds = boundsRef.current;
        if (!bounds) return;

        const { clientX, clientY } = e;

        // Calculate based on the cached "home" position
        const x = clientX - (bounds.left + bounds.width / 2);
        const y = clientY - (bounds.top + bounds.height / 2);

        xTo(x * strength);
        yTo(y * strength);
      };

      const handleMouseLeave = () => {
        xTo(0);
        yTo(0);
        boundsRef.current = null; // Clear bounds
      };

      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mousemove", handleMouseMove);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
