"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface PreloaderProps {
  contentLoaded: boolean;
}

const LOADING_PHASES = [
  "INITIALIZING_CORE",
  "ESTABLISHING_UPLINK",
  "VERIFYING_CREDENTIALS",
  "DECRYPTING_ASSETS",
  "SYSTEM_READY",
];

export function Preloader({ contentLoaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isClosed, setIsClosed] = useState(false);

  // Derived state (Fixes the synchronous setState error)
  const statusIndex = Math.min(
    Math.floor((progress / 100) * LOADING_PHASES.length),
    LOADING_PHASES.length - 1
  );
  const statusText = LOADING_PHASES[statusIndex];

  useEffect(() => {
    if (contentLoaded) {
      // Force finish
      setProgress(100);
      return;
    }
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Slow down as we get closer to 90%
        const next = prev + Math.random() * 5;
        if (next > 90) return 90; 
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [contentLoaded]);

  useGSAP(() => {
    if (contentLoaded && progress >= 90) {
      const tl = gsap.timeline({
        onComplete: () => setIsClosed(true),
        delay: 0.2,
      });

      tl.to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: "power4.inOut",
      });
    }
  }, [contentLoaded, progress]);

  // Safety fallback
  useEffect(() => {
    if (progress === 100 && !isClosed) {
      const t = setTimeout(() => setIsClosed(true), 2000);
      return () => clearTimeout(t);
    }
  }, [progress, isClosed]);

  if (isClosed) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white"
    >
      <div className="relative z-10 flex flex-col items-center gap-8 w-64">
        <div className="w-full h-[2px] bg-white/10 overflow-hidden relative rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4] transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between w-full text-[10px] font-mono tracking-widest text-gray-500">
          <span>{statusText}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}