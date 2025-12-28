"use client";

import React, { useRef, useState, useEffect } from "react";
import { TransitionLink } from "@/components/ui/transition-link";
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

// --- Hive Pattern (Stateless) ---
const HivePattern = ({
  id,
  scale = 1,
  opacity = 0.1,
}: {
  id: string;
  scale?: number;
  opacity?: number;
}) => (
  <svg
    className="absolute inset-0 w-[120%] h-[120%] -top-[10%] -left-[10%] pointer-events-none transition-transform duration-200 ease-out"
    style={{ opacity }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <pattern
      id={`hive-grid-${id}`}
      x="0"
      y="0"
      width="56"
      height="100"
      patternUnits="userSpaceOnUse"
      patternTransform={`scale(${scale})`}
    >
      <path
        d="M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </pattern>
    <rect width="100%" height="100%" fill={`url(#hive-grid-${id})`} />
  </svg>
);

// --- Depth Card (Parallax) ---
function GlareCard({
  children,
  className,
  rarity,
  onMouseEnter,
}: {
  children: React.ReactNode;
  className?: string;
  rarity: Rarity;
  onMouseEnter?: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const uniqueId = React.useId();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition({ x, y });

    const xPct = x / rect.width - 0.5;
    const yPct = y / rect.height - 0.5;

    setParallax({ x: xPct * 20, y: yPct * 20 });
  };

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 });
    setParallax({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        rarityGlowMap[rarity],
        className,
      )}
    >
      {/* ⚡ UPDATED: Scaled down pattern sizes */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translate(${parallax.x * 0.5}px, ${parallax.y * 0.5}px)`,
        }}
      >
        <HivePattern id={`${uniqueId}-deep`} scale={0.4} opacity={0.03} />
      </div>

      <div
        className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
        style={{ transform: `translate(${parallax.x}px, ${parallax.y}px)` }}
      >
        <HivePattern id={`${uniqueId}-mid`} scale={0.5} opacity={0.08} />
      </div>

      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 mix-blend-soft-light"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1), transparent 40%)`,
        }}
      />

      <div className="relative z-10 h-full flex flex-col p-3">{children}</div>
    </div>
  );
}

export function UsesClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [systemInfo, setSystemInfo] = useState({
    os: "...",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const ua = navigator.userAgent;
      let os = "UNKNOWN";
      if (ua.includes("Win")) os = "WIN32";
      if (ua.includes("Mac")) os = "DARWIN";
      if (ua.includes("Linux")) os = "LINUX";
      if (ua.includes("Android")) os = "ANDROID";
      if (ua.includes("iPhone")) os = "IOS";

      setSystemInfo({ os });
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
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 },
      );
      tl.fromTo(
        ".fade-in",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.05 },
        "-=0.4",
      );
      tl.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5",
      );

      if (!prefersReducedMotion) {
        gsap.to(".decor-item", {
          y: "15px",
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { amount: 4, from: "random" },
        });
      }
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative h-dvh w-full overflow-hidden text-foreground flex flex-col"
    >
      {/* --- FLOATING HEADER (HUD) --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-50">
        <div className="floating-header pointer-events-auto">
          <TransitionLink
            href="/"
            className="cursor-none group"
            onClick={() => play("click")}
          >
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
              asChild
            >
              <span>
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
              </span>
            </Button>
          </TransitionLink>
        </div>

        <div className="floating-header flex flex-col items-end gap-2">
          {/* Main Status Chip */}
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

          {/* Telemetry Row */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span>KERNEL: {systemInfo.os}</span>
            <span>::</span>
            <span>STABLE</span>
          </div>
        </div>
      </div>

      {/* --- AMBIENT DECOR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="decor-item absolute top-[20%] left-[5%] font-mono text-xs text-primary/60 opacity-0">{`> SCANNING_HARDWARE...`}</div>
        <div className="decor-item absolute top-[30%] right-[8%] font-mono text-xs text-muted-foreground/60 opacity-0">{`{ "fps": "uncapped" }`}</div>
        <div className="decor-item absolute bottom-[15%] left-[10%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs">CPU_LOAD: OPTIMAL</span>
        </div>
        <div className="decor-item absolute bottom-[25%] right-[5%] flex items-center gap-2 text-primary/40 opacity-0">
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
                  <div className="flex items-center gap-2 text-muted-foreground/70 pb-1 border-b border-border/40">
                    <section.icon className="h-3 w-3" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">
                      {section.category}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {section.items.map((item) => (
                      <MagneticWrapper key={item.name} strength={0.02}>
                        <GlareCard
                          rarity={item.rarity}
                          className="h-21 rounded-lg border border-border/40 bg-card/30 dark:bg-accent/10 backdrop-blur-sm hover:bg-accent/50 dark:hover:bg-accent/30 cursor-none"
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

                          {item.specs && (
                            <div
                              className={cn(
                                "absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20 grid grid-cols-2 gap-x-2 gap-y-1",
                                "bg-background/80 dark:bg-background/90 backdrop-blur-xl border-t border-border/50",
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
                        </GlareCard>
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
