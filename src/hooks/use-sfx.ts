"use client";

import { useCallback } from "react";
import useSound from "use-sound";

// You will need to add these .mp3 files to your public/sfx folder
// I recommend small, <20kb UI sounds.
const SOUNDS = {
  click: "/sfx/click.mp3",     // Short mechanical click
  hover: "/sfx/hover.mp3",     // High pitch blip
  success: "/sfx/success.mp3", // Cash register or positive chime
  error: "/sfx/error.mp3",     // Low buzz or glitch
  open: "/sfx/open.mp3",       // Sci-fi slide open
  close: "/sfx/close.mp3",     // Sci-fi slide close
  off: "/sfx/power_off.mp3",   // Power down sound
};

export function useSfx() {
  const [playClick] = useSound(SOUNDS.click, { volume: 0.5 });
  const [playHover] = useSound(SOUNDS.hover, { volume: 0.1 }); // Keep hover quiet
  const [playSuccess] = useSound(SOUNDS.success, { volume: 0.4 });
  const [playError] = useSound(SOUNDS.error, { volume: 0.4 });
  const [playOpen] = useSound(SOUNDS.open, { volume: 0.3 });
  const [playClose] = useSound(SOUNDS.close, { volume: 0.3 });
  const [playOff] = useSound(SOUNDS.off, { volume: 0.5 });

  const play = useCallback((type: keyof typeof SOUNDS) => {
    // Check if user has muted sounds in localStorage (Optional feature)
    const isMuted = localStorage.getItem("bubblepops-mute") === "true";
    if (isMuted) return;

    switch (type) {
      case "click": playClick(); break;
      case "hover": playHover(); break;
      case "success": playSuccess(); break;
      case "error": playError(); break;
      case "open": playOpen(); break;
      case "close": playClose(); break;
      case "off": playOff(); break;
    }
  }, [playClick, playHover, playSuccess, playError, playOpen, playClose, playOff]);

  return { play };
}