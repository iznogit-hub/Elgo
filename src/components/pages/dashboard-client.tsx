"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  GitCommit,
  Cpu,
  Wifi,
  Activity,
  Swords,
  Zap,
  Server,
  Code2,
} from "lucide-react";
import { SiValorant, SiLeagueoflegends } from "react-icons/si";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
// 👇 CHANGED: Import the server action for polling
import {
  fetchDashboardData,
  type DashboardData,
} from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { HudHeader } from "@/components/ui/hud-header";
import { Badge } from "@/components/ui/badge";

// --- HELPERS ---

const getHeatmapColor = (level: number) => {
  switch (level) {
    case 0:
      return "bg-white/5";
    case 1:
      return "bg-purple-500/20";
    case 2:
      return "bg-purple-500/40 shadow-[0_0_5px_rgba(168,85,247,0.2)]";
    case 3:
      return "bg-purple-500/70 shadow-[0_0_10px_rgba(168,85,247,0.4)]";
    case 4:
      return "bg-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)]";
    default:
      return "bg-white/5";
  }
};

function LoadGraph({ data }: { data?: number[] }) {
  // 👇 ADDED: 'value' property for tooltips
  const [normalizedBars, setNormalizedBars] = useState<
    { height: number; delay: number; value: number }[]
  >([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data && data.length > 0) {
        const maxLoad = Math.max(...data, 1.5);
        const bars = data.slice(-24).map((val, i) => ({
          height: Math.max(10, Math.min((val / maxLoad) * 100, 100)),
          delay: i * 0.05,
          value: val, // Store real value
        }));
        setNormalizedBars(bars);
      } else {
        const newBars = Array.from({ length: 24 }).map(() => ({
          height: Math.max(15, Math.random() * 100),
          delay: Math.random() * 2,
          value: 0,
        }));
        setNormalizedBars(newBars);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="flex items-end gap-1 h-10 w-full mt-2 opacity-80 mask-image-b">
      {normalizedBars.map((bar, i) => (
        <div
          key={i}
          // 👇 ADDED: Tooltip for hover
          title={`Load: ${bar.value.toFixed(2)}`}
          className="flex-1 bg-cyan-500/40 rounded-t-[1px] relative overflow-hidden group cursor-crosshair transition-all hover:bg-cyan-400/60"
          style={{
            height: `${bar.height}%`,
            animation: `pulse-height 2s ease-in-out infinite ${bar.delay}s`,
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-cyan-400/80" />
        </div>
      ))}
    </div>
  );
}

function MatchHistory({
  history,
  winRate,
  color = "green",
}: {
  history?: ("W" | "L")[];
  winRate: number;
  color?: "green" | "blue" | "red";
}) {
  const [visualHistory, setVisualHistory] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (history && history.length > 0) setVisualHistory(history);
      else {
        setVisualHistory(
          Array.from({ length: 5 }).map(() =>
            Math.random() < winRate / 100 ? "W" : "L",
          ),
        );
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [history, winRate]);

  const winColor =
    color === "blue"
      ? "bg-blue-500 shadow-blue-500/50"
      : "bg-emerald-500 shadow-emerald-500/50";
  const loseColor = "bg-red-500/20 border border-red-500/20";

  return (
    <div className="flex gap-1.5 mt-2">
      {visualHistory.map((result, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500",
            result === "W" ? `${winColor} shadow-[0_0_8px]` : loseColor,
          )}
        />
      ))}
    </div>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  children,
  color = "cyan",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  color?: "cyan" | "purple" | "red" | "emerald" | "amber";
}) {
  const theme = {
    cyan: {
      border: "group-hover:border-cyan-500/50",
      glow: "from-cyan-500/20",
      icon: "text-cyan-400",
      bgIcon: "bg-cyan-500/10",
      dot: "bg-cyan-400",
    },
    purple: {
      border: "group-hover:border-purple-500/50",
      glow: "from-purple-500/20",
      icon: "text-purple-400",
      bgIcon: "bg-purple-500/10",
      dot: "bg-purple-400",
    },
    red: {
      border: "group-hover:border-red-500/50",
      glow: "from-red-500/20",
      icon: "text-red-400",
      bgIcon: "bg-red-500/10",
      dot: "bg-red-400",
    },
    emerald: {
      border: "group-hover:border-emerald-500/50",
      glow: "from-emerald-500/20",
      icon: "text-emerald-400",
      bgIcon: "bg-emerald-500/10",
      dot: "bg-emerald-400",
    },
    amber: {
      border: "group-hover:border-amber-500/50",
      glow: "from-amber-500/20",
      icon: "text-amber-400",
      bgIcon: "bg-amber-500/10",
      dot: "bg-amber-400",
    },
  }[color];

  return (
    <MagneticWrapper strength={0.05} className="dashboard-card h-full">
      <div
        className={cn(
          "relative flex flex-col h-full p-6 rounded-2xl border bg-black/40 backdrop-blur-xl overflow-hidden transition-all duration-500 group",
          "border-white/5",
          theme.border,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none bg-linear-to-br via-transparent to-transparent",
            theme.glow,
          )}
        />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] bg-repeat mix-blend-overlay" />

        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-lg border border-white/5 shadow-inner backdrop-blur-md transition-colors duration-300",
                theme.bgIcon,
              )}
            >
              <Icon className={cn("h-5 w-5", theme.icon)} />
            </div>
            <h3 className="font-mono text-xs font-bold tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors uppercase">
              {title}
            </h3>
          </div>
          <div className="flex gap-1">
            <div
              className={cn(
                "h-1.5 w-1.5 rounded-full animate-pulse",
                theme.dot,
              )}
            />
          </div>
        </div>
        <div className="relative z-10 flex-1">{children}</div>
      </div>
    </MagneticWrapper>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 },
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
      <HudHeader
        title="LIVE_FEED"
        icon={Activity}
        telemetry={
          <>
            <span>NET: UPLINK</span>
            <span>::</span>
            <span>ACTIVE</span>
          </>
        }
        dotColor="bg-cyan-500"
      />

      <div className="relative z-10 w-full max-w-6xl space-y-12 pt-24 md:pt-12">
        <div className="text-center space-y-4 floating-header">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            <HackerText text="Command Center" />
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
            Real-time telemetry of my digital existence.
          </p>
        </div>
        {children}
      </div>

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

