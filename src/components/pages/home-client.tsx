"use client";

import React, { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Shield, Fingerprint } from "lucide-react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { HeroSection } from "@/components/home/hero-section";
import { SocialLinks } from "@/components/home/social-links";

gsap.registerPlugin(useGSAP);

export function HomeClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) return;

      gsap.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.5, stagger: 0.2 }
      );

      gsap.to(".decor-item", {
        y: "15px",
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 3, from: "random" },
      });
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] }
  );

  return (
    <main
      ref={containerRef}
      className="flex min-h-dvh w-full flex-col items-center justify-between overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      {/* Spacer to push content below fixed Navbar */}
      <div className="w-full shrink-0 pt-24" />

      {/* The grow utility here will center the HeroSection in the available space */}
      <div className="w-full z-10 grow flex flex-col justify-center items-center gap-8">
        {/* --- Ambient Decor (Home) --- */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0">
          <div className="decor-item absolute top-[20%] left-[10%] font-mono text-xs text-primary/60 opacity-0">
            {`> INITIALIZING_CORE...`}
          </div>
          <div className="decor-item absolute top-[30%] right-[10%] font-mono text-xs text-muted-foreground/60 opacity-0">
            {`{ "sys": "ready" }`}
          </div>
          <div className="decor-item absolute bottom-[20%] left-[5%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
            <Fingerprint className="h-4 w-4" />
            <span className="font-mono text-xs">AUTH: VERIFIED</span>
          </div>
          <div className="decor-item absolute bottom-[30%] right-[5%] flex items-center gap-2 text-primary/40 opacity-0">
            <Shield className="h-4 w-4" />
            <span className="font-mono text-xs">SEC_LEVEL: MAX</span>
          </div>
        </div>
        <HeroSection />
      </div>

      <footer className="flex w-full flex-col items-center gap-6 pb-8 pt-8 z-10 shrink-0">
        <SocialLinks />
      </footer>
    </main>
  );
}
