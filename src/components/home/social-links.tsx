"use client";

import * as React from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";
import { Button } from "@/components/ui/button";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { socialLinks } from "@/data/socials";
import { useAchievements } from "@/hooks/use-achievements";

gsap.registerPlugin(useGSAP);

interface SocialLinksProps {
  isFooter?: boolean;
}

export function SocialLinks({ isFooter = false }: SocialLinksProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { play } = useSfx();
  const { unlock } = useAchievements();

  useGSAP(
    () => {
      if (!isFooter) {
        gsap.from(".social-item", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          delay: 0.5,
        });
      }
    },
    { scope: containerRef },
  );

  const handleSocialClick = () => {
    play("click");
    unlock("SOCIAL_ENGINEER");
  };

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {socialLinks.map((item) => (
        <div key={item.name} className="social-item">
          <MagneticWrapper strength={0.4}>
            <Button
              variant="ghost"
              size="icon"
              asChild
              onClick={handleSocialClick}
              // THEME UPDATE: Uses standard semantic colors (muted -> foreground)
              className="text-muted-foreground transition-all duration-200 hover:scale-110 hover:text-foreground hover:bg-accent"
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${item.name}`}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
              </a>
            </Button>
          </MagneticWrapper>
        </div>
      ))}
    </div>
  );
}
