"use client";

import React, { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const hoverTarget = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const cursor = cursorRef.current;
      if (!cursor) return;

      // Initial State
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });

      const xTo = gsap.quickTo(cursor, "x", {
        duration: 0.25,
        ease: "power3.out",
      });
      const yTo = gsap.quickTo(cursor, "y", {
        duration: 0.25,
        ease: "power3.out",
      });

      // 1. MOVEMENT
      const onMouseMove = (e: MouseEvent) => {
        // Safety: Release if element removed
        if (hoverTarget.current && !hoverTarget.current.isConnected) {
          hoverTarget.current = null;
        }

        const { clientX, clientY } = e;

        if (hoverTarget.current) {
          // MAGNETIC MODE
          const rect = hoverTarget.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distx = clientX - centerX;
          const disty = clientY - centerY;

          xTo(centerX + distx * 0.15);
          yTo(centerY + disty * 0.15);
        } else {
          // STANDARD MODE
          xTo(clientX);
          yTo(clientY);
        }
      };

      // 2. HOVER IN
      const onMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest(
          "a, button, input, textarea, .card-hover, .magnetic-target"
        ) as HTMLElement;

        if (clickable && clickable !== hoverTarget.current) {
          hoverTarget.current = clickable;

          const rect = clickable.getBoundingClientRect();
          const styles = window.getComputedStyle(clickable);
          const radius = styles.borderRadius;

          gsap.to(cursor, {
            width: rect.width + 8,
            height: rect.height + 8,
            borderRadius: radius === "0px" ? "4px" : radius,
            duration: 0.4,
            ease: "elastic.out(1, 0.75)",
            overwrite: "auto",
          });

          cursor.classList.add("locked");
        }
      };

      // 3. HOVER OUT
      const onMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clickable = target.closest(
          "a, button, input, textarea, .card-hover, .magnetic-target"
        ) as HTMLElement;

        if (clickable && clickable === hoverTarget.current) {
          hoverTarget.current = null;

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

  // FORCE RESET ON NAVIGATION
  useEffect(() => {
    hoverTarget.current = null;
    if (cursorRef.current) {
      cursorRef.current.classList.remove("locked");

      gsap.to(cursorRef.current, {
        width: 16,
        height: 16,
        borderRadius: "50%",
        duration: 0.3,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [pathname]);

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 hidden md:block">
      <div
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 border-2 border-primary opacity-60 transition-colors duration-300",
          "h-4 w-4 rounded-full"
        )}
      />
    </div>
  );
}
