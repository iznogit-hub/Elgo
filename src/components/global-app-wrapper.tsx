"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSfx } from "@/hooks/use-sfx";
import { gsap } from "gsap";

// UI Components
import { Preloader } from "@/components/ui/preloader";
import { CommandMenu } from "@/components/command-menu";
import { Background } from "@/components/ui/background";
import { AvatarImage } from "@/components/ui/avatar-image"; 
import { Navbar } from "@/components/navbar"; 
import { Footer } from "@/components/footer"; 
import { TabManager } from "@/components/ui/tab-manager";
import { SoundPrompter } from "@/components/ui/sound-prompter";

// Context & Features
import { LoadingContext } from "@/components/loading-context";

export function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const pathname = usePathname();
  const { play } = useSfx();

  // ⚡ STRICT CHECK: Only show Avatar on the absolute home page
  const isLandingPage = pathname === "/";

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
    const timer = setTimeout(() => setAssetsLoaded(true), 2500);
    const safetyTimer = setTimeout(() => setAssetsLoaded(true), 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  // --- 3. EVENT LISTENER: OPEN CHAT FROM COMMAND MENU ---
  useEffect(() => {
    const handleOpenChat = () => setIsChatOpen(true);
    window.addEventListener("open-support-chat", handleOpenChat);
    return () => window.removeEventListener("open-support-chat", handleOpenChat);
  }, []);

  return (
    <LoadingContext.Provider value={{ assetsLoaded }}>
      
      {/* 1. VISUAL LAYER - Renders ONCE globally */}
      <Background />
      <Preloader contentLoaded={assetsLoaded} />
      
      {/* Only show Prompter if assets loaded */}
      {assetsLoaded && <SoundPrompter />}
      
      {/* 2. NAVIGATION LAYER */}
      <CommandMenu />
      <Navbar />
      <TabManager />

      {/* 3. 3D AVATAR (STRICTLY LANDING PAGE ONLY) */}
      {/* If we are NOT on home page, this entire block is removed from DOM */}
      {isLandingPage && (
        <>
          <div 
            onClick={() => {
                play("open");
                setIsChatOpen(true);
            }}
            className="fixed bottom-0 left-0 z-40 cursor-pointer hover:scale-105 transition-transform active:scale-95 hidden md:block"
            title="Open Support Uplink"
          >
             <AvatarImage startAnimation={assetsLoaded} />
          </div>
         
        </>
      )}

      {/* 4. CONTENT LAYER */}
      <div className={assetsLoaded ? "opacity-100 transition-opacity duration-1000" : "opacity-0"}>
          {children}
      </div>

      <Footer />
      
    </LoadingContext.Provider>
  );
}