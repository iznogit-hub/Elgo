"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function HackerText({ text, speed = 40, className }: { text: string | number | null; speed?: number; className?: string }) {
  const [displayText, setDisplayText] = useState(String(text || ""));
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/-_=+*^";

  useEffect(() => {
    const target = String(text || "");
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(target.split("").map((l, i) => i < iteration ? target[i] : chars[Math.floor(Math.random() * chars.length)]).join(""));
      if (iteration >= target.length) clearInterval(interval);
      iteration += 1 / 2;
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={cn("font-mono tracking-tighter", className)}>{displayText}</span>;
}