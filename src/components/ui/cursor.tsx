"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    // Center anchor point so the dot sits exactly on the mouse tip
    gsap.set(cursor, { xPercent: -50, yPercent: -50, force3D: true });

    // 'quickTo' is GSAP's most performant method for mouse movement
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={cursorRef} 
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden lg:block"
    >
      {/* VISUAL: A sharp Red Dot (Laser Sight) 
         Matches the "Culling Game" Red/Black aesthetic.
      */}
      <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]" />
    </div>
  );
}