"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HeroSection } from "@/components/coming-soon/hero-section";
import { SocialLinks } from "@/components/coming-soon/social-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Background } from "@/components/coming-soon/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { Logo } from "@/components/ui/logo";
import { AvatarImage } from "@/components/ui/avatar-image";
import { Preloader } from "@/components/ui/preloader";
import { Cursor } from "@/components/ui/cursor"; // Import here

export default function Home() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAssetsLoaded(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Custom Cursor System */}
      <Cursor />

      <Preloader contentLoaded={assetsLoaded} />

      <Background />

      <nav className="flex w-full items-center justify-between p-6 md:px-12 z-10 shrink-0">
        {/* ... existing nav code ... */}
        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.2}>
            <Link href="/" aria-label="Home" className="block">
              <Logo className="h-8 w-auto text-foreground transition-transform hover:scale-105" />
            </Link>
          </MagneticWrapper>
        </div>

        <MagneticWrapper strength={0.6}>
          <ThemeToggle />
        </MagneticWrapper>
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
