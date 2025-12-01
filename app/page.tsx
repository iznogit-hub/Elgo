"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useSfx } from "@/hooks/use-sfx";
import { useKonami } from "@/hooks/use-konami";

import { HeroSection } from "@/components/coming-soon/hero-section";
import { SocialLinks } from "@/components/coming-soon/social-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { Background } from "@/components/coming-soon/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { Logo } from "@/components/ui/logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Preloader } from "@/components/ui/preloader";
import { Cursor } from "@/components/ui/cursor";
import { CommandMenu } from "@/components/command-menu";
import { SnakeTerminal } from "@/components/snake/snake-terminal";

export default function Home() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [isGameOpen, setIsGameOpen] = useState(false); // NEW STATE
  const { play } = useSfx();

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

    // FIXED: Removed ': any' type annotation.
    // TypeScript now infers the correct type automatically.
    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

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
      {/* Render Game Overlay if open */}
      {isGameOpen && <SnakeTerminal onClose={() => setIsGameOpen(false)} />}

      <Background />

      <nav className="flex w-full items-center justify-between p-6 md:px-12 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.2}>
            <Link href="/" aria-label="Home" className="block">
              <Logo className="h-8 w-auto text-foreground transition-transform hover:scale-105" />
            </Link>
          </MagneticWrapper>
        </div>

        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.6}>
            <SoundToggle />
          </MagneticWrapper>

          <MagneticWrapper strength={0.6}>
            <ThemeToggle />
          </MagneticWrapper>
        </div>
      </nav>

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
