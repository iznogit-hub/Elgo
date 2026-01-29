"use client";

import React, { useRef, useEffect, useState } from "react";
// ⚡ Using absolute alias as per system standard
import { cn } from "@/lib/utils";

interface VideoStageProps {
  src: string;
  poster?: string;
  className?: string;
  overlayOpacity?: number;
}

/**
 * ⚡ VIDEO STAGE (V3.5 - High-Visibility Update)
 * Replaces GLTF with high-fidelity 9:16 MP4 playback.
 * Optimized with initialization guards and corrected layering.
 */
export default function VideoStage({ 
  src, 
  poster, 
  className,
  overlayOpacity = 0.35 // Slightly lowered for better video visibility
}: VideoStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 🧪 SYSTEM TRIGGER: Force play on mount to bypass browser auto-play throttles
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Video auto-play interrupted:", error);
        });
      }
    }
  }, [src]);

  return (
    <div className={cn("fixed inset-0 z-0 overflow-hidden bg-black flex items-center justify-center", className)}>
      
      {/* 📽️ THE CORE SIGNAL (Moved to relative z-0 to ensure it's at the base) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-1000",
          "contrast-[1.1] brightness-[1.1]", // Boosted brightness to fight the overlays
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      {/* 🧪 POST-PROCESSING LAYER 1: Hard Light Cyan/Pink Glow */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-hard-light animate-pulse"
        style={{
          background: `linear-gradient(135deg, rgba(6,182,212,${overlayOpacity}) 0%, rgba(236,72,153,${overlayOpacity}) 100%)`,
        }}
      />
      
      {/* 🧪 LAYER 2: Depth Gradients (Lowered Opacity from 80% to 40% for visibility) */}
      <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-black via-transparent to-black opacity-40" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,transparent_30%,black_100%)] opacity-30" />

      {/* 🧪 LAYER 3: Digital Grain Overlay */}
      <div className="absolute inset-0 z-30 opacity-[0.04] pointer-events-none mix-blend-overlay">
        <svg className="h-full w-full">
          <filter id="noiseFilterStage">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterStage)" />
        </svg>
      </div>

      {/* 🧪 LAYER 4: Scanline Hardware Texture */}
      <div className="absolute inset-0 z-40 pointer-events-none opacity-[0.08] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_3px,3px_100%]" />
      
      {/* 🛡️ BLACKOUT CURTAIN: Prevents flash-of-white before video load */}
      {!isLoaded && <div className="absolute inset-0 z-[50] bg-black" />}
    </div>
  );
} 