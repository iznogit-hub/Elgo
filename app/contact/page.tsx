"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Wifi } from "lucide-react"; // Added Wifi icon
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Background } from "@/components/coming-soon/background";
import { CommandMenu } from "@/components/command-menu";
import { Cursor } from "@/components/ui/cursor";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { ContactForm } from "@/components/contact/contact-form";
import { HackerText } from "@/components/ui/hacker-text"; // Added HackerText

gsap.registerPlugin(useGSAP);

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".back-btn",
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.2 }
      );
      tl.fromTo(
        ".contact-header",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      );
      tl.fromTo(
        ".contact-form",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.6"
      );
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      className="flex min-h-screen w-full flex-col overflow-y-auto bg-background text-foreground selection:bg-primary selection:text-primary-foreground pb-12"
    >
      <Cursor />
      <CommandMenu />
      <Background />

      <div className="container mx-auto z-10 flex flex-col justify-center px-4 md:px-6 mt-8 max-w-2xl">
        <div className="back-btn mb-8 opacity-0">
          <Link href="/" className="cursor-none">
            <Button
              variant="ghost"
              className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors cursor-none"
              onClick={() => play("click")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Abort Mission</span>
            </Button>
          </Link>
        </div>

        <div className="contact-header mb-12 space-y-4 text-center opacity-0 flex flex-col items-center">
          {/* Status Indicator */}
          <div className="mb-2 flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-[10px] font-mono font-medium text-green-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>UPLINK_SECURE</span>
            <Wifi className="h-3 w-3 ml-1" />
          </div>

          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
            <HackerText text="Establish Connection" />
          </h1>
          <p className="text-muted-foreground text-lg">
            Have a project in mind or just want to discuss the simulation?{" "}
            <br />
            Send a secure transmission below.
          </p>
        </div>

        <div className="contact-form opacity-0">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
