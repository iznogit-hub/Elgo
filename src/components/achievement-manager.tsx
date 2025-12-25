"use client";

import { useEffect } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { usePathname } from "next/navigation";

export function AchievementManager() {
  const { unlock } = useAchievements();
  const pathname = usePathname();

  // 1. Trigger: FIRST_BOOT (Run once on mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      unlock("FIRST_BOOT");
    }, 2000); // Delay slightly so it doesn't pop instantly
    return () => clearTimeout(timer);
  }, [unlock]);

  // 2. Trigger: ROOT_ACCESS (Dashboard visit)
  useEffect(() => {
    if (pathname === "/dashboard") {
      unlock("ROOT_ACCESS");
    }
  }, [pathname, unlock]);

  // 3. Trigger: COPY_CAT (Copy text)
  useEffect(() => {
    const handleCopy = () => unlock("COPY_CAT");

    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [unlock]);

  // 4. Trigger: FLUID_DYNAMICS (Window Resize)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      // Simple debounce to prevent firing 100 times per second
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        unlock("FLUID_DYNAMICS");
      }, 500);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [unlock]);

  // 5. Trigger: TIME_TRAVELER (Late night visit: 00:00 - 05:00)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlock("TIME_TRAVELER");
    }
  }, [unlock]);

  return null; // This component renders nothing
}
