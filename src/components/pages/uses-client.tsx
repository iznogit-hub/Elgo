"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Activity, Zap } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { USES_DATA } from "@/data/uses";

gsap.registerPlugin(useGSAP);

export function UsesClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(".floating-header", { y: 0, opacity: 1 });
        gsap.set(".uses-intro", { scale: 1, opacity: 1, y: 0 });
        gsap.set(".uses-grid-card", { opacity: 1, x: 0 });
        gsap.set(".decor-item", { opacity: 1, y: 0 }); // Ensure y is 0
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      );

      tl.fromTo(
        ".uses-intro",
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1 },
        "-=0.6"
      );

      tl.fromTo(
        ".uses-grid-card",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.05 },
        "<+=0.1"
      );

      tl.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5"
      );

      if (!prefersReducedMotion) {
        gsap.to([".uses-intro", ".uses-grid-card"], {
          y: "10px",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            amount: 2,
            from: "random",
          },
        });

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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground px-6 py-32"
    >
      {/* --- Floating Header --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-30">
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

        <div className="floating-header flex flex-col items-end gap-2 opacity-0">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              SYSTEM_ZYGOTE
            </span>
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>KERNEL: 6.8.0</span>
            <span>::</span>
            <span>STABLE</span>
          </div>
        </div>
      </div>

      {/* --- Ambient Decor --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="decor-item absolute top-[20%] left-[5%] font-mono text-xs text-primary/60 opacity-0">
          {`> SCANNING_HARDWARE...`}
        </div>
        <div className="decor-item absolute top-[30%] right-[8%] font-mono text-xs text-muted-foreground/60 opacity-0">
          {`{ "fps": "uncapped" }`}
        </div>
        <div className="decor-item absolute bottom-[15%] left-[10%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs">CPU_LOAD: OPTIMAL</span>
        </div>
        <div className="decor-item absolute bottom-[25%] right-[15%] flex items-center gap-2 text-primary/40 opacity-0">
          <Activity className="h-4 w-4" />
          <span className="font-mono text-xs">SYSTEM_STATUS: ONLINE</span>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col justify-center h-full pt-10">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
          <div className="w-full md:w-1/3 space-y-6 text-center md:text-left uses-intro opacity-0">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
                <HackerText text="Arsenal" />
              </h1>
              <div className="h-1 w-20 bg-primary/50 rounded-full mx-auto md:mx-0" />
            </div>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              My weapon of choice for coding and combat. <br />
              Hardware, software, and configs optimized for speed, ergonomics,
              and security.
            </p>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {USES_DATA.map((section) => (
              <div
                key={section.category}
                className={cn(
                  "uses-grid-card group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-white/5 to-white/0 backdrop-blur-md p-5 opacity-0",
                  "transition-[border-color,box-shadow,background-color] duration-500",
                  "hover:border-primary/30 hover:shadow-[0_0_30px_-10px_rgba(var(--primary),0.2)]"
                )}
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-center gap-3 mb-4 text-primary relative z-10">
                  <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <section.icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase">
                    {section.category}
                  </span>
                  <div className="h-px bg-primary/20 grow" />
                </div>

                <ul className="space-y-3 relative z-10">
                  {section.items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-start justify-between gap-4"
                    >
                      <MagneticWrapper strength={0.1} className="w-full">
                        <div className="flex flex-col w-full group/item cursor-none">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-sm text-foreground/80 group-hover/item:text-primary transition-colors duration-300">
                              {item.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono mt-0.5 opacity-60 group-hover/item:opacity-100 transition-opacity">
                            {item.desc}
                          </span>
                        </div>
                      </MagneticWrapper>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
