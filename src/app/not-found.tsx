"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Bug, ServerCrash } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

gsap.registerPlugin(useGSAP);

export default function NotFound() {
  const { play } = useSfx();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Floating Header Entrance
      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      );

      // 2. The Fracture Line (Expands horizontally)
      tl.fromTo(
        ".fracture-line",
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: "expo.out" },
        "-=0.4"
      );

      // 3. The 404 Halves (Slide from opposite sides)
      tl.fromTo(
        ".glitch-top",
        { x: -50, opacity: 0, clipPath: "inset(0 0 100% 0)" },
        { x: 0, opacity: 1, clipPath: "inset(0 0 50% 0)", duration: 1 },
        "-=1.0"
      );
      tl.fromTo(
        ".glitch-bottom",
        { x: 50, opacity: 0, clipPath: "inset(100% 0 0 0)" },
        { x: 0, opacity: 1, clipPath: "inset(50% 0 0 0)", duration: 1 },
        "<"
      );

      // 4. Content Fade Up
      tl.fromTo(
        ".content-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
        "-=0.5"
      );

      // 5. Idle Hover Animation (Drift)
      gsap.to(".glitch-top", {
        x: -5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".glitch-bottom", {
        x: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden text-foreground bg-transparent"
    >
      {/* Glitch Overlay Effect */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20 animate-scanline" />
      </div>

      {/* --- FLOATING HEADER --- */}
      <div className="absolute top-0 left-0 right-0 pt-20 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        <div className="floating-header pointer-events-auto opacity-0">
          <Link href="/" className="cursor-none" onClick={() => play("click")}>
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground/30 group-hover:border-red-500/50 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <div className="flex flex-col items-start font-sans">
                <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground group-hover:text-red-500">
                  ABORT
                </span>
                <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
                  RETURN_TO_BASE
                </span>
              </div>
            </Button>
          </Link>
        </div>

        <div className="floating-header flex flex-col items-end gap-2 opacity-0">
          <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-red-500">
              SIGNAL_LOST
            </span>
            <AlertTriangle className="h-3 w-3 text-red-500" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>ERR: 404</span>
            <span>::</span>
            <span>NULL</span>
          </div>
        </div>
      </div>

      {/* --- CENTERED CONTENT --- */}
      <div className="z-10 flex flex-col items-center justify-center relative w-full max-w-4xl px-4">
        {/* THE FRACTURE TYPOGRAPHY (FIXED) */}
        {/* 'relative' allows the container to size itself based on the 'invisible' ghost text */}
        <div className="relative font-black text-[25vw] md:text-[20rem] leading-none tracking-tighter select-none">
          {/* 1. GHOST LAYER (Invisible, but sets the size) */}
          <div className="invisible" aria-hidden="true">
            404
          </div>

          {/* 2. Top Half (Visible Layer) */}
          <div
            className="glitch-top absolute top-0 left-0 right-0 text-center text-red-500/20 blur-sm md:blur-md"
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            404
          </div>

          {/* 3. Bottom Half (Visible Layer) */}
          <div
            className="glitch-bottom absolute top-0 left-0 right-0 text-center text-red-500/60"
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            404
          </div>

          {/* Central Line */}
          <div className="fracture-line absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50 w-full transform -translate-y-1/2" />
        </div>

        {/* Text Content (Positioned Absolute over the giant number) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center text-center space-y-6 w-full">
          {/* Icon Badge */}
          <div className="content-item bg-black/80 backdrop-blur-md border border-red-500/20 p-4 rounded-full mb-4 shadow-[0_0_30px_-10px_rgba(239,68,68,0.5)]">
            <ServerCrash className="h-8 w-8 text-red-500" />
          </div>

          <div className="content-item space-y-2">
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
              <HackerText text="PAGE_NOT_FOUND" />
            </h2>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <p className="text-muted-foreground/80 font-mono text-xs md:text-sm tracking-widest uppercase">
              // ERROR_CODE: 0x404_VOID
            </p>
          </div>

          {/* Action Buttons */}
          <MagneticWrapper className="content-item flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto min-w-60 gap-3 border border-red-500/50 bg-red-500/10 text-red-500 font-mono font-bold shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all duration-300"
              onClick={() => {
                play("click");
                window.location.href =
                  "mailto:contact@t7sen.com?subject=System%20Anomaly%20Report%20(404)";
              }}
              onMouseEnter={() => play("hover")}
            >
              <Bug className="h-4 w-4" />
              <span>REPORT_ANOMALY</span>
            </Button>
          </MagneticWrapper>
        </div>
      </div>
    </div>
  );
}
