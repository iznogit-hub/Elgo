"use client";

import React, { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function Cursor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null); // The Dot
  const ringRef = useRef<HTMLDivElement>(null);   // The Reticle
  const textRef = useRef<HTMLDivElement>(null);   // The Text Label
  
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useGSAP(
    () => {
      const container = containerRef.current;
      const cursor = cursorRef.current;
      const ring = ringRef.current;
      const label = textRef.current;

      if (!container || !cursor || !ring || !label) return;

      // 1. SETUP: Center everything and hide initially
      gsap.set([cursor, ring, label], { xPercent: -50, yPercent: -50 });
      gsap.set(container, { autoAlpha: 0 }); // Hidden until move

      // 2. PERFORMANCE: Use quickTo for 60fps tracking
      // Dot moves instantly
      const xToCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3.out" });
      const yToCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3.out" });
      
      // Ring lags slightly (weighty feel)
      const xToRing = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
      const yToRing = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });

      // Label follows ring
      const xToLabel = gsap.quickTo(label, "x", { duration: 0.4, ease: "power3.out" });
      const yToLabel = gsap.quickTo(label, "y", { duration: 0.4, ease: "power3.out" });

      // 3. CORE MOVEMENT LOOP
      const handleMouseMove = (e: MouseEvent) => {
        if (!isVisible) {
            setIsVisible(true);
            gsap.to(container, { autoAlpha: 1, duration: 0.4 });
        }

        // Move the elements
        xToCursor(e.clientX);
        yToCursor(e.clientY);
        xToRing(e.clientX);
        yToRing(e.clientY);
        
        // Label offset slightly to right
        xToLabel(e.clientX + 20);
        yToLabel(e.clientY + 20);
      };

      // 4. INTERACTION: CLICK (Recoil)
      const handleMouseDown = () => {
        gsap.to(ring, { scale: 0.8, duration: 0.1 });
        gsap.to(cursor, { scale: 0.5, duration: 0.1 });
      };

      const handleMouseUp = () => {
        gsap.to(ring, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
        gsap.to(cursor, { scale: 1, duration: 0.3 });
      };

      // 5. INTERACTION: HOVER (Target Lock)
      const handleMouseEnter = (e: Event) => {
        const target = e.target as HTMLElement;
        const isDanger = target.classList.contains("text-red-500") || target.closest(".danger-zone");

        // Expand Ring
        gsap.to(ring, { 
            scale: 1.5, 
            borderColor: isDanger ? "#ef4444" : "#06b6d4", // Red or Cyan
            backgroundColor: isDanger ? "rgba(239, 68, 68, 0.1)" : "rgba(6, 182, 212, 0.1)",
            duration: 0.3 
        });

        // Show Label
        label.innerText = isDanger ? "PURGE" : "LINK";
        gsap.to(label, { opacity: 1, scale: 1, duration: 0.2 });
      };

      const handleMouseLeave = () => {
        // Reset Ring
        gsap.to(ring, { 
            scale: 1, 
            borderColor: "#ffffff", 
            backgroundColor: "transparent",
            duration: 0.3 
        });

        // Hide Label
        gsap.to(label, { opacity: 0, scale: 0.8, duration: 0.2 });
      };

      // 6. BINDERS
      const addListeners = () => {
        const targets = document.querySelectorAll("button, a, input, [role='button']");
        targets.forEach((el) => {
          el.addEventListener("mouseenter", handleMouseEnter);
          el.addEventListener("mouseleave", handleMouseLeave);
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseDown);
      window.addEventListener("mouseup", handleMouseUp);
      addListeners();

      // Observer for dynamic content (Next.js navigation)
      const observer = new MutationObserver(addListeners);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mousedown", handleMouseDown);
        window.removeEventListener("mouseup", handleMouseUp);
        observer.disconnect();
        const targets = document.querySelectorAll("button, a, input");
        targets.forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    },
    { scope: containerRef, dependencies: [pathname] }
  );

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block mix-blend-difference">
      
      {/* 1. THE DOT (Exact Position) */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full"
      />

      {/* 2. THE RETICLE (Lagged Ring) */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full transition-colors duration-200"
      />

      {/* 3. THE HUD TEXT (Contextual Data) */}
      <div
        ref={textRef}
        className="fixed top-0 left-0 text-[8px] font-black font-mono text-white tracking-widest uppercase opacity-0"
      >
        SYSTEM
      </div>

    </div>
  );
}