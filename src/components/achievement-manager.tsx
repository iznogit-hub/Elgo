"use client";

import { useEffect } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { usePathname } from "next/navigation";

export function AchievementManager() {
  const { unlock } = useAchievements();
  const pathname = usePathname();

  // Trigger: FIRST_BOOT (Run once on mount)
  useEffect(() => {
    const timer = setTimeout(() => {
      unlock("FIRST_BOOT");
    }, 2000); // Delay slightly so it doesn't pop instantly
    return () => clearTimeout(timer);
  }, [unlock]);

  // Trigger: ROOT_ACCESS (Dashboard visit)
  useEffect(() => {
    if (pathname === "/dashboard") {
      unlock("ROOT_ACCESS");
    }
  }, [pathname, unlock]);

  return null; // This component renders nothing
}
