"use client";

import React, { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { sendGAEvent } from "@next/third-parties/google";
// ✅ IMPORT ADDED
import { useAchievements } from "@/hooks/use-achievements";

import { Button } from "@/components/ui/button";

gsap.registerPlugin(useGSAP);

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { play } = useSfx();
  // ✅ HOOK ADDED
  const { unlock } = useAchievements();

  // Animation Lock to prevent flashing during rapid clicks
  const lockedRef = useRef(false);

  // ✅ REFS ADDED: Track rapid clicks for achievement
  const clickCountRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // SVG Refs
  const maskCircleRef = useRef<SVGCircleElement>(null);
  const sunCenterRef = useRef<SVGCircleElement>(null);
  const sunRaysRef = useRef<SVGGElement>(null);

  useEffect(() => {
    // This effect ensures we only render the active theme on the client
    // to prevent hydration mismatch errors.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Initial Icon State
  useGSAP(() => {
    if (!mounted) return;
    const isDark = theme === "dark";

    gsap.set(maskCircleRef.current, {
      attr: { cx: isDark ? 16 : 30, cy: isDark ? 10 : 0 },
    });
    gsap.set(sunRaysRef.current, {
      opacity: isDark ? 0 : 1,
      scale: isDark ? 0 : 1,
      svgOrigin: "12 12",
    });
    gsap.set(sunCenterRef.current, {
      scale: isDark ? 1 : 1,
      attr: { r: isDark ? 5 : 5 },
    });
  }, [mounted]);

  const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. BLOCK: If animation is running, ignore click.
    if (!mounted || lockedRef.current) return;

    // PLAY SOUND: Immediate click feedback
    play("click");

    // ✅ LOGIC ADDED: Check for "Theme Hacker" Achievement
    clickCountRef.current += 1;

    // Reset the counter if user stops clicking for 2 seconds
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    // If 5 clicks happen rapidly
    if (clickCountRef.current >= 5) {
      unlock("THEME_HACKER");
      clickCountRef.current = 0; // Reset after unlock
    }

    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    // --- TRACKING START ---
    sendGAEvent("event", "theme_change", {
      event_category: "Preferences",
      event_label: nextTheme,
    });
    // --- TRACKING END ---

    const x = e.clientX;
    const y = e.clientY;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // If browser doesn't support View Transitions, just switch state
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // 2. LOCK: Start animation sequence
    lockedRef.current = true;

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    });

    await transition.ready;

    // 3. Animate the Page Wipe
    const clipPath = [
      `circle(0px at ${x}px ${y}px)`,
      `circle(${maxRadius}px at ${x}px ${y}px)`,
    ];

    const wipeAnimation = document.documentElement.animate(
      {
        clipPath: clipPath,
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
        fill: "forwards", // PREVENTS FLASH: Holds the final state until cleanup
      },
    );

    // 4. UNLOCK: When animation finishes, allow clicking again
    wipeAnimation.onfinish = () => {
      lockedRef.current = false;
    };

    // 5. Animate the Icon (Morphing)
    if (nextTheme === "dark") {
      gsap.to(sunRaysRef.current, {
        opacity: 0,
        scale: 0.5,
        duration: 0.4,
        ease: "power2.in",
      });

      gsap.to(maskCircleRef.current, {
        attr: { cx: 16, cy: 10 },
        duration: 0.6,
        ease: "elastic.out(1, 0.7)",
        delay: 0.1,
      });
    } else {
      gsap.to(maskCircleRef.current, {
        attr: { cx: 30, cy: -10 },
        duration: 0.4,
        ease: "power2.in",
      });

      gsap.to(sunRaysRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: 0.2,
        ease: "elastic.out(1, 0.5)",
      });
    }
  };

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
      aria-label="Toggle theme"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8 text-foreground"
      >
        <mask id="moon-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <circle ref={maskCircleRef} cx="30" cy="0" r="6" fill="black" />
        </mask>

        <circle
          ref={sunCenterRef}
          fill="currentColor"
          cx="12"
          cy="12"
          r="5"
          mask="url(#moon-mask)"
          stroke="none"
        />

        <g ref={sunRaysRef} stroke="currentColor" color="currentColor">
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </g>
      </svg>
    </Button>
  );
}
