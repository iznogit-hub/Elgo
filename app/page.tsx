"use client";

import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useSfx } from "@/hooks/use-sfx";
import { useKonami } from "@/hooks/use-konami";

import { HeroSection } from "@/components/coming-soon/hero-section";
import { SocialLinks } from "@/components/coming-soon/social-links";
import { Background } from "@/components/coming-soon/background";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Preloader } from "@/components/ui/preloader";
import { Cursor } from "@/components/ui/cursor";
import { CommandMenu } from "@/components/command-menu";
import { SnakeTerminal } from "@/components/snake/snake-terminal";

export default function Home() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false);
  const { play } = useSfx();

  // Konami Code Logic
  useKonami(() => {
    play("success");
    setIsGameOpen(true);
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
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Cursor />
      <Preloader contentLoaded={assetsLoaded} />
      <CommandMenu onOpenGame={() => setIsGameOpen(true)} />
      {isGameOpen && <SnakeTerminal onClose={() => setIsGameOpen(false)} />}
      <Background />

      <div className="w-full z-10 grow flex flex-col justify-center">
        <HeroSection startAnimation={assetsLoaded} />
      </div>

      <AvatarImage
        onImageLoad={() => setAssetsLoaded(true)}
        startAnimation={assetsLoaded}
      />

      <footer className="flex w-full flex-col items-center gap-6 pb-8 pt-8 z-10 shrink-0">
        <SocialLinks />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} t7sen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
