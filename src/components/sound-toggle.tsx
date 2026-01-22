"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/sound-provider";
import { Button } from "@/components/ui/button";

export function SoundToggle() {
  const { isMuted, toggleMute, play } = useSound();

  const handleClick = () => {
    if (isMuted) {
      toggleMute();
      setTimeout(() => play("click"), 50);
    } else {
      toggleMute();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className="relative overflow-hidden w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
}