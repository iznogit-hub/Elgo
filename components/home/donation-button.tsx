"use client";

import * as React from "react";
import { Coffee, Zap, ArrowRight, Terminal } from "lucide-react";
import confetti from "canvas-confetti";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";

export function DonationButton() {
  const [status, setStatus] = React.useState<"idle" | "hover" | "redirecting">(
    "idle"
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const progressBarRef = React.useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  // Mouse Spotlight Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || status === "redirecting") return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty("--mouse-x", `${x}px`);
    containerRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  // Click Handler
  const handleInteract = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent immediate navigation
    if (status === "redirecting") return;

    setStatus("redirecting");
    play("success");

    // 1. Confetti Burst
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      // Normalize coordinates for canvas-confetti (0 to 1)
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        origin: { x, y },
        particleCount: 80,
        spread: 100,
        startVelocity: 30,
        colors: ["#a855f7", "#ffffff", "#000000"], // Purple, White, Black
        zIndex: 9999,
      });
    }

    // 2. Redirect after delay
    setTimeout(() => {
      window.open("https://buymeacoffee.com/t7sen", "_blank");
      // Reset state after user leaves (in case they come back)
      setTimeout(() => setStatus("idle"), 1000);
    }, 2000); // 2 second delay for animation
  };

  // Progress Bar Animation
  useGSAP(
    () => {
      if (status === "redirecting") {
        gsap.to(progressBarRef.current, {
          width: "100%",
          duration: 2,
          ease: "power2.inOut",
        });
      } else {
        gsap.set(progressBarRef.current, { width: "0%" });
      }
    },
    { dependencies: [status] }
  );

  return (
    <MagneticWrapper strength={0.2} className="w-full max-w-sm mx-auto">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => {
          if (status !== "redirecting") {
            play("hover");
            setStatus("hover");
          }
        }}
        onMouseLeave={() => {
          if (status !== "redirecting") setStatus("idle");
        }}
        onClick={handleInteract}
        className={cn(
          // Added 'magnetic-target' here so the cursor wraps around this element
          "group relative flex flex-col items-center justify-center gap-2 rounded-xl p-0.5 overflow-hidden cursor-none magnetic-target transition-all duration-300",
          // 3D Lift Effect
          "hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(var(--primary),0.3)]",
          // Press Effect
          "active:translate-y-0 active:scale-[0.98] active:shadow-none"
        )}
      >
        {/* Animated Gradient Border Layer */}
        <div className="absolute inset-0 bg-linear-to-r from-muted via-primary/50 to-muted opacity-50 group-hover:opacity-100 animate-gradient-xy transition-opacity duration-500" />

        {/* Inner Content Container */}
        <div className="relative z-10 flex items-center justify-between w-full h-16 px-4 bg-background/90 backdrop-blur-xl rounded-[10px] overflow-hidden">
          {/* Spotlight Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 40%)`,
            }}
          />

          {/* Progress Bar (Background Fill) */}
          <div
            ref={progressBarRef}
            className="absolute left-0 top-0 bottom-0 bg-purple-500/10 z-0"
            style={{ width: "0%" }}
          />

          {/* Loading Strip (Top) */}
          {status === "redirecting" && (
            <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_10px_#a855f7]" />
          )}

          {/* --- LEFT SIDE: ICON & TEXT --- */}
          <div className="flex items-center gap-4 relative z-10">
            {/* Icon Box */}
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-300",
                status === "redirecting"
                  ? "bg-purple-500 border-purple-500 text-white animate-pulse"
                  : "bg-background border-border group-hover:border-purple-500/50 group-hover:text-purple-500"
              )}
            >
              {status === "redirecting" ? (
                <Terminal className="h-5 w-5" />
              ) : (
                <Coffee className="h-5 w-5" />
              )}
            </div>

            <div className="flex flex-col items-start">
              {/* Main Label */}
              <span
                className={cn(
                  "text-sm font-bold tracking-tight transition-colors",
                  status === "redirecting"
                    ? "text-purple-500"
                    : "text-foreground"
                )}
              >
                {status === "redirecting" ? (
                  <HackerText text="ESTABLISHING_LINK..." speed={50} />
                ) : (
                  "Buy me a coffee"
                )}
              </span>

              {/* Sub Label */}
              <span className="text-[10px] font-mono text-muted-foreground/80 flex items-center gap-1">
                {status === "redirecting" ? (
                  <>
                    <Zap className="h-3 w-3 text-purple-500 fill-purple-500 animate-bounce" />
                    <span>POWERING_UP...</span>
                  </>
                ) : (
                  <>
                    <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                      {`>`}
                    </span>
                    <span className="group-hover:text-purple-500/80 transition-colors">
                      FUEL_THE_CODE
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* --- RIGHT SIDE: ACTION INDICATOR --- */}
          <div className="relative z-10">
            {status === "redirecting" ? (
              <div className="text-xs font-mono font-bold text-purple-500 tabular-nums">
                <HackerText text="100%" speed={100} />
              </div>
            ) : (
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300" />
            )}
          </div>
        </div>
      </div>
    </MagneticWrapper>
  );
}
