"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
// @ts-ignore
import useSoundHook from "use-sound";

type SoundContextType = {
  play: (soundName: "click" | "hover" | "success" | "error" | "off") => void;
  isMuted: boolean;
  toggleMute: () => void;
};

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  // Fix: Hydrate state safely to avoid sync-state-update warning
  useEffect(() => {
    const stored = localStorage.getItem("sound-muted");
    if (stored) {
      const parsed = JSON.parse(stored);
      // Only update if different to avoid redundant renders
      setIsMuted((prev) => (prev !== parsed ? parsed : prev));
    }
  }, []);

  const [playClick] = useSoundHook("/sounds/click.mp3", { volume: 0.5, soundEnabled: !isMuted });
  const [playHover] = useSoundHook("/sounds/hover.mp3", { volume: 0.2, soundEnabled: !isMuted });
  const [playSuccess] = useSoundHook("/sounds/success.mp3", { volume: 0.5, soundEnabled: !isMuted });
  const [playError] = useSoundHook("/sounds/error.mp3", { volume: 0.5, soundEnabled: !isMuted });
  const [playOff] = useSoundHook("/sounds/off.mp3", { volume: 0.5, soundEnabled: !isMuted });

  const play = useCallback((soundName: string) => {
    if (isMuted) return;
    switch (soundName) {
      case "click": playClick(); break;
      case "hover": playHover(); break;
      case "success": playSuccess(); break;
      case "error": playError(); break;
      case "off": playOff(); break;
    }
  }, [isMuted, playClick, playHover, playSuccess, playError, playOff]);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      localStorage.setItem("sound-muted", JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <SoundContext.Provider value={{ play, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
}