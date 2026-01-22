"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface HackerTextProps {
  text: string | number | null | undefined;
  speed?: number;
  className?: string;
}

export function HackerText({ text, speed = 30, className }: HackerTextProps) {
  const safeText = String(text || "");
  const [displayText, setDisplayText] = useState(safeText);

  useEffect(() => {
    const targetText = String(text || "");
    let iteration = 0;

    const interval = setInterval(() => {
      setDisplayText(() => {
        return targetText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()"[
              Math.floor(Math.random() * 46)
            ];
          })
          .join("");
      });

      if (iteration >= targetText.length) {
        clearInterval(interval);
      }

      iteration += 1 / 3;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={cn("font-mono", className)}>{displayText}</span>;
}