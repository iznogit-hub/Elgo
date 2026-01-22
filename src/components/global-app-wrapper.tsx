"use client";

import { useState, useEffect } from "react";
import { useSfx } from "@/hooks/use-sfx";
import { gsap } from "gsap";

import { Cursor } from "@/components/ui/cursor";
import { Preloader } from "@/components/ui/preloader";
import { CommandMenu } from "@/components/command-menu";
import { Background } from "@/components/ui/background";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Navbar } from "@/components/navbar";
import { LoadingContext } from "@/components/loading-context";
import { TabManager } from "@/components/ui/tab-manager";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { Footer } from "@/components/footer";

export function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const { play } = useSfx();

  // --- 1. HANDLE REDUCED MOTION ---
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        gsap.globalTimeline.timeScale(100);
        document.documentElement.classList.add("reduce-motion");
      } else {
        gsap.globalTimeline.timeScale(1);
        document.documentElement.classList.remove("reduce-motion");
      }
    };
    handleMotionChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // --- 2. ASSET LOADING LOGIC ---
  useEffect(() => {
    // Standard Load Time
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 2500);

    // ⚡ SAFETY FALLBACK: If anything crashes/hangs, force load after 4s
    const safetyTimer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ assetsLoaded }}>
      {/* System Overlay Elements */}
      <Cursor />
      <Background />
      <Preloader contentLoaded={assetsLoaded} />
      
      {/* Only show Prompter after load to prevent audio race conditions */}
      {assetsLoaded && <SoundPrompter />}
      
      <CommandMenu />
      <Navbar />
      <TabManager />

      {/* 3D Avatar (Bottom Left) */}
      <AvatarImage startAnimation={assetsLoaded} />

      {/* Main Page Content (Fade In) */}
      <div className={assetsLoaded ? "opacity-100 transition-opacity duration-1000" : "opacity-0"}>
          {children}
      </div>

      <Footer />
    </LoadingContext.Provider>
  );
}