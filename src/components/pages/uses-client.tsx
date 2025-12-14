"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Activity, Zap, Box } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { USES_DATA, type Rarity } from "@/data/uses";

gsap.registerPlugin(useGSAP);

// --- THEMED RARITY MAPS ---

const rarityGlowMap: Record<Rarity, string> = {
  legendary:
    "group-hover:shadow-[0_0_30px_-5px_rgba(251,146,60,0.4)] dark:group-hover:shadow-[0_0_30px_-5px_rgba(251,146,60,0.3)] group-hover:border-orange-500/50",
  epic: "group-hover:shadow-[0_0_30px_-5px_rgba(192,132,252,0.4)] dark:group-hover:shadow-[0_0_30px_-5px_rgba(192,132,252,0.3)] group-hover:border-purple-500/50",
  rare: "group-hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.4)] dark:group-hover:shadow-[0_0_30px_-5px_rgba(96,165,250,0.3)] group-hover:border-blue-500/50",
  common:
    "group-hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.1)] dark:group-hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] group-hover:border-foreground/20",
};

const rarityTextMap: Record<Rarity, string> = {
  legendary: "text-orange-600 dark:text-orange-400",
  epic: "text-purple-600 dark:text-purple-400",
  rare: "text-blue-600 dark:text-blue-400",
  common: "text-foreground/80 dark:text-muted-foreground",
};

const rarityBgMap: Record<Rarity, string> = {
  legendary: "bg-orange-500",
  epic: "bg-purple-500",
  rare: "bg-blue-500",
  common: "bg-zinc-500/50",
};

const rarityTintMap: Record<Rarity, string> = {
  legendary: "from-orange-500/5 to-transparent",
  epic: "from-purple-500/5 to-transparent",
  rare: "from-blue-500/5 to-transparent",
  common: "from-zinc-500/5 to-transparent",
};

