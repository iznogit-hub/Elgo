"use client";

import { useRef } from "react";
import { ArrowLeft, Wifi, Terminal, Cpu } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { ContactForm } from "@/components/contact/contact-form";
import { HackerText } from "@/components/ui/hacker-text";
import { TransitionLink } from "@/components/ui/transition-link";

gsap.registerPlugin(useGSAP);

export function ContactClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const prefersReducedMotion = usePrefersReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(".floating-header", { y: 0, opacity: 1 });
        gsap.set(".floating-content", { y: 0, opacity: 1 });
        gsap.set(".decor-item", { y: 0 }); // Static position
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 },
      );

      tl.fromTo(
        ".floating-content",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15 },
        "-=0.6",
      );
      tl.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5",
      );

      if (!prefersReducedMotion) {
        gsap.to(".decor-item", {
          y: "20px",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { amount: 2, from: "random" },
        });
      }
    },
    { scope: containerRef, dependencies: [prefersReducedMotion] },
  );

  return (
    <main
      ref={containerRef}
      // UPDATED:
      // 1. Removed 'justify-center'.
      // 2. Added 'justify-start'.
      // 3. Changed 'py-20' to 'pb-10' to prevent bottom cutoff.
      className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      {/* --- FLOATING HEADER --- */}
      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        {/* ABORT BUTTON */}
        <div className="floating-header pointer-events-auto">
          <TransitionLink
            href="/"
            className="cursor-none"
            onClick={() => play("click")}
          >
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
              asChild
            >
              <span>
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-muted-foreground/30 group-hover:border-red-500/50 transition-colors">
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground group-hover:text-red-500">
                    ABORT
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
                    RETURN_TO_BASE
                  </span>
                </div>
              </span>
            </Button>
          </TransitionLink>
        </div>

        {/* CONNECTION STATUS */}
        <div className="floating-header flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              LINK_ACTIVE
            </span>
            <Wifi className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>PORT: 443</span>
            <span>::</span>
            <span>SECURE</span>
          </div>
        </div>
      </div>

      {/* --- CENTER STAGE --- */}
      <div className="w-full max-w-4xl px-6 relative z-10 flex flex-col items-center pt-48 md:pt-0 md:justify-center md:min-h-dvh">
        {/* Title Section */}
        <div className="floating-content text-center mb-8 md:mb-16 space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary/60 mb-2 md:mb-4">
            <Terminal className="h-4 w-4 md:h-5 md:w-5" />
            <span className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase">
              Incoming Transmission
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter">
            <HackerText text="Initialize Contact" />
          </h1>
        </div>

        {/* The Floating Form */}
        <div className="floating-content w-full max-w-xl pb-10 md:pb-0">
          <ContactForm />
        </div>
      </div>

      {/* --- AMBIENT DECOR --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block">
        <div className="decor-item absolute top-[20%] left-[10%] font-mono text-xs text-primary">
          {`> ESTABLISHING HANDSHAKE...`}
        </div>
        <div className="decor-item absolute top-[60%] right-[15%] font-mono text-xs text-muted-foreground">
          {`{ "integrity": "verified" }`}
        </div>
        <div className="decor-item absolute bottom-[15%] left-[20%] flex items-center gap-2 text-muted-foreground">
          <Cpu className="h-4 w-4" />
          <span className="font-mono text-xs">PROCESSING...</span>
        </div>
      </div>
    </main>
  );
}
