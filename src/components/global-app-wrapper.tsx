"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useSfx } from "@/hooks/use-sfx";
import { useKonami } from "@/hooks/use-konami";
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

import dynamic from "next/dynamic";

const SnakeTerminal = dynamic(
  () =>
    import("@/components/snake/snake-terminal").then(
      (mod) => mod.SnakeTerminal,
    ),
  { ssr: false },
);

export function GlobalAppWrapper({ children }: { children: React.ReactNode }) {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const { play } = useSfx();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        // Force all GSAP animations to complete almost instantly
        gsap.globalTimeline.timeScale(100);

        // Force disable CSS animations via the DOM
        document.documentElement.classList.add("reduce-motion");
      } else {
        // Restore normal speed
        gsap.globalTimeline.timeScale(1);
        document.documentElement.classList.remove("reduce-motion");
      }
    };

    // Initialize
    handleMotionChange(mediaQuery);

    // Listen for system changes
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // --- GAME LOGIC (MOVED FROM HOME) ---
  const konamiAction = useCallback(() => {
    play("success");
    setIsGameOpen(true);

    // Celebration Confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 99999,
    };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, [play]);

  // Activate Konami Code Globally
  useKonami(konamiAction);

  // Listen for Command Menu "Play Snake" Trigger
  useEffect(() => {
    const handleOpenGame = () => {
      setIsGameOpen(true);
    };
    window.addEventListener("open-snake-game", handleOpenGame);
    return () => window.removeEventListener("open-snake-game", handleOpenGame);
  }, []);
  // ------------------------------------

  // Safety fallback for preloader
  useEffect(() => {
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleAvatarLoad = () => setAssetsLoaded(true);

  return (
    <>
      <Cursor />
      <Background />
      <Preloader contentLoaded={assetsLoaded} />
      <SoundPrompter />
      <CommandMenu />
      <Navbar />
      <TabManager />

      {/* Global Game Overlay */}
      {isGameOpen && <SnakeTerminal onClose={() => setIsGameOpen(false)} />}

      <AvatarImage
        onImageLoad={handleAvatarLoad}
        startAnimation={assetsLoaded}
      />

      <LoadingContext.Provider value={{ assetsLoaded }}>
        {children}
      </LoadingContext.Provider>
    </>
  );
}
