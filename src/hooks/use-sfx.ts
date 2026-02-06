"use client";

import { useCallback } from "react";

// 🔇 SILENT MODE: Prevents 404 errors until you add real files
export function useSfx() {
  const play = useCallback((type: string) => {
    // console.log(`[SFX] Playing sound: ${type}`); // Uncomment to debug triggers
    return; 
  }, []);

  return { play };
}