"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface VideoStageProps {
  src: string;
  poster?: string;
  className?: string;
  overlayOpacity?: number;
}

/**
 * ⚡ VIDEO STAGE V4.0 (Morph Engine)
 * Supports smooth cross-fading between video sources.
 * Essential for the "Playable World" feel when switching Niches.
 */
export default function VideoStage({ 
  src, 
  poster, 
  className,
  overlayOpacity = 0.35 
}: VideoStageProps) {
  
  // We keep track of two video sources to cross-fade them
  const [activeSrc, setActiveSrc] = useState(src);
  const [prevSrc, setPrevSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Trigger transition when prop changes
  useEffect(() => {
    if (src !== activeSrc) {
      setPrevSrc(activeSrc); // Move current to background
      setActiveSrc(src);     // Set new to foreground
      setIsTransitioning(true); // Start fade
      
      // Cleanup transition state after fade completes
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevSrc(null); // Kill the old video to save RAM
      }, 1000); // 1s cross-fade duration matching CSS
      
      return () => clearTimeout(timer);
    }
  }, [src, activeSrc]);

  return (
    <div className={cn("fixed inset-0 z-0 overflow-hidden bg-black flex items-center justify-center", className)}>
      
      {/* 📽️ LAYER A (Previous Video - Fades Out) */}
      {prevSrc && (
        <video
          key={prevSrc}
          src={prevSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: isTransitioning ? 0 : 1 }} // Force fade out
        />
      )}

      {/* 📽️ LAYER B (Active Video - Fades In) */}
      <video
        key={activeSrc}
        src={activeSrc}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out",
          "contrast-[1.1] brightness-[1.1]",
          // If transitioning, start at 0 and fade to 1. If static, stay at 1.
          isTransitioning ? "animate-in fade-in duration-1000" : "opacity-100"
        )}
      />

      {/* 🧪 POST-PROCESSING LAYER 1: Hard Light Cyan/Pink Glow */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none mix-blend-hard-light"
        style={{
          background: `linear-gradient(135deg, rgba(6,182,212,${overlayOpacity}) 0%, rgba(236,72,153,${overlayOpacity}) 100%)`,
        }}
      />
      
      {/* 🧪 LAYER 2: Depth Gradients */}
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
      
    </div>
  );
}