export function DashboardMetrics({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 👇 CHANGED: Store data in state to allow updates
  const [data, setData] = useState<DashboardData>(initialData);
  const [latency, setLatency] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useGSAP(
    () => {
      gsap.fromTo(
        ".dashboard-card",
        { y: 30, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.1 },
      );
    },
    { scope: containerRef },
  );

  // 👇 ADDED: Polling Logic (Every 30 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const freshData = await fetchDashboardData();
        setData(freshData);
      } catch (error) {
        console.error("Failed to poll dashboard data", error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 1000);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Latency Check (Kept Separate for faster ping)
  useEffect(() => {
    const checkLatency = async () => {
      const start = performance.now();
      try {
        await fetch(`/api/health?t=${Date.now()}`, { cache: "no-store" });
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

  return (
    <div
      ref={containerRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* --- CARD 1: SYSTEM INFRASTRUCTURE --- */}
      <DashboardCard title="SYSTEM_INFRA" icon={Server} color="cyan">
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5">
            <span className="text-[10px] font-mono text-cyan-200/70 uppercase tracking-wider">
              Server Status
            </span>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-bold text-cyan-400">
                {data.system.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Cpu className="h-3 w-3" /> CPU_CORE
                </span>
                <span className="text-cyan-400 font-bold">
                  {data.system.specs.cpu}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-in-out"
                  style={{ width: `${data.system.specs.cpu}%` }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> MEMORY_ALLOC
                </span>
                <span className="text-indigo-400 font-bold">
                  {data.system.specs.memory.percent}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000 ease-in-out"
                  style={{
                    width: `${data.system.specs.memory.percent}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-end mb-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                REALTIME_LOAD
              </span>
              <div className="flex items-center gap-2">
                {/* Tiny indicator when refreshing */}
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-cyan-500 transition-opacity",
                    isRefreshing ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="text-[10px] font-mono text-cyan-500/50">
                  {data.system.specs.load.toFixed(2)} avg
                </span>
              </div>
            </div>
            <LoadGraph data={data.system.specs.loadHistory} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] text-muted-foreground font-mono">
                UPTIME
              </span>
              <span className="text-xs font-mono text-foreground">
                {data.system.uptime}%
              </span>
            </div>
            <div className="flex flex-col gap-0.5 items-end">
              <span className="text-[9px] text-muted-foreground font-mono">
                PING
              </span>
              <span
                className={cn(
                  "text-xs font-mono",
                  latency > 100 ? "text-amber-500" : "text-emerald-500",
                )}
              >
                {latency}ms
              </span>
            </div>
          </div>
        </div>
      </DashboardCard>

      {/* --- CARD 2: DEV ACTIVITY --- */}
      <DashboardCard title="DEV_MATRIX" icon={GitCommit} color="purple">
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground mb-1">
                TOTAL_COMMITS
              </p>
              <div className="text-3xl font-black text-purple-100 tracking-tight">
                {data.coding.commits}
              </div>
            </div>
            <Badge
              variant="outline"
              className="border-purple-500/20 bg-purple-500/10 text-purple-300 font-mono text-[10px]"
            >
              LVL.{data.coding.level}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-purple-300/60">
              <span>XP_PROGRESS</span>
              <span>{data.coding.progress}%</span>
            </div>
            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-px">
              <div
                className="h-full rounded-full bg-linear-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                style={{ width: `${data.coding.progress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span>CONTRIBUTION_LOG</span>
              <span className="text-xs text-white/20">84_DAYS</span>
            </div>
            <div className="grid grid-rows-7 grid-flow-col gap-0.5 w-full h-24 mask-image-r">
              {data.coding.heatmap.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-[1px] transition-all duration-300 hover:scale-150 hover:z-50 hover:shadow-lg",
                    getHeatmapColor(day.level),
                  )}
                  title={`${day.date}: ${day.count}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {data.coding.languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-muted-foreground hover:text-purple-300 hover:border-purple-500/30 transition-colors cursor-default"
              >
                <Code2 className="h-3 w-3 opacity-50" />
                {lang.name}
              </div>
            ))}
          </div>
        </div>
      </DashboardCard>

      {/* --- CARD 3: COMBAT RECORDS --- */}
      <DashboardCard title="COMBAT_LOGS" icon={Swords} color="red">
        <div className="flex flex-col h-full gap-6">
          {/* Valorant Section */}
          <div className="relative group/game">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SiValorant className="h-3.5 w-3.5 text-red-500" />
                <span className="text-xs font-bold tracking-wide">
                  VALORANT
                </span>
              </div>
              <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                {data.gaming.valorant.rank.toUpperCase()}
              </span>
            </div>

            <div className="bg-linear-to-br from-red-500/5 to-transparent p-3 rounded-lg border border-red-500/10 hover:border-red-500/30 transition-colors">
              <div className="flex justify-between items-end mb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    RANK_RATING
                  </span>
                  <span className="text-lg font-bold text-red-100">
                    {data.gaming.valorant.rr} RR
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    K/D
                  </span>
                  <span className="text-sm font-mono text-white">
                    {data.gaming.valorant.kd}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-red-300/50 font-mono">
                  <span>RECENT_MATCHES</span>
                  <span>{data.gaming.valorant.winRate}% WINRATE</span>
                </div>
                <MatchHistory
                  history={data.gaming.valorant.lastMatches}
                  winRate={data.gaming.valorant.winRate}
                  color="red"
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent" />

          {/* League Section */}
          <div className="relative group/game">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SiLeagueoflegends className="h-3.5 w-3.5 text-blue-500" />
                <span className="text-xs font-bold tracking-wide">LEAGUE</span>
              </div>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                {data.gaming.lol.rank}
              </span>
            </div>

            <div className="bg-linear-to-br from-blue-500/5 to-transparent p-3 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between items-end mb-2">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    MAIN_CHAMP
                  </span>
                  <span className="text-sm font-bold text-blue-100">
                    {data.gaming.lol.main}
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block font-mono">
                    LP
                  </span>
                  <span className="text-sm font-mono text-white">
                    {data.gaming.lol.lp}
                  </span>
                </div>
              </div>
              <MatchHistory
                history={data.gaming.lol.lastMatches}
                winRate={data.gaming.lol.winRate}
                color="blue"
              />
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  );
}
