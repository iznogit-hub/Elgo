"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { NewsletterForm } from "@/components/coming-soon/newsletter-form";
import { HackerText } from "@/components/ui/hacker-text";
import { DiscordStatus } from "@/components/coming-soon/discord-status";
import { useLoadingStatus } from "@/components/loading-context";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const { assetsLoaded } = useLoadingStatus();

  // Track the loading state at the moment of mounting.
  // If assetsLoaded is ALREADY true when we mount, it means we navigated here
  // from another page (no preloader), so we should skip the long delay.
  const wasLoadedOnMount = React.useRef(assetsLoaded);

  useGSAP(
    () => {
      if (!assetsLoaded) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // DYNAMIC TIMING:
      // Initial Load (Preloader active): Wait 1.3s for curtain to lift.
      // Navigation (Preloader done): Wait only 0.1s for smooth entry.
      const startDelay = wasLoadedOnMount.current ? 0.1 : 1.3;

      // 1. Image Fades in Background (if any)
      tl.fromTo(
        ".avatar-layer",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" },
        startDelay
      );

      // 2. Text Content Slides up
      tl.fromTo(
        ".hero-animate",
        { y: 40, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.15,
        },
        "-=1.2"
      );
    },
    { scope: containerRef, dependencies: [assetsLoaded] }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-12"
    >
      {/* ... Background Layer ... */}
      <div className="avatar-layer absolute inset-0 z-0 flex items-center justify-center opacity-0">
        <div className="relative h-full w-full max-w-[1000px] opacity-90" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        {/* Added 'opacity-0' class to everything to ensure they are hidden initially */}
        <div className="hero-animate opacity-0">
          <DiscordStatus />
        </div>

        <h1 className="hero-animate opacity-0 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl">
          Something amazing is
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            {" "}
            <HackerText text="in the works." />
          </span>
        </h1>

        <p className="hero-animate opacity-0 mx-auto max-w-[600px] rounded-2xl bg-background/30 p-4 text-muted-foreground backdrop-blur-sm md:text-xl">
          I am crafting a digital experience that showcases innovation and
          technical expertise. Be the first to know when it goes live.
        </p>

        <div className="hero-animate opacity-0 w-full flex justify-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
