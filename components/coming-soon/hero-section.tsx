"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { NewsletterForm } from "@/components/coming-soon/newsletter-form";

gsap.registerPlugin(useGSAP);

export function HeroSection() {
  const containerRef = React.useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate elements with the class 'hero-animate'
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
      // Note: The blob animation code was removed here
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[70vh] w-full flex-col items-center justify-center overflow-hidden px-4 py-12 md:px-6"
    >
      {/* REMOVED: The local background blob div. 
               The global Background component now handles this.
            */}

      <div className="container flex flex-col items-center space-y-8 text-center">
        <div className="space-y-4">
          <div className="hero-animate inline-block rounded-full border border-border bg-background/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
            t7sen.com
          </div>
          <h1 className="hero-animate text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Something amazing is
            <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {" "}
              in the works.
            </span>
          </h1>
          <p className="hero-animate mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            I am crafting a digital experience that showcases innovation and
            technical expertise. Be the first to know when it goes live.
          </p>
        </div>

        <div className="hero-animate flex w-full justify-center">
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
