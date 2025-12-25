"use client";

import React, { useRef, useMemo } from "react";
import {
  useAchievements,
  ACHIEVEMENTS,
  type AchievementId,
} from "@/hooks/use-achievements";
import { cn } from "@/lib/utils";
import {
  Trophy,
  ArrowLeft,
  Terminal,
  Shield,
  Award,
  Palette,
  Power,
  Code2,
  Fingerprint,
  Wifi,
  Disc,
  Activity,
  Gamepad2,
  Share2,
  Ghost,
  Clock,
  MonitorSmartphone,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

gsap.registerPlugin(useGSAP);

// --- Configuration & Helpers ---

const ACHIEVEMENT_ICONS: Record<AchievementId, React.ElementType> = {
  FIRST_BOOT: Power,
  ROOT_ACCESS: Fingerprint,
  ECHO_LOCATOR: Wifi,
  THEME_HACKER: Palette,
  COMMAND_LINE: Terminal,
  SOURCE_HUNTER: Code2,
  KONAMI_CODE: Gamepad2,
  SOCIAL_ENGINEER: Share2,
  VOID_WALKER: Ghost,
  COPY_CAT: Code2,
  TIME_TRAVELER: Clock,
  FLUID_DYNAMICS: MonitorSmartphone,
};

// UPDATED RANKS (Total XP: 1274)
const RANKS = [
  {
    threshold: 0,
    title: "GUEST_USER",
    icon: Disc,
    color: "text-muted-foreground",
  },
  {
    threshold: 100, // Easy: 2-3 basic achievements
    title: "SCRIPT_KIDDIE",
    icon: Terminal,
    color: "text-blue-500",
  },
  {
    threshold: 450, // Medium: Requires at least one 'Secret' or completion of all basics
    title: "NETRUNNER",
    icon: Activity,
    color: "text-purple-500",
  },
  {
    threshold: 900, // Hard: Requires Konami Code or Void Walker
    title: "SYS_ADMIN",
    icon: Shield,
    color: "text-orange-500",
  },
  {
    threshold: 1274, // Master: Requires ~99% Completion
    title: "ARCHITECT",
    icon: Trophy,
    color: "text-yellow-500",
  },
];

// --- PART 1: THE STATIC SHELL (Header, Footer, Decor) ---
export function AchievementsShell({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
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
          stagger: {
            amount: 3,
            from: "random",
          },
        });
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden text-foreground pt-24 md:pt-32 pb-20 px-4 md:px-6"
    >
      {/* --- Floating Header --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        <div className="floating-header pointer-events-auto opacity-0">
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

        {/* --- STATUS INDICATOR --- */}
        <div className="floating-header flex flex-col items-end gap-2 opacity-0">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              ARCHIVE_LIVE
            </span>
            <Award className="h-3 w-3 text-primary" />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>REF: 0x4E1</span>
            <span>::</span>
            <span>INDEXED</span>
          </div>
        </div>
      </div>

      {/* --- Ambient Decor --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
        <div className="decor-item absolute top-[18%] left-[6%] font-mono text-xs text-primary/60 opacity-0">
          {`> VERIFYING_PROTOCOLS...`}
        </div>
        <div className="decor-item absolute top-[35%] right-[8%] font-mono text-xs text-muted-foreground/60 opacity-0">
          {`{ "trophies": "cached" }`}
        </div>
        <div className="decor-item absolute bottom-[15%] left-[12%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <Trophy className="h-4 w-4" />
          <span className="font-mono text-xs">TROPHY_INDEX: VERIFIED</span>
        </div>
        <div className="decor-item absolute bottom-[25%] right-[15%] flex items-center gap-2 text-primary/40 opacity-0">
          <Award className="h-4 w-4" />
          <span className="font-mono text-xs">HONOR_SYSTEM: ONLINE</span>
        </div>
      </div>

      {children}
    </main>
  );
}

// --- PART 2: THE DYNAMIC CONTENT ---
export function AchievementsContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { unlocked } = useAchievements();
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();

  const stats = useMemo(() => {
    const totalXP = Object.values(ACHIEVEMENTS).reduce(
      (acc, curr) => acc + curr.xp,
      0,
    );
    const currentXP = unlocked.reduce((acc, id) => {
      const achievement = ACHIEVEMENTS[id as AchievementId];
      return acc + (achievement?.xp || 0);
    }, 0);

    const currentRank =
      [...RANKS].reverse().find((r) => currentXP >= r.threshold) || RANKS[0];
    const nextRank = RANKS.find((r) => r.threshold > currentXP);
    const progressToNext = nextRank
      ? ((currentXP - currentRank.threshold) /
          (nextRank.threshold - currentRank.threshold)) *
        100
      : 100;

    return { totalXP, currentXP, currentRank, nextRank, progressToNext };
  }, [unlocked]);

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".stats-hud",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.1 },
      );

      tl.fromTo(
        ".achievement-chip",
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          clearProps: "transform",
        },
        "-=0.6",
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(".xp-bar-fill", { width: `${stats.progressToNext}%` });
        return;
      }

      gsap.to(".xp-bar-fill", {
        width: `${stats.progressToNext}%`,
        duration: 1.5,
        ease: "expo.out",
      });
    },
    {
      scope: containerRef,
      dependencies: [prefersReducedMotion, stats.progressToNext],
    },
  );

  return (
    <div
      ref={containerRef}
      className="z-10 w-full max-w-4xl flex flex-col gap-8 md:gap-12 mt-4"
    >
      {/* --- Player Stats HUD --- */}
      <div className="stats-hud w-full relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xl p-5 md:p-6 opacity-0">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50" />

        <div className="relative flex flex-col md:flex-row gap-6 md:items-center justify-between">
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "h-16 w-16 rounded-xl border-2 flex items-center justify-center bg-background shadow-lg shrink-0",
                stats.currentRank.color.replace("text-", "border-"),
              )}
            >
              <stats.currentRank.icon
                className={cn("h-8 w-8", stats.currentRank.color)}
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Current Rank
                </span>
                <div className="h-px w-6 bg-border" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">
                <HackerText text={stats.currentRank.title} />
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                <span className="text-foreground font-bold">
                  {stats.currentXP}
                </span>{" "}
                / {stats.totalXP} XP
              </p>
            </div>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
              <span>Progress</span>
              <span>{stats.nextRank ? "Next Rank" : "Max Level"}</span>
            </div>
            <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/50 relative">
              <div className="absolute inset-0 w-full h-full flex justify-evenly opacity-20 z-10">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-px h-full bg-background" />
                ))}
              </div>
              <div className="xp-bar-fill h-full bg-primary relative w-0">
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
              </div>
            </div>
            {stats.nextRank && (
              <p className="text-[10px] text-right font-mono text-muted-foreground/50">
                {stats.nextRank.threshold - stats.currentXP} XP to upgrade
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Achievement Grid --- */}
      {/* UPDATED: 4 Columns on Large Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {Object.entries(ACHIEVEMENTS).map(([id, achievement]) => {
          const achievementId = id as AchievementId;
          const isUnlocked = unlocked.includes(achievementId);
          const Icon = ACHIEVEMENT_ICONS[achievementId] || Trophy;

          const isSecretLocked = achievement.secret && !isUnlocked;

          return (
            <div
              key={id}
              className={cn(
                "achievement-chip group relative flex flex-col p-4 rounded-lg border transition-all duration-300 overflow-hidden opacity-0",
                "hover:scale-[1.02] hover:-translate-y-1",
                isUnlocked
                  ? "bg-primary/5 border-primary/20 hover:border-primary/50 shadow-[0_4px_20px_-10px_rgba(var(--primary),0.1)]"
                  : "bg-secondary/10 border-border/40 hover:opacity-100",
              )}
              onMouseEnter={() => play("hover")}
            >
              <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                <Icon className="h-20 w-20 -rotate-12 translate-x-4 -translate-y-4" />
              </div>

              <div className="flex items-start justify-between mb-3 z-10">
                <div
                  className={cn(
                    "p-2 rounded-md border backdrop-blur-md",
                    isUnlocked
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "bg-muted/20 border-border/20 text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border",
                      isUnlocked
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-muted/20 border-border/20 text-muted-foreground",
                    )}
                  >
                    {isSecretLocked ? "???" : `${achievement.xp} XP`}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mt-auto z-10">
                <h3
                  className={cn(
                    "font-bold tracking-tight text-sm",
                    isUnlocked ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {isSecretLocked ? "???" : achievement.title}
                </h3>
                <p
                  className={cn(
                    "text-[10px] leading-relaxed",
                    isUnlocked
                      ? "text-muted-foreground"
                      : isSecretLocked
                        ? "text-primary/70 font-mono"
                        : "text-muted-foreground/40 blur-[2px] select-none",
                  )}
                >
                  {isSecretLocked
                    ? "Encrypted signal detected..."
                    : achievement.description}
                </p>
              </div>

              {!isUnlocked && (
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
              )}

              <div
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 transition-all duration-500",
                  isUnlocked ? "w-full bg-primary" : "w-0 bg-muted-foreground",
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
