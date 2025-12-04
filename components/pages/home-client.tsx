"use client";

import { HeroSection } from "@/components/home/hero-section";
import { SocialLinks } from "@/components/home/social-links";

export function HomeClient() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-between overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Spacer to push content below fixed Navbar */}
      <div className="w-full shrink-0 pt-24" />

      <div className="w-full z-10 grow flex flex-col justify-center items-center gap-8">
        <HeroSection />
      </div>

      <footer className="flex w-full flex-col items-center gap-6 pb-8 pt-8 z-10 shrink-0">
        <SocialLinks />
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} t7sen. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
