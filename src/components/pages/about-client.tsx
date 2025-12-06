"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Cpu, Globe2, ScanFace, Terminal } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HackerText } from "@/components/ui/hacker-text";
import { Globe } from "@/components/ui/globe";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

const TECH_STACK = [
  { n: "Next.js", i: "nextdotjs" },
  { n: "React", i: "react" },
  { n: "TypeScript", i: "typescript" },
  { n: "Tailwind", i: "tailwindcss" },
  { n: "Node.js", i: "nodedotjs" },
  { n: "MongoDB", i: "mongodb" },
  { n: "Docker", i: "docker" },
  { n: "Three.js", i: "threedotjs" },
];

export function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 }
      );

      tl.fromTo(
        ".float-profile",
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1 },
        "-=0.6"
      );

      tl.fromTo(
        ".tech-item",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.05 },
        "-=0.5"
      );

      gsap.fromTo(
        ".bg-globe",
        { scale: 0.5, opacity: 0 },
        {
          scale: 1,
          opacity: 0.25,
          duration: 2.5,
          delay: 0.5,
          ease: "expo.out",
        }
      );
      if (!isReduced) {
        gsap.to(".tech-item", {
          y: "10px",
          duration: 2,
          repeat: -1, // <--- This property creates the infinite loop
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            amount: 1.5,
            from: "random",
          },
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-screen w-full flex-col items-center overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground pt-24 md:pt-32 pb-20 px-6"
    >
      <div
        className={cn(
          "bg-globe fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-0 pointer-events-none -z-10",
          "mix-blend-multiply dark:mix-blend-screen"
        )}
      >
        <Globe />
      </div>

      <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-20">
        <div className="floating-header pointer-events-auto">
          <Link href="/" className="cursor-none" onClick={() => play("click")}>
            <Button
              variant="ghost"
              className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 transition-colors cursor-none"
              onMouseEnter={() => play("hover")}
            >
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
            </Button>
          </Link>
        </div>

        <div className="floating-header flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-primary">
              ID_VERIFIED
            </span>
            <ScanFace className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
            <span>LOC: JEDDAH</span>
            <span>::</span>
            <span>KSA</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center mt-8 md:mt-20">
        <div className="float-profile flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <MagneticWrapper strength={0.2}>
            <div className="relative group">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-primary/20 shadow-2xl">
                <Image
                  src="/Avatar.png"
                  alt="Avatar"
                  width={160}
                  height={160}
                  className="object-cover h-full w-full scale-110"
                  priority
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background border border-border px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-lg">
                v3.0
              </div>
            </div>
          </MagneticWrapper>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              <HackerText text="t7sen" />
            </h1>
            <div className="flex items-center gap-3 justify-center md:justify-start text-primary/80 font-mono text-sm tracking-widest uppercase">
              <Terminal className="h-4 w-4" />
              <span>Sec_Ops // Frontend</span>
            </div>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              I merge the precision of Cyber Security with the creativity of
              Frontend Engineering. With extensive coding experience and a
              competitive drive that places me in the top 0.1% of gamers, I
              build secure, responsive, and winning digital solutions.
            </p>
          </div>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="float-profile flex items-center gap-2 text-primary font-mono text-xs tracking-widest uppercase mb-4 md:mb-0">
            <Cpu className="h-4 w-4" />
            <span>Active_Arsenal</span>
            <div className="h-px bg-primary/20 grow ml-4 opacity-50" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            {TECH_STACK.map((tech) => (
              <div key={tech.n} className="tech-item group">
                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-background/40 backdrop-blur-md hover:border-primary/30 hover:bg-primary/5 transition-all duration-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.simpleicons.org/${tech.i}`}
                    alt={tech.n}
                    className={cn(
                      "h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity",
                      (tech.n === "Next.js" || tech.n === "Three.js") &&
                        "dark:invert"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 group-hover:text-primary transition-all">
                      {tech.n}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      READY
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tech-item mt-8 p-4 rounded-lg border-l-2 border-primary/30 bg-background/30 backdrop-blur-sm font-mono text-[10px] text-muted-foreground/80 leading-loose opacity-80 hover:opacity-100 transition-opacity select-none">
            <p>{`> initializing_security_protocols... OK`}</p>
            <p>{`> scanning_threat_vectors... NONE`}</p>
            <p>{`> optimizing_performance... MAX`}</p>
            <span className="animate-pulse text-primary">{`> player_status: TOP_0.1%`}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30 pointer-events-none mix-blend-difference">
        <Globe2 className="h-12 w-12 animate-[spin_10s_linear_infinite]" />
      </div>
    </main>
  );
}
