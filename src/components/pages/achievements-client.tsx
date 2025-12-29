"use client";

import React, { useRef, useMemo, useState } from "react";
import {
  useAchievements,
  ACHIEVEMENTS,
  type AchievementId,
} from "@/hooks/use-achievements";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Terminal,
  Shield,
  Activity,
  Share2,
  Ghost,
  Clock,
  MonitorSmartphone,
  Zap,
  Crown,
  Binary,
  Cpu,
  Skull,
  Lock,
  Network,
  Bot,
  Power,
  Code2,
  Fingerprint,
  Wifi,
  Palette,
  Gamepad2,
  Award,
  Disc,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { HackerText } from "@/components/ui/hacker-text";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HudHeader } from "@/components/ui/hud-header";

gsap.registerPlugin(useGSAP);

// --- TYPES ---
type Achievement = (typeof ACHIEVEMENTS)[AchievementId];

// --- ICONS & RANKS ---
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
  SPEED_RUNNER: Zap,
  COMPLETIONIST: Crown,
  CONSOLE_COWBOY: Binary,
};

const RANKS = [
  {
    threshold: 0,
    title: "GUEST_USER",
    icon: Disc,
    color: "text-muted-foreground",
  },
  {
    threshold: 100,
    title: "SCRIPT_KIDDIE",
    icon: Terminal,
    color: "text-blue-500",
  },
  {
    threshold: 250,
    title: "HACKTIVIST",
    icon: Cpu,
    color: "text-cyan-500",
  },
  {
    threshold: 500,
    title: "NETRUNNER",
    icon: Activity,
    color: "text-indigo-500",
  },
  {
    threshold: 750,
    title: "CYBER_PUNK",
    icon: Skull,
    color: "text-pink-500",
  },
  {
    threshold: 1000,
    title: "SYS_ADMIN",
    icon: Shield,
    color: "text-orange-500",
  },
  {
    threshold: 1300,
    title: "WHITE_HAT",
    icon: Lock,
    color: "text-emerald-500",
  },
  {
    threshold: 1900,
    title: "ARCHITECT",
    icon: Network,
    color: "text-yellow-500",
  },
  {
    threshold: 2600,
    title: "TECH_PRIEST",
    icon: Bot,
    color: "text-red-500",
  },
  {
    threshold: 3611,
    title: "LEGEND",
    icon: Trophy,
    color: "text-amber-400",
  },
];

// --- COMPONENTS ---

function AchievementCard({
  id,
  achievement,
  isUnlocked,
}: {
  id: string;
  achievement: Achievement;
  isUnlocked: boolean;
}) {
  const { play } = useSfx();
  const Icon = ACHIEVEMENT_ICONS[id as AchievementId] || Trophy;
  const isSecretLocked = achievement.secret && !isUnlocked;

  // 3D Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Intensity of tilt (higher = more tilt)
    const intensity = 12;

    // Invert Y for natural feel
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    play("hover");
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovering
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.02, 1.02, 1.02)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.1s ease-out",
      }}
      className={cn(
        "achievement-chip relative flex flex-col p-4 rounded-xl border overflow-hidden opacity-0 will-change-transform",
        // Glassmorphism & Borders
        isUnlocked
          ? "bg-zinc-50/5 dark:bg-zinc-900/5 border-primary/20 hover:border-primary/50 shadow-lg shadow-primary/5"
          : "bg-secondary/5 border-white/5 hover:border-white/10",
      )}
    >
      {/* Dynamic Shine Effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 0.1 : 0,
          background: `radial-gradient(circle at ${50 + rotation.y * 2}% ${
            50 + rotation.x * 2
          }%, rgba(255,255,255,0.8), transparent 60%)`,
        }}
      />

      {/* Floating Background Icon */}
      <div className="absolute top-0 right-0 p-2 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
        <Icon className="h-24 w-24 -rotate-12 translate-x-6 -translate-y-6" />
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4 z-10 relative">
        <div
          className={cn(
            "p-2.5 rounded-lg border backdrop-blur-md shadow-inner transition-colors duration-300",
            isUnlocked
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-zinc-500/5 border-white/5 text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-end">
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-[10px] font-bold px-2 py-0.5 transition-colors",
              isUnlocked
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-white/10 bg-white/5 text-muted-foreground",
            )}
          >
            {isSecretLocked
              ? "???"
              : achievement.xp === 0
                ? "SPECIAL"
                : `${achievement.xp} XP`}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-1.5 mt-auto z-10 relative">
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
            "text-[11px] leading-relaxed transition-all duration-300",
            isUnlocked
              ? "text-muted-foreground"
              : isSecretLocked
                ? "text-primary/60 font-mono"
                : "text-muted-foreground/30 blur-[2px] select-none",
          )}
        >
          {isSecretLocked ? (
            <span className="animate-pulse">Encrypted signal...</span>
          ) : (
            achievement.description
          )}
        </p>
      </div>

      {/* Locked Noise Overlay */}
      {!isUnlocked && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay">
          <svg className="h-full w-full opacity-50">
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>
      )}

      {/* Progress Line */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-0.5 transition-all duration-700 ease-out",
          isUnlocked ? "w-full bg-primary" : "w-0 bg-muted-foreground",
        )}
      />
    </div>
  );
}

