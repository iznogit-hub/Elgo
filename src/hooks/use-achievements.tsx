"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { Trophy, Crown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  unlockServerAchievement,
  getVisitorAchievements,
} from "@/app/actions/achievements";

// --- TYPES ---
export type AchievementId =
  | "FIRST_BOOT"
  | "ROOT_ACCESS"
  | "ECHO_LOCATOR"
  | "THEME_HACKER"
  | "COMMAND_LINE"
  | "SOURCE_HUNTER"
  | "KONAMI_CODE"
  | "SOCIAL_ENGINEER"
  | "VOID_WALKER"
  | "COPY_CAT"
  | "TIME_TRAVELER"
  | "FLUID_DYNAMICS"
  | "SPEED_RUNNER"
  | "COMPLETIONIST";

interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  xp: number;
  secret?: boolean;
  invisible?: boolean;
}

// --- DATA ---
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
    secret: true,
  },
  SOCIAL_ENGINEER: {
    id: "SOCIAL_ENGINEER",
    title: "SOCIAL_LINK",
    description: "Established connection on external frequencies.",
    xp: 25,
    secret: true,
  },
  VOID_WALKER: {
    id: "VOID_WALKER",
    title: "VOID_WALKER",
    description: "Stared into the void and lived to tell the tale.",
    xp: 404,
    secret: true,
  },
  COPY_CAT: {
    id: "COPY_CAT",
    title: "CTRL_C_V",
    description: "Great artists steal code.",
    xp: 20,
    secret: true,
  },
  TIME_TRAVELER: {
    id: "TIME_TRAVELER",
    title: "MIDNIGHT_RUN",
    description: "System access detected during off-hours.",
    xp: 25,
    secret: true,
  },
  FLUID_DYNAMICS: {
    id: "FLUID_DYNAMICS",
    title: "FLUID_LAYOUT",
    description: "Stress-tested the responsive grid.",
    xp: 50,
    secret: true,
  },
  SPEED_RUNNER: {
    id: "SPEED_RUNNER",
    title: "OVERCLOCKED",
    description: "System speed limit exceeded (3 unlocks < 60s).",
    xp: 0,
    invisible: true,
  },
  COMPLETIONIST: {
    id: "COMPLETIONIST",
    title: "PROTOCOL_OMEGA",
    description: "100% System Synchronization. You are the Architect.",
    xp: 0,
    invisible: true,
  },
};

// --- HELPERS ---
const CACHE_KEY = "t7sen-achievements-cache";

function getLocalCache(): AchievementId[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return [];
  }
}

function updateLocalCache(ids: AchievementId[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(ids));
}

// --- CONTEXT ---
interface AchievementsContextType {
  unlocked: AchievementId[];
  unlock: (id: AchievementId) => void;
}

const AchievementsContext = createContext<AchievementsContextType | undefined>(
  undefined,
);

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { play } = useSfx();
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const unlockedRef = useRef<AchievementId[]>([]);
  const visitorIdRef = useRef<string | null>(null);

  const unlockHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    const initSession = async () => {
      let vid = localStorage.getItem("t7sen-visitor-id");
      if (!vid) {
        vid = uuidv4();
        localStorage.setItem("t7sen-visitor-id", vid);
      }
      visitorIdRef.current = vid;

      const cached = getLocalCache();
      if (cached.length > 0) {
        setUnlocked(cached);
        unlockedRef.current = cached;
      }

      try {
        const serverAchievements = await getVisitorAchievements(vid);
        const typedServerAchievements =
          serverAchievements as string[] as AchievementId[];

        const merged = Array.from(
          new Set([...cached, ...typedServerAchievements]),
        );

        if (merged.length !== cached.length) {
          setUnlocked(merged);
          unlockedRef.current = merged;
          updateLocalCache(merged);
        }
      } catch (error) {
        console.error("Failed to sync achievements", error);
      }
    };

    const timer = setTimeout(() => {
      initSession();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const unlock = useCallback(
    async (id: AchievementId) => {
      if (unlockedRef.current.includes(id)) return;

      const cached = getLocalCache();
      if (cached.includes(id)) {
        unlockedRef.current = cached;
        setUnlocked(cached);
        return;
      }

      const now = Date.now();
      unlockHistoryRef.current.push(now);

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

      const newSet = [...unlockedRef.current, id];
      unlockedRef.current = newSet;
      setUnlocked(newSet);
      updateLocalCache(newSet);

      play("success");
      const achievement = ACHIEVEMENTS[id];

      let Icon = Trophy;
      if (id === "COMPLETIONIST") Icon = Crown;

      toast(achievement.title, {
        description: achievement.description,
        icon: <Icon className="h-4 w-4 text-yellow-500" />,
        className: "border-primary/50 bg-background/90 backdrop-blur-md",
        duration: 4000,
      });

      await unlockServerAchievement(currentVisitorId, id);
    },
    [play],
  );

  // --- SPEED RUNNER CHECK ---
  useEffect(() => {
    const history = unlockHistoryRef.current;
    if (history.length < 3) return;

    const thirdLastTime = history[history.length - 3];
    const lastTime = history[history.length - 1];

    if (lastTime && thirdLastTime && lastTime - thirdLastTime <= 60000) {
      const timer = setTimeout(() => {
        unlock("SPEED_RUNNER");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [unlocked, unlock]);

  // --- COMPLETIONIST CHECK ---
  useEffect(() => {
    // If we already have it, skip logic
    if (unlocked.includes("COMPLETIONIST")) return;

    const allAchievementIds = Object.keys(ACHIEVEMENTS) as AchievementId[];

    // Filter out COMPLETIONIST itself to prevent circular requirement
    const requiredIds = allAchievementIds.filter(
      (id) => id !== "COMPLETIONIST",
    );

    // Check if every required ID is in the unlocked array
    const hasAll = requiredIds.every((id) => unlocked.includes(id));

    if (hasAll) {
      const timer = setTimeout(() => {
        unlock("COMPLETIONIST");
      }, 1000); // 1s delay for dramatic effect after the last unlock
      return () => clearTimeout(timer);
    }
  }, [unlocked, unlock]);

  return (
    <AchievementsContext.Provider value={{ unlocked, unlock }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (context === undefined) {
    throw new Error(
      "useAchievements must be used within an AchievementsProvider",
    );
  }
  return context;
}
