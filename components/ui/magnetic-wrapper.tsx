"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface MagneticWrapperProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // How strong the pull is (0.1 = weak, 1 = sticks to mouse)
}

export function MagneticWrapper({
  children,
  className,
  strength = 0.5,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      if (!element) return;

      // Setup quickTo for performant animation (no React renders)
      const xTo = gsap.quickTo(element, "x", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });
      const yTo = gsap.quickTo(element, "y", {
        duration: 1,
        ease: "elastic.out(1, 0.3)",
      });

      const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { height, width, left, top } = element.getBoundingClientRect();

        // Calculate distance from center
        const x = clientX - (left + width / 2);
        const y = clientY - (top + height / 2);

        // Move element towards mouse based on strength
        xTo(x * strength);
        yTo(y * strength);
      };

      const handleMouseLeave = () => {
        // Snap back to center
        xTo(0);
        yTo(0);
      };

      element.addEventListener("mousemove", handleMouseMove);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
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
