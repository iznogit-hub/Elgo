"use client";

import Link from "next/link";
import { Ping } from "@/components/ui/ping";
import { useEffect, useState } from "react";

export function Footer() {
  // 1. Initialize with a static default (e.g. 2026) to match server render
  const [currentYear, setCurrentYear] = useState(2026);

  // 2. Update to actual client time after mount
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 w-full z-50 py-6 pointer-events-none">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-3 px-4 pointer-events-auto">
        
        {/* INFO PILL */}
        <div className="flex items-center gap-3 md:gap-5 bg-background/80 backdrop-blur-md px-5 py-2 rounded-full border border-border/50 shadow-sm">
          
          {/* Copyright */}
          <Link
            href="https://discord.com/users/170916597156937728"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 font-mono text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>
              &copy; {currentYear} T7SEN
            </span>
          </Link>

          {/* Divider */}
          <span className="h-3 w-px bg-border block opacity-20"></span>

          {/* Network Latency */}
          <Ping />

        </div>
      </div>
    </footer>
  );
}