"use client";

import { useEffect, useRef } from "react";

export function TabManager() {
  // FIXED: Initialize with empty string to avoid "document is not defined" during SSR
  const originalTitle = useRef("");

  useEffect(() => {
    // Now we are on the client, so it is safe to capture the title
    originalTitle.current = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Capture the latest title before switching away
        originalTitle.current = document.title;
        document.title = "Signal Lost... 📡";
      } else {
        // Restore
        document.title = originalTitle.current;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Safety measure: Restore title if component unmounts
      document.title = originalTitle.current;
    };
  }, []);

  return null;
}
