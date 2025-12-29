"use client";

import { useRef } from "react";
import { Wifi, Terminal, Cpu } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

import { ContactForm } from "@/components/contact/contact-form";
import { HackerText } from "@/components/ui/hacker-text";
import { HudHeader } from "@/components/ui/hud-header";

gsap.registerPlugin(useGSAP);

export function ContactClient() {
  const containerRef = useRef<HTMLDivElement>(null);
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
      className="relative flex min-h-dvh w-full flex-col items-center justify-start overflow-x-hidden text-foreground selection:bg-primary selection:text-primary-foreground"
    >
      {/* --- FLOATING HEADER (HUD) --- */}
      <HudHeader
        title="LINK_ACTIVE"
        icon={Wifi}
        telemetry={
          <>
            <span>PORT: 443</span>
            <span>::</span>
            <span>SECURE</span>
          </>
        }
        dotColor="bg-emerald-500"
      />

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
