"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image"; 
import { 
  Instagram, Crown, ArrowRight, Zap, Globe, 
  Skull, Flame, Trophy, Users, Radio, MessageCircle,
  Diamond, Play, Verified, Heart
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import VideoStage from "@/components/canvas/video-stage";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// --- MOCK DATA ---
const PRO_USER = {
  name: "NAINA SINGH",
  handle: "@naina_singh",
  role: "SECTOR WARLORD",
  sector: "FASHION_NODE",
  stats: {
    reach: "1.2M",
    velocity: "99.9%",
    rank: "GLOBAL #1",
    earnings: "₹8.4L",
  }
};

const INITIAL_CHAT = [
  { user: "RECRUIT_47", msg: "QUEEN NAINA DROPPED ANOTHER BANGER REEL 🔥", color: "text-white" },
  { user: "SHADOW_UNIT", msg: "HOW DO I JOIN HER SYNDICATE???", color: "text-yellow-400" },
  { user: "NEON_VIPER", msg: "SHE JUST EXECUTED 50 TARGETS IN ONE HOUR", color: "text-pink-400" },
  { user: "GRID_RUNNER", msg: "ALGO BOOST IS INSANE WITH HER STRATS", color: "text-cyan-400" },
  { user: "VOID_WALKER", msg: "DONATED 5000 POPCOINS", color: "text-green-400 font-bold" },
];

export default function ProProfilePage() {
  const { play } = useSfx();
  const [liveViewers, setLiveViewers] = useState(12402);
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [glitch, setGlitch] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. LIVE SIMULATION
  useEffect(() => {
    // Viewers Fluctuation
    const viewerInterval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 50) - 20);
    }, 2000);

    // Chat Spam
    const chatInterval = setInterval(() => {
      const newMsg = {
        user: `UNIT_${Math.floor(Math.random() * 9999)}`,
        msg: ["INSANE GROWTH 🚀", "VERIFIED ✅", "NAINA IS GOD", "JOIN SYNDICATE", "W", "LFG"][Math.floor(Math.random() * 6)],
        color: Math.random() > 0.8 ? "text-yellow-400" : "text-white/80"
      };
      setChat(prev => [...prev.slice(-15), newMsg]); // Keep last 15 msgs
      
      // Auto-scroll
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 800);

    // Random Glitch
    const glitchInterval = setInterval(() => {
        if (Math.random() < 0.1) {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 150);
        }
    }, 3000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  return (
    <main className={cn(
        "relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col",
        glitch && "invert hue-rotate-180"
    )}>
      
      {/* 📽️ BACKGROUND VIDEO STAGE */}
      <div className="fixed inset-0 z-0">
         <VideoStage src="/video/naina.mp4" overlayOpacity={0.6} />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* 🔴 LIVE INDICATOR */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded-md animate-pulse">
            <Radio size={16} className="text-white" />
            <span className="text-xs font-black tracking-widest text-white">LIVE</span>
        </div>
        <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-2">
            <Users size={16} className="text-white" />
            <span className="text-xs font-mono font-bold text-white">{liveViewers.toLocaleString()}</span>
        </div>
      </div>

      {/* 📱 CHAT OVERLAY (Mobile/Desktop) */}
      <div className="absolute bottom-32 left-6 z-40 w-80 h-64 hidden md:flex flex-col justify-end mask-gradient-b">
         <div ref={scrollRef} className="overflow-hidden space-y-2 pb-2 h-full flex flex-col justify-end">
            {chat.map((c, i) => (
                <div key={i} className="text-xs font-mono bg-black/40 backdrop-blur-sm p-2 rounded animate-in slide-in-from-left-4 fade-in">
                    <span className="opacity-50 mr-2">{c.user}:</span>
                    <span className={c.color}>{c.msg}</span>
                </div>
            ))}
         </div>
      </div>

      {/* 👑 HERO CONTENT */}
      <section className="relative z-30 flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-40 text-center">
        
        {/* AVATAR RING */}
        <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-pink-500 blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full p-2 border-4 border-pink-500 shadow-2xl shadow-pink-600/50">
                <div className="w-full h-full rounded-full overflow-hidden relative bg-black">
                    {/* Placeholder for her image if video fails or just as profile pic */}
                    <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-xs px-3 py-1 rounded uppercase tracking-widest flex items-center gap-1">
                    <Crown size={12} /> Warlord
                </div>
            </div>
        </div>

        {/* IDENTITY */}
        <div className="space-y-4 mb-12">
            <div className="flex items-center justify-center gap-2 text-pink-400">
                <Verified size={24} className="fill-pink-500 text-black" />
                <HackerText text={PRO_USER.handle} className="text-xl md:text-2xl font-mono tracking-widest uppercase" />
            </div>
            <h1 className="text-6xl md:text-9xl font-black italic uppercase leading-[0.8] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 drop-shadow-xl">
                {PRO_USER.name}
            </h1>
            <p className="text-sm md:text-xl font-mono text-pink-200/80 uppercase tracking-[0.2em]">
                {PRO_USER.role} • {PRO_USER.sector}
            </p>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-16">
            {[
                { label: "Total Reach", val: PRO_USER.stats.reach, icon: <Globe size={16} /> },
                { label: "Velocity", val: PRO_USER.stats.velocity, icon: <Zap size={16} /> },
                { label: "Global Rank", val: PRO_USER.stats.rank, icon: <Trophy size={16} /> },
                { label: "War Chest", val: PRO_USER.stats.earnings, icon: <Diamond size={16} /> },
            ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-xl flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                    <div className="text-pink-500 mb-2">{stat.icon}</div>
                    <div className="text-2xl md:text-4xl font-black italic text-white">{stat.val}</div>
                    <div className="text-[9px] font-mono text-white/50 uppercase tracking-widest">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* ACTION MATRIX */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
            <MagneticWrapper className="flex-1">
                <TransitionLink 
                    href="/auth/signup?ref=warlord_naina"
                    onClick={() => play("success")}
                    className="group relative w-full h-20 bg-pink-600 hover:bg-pink-500 flex items-center justify-center gap-4 overflow-hidden rounded-xl shadow-[0_0_40px_rgba(219,39,119,0.4)] transition-all"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
                    <span className="text-2xl md:text-3xl font-black italic uppercase tracking-widest relative z-10">
                        Join Syndicate
                    </span>
                    <ArrowRight size={32} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                </TransitionLink>
            </MagneticWrapper>

            <MagneticWrapper className="flex-1">
                <button 
                    onClick={() => window.open('https://instagram.com/naina_singh', '_blank')}
                    className="w-full h-20 bg-black/60 border-2 border-pink-500/50 hover:bg-pink-950/30 flex items-center justify-center gap-4 rounded-xl backdrop-blur-md transition-all group"
                >
                    <Instagram size={32} className="text-pink-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xl font-bold font-mono uppercase tracking-widest text-pink-200">
                        Follow Comms
                    </span>
                </button>
            </MagneticWrapper>
        </div>

      </section>

      {/* FOOTER TICKER */}
      <div className="fixed bottom-0 w-full bg-pink-950/80 backdrop-blur-xl border-t border-pink-500/30 py-3 overflow-hidden z-50">
        <div className="flex whitespace-nowrap animate-marquee">
            {Array(10).fill("").map((_, i) => (
                <div key={i} className="flex items-center gap-8 mx-8">
                    <span className="text-sm font-black italic text-pink-400 uppercase tracking-widest">
                        NAINA SINGH DOMINATES THE GRID
                    </span>
                    <Flame size={16} className="text-yellow-500" />
                    <span className="text-sm font-mono text-white/60">
                        JOIN THE REVOLUTION
                    </span>
                    <Skull size={16} className="text-white/40" />
                </div>
            ))}
        </div>
      </div>

    </main>
  );
}