"use client";

import { useRef } from "react";
import {
  useAchievements,
  ACHIEVEMENTS,
  AchievementId,
} from "@/hooks/use-achievements";
import { cn } from "@/lib/utils";
import { Lock, Trophy } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function AchievementsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { unlocked } = useAchievements();

  // Calculate stats
  const total = Object.keys(ACHIEVEMENTS).length;
  const count = unlocked.length;
  const progress = (count / total) * 100;

  useGSAP(
    () => {
      // Staggered entrance animation for cards
      gsap.fromTo(
        ".achievement-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "all", // Clean up styles after animation to allow hover effects
        },
      );

      // Smooth width animation for progress bar
      gsap.fromTo(
        ".progress-fill",
        { width: "0%" },
        {
          width: `${progress}%`,
          duration: 1.5,
          ease: "power2.inOut",
          delay: 0.2,
        },
      );
    },
    { scope: containerRef, dependencies: [progress] },
  );

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 mb-16">
        <h1 className="font-mono text-4xl font-bold tracking-tighter">
          <span className="text-primary mr-3">/</span>
          SERVICE_RECORDS
        </h1>
        <p className="text-muted-foreground font-mono text-sm max-w-lg">
          Track your interaction history with the system. Unlocking these nodes
          requires exploration of the network.
        </p>

        {/* Progress Bar */}
        <div className="mt-4 w-full max-w-md">
          <div className="flex justify-between text-[10px] font-mono mb-1 text-primary/80">
            <span>SYNC_STATUS</span>
            <span>
              {count}/{total} UNLOCKED
            </span>
          </div>
          <div className="h-1 w-full bg-muted overflow-hidden rounded-full">
            <div
              className="progress-fill h-full bg-primary"
              style={{ width: `${progress}%` }} // Initial render width
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(ACHIEVEMENTS).map((achievement, index) => {
          const isUnlocked = unlocked.includes(achievement.id as AchievementId);

          return (
            <div
              key={achievement.id}
              className={cn(
                "achievement-card relative group overflow-hidden border p-6 flex flex-col gap-3 transition-all duration-300",
                isUnlocked
                  ? "bg-primary/5 border-primary/20 shadow-[0_0_20px_-12px_var(--primary)]"
                  : "bg-muted/5 border-border/40 opacity-60 grayscale",
              )}
            >
              <div className="flex items-start justify-between">
                <div
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    isUnlocked
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isUnlocked ? (
                    <Trophy className="h-5 w-5" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </div>
                <span className="font-mono text-[10px] opacity-40">
                  #{String(index + 1).padStart(3, "0")}
                </span>
              </div>

              <div className="space-y-1">
                <h3
                  className={cn(
                    "font-mono font-bold tracking-tight",
                    isUnlocked ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {achievement.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {isUnlocked
                    ? achievement.description
                    : "Encrypted Data. Explore to decrypt."}
                </p>
              </div>

              {isUnlocked && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
