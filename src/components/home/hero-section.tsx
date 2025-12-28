"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { DonationButton } from "@/components/home/donation-button";
import { HackerText } from "@/components/ui/hacker-text";
import { DiscordStatus } from "@/components/home/discord-status";
import { useLoadingStatus } from "@/components/loading-context";
import { NeuralNetwork } from "@/components/home/neural-network";

gsap.registerPlugin(useGSAP);

// --- ⚡ UPDATED: Typewriter (Layout Fixed) ---
function Typewriter({
  text,
  startDelay = 0,
}: {
  text: string;
  startDelay?: number;
}) {
  const [displayText, setDisplayText] = React.useState("");
  const [showCursor, setShowCursor] = React.useState(true);
  const [started, setStarted] = React.useState(false);

  React.useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), startDelay * 1000);
    return () => clearTimeout(startTimeout);
  }, [startDelay]);

  React.useEffect(() => {
    if (!started) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
        setShowCursor(false);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [text, started]);

  return (
    // Container uses relative positioning to hold the absolute overlay
    <div className="relative inline-block w-full">
      {/* LAYER 1: Space Reserver
        - Contains full text immediately
        - Invisible (opacity-0)
        - Dictates the final height/width of the box so layout never jumps
      */}
      <div className="invisible opacity-0" aria-hidden="true">
        {text}
      </div>

      {/* LAYER 2: Active Typing
        - Positioned exactly over the invisible text
        - Updates dynamically
      */}
      <div className="absolute top-0 left-0 right-0 bottom-0 text-center">
        {displayText}
        {showCursor && (
          <span className="animate-pulse text-primary font-bold ml-0.5">_</span>
        )}
      </div>
    </div>
  );
}

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);
  const { assetsLoaded } = useLoadingStatus();
  const wasLoadedOnMount = React.useRef(assetsLoaded);

  useGSAP(
    () => {
      if (!assetsLoaded) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const startDelay = wasLoadedOnMount.current ? 0.1 : 1.3;

      // 1. Network Fade In
      tl.fromTo(
        ".network-layer",
        { opacity: 0 },
        { opacity: 1, duration: 2, ease: "sine.inOut" },
        startDelay,
      );

      // 2. Content Slide Up
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
        "-=1.5",
      );
    },
    { scope: containerRef, dependencies: [assetsLoaded] },
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[60vh] md:min-h-0 md:h-auto w-full flex-col items-center justify-center overflow-hidden px-4 py-12"
    >
      {/* Neural Network Background Layer */}
      <div className="network-layer absolute inset-0 z-0 opacity-0 transition-opacity">
        <NeuralNetwork />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 text-center pointer-events-none">
        <div className="hero-animate opacity-0 pointer-events-auto">
          <DiscordStatus />
        </div>

        <h1 className="hero-animate opacity-0 text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl select-text pointer-events-auto">
          Secure Code.
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            {" "}
            <HackerText text="Elite Performance." />
          </span>
        </h1>

        <div className="hero-animate opacity-0 mx-auto max-w-175 rounded-2xl bg-background/30 p-4 text-muted-foreground backdrop-blur-sm md:text-xl border border-white/5 pointer-events-auto">
          <Typewriter
            text="Cyber Security student and Frontend specialist. Whether optimizing code or conquering leaderboards in the top 0.1%, I deliver precision, security, and speed."
            startDelay={2.5}
          />
        </div>

        <div className="hero-animate opacity-0 w-full flex justify-center pointer-events-auto">
          <DonationButton />
        </div>
      </div>
    </section>
  );
}
