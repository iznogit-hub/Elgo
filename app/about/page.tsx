"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Github, Linkedin } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { Background } from "@/components/coming-soon/background";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { Logo } from "@/components/ui/logo";
import { CommandMenu } from "@/components/command-menu";
import { Cursor } from "@/components/ui/cursor";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { Globe } from "@/components/ui/globe";
import { HackerText } from "@/components/ui/hacker-text";
import { CommandTrigger } from "@/components/command-trigger";

gsap.registerPlugin(useGSAP);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TechMap() {
  return (
    <div className="absolute inset-0 opacity-100 dark:opacity-80">
      <svg
        className="h-full w-full"
        viewBox="0 0 400 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <pattern
          id="dot-pattern"
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="1" className="fill-foreground/50" />
        </pattern>
        <path
          d="M50 60 C50 60 70 40 90 60 C110 80 130 50 150 70 C170 90 200 40 220 50 C240 60 260 30 300 50 C340 70 360 40 370 50 V150 H50 Z"
          fill="url(#dot-pattern)"
          className="opacity-60"
        />
        <rect
          x="0"
          y="0"
          width="400"
          height="200"
          fill="url(#dot-pattern)"
          className="opacity-10"
        />
      </svg>
      <div className="absolute top-[45%] left-[58%] flex items-center justify-center">
        <div className="absolute h-3 w-3 rounded-full bg-primary animate-ping opacity-75" />
        <div className="relative h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />
      </div>
    </div>
  );
}

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  noHover?: boolean;
}

