"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  outline?: boolean;
}

export function Logo({ className, outline = false, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 464.22 442.36"
      // CRITICAL FIX: Always set a fill color, but control visibility with opacity.
      // This allows GSAP to animate 'fillOpacity' from 0 to 1.
      fill="currentColor"
      fillOpacity={outline ? 0 : 1}
      stroke={outline ? "currentColor" : "none"}
      strokeWidth={outline ? "20" : "0"}
      className={cn("h-10 w-auto", className)}
      {...props}
    >
      <polygon
        className="logo-path"
        points="464.22 0 464.22 7.43 411.18 73.13 186.22 351.77 113.09 442.36 113.09 325.94 186.22 235.35 317.19 73.13 186.22 73.13 186.22 164.38 113.09 254.97 113.09 73.13 0 73.13 0 0 464.22 0"
      />
    </svg>
  );
}
