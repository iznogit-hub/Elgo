"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { useSfx } from "@/hooks/use-sfx";
import { useKonami } from "@/hooks/use-konami";

import { HeroSection } from "@/components/home/hero-section";
import { SocialLinks } from "@/components/home/social-links";
import { SnakeTerminal } from "@/components/snake/snake-terminal";

export default function Home() {
  const [isGameOpen, setIsGameOpen] = useState(false);
  const { play } = useSfx();

  // Konami Code Logic
  // STABILIZED KONAMI ACTION
  const konamiAction = useCallback(() => {
    play("success");
    setIsGameOpen(true);

    // Confetti logic remains the same
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
  }, [play, setIsGameOpen]);

  useKonami(konamiAction);

  // NEW EFFECT: Listen for the global Command Menu signal
  useEffect(() => {
    const handleOpenGame = () => {
      setIsGameOpen(true);
    };

    // The global Command Menu dispatches this event
    window.addEventListener("open-snake-game", handleOpenGame);
    return () => window.removeEventListener("open-snake-game", handleOpenGame);
  }, []); // Run once on mount

  return (
    <main className="flex h-screen w-full flex-col items-center justify-between overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* REMOVED: <Cursor />, <Preloader />, <CommandMenu />, <Background /> */}

      {/* Navbar is now in layout, so we don't need the top spacer either, 
         but we need the content to be centered correctly.
         The fixed Navbar covers the top, so we need content to start lower.
         A simple full-height flex column works.
      */}

      {/* Spacer to push content below the fixed Navbar (approx 96px) */}
      <div className="w-full shrink-0 pt-24" />

      <div className="w-full z-10 grow flex flex-col justify-center">
        {/* CRITICAL: The HeroSection animation must now be triggered by a signal 
           from the global wrapper, not local state.
           We must pass the global state down via a Context or prop drilling
           from the wrapper to HeroSection. Since that's complicated, we will use a global
           flag and let HeroSection check it in its GSAP logic.
           But for now, to ensure it doesn't crash, we pass TRUE, and fix HeroSection later.
        */}
        <HeroSection />
      </div>

      {/* Game renders as a modal/overlay */}
      {isGameOpen && <SnakeTerminal onClose={() => setIsGameOpen(false)} />}

      {/* REMOVED: <AvatarImage ... /> */}

      <footer className="flex w-full flex-col items-center gap-6 pb-8 pt-8 z-10 shrink-0">
        <SocialLinks />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} t7sen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