export function AchievementsShell({ children }: { children: React.ReactNode }) {
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
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden text-foreground pt-24 md:pt-32 pb-20 px-4 md:px-6"
    >
      {/* --- FLOATING HEADER (HUD) --- */}
      <HudHeader
        title="ARCHIVE_LIVE"
        icon={Award}
        telemetry={
          <>
            <span>REF: 0x4E1</span>
            <span>::</span>
            <span>INDEXED</span>
          </>
        }
        dotColor="bg-amber-400"
      />

      {/* --- DECOR --- */}
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

  // Special Badges
  const badges = [
    {
      id: "SPEED_RUNNER",
      active: unlocked.includes("SPEED_RUNNER"),
      icon: Zap,
      color: "amber",
      title: "OVERCLOCKED",
    },
    {
      id: "CONSOLE_COWBOY",
      active: unlocked.includes("CONSOLE_COWBOY"),
      icon: Binary,
      color: "green",
      title: "CONSOLE_COWBOY",
    },
    {
      id: "COMPLETIONIST",
      active: unlocked.includes("COMPLETIONIST"),
      icon: Crown,
      color: "purple",
      title: "PROTOCOL_OMEGA",
    },
  ];

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
          stagger: 0.05,
          clearProps: "transform", // Important for Tilt to take over
        },
        "-=0.6",
      );
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  // Animate XP Bar
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
        delay: 0.5,
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
      className="z-10 w-full max-w-5xl flex flex-col gap-8 md:gap-12 mt-4"
    >
      {/* --- STATS HUD --- */}
      <div className="stats-hud w-full relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-xl p-6 md:p-8 opacity-0 shadow-2xl shadow-black/20">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row gap-8 md:items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Rank Icon Box */}
            <div
              className={cn(
                "h-20 w-20 rounded-2xl border-2 flex items-center justify-center bg-black/50 shadow-inner shrink-0 relative overflow-hidden group",
                stats.currentRank.color.replace("text-", "border-"),
              )}
            >
              <div className="absolute inset-0 bg-current opacity-10 group-hover:opacity-20 transition-opacity" />
              <stats.currentRank.icon
                className={cn(
                  "h-10 w-10 relative z-10 drop-shadow-lg",
                  stats.currentRank.color,
                )}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  System Rank
                </span>
                <div className="h-px w-8 bg-border/50" />

                {/* Special Badges Row */}
                <div className="flex gap-1.5">
                  {badges.map(
                    (badge) =>
                      badge.active && (
                        <HoverCard
                          key={badge.id}
                          openDelay={200}
                          closeDelay={100}
                        >
                          <HoverCardTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-7 px-1.5 flex items-center justify-center rounded-md cursor-help transition-all duration-300",
                                `border-${badge.color}-500/30 bg-${badge.color}-500/5 hover:bg-${badge.color}-500/10`,
                              )}
                              onMouseEnter={() => play("hover")}
                            >
                              <badge.icon
                                className={cn(
                                  "h-3.5 w-3.5",
                                  `text-${badge.color}-500`,
                                )}
                              />
                            </Badge>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-64 border-white/10 bg-black/90 backdrop-blur-xl"
                            sideOffset={8}
                          >
                            <div className="space-y-1">
                              <h4
                                className={cn(
                                  "text-xs font-bold flex items-center gap-2",
                                  `text-${badge.color}-500`,
                                )}
                              >
                                <badge.icon className="h-3 w-3" />
                                {badge.title}
                              </h4>
                              <p className="text-[10px] text-muted-foreground">
                                {
                                  ACHIEVEMENTS[badge.id as AchievementId]
                                    .description
                                }
                              </p>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      ),
                  )}
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase drop-shadow-sm">
                <HackerText text={stats.currentRank.title} />
              </h1>
              <p className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                <span className="text-foreground font-bold text-sm">
                  {stats.currentXP}
                </span>{" "}
                <span className="opacity-50">/</span> {stats.totalXP} XP
              </p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground/70">
              <span>Next Milestone</span>
              <span>
                {stats.nextRank ? (
                  <span className="text-primary">
                    {stats.nextRank.threshold - stats.currentXP} XP Needed
                  </span>
                ) : (
                  "MAX_LEVEL"
                )}
              </span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
              <div className="absolute inset-0 w-full h-full flex justify-evenly opacity-10 z-10 pointer-events-none">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-px h-full bg-white" />
                ))}
              </div>
              <div className="xp-bar-fill h-full bg-linear-to-r from-primary/60 to-primary relative w-0 shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
            </div>
          </div>
        </div>
      </div>

      {/* --- GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 pb-20">
        {Object.entries(ACHIEVEMENTS)
          .filter(([, achievement]) => !achievement.invisible)
          .map(([id, achievement]) => (
            <AchievementCard
              key={id}
              id={id}
              achievement={achievement}
              isUnlocked={unlocked.includes(id as AchievementId)}
            />
          ))}
      </div>
    </div>
  );
}
