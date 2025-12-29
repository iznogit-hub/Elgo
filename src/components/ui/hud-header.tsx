"use client";

import React from "react";
import { TransitionLink } from "@/components/ui/transition-link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

interface HudHeaderProps {
  title: string;
  icon: React.ElementType;
  telemetry: React.ReactNode;
  // Visual Customization (Defaults to 'primary' theme)
  dotColor?: string; // e.g. "bg-primary" or "bg-amber-500"
  textColor?: string; // e.g. "text-primary" or "text-amber-500"
  borderColor?: string; // e.g. "border-primary/20"
  backgroundColor?: string; // e.g. "bg-primary/5"
}

export function HudHeader({
  title,
  icon: Icon,
  telemetry,
  dotColor = "bg-primary",
  textColor = "text-primary",
  borderColor = "border-primary/20",
  backgroundColor = "bg-primary/5",
}: HudHeaderProps) {
  const { play } = useSfx();

  return (
    <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-50">
      <div className="floating-header pointer-events-auto">
        <TransitionLink
          href="/"
          className="cursor-none group"
          onClick={() => play("click")}
        >
          <Button
            variant="ghost"
            className="group gap-3 pl-0 hover:bg-transparent hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-none"
            onMouseEnter={() => play("hover")}
            asChild
          >
            <span>
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border/50 group-hover:border-red-500/50 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-mono text-xs font-bold tracking-widest text-muted-foreground group-hover:text-red-500 dark:group-hover:text-red-400">
                  ABORT
                </span>
                <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
                  RETURN_TO_BASE
                </span>
              </div>
            </span>
          </Button>
        </TransitionLink>
      </div>

      <div className="floating-header flex flex-col items-end gap-2">
        {/* Main Status Chip */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm",
            borderColor,
            backgroundColor,
          )}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColor,
              )}
            ></span>
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                dotColor,
              )}
            ></span>
          </span>
          <span
            className={cn(
              "text-xs font-mono font-bold tracking-wider",
              textColor,
            )}
          >
            {title}
          </span>
          <Icon className={cn("h-3 w-3", textColor)} />
        </div>

        {/* Telemetry Row */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          {telemetry}
        </div>
      </div>
    </div>
  );
}
