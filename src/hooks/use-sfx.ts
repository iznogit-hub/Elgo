"use client";

import { useSound } from "@/components/sound-provider";

export function useSfx() {
  // We simply expose the play function from our global context.
  // This ensures all components (buttons, nav, forms) automatically
  // respect the global 'isMuted' state without needing extra logic.
  const { play } = useSound();

  return { play };
}
