"use client";

import * as React from "react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSfx } from "@/hooks/use-sfx";

import { Button } from "@/components/ui/button";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

gsap.registerPlugin(useGSAP);

const socialLinks = [
  { name: "GitHub", href: "https://github.com/t7sen", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/in/t7sen", icon: Linkedin },
  { name: "Twitter", href: "https://twitter.com/t7sen", icon: Twitter },
  { name: "Email", href: "mailto:contact@t7sen.com", icon: Mail },
];

export function SocialLinks() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { play } = useSfx();

  useGSAP(
    () => {
      gsap.from(".social-item", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5,
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="flex items-center gap-4">
      {socialLinks.map((item) => (
        <div key={item.name} className="social-item">
          {/* The wrapper handles the Hover Sound */}
          <MagneticWrapper strength={0.4}>
            <Button
              variant="ghost"
              size="icon"
              asChild
              // The button handles the Click Sound
              // Because this is a prop, it re-renders with the component
              // and always sees the current 'play' function
              onClick={() => play("click")}
              className="text-muted-foreground transition-transform duration-200 hover:scale-110 hover:text-foreground hover:bg-muted/50"
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit my ${item.name}`}
              >
                <item.icon className="h-5 w-5" />
              </a>
            </Button>
          </MagneticWrapper>
        </div>
      ))}
    </div>
  );
}
