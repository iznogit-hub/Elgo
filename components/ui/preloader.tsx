"use client";

import React, { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { Logo } from "@/components/ui/logo";

interface PreloaderProps {
  contentLoaded: boolean;
}

const LOADING_PHASES = [
  "INITIALIZING_CORE",
  "LOADING_MODULES",
  "VERIFYING_INTEGRITY",
  "ESTABLISHING_UPLINK",
  "DECRYPTING_ASSETS",
  "SYSTEM_READY",
];

export function Preloader({ contentLoaded }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoWrapperRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(LOADING_PHASES[0]);
  const [isClosed, setIsClosed] = useState(false);

  const { play } = useSfx();

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isExitingRef = useRef(false);
  const progressRef = useRef(0);

  const contentLoadedRef = useRef(contentLoaded);
  useEffect(() => {
    contentLoadedRef.current = contentLoaded;
  }, [contentLoaded]);

  // 1. SIMULATED PROGRESS
  useEffect(() => {
    const interval = setInterval(() => {
      if (contentLoaded) return;

      progressRef.current += Math.random() * 3;
      if (progressRef.current > 95) progressRef.current = 95;

      setProgress(Math.floor(progressRef.current));

      const phaseIndex = Math.floor(
        (progressRef.current / 100) * (LOADING_PHASES.length - 1)
      );
      setStatusText(LOADING_PHASES[phaseIndex]);
    }, 150);

    return () => clearInterval(interval);
  }, [contentLoaded]);

  useGSAP(
    () => {
      const logoWrapper = logoWrapperRef.current;
      const bg = bgRef.current;
      const ui = uiRef.current;
      const container = containerRef.current;

      if (!logoWrapper || !bg || !container || !ui) return;

      // --- EXIT SEQUENCE ---
      const animateExit = () => {
        if (isExitingRef.current) return;
        isExitingRef.current = true;

        if (timelineRef.current) timelineRef.current.kill();
        gsap.killTweensOf(logoWrapper);
        gsap.killTweensOf(ui);

        // 1. HIDE NAVBAR LOGO
        const targetEl = document.getElementById("navbar-logo");
        if (targetEl) {
          gsap.set(targetEl, { opacity: 0 });
        }

        // 2. CAPTURE COORDINATES
        const startRect = logoWrapper.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;

        // Default Target
        let targetRect = {
          top: 24,
          left: isMobile ? 24 : 48,
          width: 32,
          height: 32,
        };

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          if (rect.width > 0) {
            targetRect = {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            };
          }
        }

        // 3. FLIP: LOCK POSITION
        // We set fixed on the wrapper. The parent 'placeholder' div (see JSX) keeps the layout structure.
        gsap.set(logoWrapper, {
          position: "fixed",
          top: startRect.top,
          left: startRect.left,
          width: startRect.width,
          height: startRect.height,
          margin: 0,
          x: 0,
          y: 0,
          transform: "none",
          zIndex: 100,
        });

        const tl = gsap.timeline({
          onStart: () => play("success"),
          onComplete: () => {
            if (targetEl) gsap.set(targetEl, { opacity: 1 });
            setIsClosed(true);
          },
        });

        // 4. PREP: FILL LOGO & FADE UI (Concurrent)
        const path = logoWrapper.querySelector(".logo-path");
        tl.to(path, {
          fillOpacity: 1,
          strokeOpacity: 0,
          duration: 0.4,
          ease: "power2.out",
        }).to(ui, { opacity: 0, duration: 0.4, ease: "power2.in" }, "<");

        // 5. THE MOVE
        tl.to(logoWrapper, {
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          duration: 1.2,
          ease: "expo.inOut",
        });

        // 6. CURTAIN REVEAL
        tl.to(
          bg,
          {
            yPercent: -100,
            duration: 1.0,
            ease: "power4.inOut",
          },
          "-=0.8"
        );
      };

      // --- INTRO ---
      const path = logoWrapper.querySelector(".logo-path") as SVGPathElement;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
          fillOpacity: 0,
          stroke: "currentColor",
          strokeWidth: 2,
        });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          if (contentLoadedRef.current) {
            animateExit();
          } else {
            // Idle Pulse (Scale only, no layout shift)
            gsap.to(logoWrapper, {
              scale: 1.05,
              duration: 1,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
            });
          }
        },
      });
      timelineRef.current = tl;

      tl.to(path, {
        strokeDashoffset: 0,
        duration: 2.0,
        ease: "power2.inOut",
      });
    },
    { scope: containerRef }
  );

  // --- REACTIVE TRIGGER ---
  useGSAP(
    () => {
      if (contentLoaded && timelineRef.current && !isExitingRef.current) {
        const tl = timelineRef.current;

        setProgress(100);
        setStatusText("SYSTEM_READY");

        if (tl.isActive()) {
          tl.timeScale(8.0);
        } else {
          // Idle Breakout
          const logoWrapper = logoWrapperRef.current;
          const bg = bgRef.current;
          const ui = uiRef.current;

          if (logoWrapper && bg && ui) {
            isExitingRef.current = true;
            gsap.killTweensOf(logoWrapper);

            const targetEl = document.getElementById("navbar-logo");
            if (targetEl) gsap.set(targetEl, { opacity: 0 });

            const startRect = logoWrapper.getBoundingClientRect();
            const isMobile = window.innerWidth < 768;
            let targetRect = {
              top: 24,
              left: isMobile ? 24 : 48,
              width: 32,
              height: 32,
            };
            if (targetEl) {
              const rect = targetEl.getBoundingClientRect();
              if (rect.width > 0)
                targetRect = {
                  top: rect.top,
                  left: rect.left,
                  width: rect.width,
                  height: rect.height,
                };
            }

            gsap.set(logoWrapper, {
              position: "fixed",
              top: startRect.top,
              left: startRect.left,
              width: startRect.width,
              height: startRect.height,
              margin: 0,
              x: 0,
              y: 0,
              transform: "none",
              zIndex: 100,
            });

            const exitTl = gsap.timeline({
              onStart: () => play("success"),
              onComplete: () => {
                if (targetEl) gsap.set(targetEl, { opacity: 1 });
                setIsClosed(true);
              },
            });

            const path = logoWrapper.querySelector(".logo-path");
            exitTl
              .to(path, { fillOpacity: 1, strokeOpacity: 0, duration: 0.4 })
              .to(ui, { opacity: 0, duration: 0.4 }, "<");

            exitTl.to(logoWrapper, {
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              duration: 1.2,
              ease: "expo.inOut",
            });

            exitTl.to(
              bg,
              { yPercent: -100, duration: 1.0, ease: "power4.inOut" },
              "-=0.8"
            );
          }
        }
      }
    },
    { dependencies: [contentLoaded] }
  );

  if (isClosed) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex items-center justify-center"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-background text-foreground z-0"
      />

      <div className="relative z-50 flex flex-col items-center gap-10 w-full">
        {/* LAYOUT FIX: 
           We wrap the logo in a 'placeholder' div that maintains the space in the flow
           even when the inner 'logoWrapper' becomes position: fixed.
        */}
        <div className="relative flex items-center justify-center h-32 w-auto aspect-[464.22/442.36]">
          <div
            ref={logoWrapperRef}
            // 'w-full h-full' ensures it fills the placeholder initially.
            // When fixed, GSAP locks the width/height to pixels, so it won't stretch.
            className="relative flex items-center justify-center w-full h-full text-foreground"
          >
            <Logo outline className="w-full h-full" />
          </div>
        </div>

        <div
          ref={uiRef}
          className="flex flex-col items-center gap-4 min-w-[240px]"
        >
          <div className="w-full h-px bg-muted/20 overflow-hidden relative">
            <div
              className="absolute left-0 top-0 h-full bg-primary transition-all duration-200 ease-linear shadow-[0_0_15px_rgba(var(--primary),0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between w-full text-[10px] font-mono text-muted-foreground tracking-widest">
            <span className="uppercase animate-pulse">{`> ${statusText}`}</span>
            <span className="text-foreground font-bold tabular-nums">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
