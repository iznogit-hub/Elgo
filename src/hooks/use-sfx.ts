"use client";

import { useSound } from "@/components/sound-provider";

export function useSfx() {
  // ⚡ Extract 'isMuted' so the UI knows what icon to show
  const { play, toggleMute, isMuted } = useSound();

  return {
    play,
    toggleMute,
    isMuted, // <-- Now your UI can react to the state
  };
}