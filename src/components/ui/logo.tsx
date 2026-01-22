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
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={outline ? "1.5" : "0"}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-10 h-10", className)}
      {...props}
    >
      {/* The Zaibatsu Core (Hexagon) */}
      <path 
        d="M12 2L2 7L12 12L22 7L12 2Z" 
        className={outline ? "" : "fill-cyan-500"} 
        fillOpacity={outline ? 0 : 0.2}
        stroke="currentColor" 
      />
      <path d="M2 17L12 22L22 17" stroke="currentColor" />
      <path d="M2 7V17" stroke="currentColor" />
      <path d="M22 7V17" stroke="currentColor" />
      <path d="M12 12V22" stroke="currentColor" />
    </svg>
  );
}