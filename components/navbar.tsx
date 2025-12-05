"use client";

import Link from "next/link";
import { Send, PcCase } from "lucide-react"; // <--- Updated Import
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { CommandTrigger } from "@/components/command-trigger";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useSfx } from "@/hooks/use-sfx";

export function Navbar() {
  const { play } = useSfx();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-4 md:p-6 md:px-12 pointer-events-none">
      <div className="flex items-center gap-2 pointer-events-auto">
        <MagneticWrapper strength={0.2}>
          <Link
            href="/"
            aria-label="Home"
            className="block"
            onClick={() => play("click")}
          >
            <Logo
              id="navbar-logo"
              className="h-8 w-auto text-foreground transition-transform hover:scale-105"
            />
          </Link>
        </MagneticWrapper>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <MagneticWrapper strength={0.6}>
          <Link href="/uses" onClick={() => play("click")}>
            <Button
              variant="ghost"
              size="icon"
              className="relative overflow-hidden w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
              onMouseEnter={() => play("hover")}
              aria-label="Uses / Gear"
            >
              <PcCase className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
        </MagneticWrapper>

        <MagneticWrapper strength={0.6}>
          <Link href="/contact" onClick={() => play("click")}>
            <Button
              variant="ghost"
              size="icon"
              className="relative overflow-hidden w-10 h-10 rounded-full hover:bg-muted/50 transition-colors"
              onMouseEnter={() => play("hover")}
              aria-label="Contact Page"
            >
              <Send className="h-5 w-5 text-foreground" />
            </Button>
          </Link>
        </MagneticWrapper>

        <MagneticWrapper strength={0.6}>
          <CommandTrigger />
        </MagneticWrapper>

        <MagneticWrapper strength={0.6}>
          <SoundToggle />
        </MagneticWrapper>

        <MagneticWrapper strength={0.6}>
          <ThemeToggle />
        </MagneticWrapper>
      </div>
    </nav>
  );
}
