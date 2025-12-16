"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/sound-provider";
import { Button } from "@/components/ui/button";
import { sendGAEvent } from "@next/third-parties/google";

export function SoundToggle() {
  const { isMuted, toggleMute, play } = useSound();

  const handleClick = () => {
    const newStatus = isMuted ? "unmuted" : "muted";

    // --- TRACKING START ---
    sendGAEvent("event", "sound_toggle", {
      event_category: "Preferences",
      event_label: newStatus,
    });
    // --- TRACKING END ---

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
      className="relative overflow-hidden w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {/* Conditional Icon Rendering */}
      {isMuted ? (
        <VolumeX className="h-5 w-5 text-muted-foreground" />
      ) : (
        <Volume2 className="h-5 w-5 text-foreground" />
      )}
    </Button>
  );
}
