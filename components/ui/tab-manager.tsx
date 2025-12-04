"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TabManager() {
  const originalTitle = useRef("");
  const pathname = usePathname();

  useEffect(() => {
    // 1. On mount/navigation, grab the current title immediately
    // (It might still be the old one for a few milliseconds)
    if (document.title) {
      originalTitle.current = document.title;
    }

    // 2. Wait for Next.js to finish setting the NEW page title
    // We capture it so we can restore it if the user tabs away and comes back
    const timer = setTimeout(() => {
      originalTitle.current = document.title;
    }, 200); // Increased to 200ms to ensure we catch the update

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the tab
        document.title = "Signal Lost... 📡";
      } else {
        // User came back: Restore the correct page title we captured
        document.title = originalTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // CRITICAL FIX: Removed the line that reset document.title.
      // We let Next.js handle the title update for the new route.
    };
  }, [pathname]);

  return null;
}
