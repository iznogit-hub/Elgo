"use client";

import { useCallback } from "react";

export const useCyberChat = () => {
  const openChat = useCallback(() => {
    // Dispatch a custom event that the CyberChat component listens for
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-ai-chat"));
    }
  }, []);

  return { openChat };
};
