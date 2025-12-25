/* eslint-disable @typescript-eslint/no-unused-vars */
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
  | "SOURCE_HUNTER"
  | "KONAMI_CODE"
  | "SOCIAL_ENGINEER"
  | "VOID_WALKER";

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
  KONAMI_CODE: {
    id: "KONAMI_CODE",
    title: "GOD_MODE",
    description: "Unlimited power! (Not really).",
    xp: 500,
  },
  SOCIAL_ENGINEER: {
    id: "SOCIAL_ENGINEER",
    title: "SOCIAL_LINK",
    description: "Established connection on external frequencies.",
    xp: 25,
  },
  VOID_WALKER: {
    id: "VOID_WALKER",
    title: "VOID_WALKER",
    description: "Stared into the void and lived to tell the tale.",
    xp: 404,
  },
};

// --- Cache Helpers ---
const CACHE_KEY = "t7sen-achievements-cache";

function getLocalCache(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (e) {
    return [];
  }
}

function updateLocalCache(ids: AchievementId[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(ids));
}

export function useAchievements() {
  const { play } = useSfx();
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const unlockedRef = useRef<AchievementId[]>([]);
  const visitorIdRef = useRef<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      // 1. Initialize Visitor ID
      let vid = localStorage.getItem("t7sen-visitor-id");
      if (!vid) {
        vid = uuidv4();
        localStorage.setItem("t7sen-visitor-id", vid);
      }
      visitorIdRef.current = vid;

      // 2. Load from LocalStorage Cache FIRST (Instant)
      // This ensures we have data immediately before the server request finishes
      const cached = getLocalCache();
      if (cached.length > 0) {
        setUnlocked(cached);
        unlockedRef.current = cached;
      }

      // 3. Sync with Server (Async)
      const serverAchievements = await getVisitorAchievements(vid);
      const typedServerAchievements =
        serverAchievements as string[] as AchievementId[];

      // 4. Merge Local Cache + Server Data
      const merged = Array.from(
        new Set([...cached, ...typedServerAchievements]),
      );

      // 5. Update State & Cache if there's a difference
      if (merged.length !== cached.length) {
        setUnlocked(merged);
        unlockedRef.current = merged;
        updateLocalCache(merged);
      }
    };

    // Run immediately (setTimeout 0 puts it at end of event loop, safe for hydration)
    const timer = setTimeout(() => {
      initSession();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const unlock = useCallback(
    async (id: AchievementId) => {
      // 1. Memory Check
      if (unlockedRef.current.includes(id)) return;

      // 2. Cache Check (The Fix for 404 Race Condition)
      // Even if unlockedRef is empty (fetching), we might have it in localStorage.
      const cached = getLocalCache();
      if (cached.includes(id)) {
        // We actually have it! Sync state and abort.
        unlockedRef.current = cached;
        setUnlocked(cached);
        return;
      }

      // 3. Verify Visitor ID
      let currentVisitorId = visitorIdRef.current;
      if (!currentVisitorId) {
        if (typeof window !== "undefined") {
          currentVisitorId = localStorage.getItem("t7sen-visitor-id");
          if (!currentVisitorId) {
            currentVisitorId = uuidv4();
            localStorage.setItem("t7sen-visitor-id", currentVisitorId);
          }
          visitorIdRef.current = currentVisitorId;
        }
      }
      if (!currentVisitorId) return;

      // 4. Optimistic Update
      const newSet = [...unlockedRef.current, id];
      unlockedRef.current = newSet;
      setUnlocked(newSet);
      updateLocalCache(newSet); // <--- Persist immediately

      // 5. UI Feedback
      play("success");
      const achievement = ACHIEVEMENTS[id];
      toast(achievement.title, {
        description: achievement.description,
        icon: <Trophy className="h-4 w-4 text-yellow-500" />,
        className: "border-primary/50 bg-background/90 backdrop-blur-md",
        duration: 4000,
      });

      // 6. Server Sync
      await unlockServerAchievement(currentVisitorId, id);
    },
    [play],
  );

  return { unlock, unlocked };
}
