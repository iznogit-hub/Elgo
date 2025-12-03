"use client";

import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react"; // Global service
import { SpeedInsights } from "@vercel/speed-insights/next"; // Global service
import { Cursor } from "@/components/ui/cursor"; // Global overlay
import { Preloader } from "@/components/ui/preloader"; // Global overlay
import { CommandMenu } from "@/components/command-menu"; // Global overlay
import { Background } from "@/components/ui/background"; // Global overlay
import { AvatarImage } from "@/components/ui/avatar-image"; // Global asset tracker
import { Navbar } from "@/components/navbar"; // Global navigation
import { LoadingContext } from "@/components/loading-context"; // Loading context
import { TabManager } from "./ui/tab-manager"; // Global overlay

// This component manages all client-side global state and persistent overlays.
export function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Safety fallback (ensures preloader doesn't get stuck)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // This state setter must be passed to the AvatarImage
  const handleAvatarLoad = () => setAssetsLoaded(true);

  return (
    <>
      {/* GLOBAL OVERLAYS & SERVICES (Persistent Across Routes) */}
      <Cursor />
      <Background />
      <Preloader contentLoaded={assetsLoaded} />
      <CommandMenu onOpenGame={() => console.log("Game launch called...")} />
      <Navbar />
      <TabManager />
      {/* Ensure Navbar is placed inside the wrapper for z-index control */}
      {/* The Asset Tracker: Only needs to load once per session */}
      <AvatarImage
        onImageLoad={handleAvatarLoad}
        startAnimation={assetsLoaded}
      />
      <LoadingContext.Provider value={{ assetsLoaded }}>
        {children}
      </LoadingContext.Provider>
      {/* Vercel Analytics (Always at the bottom of the body) */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}