function BentoCard({ children, className, noHover = false }: BentoCardProps) {
  const { play } = useSfx();
  return (
    <div
      onMouseEnter={() => !noHover && play("hover")}
      className={cn(
        "bento-card relative overflow-hidden rounded-3xl border border-border/40 bg-background/60 p-6 backdrop-blur-md transition-all duration-500",
        !noHover &&
          "hover:border-border/80 hover:shadow-2xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
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
        ".bento-card",
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.1 },
        "-=0.4"
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

      <nav className="flex w-full items-center justify-between p-6 md:px-12 z-10 shrink-0">
        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.2}>
            <Link
              href="/"
              aria-label="Home"
              className="block cursor-none"
              onClick={() => play("click")}
            >
              <Logo className="h-8 w-auto text-foreground transition-transform hover:scale-105" />
            </Link>
          </MagneticWrapper>
        </div>

        <div className="flex items-center gap-2">
          <MagneticWrapper strength={0.6}>
            <CommandTrigger />
          </MagneticWrapper>
          <MagneticWrapper strength={0.6}>
            <SoundToggle />
          </MagneticWrapper>
          <MagneticWrapper strength={0.6}>
            <ThemeToggle />
          </MagneticWrapper>
        </div>
      </nav>

      <div className="container mx-auto z-10 flex flex-col justify-center px-4 md:px-6 mt-8 max-w-5xl">
        <div className="back-btn mb-8 opacity-0">
          <Link href="/" className="cursor-none">
            <Button
              variant="ghost"
              className="gap-2 pl-0 hover:bg-transparent hover:text-primary transition-colors cursor-none"
              onClick={() => play("click")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Orbit</span>
            </Button>
          </Link>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[180px]">
          {/* 1. PROFILE CARD (Top Left - 2x2) */}
          <BentoCard
            className="md:col-span-2 md:row-span-2 p-0 flex flex-col opacity-0 group"
            noHover
          >
            {/* Header Banner with Animated Gradient */}
            <div className="h-28 w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 animate-gradient-xy" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 grayscale" />
            </div>

            <div className="px-6 pb-6 flex flex-col grow relative">
              {/* Avatar - Magnetic & Floating */}
              <div className="-mt-14 mb-4 relative z-10 w-fit">
                <MagneticWrapper strength={0.3}>
                  <div className="h-28 w-28 rounded-full border-[6px] border-background overflow-hidden bg-background shadow-xl cursor-none magnetic-target group-hover:scale-105 transition-transform duration-500">
                    {/* NOTE: Update src="/me.png" when your new image is ready */}
                    <Image
                      src="/Avatar.png"
                      alt="Avatar"
                      width={112}
                      height={112}
                      className="object-cover h-full w-full scale-110"
                    />
                  </div>
                </MagneticWrapper>
              </div>

              <div className="space-y-1">
                <h2 className="text-4xl font-bold tracking-tight">
                  <HackerText text="t7sen" />
                </h2>
                <p className="text-primary font-mono text-sm tracking-wide">
                  FULL_STACK_ARCHITECT
                </p>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground/90 max-w-md font-medium">
                Crafting digital reality through code. <br />
                Specialized in <span className="text-foreground">
                  Next.js
                </span>, <span className="text-foreground">WebGL</span>, and{" "}
                <span className="text-foreground">Interaction Design</span>.
              </p>

              <div className="mt-auto pt-6 flex flex-wrap gap-3">
                {/* REMOVED: Resume Button */}

                {/* Status Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Online & Ready
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 2. LOCATION (Live 3D Globe) */}
          <BentoCard className="md:col-span-1 md:row-span-1 flex flex-col justify-end p-0 overflow-hidden opacity-0 relative group min-h-[180px]">
            {/* Visual Container */}
            <div className="absolute inset-0 z-0 opacity-60 transition-opacity group-hover:opacity-100">
              {/* FIXED CONTAINER:
                   1. 'w-full h-full': Fills the card.
                   2. 'flex items-center': Centers the globe.
                   3. Removed transforms: Keeping it simple ensures visibility.
                */}
              <div className="w-full h-full flex items-center justify-center">
                <Globe />
              </div>
            </div>

            {/* Overlay Text */}
            {/* 'pointer-events-none' ensures clicks pass through to the globe for dragging */}
            <div className="relative z-10 p-6 bg-linear-to-t from-background/90 via-background/40 to-transparent pointer-events-none">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs font-mono text-primary">LIVE_UPLINK</p>
              </div>
              <p className="font-bold text-lg">Jeddah, KSA</p>
            </div>
          </BentoCard>

          {/* 3. ARSENAL (1x2 TALL) */}
          <BentoCard className="md:col-span-1 md:row-span-3 flex flex-col gap-4 opacity-0">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="font-semibold text-muted-foreground uppercase tracking-widest text-xs">
                Arsenal
              </h3>
              <span className="text-xs text-muted-foreground/50">v1.0</span>
            </div>
            {/* UPDATED: grid-cols-1 to stack items vertically so names fit */}
            <div className="grid grid-cols-1 gap-2 grow content-start overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { n: "React", i: "react" },
                { n: "Next.js", i: "nextdotjs" },
                { n: "TypeScript", i: "typescript" },
                { n: "Tailwind", i: "tailwindcss" },
                { n: "Node.js", i: "nodedotjs" },
                { n: "PostgreSQL", i: "postgresql" },
                { n: "Docker", i: "docker" },
                { n: "Figma", i: "figma" },
                { n: "Git", i: "git" },
                { n: "Redis", i: "redis" },
                { n: "Python", i: "python" },
                { n: "Three.js", i: "threedotjs" },
              ].map((t) => (
                <div
                  key={t.n}
                  className="flex items-center gap-3 rounded-md bg-muted/30 p-3 transition-colors hover:bg-muted cursor-none group"
                >
                  {/* REVERTED TO IMG TAG TO FIX BROKEN ICONS */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.simpleicons.org/${t.i}`}
                    alt={t.n}
                    className="h-5 w-5 opacity-60 group-hover:opacity-100 transition-opacity dark:invert"
                  />
                  <span className="text-sm font-medium opacity-80 group-hover:opacity-100">
                    {t.n}
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 4. SOCIAL: GITHUB (1x1) */}
          <Link
            href="https://github.com/t7sen"
            target="_blank"
            className="contents cursor-none"
            onClick={() => play("click")}
          >
            <BentoCard className="md:col-span-1 md:row-span-1 flex flex-col items-center justify-center gap-4 group hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black opacity-0 cursor-none magnetic-target transition-all">
              <Github className="h-10 w-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold text-lg">GitHub</span>
            </BentoCard>
          </Link>

          {/* 5. SOCIAL: LINKEDIN (1x1) */}
          <Link
            href="https://linkedin.com/in/t7sen"
            target="_blank"
            className="contents cursor-none"
            onClick={() => play("click")}
          >
            <BentoCard className="md:col-span-1 md:row-span-1 flex flex-col items-center justify-center gap-4 group hover:bg-[#0077b5] hover:text-white opacity-0 cursor-none magnetic-target transition-all">
              <Linkedin className="h-10 w-10 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="font-bold text-lg">LinkedIn</span>
            </BentoCard>
          </Link>

          {/* 6. CONTACT (Wide 2x1) */}
          <Link
            href="mailto:contact@t7sen.com"
            className="contents cursor-none"
            onClick={() => play("click")}
          >
            <BentoCard className="md:col-span-2 md:row-span-1 flex items-center justify-between px-8 hover:border-primary/50 hover:bg-primary/5 transition-colors opacity-0 cursor-none magnetic-target group">
              <div className="flex flex-col">
                <span className="font-bold text-xl group-hover:text-primary transition-colors">
                  Let&apos;s build together
                </span>
                <span className="text-sm opacity-60 group-hover:opacity-100">
                  contact@t7sen.com
                </span>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </BentoCard>
          </Link>
        </div>
      </div>
    </main>
  );
}