export function UsesClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [systemInfo, setSystemInfo] = useState({ os: "...", engine: "..." });

  useEffect(() => {
    // ⚡ FIX: Use setTimeout to move the state update to the next tick.
    // This satisfies the linter rule about synchronous state updates in effects.
    const timer = setTimeout(() => {
      const ua = navigator.userAgent;
      let os = "UNKNOWN";
      if (ua.includes("Win")) os = "WIN32";
      if (ua.includes("Mac")) os = "DARWIN";
      if (ua.includes("Linux")) os = "LINUX";
      if (ua.includes("Android")) os = "ANDROID";
      if (ua.includes("iPhone")) os = "IOS";

      const engine = ua.includes("Chrome")
        ? "BLINK"
        : ua.includes("Firefox")
          ? "GECKO"
          : ua.includes("Safari")
            ? "WEBKIT"
            : "UNKNOWN";

      setSystemInfo({ os, engine });
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set([".fade-in", ".floating-header"], { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 },
      );

      tl.fromTo(
        ".fade-in",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 },
        "-=0.4",
      );
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden text-foreground flex flex-col"
    >
      {/* --- FLOATING HEADER --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-50">
        <div className="floating-header pointer-events-auto">
          <Link
            href="/"
            className="cursor-none group"
            onClick={() => play("click")}
          >
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border/50 group-hover:border-red-500/50 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400">
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              SYSTEM_ZYGOTE
            </span>
            <Zap className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>KERNEL: {systemInfo.os}</span>
            <span>::</span>
            <span>STABLE</span>
          </div>
        </div>
      </div>

      {/* --- AMBIENT DECOR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="absolute top-[20%] left-[5%] font-mono text-xs text-primary/60">
          {`> SCANNING_HARDWARE...`}
        </div>
        <div className="absolute top-[30%] right-[8%] font-mono text-xs text-muted-foreground/60">
          {`{ "fps": "uncapped" }`}
        </div>
        <div className="absolute bottom-[15%] left-[10%] flex items-center gap-2 text-muted-foreground/60">
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs">CPU_LOAD: OPTIMAL</span>
        </div>
        <div className="absolute bottom-[25%] right-[15%] flex items-center gap-2 text-primary/40">
          <Activity className="h-4 w-4" />
          <span className="font-mono text-xs">SYSTEM_STATUS: ONLINE</span>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex-1 w-full max-w-350 mx-auto flex items-center justify-center h-full px-6 md:px-12 pt-20 pb-8">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT: Intro */}
          <div className="lg:col-span-3 flex flex-col justify-center space-y-6 fade-in self-center">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-accent/50 border border-border/50 text-[10px] font-mono tracking-widest text-muted-foreground w-fit">
                <Box className="h-3 w-3" />
                <span>/ ARMORY</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-none">
                <HackerText text="Gear" />
              </h1>
              {/* ⚡ UPDATED: Tech/Gamer Phrase */}
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed max-w-xs">
                Overclocked hardware and zero-latency configurations. Engineered
                for clicking heads.
              </p>
            </div>

            {/* Rarity Legend */}
            <div className="flex flex-wrap gap-2 pt-2">
              {Object.keys(rarityGlowMap).map((key) => {
                const rarity = key as Rarity;
                return (
                  <div
                    key={rarity}
                    className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-border/40 bg-accent/20"
                  >
                    <div
                      className={cn(
                        "w-1 h-1 rounded-full",
                        rarityBgMap[rarity],
                      )}
                    />
                    <span className="text-[8px] uppercase font-mono text-muted-foreground">
                      {rarity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Quadrant Grid */}
          <div className="lg:col-span-9 w-full h-full flex flex-col justify-center fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 w-full">
              {USES_DATA.map((section) => (
                <div key={section.category} className="flex flex-col gap-2">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 text-muted-foreground/70 pb-1 border-b border-border/40">
                    <section.icon className="h-3 w-3" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">
                      {section.category}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="flex flex-col gap-2">
                    {section.items.map((item) => (
                      <MagneticWrapper key={item.name} strength={0.02}>
                        <div
                          className={cn(
                            "group relative h-21 p-3 rounded-lg transition-all duration-300 cursor-none overflow-hidden flex flex-col",
                            "border border-border/40 bg-card/30 dark:bg-accent/10 backdrop-blur-sm",
                            "hover:bg-accent/50 dark:hover:bg-accent/30",
                            rarityGlowMap[item.rarity],
                          )}
                          onMouseEnter={() => play("hover")}
                        >
                          <div className="flex justify-between items-start mb-1 z-10">
                            <span
                              className={cn(
                                "text-xs font-bold tracking-tight transition-colors duration-300 truncate pr-2",
                                "text-foreground/90 group-hover:text-foreground",
                                item.rarity !== "common" &&
                                  `group-hover:${rarityTextMap[item.rarity].split(" ")[0]}`,
                              )}
                            >
                              {item.name}
                            </span>

                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full opacity-50 group-hover:opacity-100 transition-opacity shrink-0 mt-1",
                                rarityBgMap[item.rarity],
                              )}
                            />
                          </div>

                          <p className="text-[10px] text-muted-foreground font-mono leading-tight opacity-70 group-hover:opacity-20 transition-opacity z-10 line-clamp-2">
                            {item.desc}
                          </p>

                          {/* DRAWER */}
                          {item.specs && (
                            <div
                              className={cn(
                                "absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 grid grid-cols-2 gap-x-2 gap-y-1",
                                "bg-background/80 dark:bg-background/90 backdrop-blur-xl",
                                "border-t border-border/50",
                                "bg-linear-to-t",
                                rarityTintMap[item.rarity],
                              )}
                            >
                              {item.specs.slice(0, 4).map((spec) => (
                                <div
                                  key={spec.label}
                                  className="flex justify-between items-center border-b border-border/40 pb-0.5 last:border-0"
                                >
                                  <span className="text-[7px] uppercase text-muted-foreground/70 tracking-wider">
                                    {spec.label}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[8px] font-mono font-bold ml-1 truncate",
                                      rarityTextMap[item.rarity],
                                    )}
                                  >
                                    {spec.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </MagneticWrapper>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
