"use client";

import React from "react";
import { TransitionLink } from "@/components/ui/transition-link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

interface HudHeaderProps {
  title: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>; 
  telemetry: React.ReactNode;
  dotColor?: string; 
  textColor?: string; 
  borderColor?: string; 
  backgroundColor?: string; 
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
    <div className="absolute top-0 left-0 right-0 pt-24 md:pt-32 px-6 md:px-12 flex justify-between items-start pointer-events-none z-30">
      
      {/* Back Navigation - Corrected to avoid nested buttons */}
      <div className="pointer-events-auto">
        <TransitionLink 
          href="/dashboard"
          onMouseEnter={() => play("hover")}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "group flex items-center gap-2 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
          )}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm group-hover:border-primary/50 group-hover:text-primary transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="flex flex-col items-start text-xs font-mono">
            <span className="uppercase tracking-widest font-bold">Back</span>
            <div className="h-[1px] w-0 bg-primary group-hover:w-full transition-all duration-300">
              <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
                RETURN_TO_BASE
              </span>
            </div>
          </span>
        </TransitionLink>
      </div>

      <div className="floating-header flex flex-col items-end gap-2">
        <div className={cn("flex items-center gap-2 rounded-full border px-4 py-1.5 backdrop-blur-sm", borderColor, backgroundColor)}>
          <span className="relative flex h-2 w-2">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColor)}></span>
            <span className={cn("relative inline-flex rounded-full h-2 w-2", dotColor)}></span>
          </span>
          <span className={cn("text-xs font-mono font-bold tracking-wider", textColor)}>
            {title}
          </span>
          <Icon className={cn("h-3 w-3", textColor)} />
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground/70 bg-black/40 px-3 py-1 rounded-md border border-white/5 backdrop-blur-md">
          {telemetry}
        </div>
      </div>
    </div>
  );
}