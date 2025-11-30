"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { NewsletterForm } from "@/components/coming-soon/newsletter-form";
import { HackerText } from "@/components/ui/hacker-text";
import { DiscordStatus } from "@/components/coming-soon/discord-status";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-animate",
        { y: 40, opacity: 0, filter: "blur(10px)" },
        {
          y: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1.2,
          stagger: 0.15,
        }
      );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-12"
    >
      <div className="relative z-10 flex flex-col items-center space-y-8 text-center">
        <div className="hero-animate">
          <DiscordStatus />
        </div>

        <h1 className="hero-animate text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-8xl">
          Something amazing is
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-primary/60">
            {" "}
            <HackerText text="in the works." />
          </span>
        </h1>

        <p className="hero-animate mx-auto max-w-[600px] text-muted-foreground md:text-xl">
          I am crafting a digital experience that showcases innovation and
          technical expertise. Be the first to know when it goes live.
        </p>

        <div className="hero-animate w-full flex justify-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
