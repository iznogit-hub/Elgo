"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function TabManager() {
  const originalTitle = useRef("");
  const pathname = usePathname();

  useEffect(() => {
    // 1. Logic to generate the title based on the current URL
    const getPageTitle = () => {
      if (pathname === "/") return "t7sen | Portfolio";

      // Extract first segment (e.g., "/about" -> "about")
      const segment = pathname.split("/")[1];

      // Capitalize first letter (e.g., "about" -> "About")
      const formatted = segment.charAt(0).toUpperCase() + segment.slice(1);

      return `t7sen | ${formatted}`;
    };

    const systemTitle = getPageTitle();

    // 2. Set the title immediately upon navigation
    document.title = systemTitle;
    originalTitle.current = systemTitle;

    // 3. "Away" Status Logic
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.title = "Signal Lost... 📡";
      } else {
        // Restore the calculated page title
        document.title = originalTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Safety reset
      document.title = systemTitle;
    };
  }, [pathname]); // Re-run this effect every time the URL changes

  return null;
}
