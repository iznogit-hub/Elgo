"use client";

import { useEffect, useRef } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { usePathname } from "next/navigation";

export function AchievementsManager() {
  const { unlock } = useAchievements();
  const pathname = usePathname();
  const visits = useRef<number[]>([]);

  // 1. Trigger: FIRST_BOOT
  useEffect(() => {
    const timer = setTimeout(() => {
      unlock("FIRST_BOOT");
    }, 2000);
    return () => clearTimeout(timer);
  }, [unlock]);

  // 2. Trigger: TIME_TRAVELER
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 6) {
      unlock("TIME_TRAVELER");
    }
  }, [unlock]);

  // 3. Trigger: COPY_CAT
  useEffect(() => {
    const handleCopy = () => unlock("COPY_CAT");
    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [unlock]);

  // 4. Trigger: FLUID_DYNAMICS
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
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

  // 5. Trigger: CONSOLE_COWBOY (DevTools Hack) ⚡ NEW
  useEffect(() => {
    // A. Log the hint with style
    console.log(
      "%c⚠ SYSTEM ALERT: Port 3000 vulnerable. Type 'window.hack()' to patch.",
      "color: red; font-family: monospace; font-size: 14px; font-weight: bold; padding: 4px; border: 1px solid red; background: #220000;",
    );

    // B. Expose the hack function
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).hack = () => {
      unlock("CONSOLE_COWBOY");
      console.log(
        "%cACCESS GRANTED. SYSTEM PATCHED.",
        "color: #22c55e; font-family: monospace; font-weight: bold; font-size: 14px; padding: 4px; border: 1px solid #22c55e; background: #002200;",
      );
      return "Achievement Unlocked: CONSOLE_COWBOY";
    };

    // Cleanup
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).hack;
    };
  }, [unlock]);

  // 6. Trigger: ROOT_ACCESS & SPEED_RUNNER
  useEffect(() => {
    if (pathname === "/dashboard") {
      unlock("ROOT_ACCESS");
    }

    const now = Date.now();
    visits.current.push(now);
    visits.current = visits.current.filter((t) => now - t < 10000);

    if (visits.current.length >= 5) {
      unlock("SPEED_RUNNER");
    }
  }, [pathname, unlock]);

  return null;
}
