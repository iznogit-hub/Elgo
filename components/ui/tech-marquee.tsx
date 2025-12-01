"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Icons from simple-icons (you can add more)
const TECH_STACK = [
  {
    name: "React",
    color: "#61DAFB",
    icon: "https://cdn.simpleicons.org/react/white",
  },
  {
    name: "Next.js",
    color: "#000000",
    icon: "https://cdn.simpleicons.org/nextdotjs/white",
  },
  {
    name: "TypeScript",
    color: "#3178C6",
    icon: "https://cdn.simpleicons.org/typescript/white",
  },
  {
    name: "Tailwind",
    color: "#06B6D4",
    icon: "https://cdn.simpleicons.org/tailwindcss/white",
  },
  {
    name: "Node.js",
    color: "#339933",
    icon: "https://cdn.simpleicons.org/nodedotjs/white",
  },
  {
    name: "PostgreSQL",
    color: "#4169E1",
    icon: "https://cdn.simpleicons.org/postgresql/white",
  },
  {
    name: "Docker",
    color: "#2496ED",
    icon: "https://cdn.simpleicons.org/docker/white",
  },
  {
    name: "Git",
    color: "#F05032",
    icon: "https://cdn.simpleicons.org/git/white",
  },
  {
    name: "Figma",
    color: "#F24E1E",
    icon: "https://cdn.simpleicons.org/figma/white",
  },
];

export function TechMarquee() {
  return (
    <div className="relative flex w-full overflow-hidden border-y border-white/5 bg-background/20 py-4 backdrop-blur-sm">
      {/* Left/Right Fade Masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-gradient-to-l from-background to-transparent" />

      {/* The Moving Track (Duplicated for seamless loop) */}
      <div className="animate-marquee flex min-w-full shrink-0 items-center gap-12 px-6">
        {TECH_STACK.map((tech) => (
          <div key={tech.name} className="flex items-center gap-2 group">
            <img
              src={tech.icon}
              alt={tech.name}
              className="h-6 w-6 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="font-mono text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
              {tech.name}
            </span>
          </div>
        ))}
      </div>

      {/* Duplicate for smooth looping */}
      <div
        className="animate-marquee flex min-w-full shrink-0 items-center gap-12 px-6"
        aria-hidden="true"
      >
        {TECH_STACK.map((tech) => (
          <div
            key={`${tech.name}-copy`}
            className="flex items-center gap-2 group"
          >
            <img
              src={tech.icon}
              alt={tech.name}
              className="h-6 w-6 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="font-mono text-sm font-medium text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
