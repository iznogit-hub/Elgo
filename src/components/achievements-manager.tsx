"use client";

import { useEffect, useRef } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { usePathname } from "next/navigation";

// ✅ Fix TypeScript error globally
declare global {
  interface Window {
    hack: () => string;
  }
}

export function AchievementsManager() {
  const { unlock, unlocked } = useAchievements();
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

  // 5. Trigger: CONSOLE_COWBOY (DevTools Hack)
  useEffect(() => {
    // Stop if already unlocked
    if (unlocked.includes("CONSOLE_COWBOY")) return;

    // Stylish Console Log (Delayed to ensure it's not buried by other logs)
    const timer = setTimeout(() => {
      // Double check inside timeout in case state changed quickly
      if (unlocked.includes("CONSOLE_COWBOY")) return;

      console.log(
        `%c
   ▄▄▄       ██▓     ▓█████  ██▀███  ▄▄▄█████▓
  ▒████▄    ▓██▒     ▓█   ▀ ▓██ ▒ ██▒▓  ██▒ ▓▒
  ▒██  ▀█▄  ▒██░     ▒███   ▓██ ░▄█ ▒▒ ▓██░ ▒░
  ░██▄▄▄▄██ ▒██░     ▒▓█  ▄ ▒██▀▀█▄  ░ ▓██▓ ░ 
   ▓█   ▓██▒░██████▒ ░▒████▒░██▓ ▒██▒  ▒██▒ ░ 
   ▒▒   ▓▒█░░ ▒░▓  ░ ░░ ▒░ ░░ ▒▓ ░▒▓░  ▒ ░░   
    ▒   ▒▒ ░░ ░ ▒  ░  ░ ░  ░  ░▒ ░ ▒░    ░    
    ░   ▒     ░ ░       ░     ░░   ░   ░      
        ░  ░    ░  ░    ░  ░   ░              
                                              
  %c⚠ SYSTEM ALERT: Port 3000 vulnerable.
  %c> Type 'window.hack()' to patch the mainframe.
      `,
        "color: #ef4444; font-weight: bold;",
        "color: #ef4444; font-family: monospace; font-size: 14px; font-weight: bold; background: #220000; padding: 4px;",
        "color: #fff; font-family: monospace; font-size: 12px; background: #000; padding: 4px;",
      );
    }, 1500);

    // B. Expose the hack function
    window.hack = () => {
      unlock("CONSOLE_COWBOY");
      console.log(
        "%cACCESS GRANTED. SYSTEM PATCHED.",
        "color: #22c55e; font-family: monospace; font-weight: bold; font-size: 14px; padding: 4px; border: 1px solid #22c55e; background: #002200;",
      );
      return "Achievement Unlocked: CONSOLE_COWBOY";
    };

    return () => {
      clearTimeout(timer);
      // @ts-expect-error - cleanup property
      delete window.hack;
    };
  }, [unlock, unlocked]);

  // 6. Trigger: ROOT_ACCESS & SPEED_RUNNER
  useEffect(() => {
    if (pathname === "/dashboard") {
      unlock("ROOT_ACCESS");
    }

    const now = Date.now();
    visits.current.push(now);
    // Keep only timestamps from the last 10 seconds
    visits.current = visits.current.filter((t) => now - t < 10000);
  }, [pathname, unlock]);

  return null;
}
