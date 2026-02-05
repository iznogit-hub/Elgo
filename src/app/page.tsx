"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, LayoutGrid, Cpu, ShieldCheck, Zap, Lock, Activity } from "lucide-react";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 📡 LIVE ECONOMY FEED
const LIVE_SIGNALS = [
  "EARNED 50 PC", "INTEL DROP: TECH", "BOUNTY CLAIMED", "SEASON 02 LOADING"
];

export default function IntroPage() {
  const { play } = useSfx();
  const { userData } = useAuth();
  const [signalIndex, setSignalIndex] = useState(0);

  // Cycle the Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalIndex((prev) => (prev + 1) % LIVE_SIGNALS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col">
      
      {/* 📽️ BACKGROUND LAYER */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📡 MOBILE TICKER (VERY THIN) */}
      <div className="fixed top-0 left-0 right-0 z-[50] h-6 bg-cyan-950/20 backdrop-blur-md border-b border-cyan-500/10 flex items-center justify-center pointer-events-none">
         <div className="flex items-center gap-2 opacity-80">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span key={signalIndex} className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase animate-in slide-in-from-bottom-1">
               {LIVE_SIGNALS[signalIndex]}
            </span>
         </div>
      </div>

      {/* 📱 NAVIGATION HUD */}
      <nav className="fixed top-6 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
         <div className="pointer-events-auto">
            <span className="font-orbitron font-black text-xl tracking-tighter leading-none block">
              BUBBLE<span className="text-cyan-500">POPS</span>
            </span>
         </div>
         <div className="pointer-events-auto">
            {userData ? (
               <TransitionLink 
                 href="/dashboard"
                 className="flex items-center gap-2 px-3 py-1.5 border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-[9px] font-mono font-bold tracking-widest backdrop-blur-md"
               >
                 ENTER_BASE
               </TransitionLink>
            ) : (
               <TransitionLink 
                 href="/auth/login"
                 className="flex items-center gap-2 px-3 py-1.5 border border-white/10 bg-black/40 text-white/80 text-[9px] font-mono font-bold tracking-widest backdrop-blur-md"
               >
                 LOGIN
               </TransitionLink>
            )}
         </div>
      </nav>

      {/* ⚡ HERO SECTION (MOBILE CENTERED) */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 text-center mt-12 pb-20">
        
        {/* BADGE */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-900/10 backdrop-blur-md">
           <Zap size={10} className="text-pink-500" />
           <span className="text-[8px] font-mono font-bold tracking-widest text-pink-400 uppercase">
             Breach_Active
           </span>
        </div>

        {/* TITLE */}
        <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter leading-[0.9] text-white mix-blend-screen">
           DOMINATE<br/>
           <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-800">THE SIGNAL</span>
        </h1>

        <p className="mt-6 text-sm font-mono text-gray-400 max-w-xs md:max-w-lg mx-auto leading-relaxed">
           The high-frequency growth economy. <br/>
           <span className="text-white">Earn Intel. Grind Coins.</span>
        </p>

        {/* 🎁 MOBILE BONUS TEASE */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
            <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-widest">Enlistment_Bonus:</span>
            <span className="text-[10px] font-black text-white">+300 PC</span>
        </div>

        {/* CTA STACK */}
        <div className="flex flex-col w-full max-w-xs gap-3 mt-6">
           <MagneticWrapper>
             <TransitionLink 
               href="/auth/signup"
               onClick={() => play("click")}
               className="h-14 w-full bg-cyan-500 text-black font-black font-orbitron tracking-widest uppercase hover:bg-white transition-all clip-path-slant flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
             >
               Join_Cartel <ArrowRight size={16} />
             </TransitionLink>
           </MagneticWrapper>
           
           <button 
             onClick={() => { play("error"); toast.error("ACCESS_DENIED // LOGIN_REQUIRED"); }}
             className="h-12 w-full border border-white/10 bg-black/40 backdrop-blur-md text-gray-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2"
           >
             <LayoutGrid size={14} /> View_Intel
           </button>
        </div>

        {/* 📱 MOBILE SWIPEABLE SECTORS (NEW) */}
        <div className="mt-12 w-full max-w-sm overflow-x-auto no-scrollbar flex items-center gap-3 px-4 snap-x snap-mandatory mask-gradient">
            {['TECH', 'FASHION', 'FITNESS', 'CRYPTO', 'TRAVEL'].map((sector, i) => (
                <div key={i} className="flex-none snap-center w-24 h-24 border border-white/5 bg-white/5 flex flex-col items-center justify-center gap-2 rounded-sm backdrop-blur-sm opacity-60">
                    <Lock size={14} className="text-white/30" />
                    <span className="text-[8px] font-mono tracking-widest text-white/50">{sector}</span>
                </div>
            ))}
        </div>

      </section>

      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <Cpu size={12} className="text-cyan-500 animate-spin-slow" />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">
                SYSTEM_ONLINE
            </span>
         </div>
         <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">V4.0</span>
      </footer>

      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 25%);
        }
        .mask-gradient {
            mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </main>
  );
}