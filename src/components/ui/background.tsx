"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import { 
  Volume2, VolumeX, Maximize2, Minimize2 
} from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";

export function Background() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  // 🎛️ MEDIA STATE
  const [isMuted, setIsMuted] = useState(true);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // ⚡ FIX: Store bar heights in state to prevent Hydration Mismatch
  const [barHeights, setBarHeights] = useState<number[]>([20, 40, 60, 40, 20]); // Default static values

  // 1. VIDEO SYNC ENGINE
  useEffect(() => {
    // Generate random heights ONLY on client-side mount
    setBarHeights(Array.from({ length: 5 }, () => Math.random() * 100));

    const video = document.querySelector('video');
    if (!video) return;

    const updateProgress = () => {
       const percent = (video.currentTime / video.duration) * 100;
       setProgress(percent || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, []);

  // 2. TOGGLE AUDIO
  const toggleAudio = () => {
    const video = document.querySelector('video');
    if (!video) return;

    play("click");
    video.muted = !video.muted;
    setIsMuted(video.muted);
    
    if (!video.muted) {
        setIsFocusMode(true);
    }
  };

  // 3. TOGGLE FOCUS
  const toggleFocus = () => {
      play("hover");
      setIsFocusMode(!isFocusMode);
  };

  // 4. PARALLAX GRID ANIMATION
  useGSAP(() => {
      const grid = gridRef.current;
      if (!grid) return;

      const xToGrid = gsap.quickTo(grid, "x", { duration: 0.8, ease: "power3.out" });
      const yToGrid = gsap.quickTo(grid, "y", { duration: 0.8, ease: "power3.out" });

      const handleMouseMove = (e: MouseEvent) => {
        const xOffset = (e.clientX - window.innerWidth / 2) / -40;
        const yOffset = (e.clientY - window.innerHeight / 2) / -40;
        xToGrid(xOffset);
        yToGrid(yOffset);
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    },
    { scope: containerRef }
  );

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-10 h-full w-full overflow-hidden pointer-events-none"
    >
      {/* 🧪 DYNAMIC NEURAL GRID */}
      <div
        ref={gridRef}
        className={cn(
          "absolute inset-[-20%] h-[140%] w-[140%] transition-opacity duration-1000",
          "bg-[linear-gradient(to_right,rgba(6,182,212,0.12)_1px,transparent:1px),linear-gradient(to_bottom,rgba(6,182,212,0.12)_1px,transparent_1px)]",
          "bg-[size:60px_60px]",
          "mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]",
          isFocusMode ? "opacity-10" : "opacity-100"
        )}
      />

      {/* 🧪 AMBIENT GLOWS */}
      <div className={cn("absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full mix-blend-hard-light animate-pulse transition-opacity duration-700", isFocusMode && "opacity-20")} />
      <div className={cn("absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-pink-500/5 blur-[120px] rounded-full mix-blend-hard-light animate-pulse [animation-delay:1.5s] transition-opacity duration-700", isFocusMode && "opacity-20")} />

      {/* 🧪 DIGITAL GRAIN */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay brightness-125">
        <svg className="h-full w-full">
          <filter id="hudNoise"><feTurbulence type="fractalNoise" baseFrequency="0.80" numOctaves="4" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#hudNoise)" />
        </svg>
      </div>

      {/* 🎛️ TRANSMISSION CONTROL PANEL (Bottom Right HUD) */}
      <div className="absolute bottom-24 right-6 md:bottom-8 md:right-8 z-50 pointer-events-auto flex flex-col items-end gap-3">
          
          {/* 1. AUDIO VISUALIZER */}
          <div className={cn(
              "flex items-center gap-1 h-8 px-3 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-sm transition-all duration-500",
              isMuted ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}>
              <span className="text-[9px] font-mono text-cyan-500 animate-pulse">LIVE_FEED</span>
              <div className="flex items-end gap-0.5 h-3 ml-2">
                  {[0, 1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="w-0.5 bg-cyan-500 animate-[bounce_1s_infinite]" 
                        style={{ 
                          height: `${barHeights[i]}%`, // ⚡ FIX: Uses state instead of Math.random() directly
                          animationDelay: `${i * 0.1}s` 
                        }} 
                      />
                  ))}
              </div>
          </div>

          {/* 2. MAIN CONTROLLER */}
          <div className="flex items-center gap-2 p-1.5 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-500/50">
              
              {/* UNMUTE BUTTON */}
              <button 
                  onClick={toggleAudio}
                  className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all border",
                      isMuted 
                        ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white" 
                        : "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  )}
              >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {/* PROGRESS BAR */}
              <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden mx-1">
                  <div 
                    className="h-full bg-cyan-500 transition-all duration-300 ease-linear" 
                    style={{ width: `${progress}%` }} 
                  />
              </div>

              {/* FOCUS MODE TOGGLE */}
              <button 
                  onClick={toggleFocus}
                  className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10",
                      isFocusMode ? "text-yellow-400" : "text-gray-500"
                  )}
                  title={isFocusMode ? "Exit Focus" : "Enter Focus"}
              >
                  {isFocusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>

          </div>
      </div>
      
    </div>
  );
}