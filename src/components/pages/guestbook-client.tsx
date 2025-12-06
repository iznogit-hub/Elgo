"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { GuestbookForm } from "@/components/guestbook/form";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";

export function GuestbookClient({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { play } = useSfx();

  useGSAP(
    () => {
      // Instant visibility for reduced motion
      if (prefersReducedMotion) {
        gsap.set(".gb-item", { y: 0, opacity: 1 });
        gsap.set(".floating-header", { y: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 1. Header Elements Drop In
      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      );

      // 2. Main Content Fades Up
      tl.fromTo(
        ".gb-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        "-=0.6" // Slight overlap with header animation
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <main
      ref={containerRef}
      className="flex min-h-screen flex-col items-center pt-24 pb-20 px-6 overflow-hidden relative"
    >
      {/* --- FLOATING HEADER --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        {/* ABORT BUTTON */}
        <div className="floating-header pointer-events-auto">
          <Link href="/" className="cursor-none" onClick={() => play("click")}>
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground/30 group-hover:border-red-500/50 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <div className="flex flex-col items-start">
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

        {/* STATUS PILL */}
        <div className="floating-header flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              DB_ACCESS
            </span>
            <Database className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/60">
            <span>NODE: REDIS</span>
            <span>::</span>
            <span>WRITE_OK</span>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      {/* Added mt-20 to account for the floating header spacing on desktop */}
      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8 mt-12 md:mt-20">
        {/* Header */}
        <div className="gb-item text-center space-y-4 opacity-0">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            <HackerText text="Guestbook" />
          </h1>
          <p className="text-muted-foreground max-w-[400px] mx-auto">
            Leave your mark on the digital ledger. <br />
            Data is persisted via Redis.
          </p>
        </div>

        {/* Form Container */}
        <div className="gb-item w-full flex justify-center opacity-0">
          <GuestbookForm />
        </div>

        {/* Divider */}
        <div className="gb-item w-full opacity-0">
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent my-4" />
        </div>

        {/* List Container (Passed from Server) */}
        <div className="gb-item w-full flex justify-center opacity-0">
          {children}
        </div>
      </div>
    </main>
  );
}
