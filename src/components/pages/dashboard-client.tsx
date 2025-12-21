"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  ArrowLeft,
  GitCommit,
  Cpu,
  Wifi,
  Activity,
  Swords,
  Zap,
  ShieldCheck,
  Crosshair,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";
import type { DashboardData } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { TransitionLink } from "@/components/ui/transition-link";

interface DashboardClientProps {
  initialData: DashboardData;
}

const getHeatmapColor = (level: number) => {
  switch (level) {
    case 0:
      return "bg-white/5";
    case 1:
      return "bg-purple-900/40";
    case 2:
      return "bg-purple-700/60";
    case 3:
      return "bg-purple-500/80";
    case 4:
      return "bg-purple-400";
    default:
      return "bg-white/5";
  }
};

function LoadGraph() {
  const [bars, setBars] = useState<{ height: number; delay: number }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newBars = Array.from({ length: 30 }).map(() => ({
        height: Math.random() * 100,
        delay: Math.random(),
      }));
      setBars(newBars);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-end gap-0.5 h-8 w-full mt-2 opacity-50 min-h-8">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-1 bg-blue-500/50 rounded-t-[1px]"
          style={{
            height: `${bar.height}%`,
            animation: `pulse 2s infinite ${bar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// --- MATCH HISTORY STRIP (Handles Real or Mock) ---
function MatchHistory({
  history,
  winRate,
}: {
  history?: ("W" | "L")[];
  winRate: number;
}) {
  const [visualHistory, setVisualHistory] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (history && history.length > 0) {
        // Use Real History
        setVisualHistory(history);
      } else {
        // Fallback: Mock based on winrate
        const results = Array.from({ length: 5 }).map(() =>
          Math.random() < winRate / 100 ? "W" : "L",
        );
        setVisualHistory(results);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [history, winRate]);

  return (
    <div className="flex gap-1 mt-1 min-h-1.5">
      {visualHistory.map((result, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-full rounded-sm",
            result === "W" ? "bg-green-500" : "bg-red-500/50",
          )}
        />
      ))}
    </div>
  );
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const checkLatency = async () => {
      const start = performance.now();
      try {
        // FIX: Add timestamp query param to bypass browser cache
        await fetch(`/api/health?t=${Date.now()}`, {
          cache: "no-store", // Explicitly tell fetch not to cache
        });
        const end = performance.now();
        setLatency(Math.round(end - start));
      } catch {
        setLatency(999);
      }
    };

    checkLatency();
    const interval = setInterval(checkLatency, 5000);
    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 },
      );
      tl.fromTo(
        ".dashboard-card",
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 },
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
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { amount: 3, from: "random" },
        });
      }
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-dvh md:h-dvh w-full flex-col items-center pt-24 md:pt-40 pb-20 px-6 overflow-hidden"
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        <div className="floating-header pointer-events-auto">
          <TransitionLink
            href="/"
            className="cursor-none"
            onClick={() => play("click")}
          >
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
              asChild
            >
              <span>
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
              </span>
            </Button>
          </TransitionLink>
        </div>
        <div className="floating-header flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              LIVE_FEED
            </span>
            <Activity className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>NET: UPLINK</span>
            <span>::</span>
            <span>ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-12 pt-24 md:pt-12">
        <div className="text-center space-y-4 floating-header">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            <HackerText text="Command Center" />
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
            Real-time telemetry of my digital existence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. SYSTEM STATUS */}
          <DashboardCard
            title="SYSTEM_INFRA"
            icon={Cpu}
            accent="text-blue-500"
            border="hover:border-blue-500/50"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-mono">
                  STATUS
                </span>
                <span className="text-green-500 font-bold text-sm tracking-widest uppercase">
                  {initialData.system.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> AVAILABILITY
                </span>
                <span className="font-mono text-xs text-green-400">
                  {initialData.system.uptime}%
                </span>
              </div>

              <div className="space-y-3 mt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Cpu className="h-3 w-3" /> CPU USAGE
                    </span>
                    <span className="text-blue-400">
                      {initialData.system.specs.cpu}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${initialData.system.specs.cpu}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3" /> RAM USAGE
                    </span>
                    <span className="text-purple-400">
                      {initialData.system.specs.memory.percent}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-1000"
                      style={{
                        width: `${initialData.system.specs.memory.percent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    SYS_LOAD
                  </span>
                  <span className="text-xs font-mono text-blue-400">
                    {initialData.system.specs.load.toFixed(2)}
                  </span>
                </div>
                <LoadGraph />
              </div>

              <div className="mt-2 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Wifi className="h-3 w-3" /> LATENCY
                </span>
                <span
                  className={cn(
                    latency > 100 ? "text-yellow-500" : "text-green-500",
                  )}
                >
                  {latency}ms
                </span>
              </div>
            </div>
          </DashboardCard>

          {/* 2. CODING METRICS */}
          <DashboardCard
            title="DEV_ACTIVITY"
            icon={GitCommit}
            accent="text-purple-500"
            border="hover:border-purple-500/50"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-mono">
                  COMMITS (YTD)
                </span>
                <span className="text-xl font-bold font-mono">
                  {initialData.coding.commits}
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted-foreground">
                    C::S LEVEL {initialData.coding.level}
                  </span>
                  <span className="text-purple-400">
                    {initialData.coding.progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    style={{ width: `${initialData.coding.progress}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                  Contribution Matrix (Last 12 Weeks)
                </span>
                <div className="grid grid-rows-7 grid-flow-col gap-1 w-full h-25">
                  {initialData.coding.heatmap.map((day, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full h-full rounded-[1px] transition-colors hover:scale-125 hover:z-10",
                        getHeatmapColor(day.level),
                      )}
                      title={`${day.date}: ${day.count} commits`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 mt-1">
                {initialData.coding.languages.map((lang) => (
                  <span
                    key={lang.name}
                    className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] border border-white/10"
                  >
                    {lang.name}
                  </span>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* 3. GAMING STATS (UPDATED) */}
          <DashboardCard
            title="COMBAT_RECORDS"
            icon={Swords}
            accent="text-red-500"
            border="hover:border-red-500/50"
          >
            <div className="space-y-6">
              {/* Valorant */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>VALORANT</span>
                  <div className="flex gap-3">
                    <span className="text-red-400">
                      WIN: {initialData.gaming.valorant.winRate}%
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Crosshair className="h-3 w-3" />
                      {initialData.gaming.valorant.kd} KD
                    </span>
                  </div>
                </div>
                <div className="bg-background/50 p-3 rounded border border-border/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">
                      {initialData.gaming.valorant.rank}
                    </span>
                    <span className="font-mono text-xs text-red-400 flex gap-2">
                      <span>{initialData.gaming.valorant.rr} RR</span>
                      <span className="text-muted-foreground/50">|</span>
                      <span>HS {initialData.gaming.valorant.hs}</span>
                    </span>
                  </div>
                  {/* REAL HISTORY IF AVAILABLE */}
                  <MatchHistory
                    history={initialData.gaming.valorant.lastMatches}
                    winRate={initialData.gaming.valorant.winRate}
                  />
                </div>
              </div>

              {/* LoL */}
              <div className="space-y-2 border-t border-border/50 pt-4">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span>LEAGUE</span>
                  <div className="flex gap-3">
                    <span className="text-blue-400">
                      WIN: {initialData.gaming.lol.winRate}%
                    </span>
                    <span className="text-muted-foreground">
                      {initialData.gaming.lol.main}
                    </span>
                  </div>
                </div>
                <div className="bg-background/50 p-3 rounded border border-border/50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">
                      {initialData.gaming.lol.rank}
                    </span>
                    <span className="font-mono text-xs text-blue-400">
                      {initialData.gaming.lol.lp} LP
                    </span>
                  </div>
                  {/* 👇 UPDATED: Pass the real history here */}
                  <MatchHistory
                    history={initialData.gaming.lol.lastMatches}
                    winRate={initialData.gaming.lol.winRate}
                  />
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Ambient Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="decor-item absolute top-[20%] left-[5%] font-mono text-xs text-primary/60 opacity-0">{`> ESTABLISHING_UPLINK...`}</div>
        <div className="decor-item absolute top-[25%] right-[10%] font-mono text-xs text-muted-foreground/60 opacity-0">{`{ "stream": "encrypted" }`}</div>
        <div className="decor-item absolute bottom-[20%] left-[8%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <Wifi className="h-4 w-4" />
          <span className="font-mono text-xs">SIGNAL_STRENGTH: MAX</span>
        </div>
        <div className="decor-item absolute bottom-[10%] right-[12%] flex items-center gap-2 text-primary/40 opacity-0">
          <Zap className="h-4 w-4" />
          <span className="font-mono text-xs">LIVE_METRICS: ACTIVE</span>
        </div>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  children,
  accent,
  border,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent: string;
  border: string;
}) {
  return (
    <MagneticWrapper strength={0.05} className="dashboard-card opacity-0">
      <div
        className={cn(
          "relative h-full p-6 rounded-xl border border-white/5 bg-linear-to-br from-white/5 to-white/0 backdrop-blur-md transition-all duration-500 group",
          border,
        )}
      >
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <div className={cn("p-2 rounded-md bg-white/5", accent)}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-mono text-sm font-bold tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
            {title}
          </h3>
        </div>
        <div className="relative z-10">{children}</div>
      </div>
    </MagneticWrapper>
  );
}
