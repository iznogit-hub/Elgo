"use client";

import { useSound } from "@/components/sound-provider";

export function useSfx() {
  const { play, isMuted, toggleMute } = useSound();

  return {
    play,
    isMuted,
    toggleMute,
  };
}
