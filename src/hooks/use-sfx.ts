"use client";

import { useSound } from "@/components/sound-provider";

export function useSfx() {
  const { play,  toggleMute } = useSound();

  return {
    play,
    toggleMute,
  };
}
