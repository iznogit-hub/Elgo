"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  // We use refs instead of state to avoid React re-renders on every frame (performance)
  const hoverTarget = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      gsap.set(cursor, { xPercent: -50, yPercent: -50 });

      // Velocity trackers for smooth movement
      const xTo = gsap.quickTo(cursor, "x", {
        duration: 0.2,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(cursor, "y", {
        duration: 0.2,
        ease: "power3.out",
      });

      // 1. MOUSE MOVE HANDLER
      const onMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;

        if (hoverTarget.current) {
          // --- MAGNETIC MODE ---
          // If hovering a button, we don't freeze. We "magnetize".
          // The cursor moves towards the mouse, but is dampened so it stays near the button center.

          const rect = hoverTarget.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate distance from center
          const distx = clientX - centerX;
          const disty = clientY - centerY;

          // Move cursor to Center + 10% of the mouse distance (The "Magnetic" Pull)
          xTo(centerX + distx * 0.1);
          yTo(centerY + disty * 0.1);
        } else {
          // --- STANDARD MODE ---
          // Follow mouse exactly
          xTo(clientX);
          yTo(clientY);
        }
      };

      // 2. ENTER INTERACTIVE ELEMENT
      const onMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest(
          "a, button, input, .card-hover, .magnetic-target"
        ) as HTMLElement;

        if (clickable && clickable !== hoverTarget.current) {
          hoverTarget.current = clickable;

          const rect = clickable.getBoundingClientRect();
          const styles = window.getComputedStyle(clickable);
          const radius = styles.borderRadius;

          // Animate into the shape of the button
          gsap.to(cursor, {
            width: rect.width + 8, // Add subtle padding
            height: rect.height + 8,
            borderRadius: radius === "0px" ? "4px" : radius,
            duration: 0.4,
            ease: "elastic.out(1, 0.75)",
            overwrite: "auto",
          });

          cursor.classList.add("locked");
        }
      };

      // 3. LEAVE INTERACTIVE ELEMENT
      const onMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest(
          "a, button, input, .card-hover, .magnetic-target"
        ) as HTMLElement;

        // Only unlock if we are actually leaving the tracked element
        if (clickable && clickable === hoverTarget.current) {
          hoverTarget.current = null;

          // Animate back to dot
          gsap.to(cursor, {
            width: 16,
            height: 16,
            borderRadius: "50%",
            duration: 0.3,
            ease: "power2.out",
            overwrite: "auto",
          });

          cursor.classList.remove("locked");
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseover", onMouseOver);
      window.addEventListener("mouseout", onMouseOut);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseover", onMouseOver);
        window.removeEventListener("mouseout", onMouseOut);
      };
    },
    { scope: cursorRef }
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 border-2 border-primary opacity-60 transition-colors duration-300",
          // Base: Small ring
          "h-4 w-4 rounded-full"
        )}
      />
    </div>
  );
}
