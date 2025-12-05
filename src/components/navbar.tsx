"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, User, PcCase } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { CommandTrigger } from "@/components/command-trigger";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "About", href: "/about", icon: User },
  { name: "Uses", href: "/uses", icon: PcCase },
  { name: "Contact", href: "/contact", icon: Send },
];

export function Navbar() {
  const { play } = useSfx();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex w-full items-center justify-between p-4 md:p-6 md:px-12 pointer-events-none">
      {/* Left: Logo */}
      <div className="pointer-events-auto">
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

      {/* Right: Floating Dock */}
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/40 bg-background/60 p-1.5 backdrop-blur-md shadow-lg shadow-black/5">
        {/* Navigation Links */}
        <div className="flex items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <MagneticWrapper key={item.href} strength={0.6}>
                <Link href={item.href} onClick={() => play("click")}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "relative overflow-hidden rounded-full transition-all duration-300",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                    onMouseEnter={() => play("hover")}
                    aria-label={item.name}
                  >
                    <item.icon className="h-4 w-4" />
                    {isActive && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary animate-pulse" />
                    )}
                  </Button>
                </Link>
              </MagneticWrapper>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-border/50 mx-1" />

        {/* Utilities */}
        <div className="flex items-center gap-1">
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
      </div>
    </nav>
  );
}
