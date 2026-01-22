"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { animatePageIn } from "@/utils/transition";

gsap.registerPlugin(useGSAP);

export default function Template({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      animatePageIn(containerRef.current);
    }
  });

  return (
    <div
      id="page-transition-container"
      ref={containerRef}
      // ⚡ APPLY CLASS: The CSS class 'invisible-hold' (defined in globals.css) prevents flash of unstyled content
      className="w-full origin-top will-change-transform invisible-hold"
    >
      {children}
    </div>
  );
}