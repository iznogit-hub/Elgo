"use client";

import React, { useRef, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false); // ⚡ FIX: Track visibility state
  const pathname = usePathname();

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      // Initial Setup
      gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 });

      const xTo = gsap.quickTo(cursor, "x", {
        duration: 0.2,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(cursor, "y", {
        duration: 0.2,
        ease: "power3.out",
      });

      const handleMouseMove = (e: MouseEvent) => {
        // ⚡ FIX: Show cursor on first move
        if (!isVisible) setIsVisible(true);
        
        // Update opacity manually to avoid React render cycle delay
        cursor.style.opacity = "1";
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`; // Fallback
        
        xTo(e.clientX);
        yTo(e.clientY);
      };

      const handleMouseEnter = () => {
        gsap.to(cursor, { scale: 1.5, duration: 0.3, borderColor: "#06b6d4" }); // Cyan hover
      };

      const handleMouseLeave = () => {
        gsap.to(cursor, { scale: 1, duration: 0.3, borderColor: "#06b6d4" });
      };

      // Global Listeners for "magnetic" elements
      const addListeners = () => {
        const targets = document.querySelectorAll("button, a, input, [role='button']");
        targets.forEach((el) => {
          el.addEventListener("mouseenter", handleMouseEnter);
          el.addEventListener("mouseleave", handleMouseLeave);
        });
      };

      window.addEventListener("mousemove", handleMouseMove);
      addListeners();

      // Re-bind on navigation
      const observer = new MutationObserver(addListeners);
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        observer.disconnect();
        const targets = document.querySelectorAll("button, a, input");
        targets.forEach((el) => {
          el.removeEventListener("mouseenter", handleMouseEnter);
          el.removeEventListener("mouseleave", handleMouseLeave);
        });
      };
    },
    { scope: cursorRef, dependencies: [pathname] }
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      <div
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 w-4 h-4 rounded-full border-2 border-cyan-500",
          "opacity-0 transition-opacity duration-300", // Start invisible
          isVisible && "opacity-100"
        )}
      />
    </div>
  );
}