"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DonationButton } from "@/components/home/donation-button";
import { HackerText } from "@/components/ui/hacker-text";
import { DiscordStatus } from "@/components/home/discord-status";
import { useLoadingStatus } from "@/components/loading-context";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const { assetsLoaded } = useLoadingStatus();
  const wasLoadedOnMount = React.useRef(assetsLoaded);

  useGSAP(
    () => {
      if (!assetsLoaded) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const startDelay = wasLoadedOnMount.current ? 0.1 : 1.3;

      tl.fromTo(
        ".avatar-layer",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" },
        startDelay
      );

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
      <div className="avatar-layer absolute inset-0 z-0 flex items-center justify-center opacity-0">
        <div className="relative h-full w-full max-w-[1000px] opacity-90" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        <div className="hero-animate opacity-0">
          <DiscordStatus />
        </div>

        <h1 className="hero-animate opacity-0 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl">
          Secure Code.
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            {" "}
            <HackerText text="Elite Performance." />
          </span>
        </h1>

        <p className="hero-animate opacity-0 mx-auto max-w-[700px] rounded-2xl bg-background/30 p-4 text-muted-foreground backdrop-blur-sm md:text-xl">
          Cyber Security student and Frontend specialist. Whether optimizing
          code or conquering leaderboards in the top 0.1%, I deliver precision,
          security, and speed.
        </p>

        <div className="hero-animate opacity-0 w-full flex justify-center">
          <DonationButton />
        </div>
      </div>
    </section>
  );
}
