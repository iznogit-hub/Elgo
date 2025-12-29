"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Cpu, ScanFace, Terminal, MapPin, Code2 } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { TECH_STACK } from "@/data/about";
import { HudHeader } from "@/components/ui/hud-header";

import dynamic from "next/dynamic";

const Globe = dynamic(
  () => import("@/components/ui/globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => <div className="w-full h-full opacity-0" />,
  },
);

gsap.registerPlugin(useGSAP);

// --- CONSTANTS ---
const SECURITY_LOGS = [
  "> initializing_security_protocols... OK",
  "> scanning_threat_vectors... NONE",
  "> optimizing_performance... MAX",
  "> player_status: TOP_0.1%",
];

// --- Live Location Clock ---
function LocationClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "Asia/Riyadh",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return <span className="opacity-0">00:00:00</span>;

  return <span className="tabular-nums font-mono tracking-widest">{time}</span>;
}

// --- ⚡ UPDATED: Stable Animated Logs (Always Runs) ---
function SecurityLogs() {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    // Clear lines on mount to prevent duplication in Strict Mode/HMR
    setLines([]);

    let currentLine = 0;

    const interval = setInterval(() => {
      // 1. Check bounds to prevent accessing undefined index
      if (currentLine < SECURITY_LOGS.length) {
        const nextLog = SECURITY_LOGS[currentLine];

        // 2. Only update if valid log exists
        if (nextLog) {
          setLines((prev) => [...prev, nextLog]);
        }
        currentLine++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-[10px] text-muted-foreground/80 leading-loose select-none">
      {lines.map((line, i) => (
        <p
          key={i}
          className="animate-in fade-in slide-in-from-left-2 duration-300"
        >
          {line && line.includes("TOP_0.1%") ? (
            <span className="text-primary animate-pulse font-bold">{line}</span>
          ) : (
            line || ""
          )}
        </p>
      ))}
      {lines.length < SECURITY_LOGS.length && (
        <span className="animate-pulse text-primary">_</span>
      )}
    </div>
  );
}

export function AboutClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const isReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // Header Entrance
      tl.fromTo(
        ".floating-header",
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, delay: 0.2 },
      );

      // Profile & Content Entrance
      tl.fromTo(
        ".float-profile",
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 1 },
        "-=0.6",
      );

      // Tech Grid Entrance
      tl.fromTo(
        ".tech-item",
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05 },
        "-=0.5",
      );

      // Globe Fade In
      gsap.fromTo(
        ".bg-globe",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 0.25,
          duration: 2.5,
          delay: 0.5,
          ease: "expo.out",
        },
      );

      // Decor Items
      tl.fromTo(
        ".decor-item",
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        "-=0.5",
      );

      if (!isReduced) {
        gsap.to(".decor-item", {
          y: "15px",
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: { amount: 4, from: "random" },
        });
      }
    },
    { scope: containerRef },
  );

  return (
    <main
      ref={containerRef}
      className="relative flex min-h-dvh w-full flex-col items-center overflow-hidden text-foreground selection:bg-primary selection:text-primary-foreground pt-24 md:pt-32 pb-20 px-6"
    >
      <div
        className={cn(
          "bg-globe fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 opacity-0 pointer-events-none -z-10",
          "mix-blend-multiply dark:mix-blend-screen",
        )}
      >
        <Globe />
      </div>
      {/* --- FLOATING HEADER (HUD) --- */}
      <HudHeader
        title="ID_VERIFIED"
        icon={ScanFace}
        telemetry={
          <>
            <span>LOC: JEDDAH</span>
            <span>::</span>
            <LocationClock />
          </>
        }
        dotColor="bg-blue-500"
      />

      {/* --- Ambient Decor --- */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden select-none opacity-20 hidden md:block z-0"
        aria-hidden="true"
      >
        <div className="decor-item absolute top-[20%] left-[5%] font-mono text-xs text-primary/60 opacity-0">
          {`> LOCATING_TARGET...`}
        </div>
        <div className="decor-item absolute top-[18%] right-[5%] font-mono text-xs text-muted-foreground/60 opacity-0">
          {`{ "lat": "21.54", "lon": "39.17" }`}
        </div>
        <div className="decor-item absolute bottom-[15%] left-[12%] flex items-center gap-2 text-muted-foreground/60 opacity-0">
          <MapPin className="h-4 w-4" />
          <span className="font-mono text-xs">SECTOR: JEDDAH</span>
        </div>
        <div className="decor-item absolute bottom-[40%] right-[10%] flex items-center gap-2 text-primary/40 opacity-0">
          <Code2 className="h-4 w-4" />
          <span className="font-mono text-xs">STACK: MOUNTED</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 items-center mt-8 md:mt-20">
        <div className="float-profile flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <MagneticWrapper strength={0.2}>
            <div className="relative group cursor-none">
              <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
              <div className="relative h-40 w-40 rounded-full overflow-hidden border-2 border-primary/20 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <Image
                  src="/Avatar.png"
                  alt="Avatar"
                  width={160}
                  height={160}
                  className="object-cover h-full w-full scale-110"
                  priority={true}
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-background border border-border px-3 py-1 rounded-full text-[10px] font-mono font-bold shadow-lg flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
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

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            {TECH_STACK.map((tech) => (
              <div key={tech.n} className="tech-item group relative">
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-background/40 backdrop-blur-md transition-all duration-300",
                    "hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_20px_-5px_rgba(var(--primary),0.2)]",
                    "group-hover:-translate-y-1",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://cdn.simpleicons.org/${tech.i}`}
                    alt={tech.n}
                    className={cn(
                      "h-6 w-6 opacity-60 transition-all duration-300 filter grayscale",
                      "group-hover:opacity-100 group-hover:filter-none group-hover:scale-110",
                      (tech.n === "Next.js" || tech.n === "Three.js") &&
                        "dark:invert",
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold opacity-80 group-hover:opacity-100 group-hover:text-primary transition-colors">
                      {tech.n}
                    </span>
                    <span className="text-[9px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                      STATUS: ONLINE
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="tech-item mt-8 p-4 rounded-lg border-l-2 border-primary/30 bg-background/30 backdrop-blur-sm min-h-30">
            <SecurityLogs />
          </div>
        </div>
      </div>
    </main>
  );
}
