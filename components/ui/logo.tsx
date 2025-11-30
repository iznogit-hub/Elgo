"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 464.22 442.36"
      fill="currentColor" // Adapts to text-foreground automatically
      className={cn("h-10 w-auto", className)}
      {...props}
    >
      <polygon points="464.22 0 464.22 7.43 411.18 73.13 186.22 351.77 113.09 442.36 113.09 325.94 186.22 235.35 317.19 73.13 186.22 73.13 186.22 164.38 113.09 254.97 113.09 73.13 0 73.13 0 0 464.22 0" />
    </svg>
  );
}
