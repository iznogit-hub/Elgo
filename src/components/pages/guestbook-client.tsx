"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Server } from "lucide-react";
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
      if (prefersReducedMotion) {
        gsap.set(".gb-item", { y: 0, opacity: 1 });
        gsap.set(".floating-header", { y: 0, opacity: 1 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      );

      tl.fromTo(
        ".gb-item",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        "-=0.6"
      );
      tl.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5"
      );

      if (!prefersReducedMotion) {
        gsap.to(".decor-item", {
          y: "15px",
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            amount: 3,
            from: "random",
          },
        });
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <main
      ref={containerRef}
      className="flex min-h-dvh md:h-dvh w-full flex-col items-center md:overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
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
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>NODE: REDIS</span>
            <span>::</span>
            <span>WRITE_OK</span>
          </div>
        </div>
      </div>

      {/* --- Ambient Decor (Guestbook) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="decor-item absolute top-[18%] left-[6%] font-mono text-xs text-primary/60 opacity-0">
          {`> ACCESSING_ARCHIVES...`}
        </div>
        <div className="decor-item absolute top-[35%] right-[8%] font-mono text-xs text-muted-foreground/60 opacity-0">
          {`{ "persistence": "true" }`}
        </div>
        <div className="decor-item absolute bottom-[15%] left-[12%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <Database className="h-4 w-4" />
          <span className="font-mono text-xs">DB_LATENCY: 12ms</span>
        </div>
        <div className="decor-item absolute bottom-[25%] right-[15%] flex items-center gap-2 text-primary/40 opacity-0">
          <Server className="h-4 w-4" />
          <span className="font-mono text-xs">SYNC_STATUS: COMPLETE</span>
        </div>
      </div>

      {/* UPDATED: Increased pt-32 to pt-48 */}
      <div className="z-10 w-full max-w-2xl flex flex-col items-center gap-4 md:gap-6 mt-0 h-auto md:h-full pt-48 md:pt-32 pb-6 px-6 grow">
        <div className="gb-item text-center space-y-2 shrink-0 opacity-0">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
            <HackerText text="Guestbook" />
          </h1>
          <p className="text-muted-foreground text-sm max-w-[400px] mx-auto">
            Leave your mark on the digital ledger.
            <br />
            Data is persisted via Redis.
          </p>
        </div>

        <div className="gb-item w-full flex justify-center shrink-0 opacity-0">
          <GuestbookForm />
        </div>

        <div className="gb-item w-full shrink-0 opacity-0">
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />
        </div>

        <div className="gb-item w-full h-[400px] md:h-auto md:flex-1 md:min-h-0 flex justify-center opacity-0">
          {children}
        </div>
      </div>
    </main>
  );
}
