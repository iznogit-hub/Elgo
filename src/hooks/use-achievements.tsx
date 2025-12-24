"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { Trophy } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  unlockServerAchievement,
  getVisitorAchievements,
} from "@/app/actions/achievements";

export type AchievementId =
  | "FIRST_BOOT"
  | "ROOT_ACCESS"
  | "ECHO_LOCATOR"
  | "THEME_HACKER"
  | "COMMAND_LINE"
  | "SOURCE_HUNTER";

interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  xp: number;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  FIRST_BOOT: {
    id: "FIRST_BOOT",
    title: "SYSTEM_INIT",
    description: "Welcome to the network.",
    xp: 10,
  },
  ROOT_ACCESS: {
    id: "ROOT_ACCESS",
    title: "ROOT_ACCESS",
    description: "Accessed the main dashboard.",
    xp: 50,
  },
  ECHO_LOCATOR: {
    id: "ECHO_LOCATOR",
    title: "ECHO_LOCATOR",
    description: "Checked network latency manually.",
    xp: 20,
  },
  THEME_HACKER: {
    id: "THEME_HACKER",
    title: "CHROMATIC_ABERRATION",
    description: "Stop flashing the lights!",
    xp: 30,
  },
  COMMAND_LINE: {
    id: "COMMAND_LINE",
    title: "POWER_USER",
    description: "Accessed the command terminal.",
    xp: 40,
  },
  SOURCE_HUNTER: {
    id: "SOURCE_HUNTER",
    title: "OPEN_SOURCE",
    description: "Attempted to view the source code.",
    xp: 100,
  },
};

export function useAchievements() {
  const { play } = useSfx();
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const unlockedRef = useRef<AchievementId[]>([]);
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Sync with Server (Redis) on mount
    const initSession = async () => {
      let vid = localStorage.getItem("t7sen-visitor-id");
      if (!vid) {
        vid = uuidv4();
        localStorage.setItem("t7sen-visitor-id", vid);
      }
      visitorIdRef.current = vid;

      const serverAchievements = await getVisitorAchievements(vid);

      // Ensure we treat the return value as strings
      const typedAchievements =
        serverAchievements as string[] as AchievementId[];

      setUnlocked(typedAchievements);
      unlockedRef.current = typedAchievements;
    };

    // Run inside setTimeout to avoid any hydration/render conflicts
    const timer = setTimeout(() => {
      initSession();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const unlock = useCallback(
    async (id: AchievementId) => {
      if (unlockedRef.current.includes(id)) return;
      if (!visitorIdRef.current) return;

      // Optimistic Update
      unlockedRef.current = [...unlockedRef.current, id];
      setUnlocked([...unlockedRef.current]);

      // UI Feedback
      play("success");
      const achievement = ACHIEVEMENTS[id];
      toast(achievement.title, {
        description: achievement.description,
        icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        className: "border-primary/50 bg-background/90 backdrop-blur-md",
        duration: 4000,
      });

      // Server Sync (Fire and forget, or await if strictly needed)
      await unlockServerAchievement(visitorIdRef.current, id);
    },
    [play],
  );

  return { unlock, unlocked };
}
