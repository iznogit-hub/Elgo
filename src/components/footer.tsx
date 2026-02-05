"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Twitter, Instagram, Github, 
  ShieldCheck, Wifi, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";

export function Footer() {
  const pathname = usePathname();
  const { play } = useSfx();
  const [currentYear, setCurrentYear] = useState(2026);
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
    
    // 💓 FAKE PING SIMULATOR
    // Makes the numbers jump slightly to feel "Live"
    const interval = setInterval(() => {
        setLatency(prev => {
            const noise = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newValue = prev + noise;
            return newValue > 10 && newValue < 60 ? newValue : 24;
        });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // 1. HIDE ON APP PAGES (They have internal footers)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/hunter") || pathname.startsWith("/store") || pathname.startsWith("/niche") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 p-6 pointer-events-none">
      <div className="mx-auto max-w-4xl flex items-center justify-between rounded-full border border-white/10 bg-black/60 backdrop-blur-xl px-2 py-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto transition-all hover:border-white/20 hover:bg-black/80 hover:scale-[1.01] duration-500">
        
        {/* LEFT: LIVE TELEMETRY */}
        <div className="flex items-center gap-4 px-4">
            <div className="flex items-center gap-2 group cursor-help" title="Server Status: Optimal">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[9px] font-black font-orbitron text-white tracking-widest uppercase">
                        SYSTEM_ONLINE
                    </span>
                    <span className="text-[7px] font-mono text-green-500 flex items-center gap-1">
                        <Activity size={8} /> {latency}ms
                    </span>
                </div>
            </div>
        </div>

        {/* CENTER: COPYRIGHT (Hidden on mobile for space) */}
        <div className="hidden md:flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-mono text-white">
                BUBBLEPOPS © {currentYear}
            </span>
        </div>

        {/* RIGHT: SOCIAL ORBS */}
        <div className="flex items-center pr-1 gap-1">
            
            {/* TWITTER / X */}
            <Link 
                href="https://twitter.com" 
                target="_blank" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-black hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all group"
                onMouseEnter={() => play("hover")}
                onClick={() => play("click")}
            >
                <Twitter size={12} className="text-gray-400 group-hover:text-white transition-colors" />
            </Link>

            {/* INSTAGRAM (The "Sexy" Gradient Hover) */}
            <Link 
                href="https://instagram.com" 
                target="_blank" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-black hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition-all group"
                onMouseEnter={() => play("hover")}
                onClick={() => play("click")}
            >
                <Instagram size={12} className="text-gray-400 group-hover:text-pink-500 transition-colors" />
            </Link>

            {/* GITHUB */}
            <Link 
                href="https://github.com" 
                target="_blank" 
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 hover:bg-black hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all group"
                onMouseEnter={() => play("hover")}
                onClick={() => play("click")}
            >
                <Github size={12} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </Link>

            <div className="h-4 w-px bg-white/10 mx-2" />

            <Link 
                href="/legal" 
                className="text-[8px] font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest px-2"
                onMouseEnter={() => play("hover")}
            >
                Legal
            </Link>
        </div>

      </div>
    </footer>
  );
}