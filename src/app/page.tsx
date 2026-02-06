"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LayoutGrid, Cpu, Zap, Lock } from "lucide-react";

// UI Components
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import VideoStage from "@/components/canvas/video-stage";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hooks & Context
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";

// 📡 LIVE ECONOMY TICKER DATA
const LIVE_SIGNALS = [
  "SYSTEM ONLINE", 
  "EARNED 50 PC", 
  "INTEL DROP: TECH", 
  "BOUNTY CLAIMED", 
  "SEASON 02 LOADING",
  "NEW OPERATIVE JOINED"
];

export default function Home() {
  const { play } = useSfx();
  const { userData, loading } = useAuth();
  const router = useRouter();
  const [signalIndex, setSignalIndex] = useState(0);

  // 🚀 1. INSTANT INGRESS: Auto-redirect if logged in
  useEffect(() => {
    if (!loading && userData) {
      router.push("/dashboard");
    }
  }, [userData, loading, router]);

  // 📡 2. TICKER ANIMATION
  useEffect(() => {
    const interval = setInterval(() => {
      setSignalIndex((prev) => (prev + 1) % LIVE_SIGNALS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      
      {/* 📽️ VIDEO LAYER (Specific to Intro) */}
      {/* GlobalAppWrapper handles the Grid/Cursor/Nav, we just add the video here */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.65} />

      {/* 📡 MOBILE TICKER (Top Bar) */}
      <div className="fixed top-20 md:top-24 left-0 right-0 z-[40] h-6 flex items-center justify-center pointer-events-none">
         <div className="flex items-center gap-2 px-4 py-1 bg-cyan-950/20 backdrop-blur-md border border-cyan-500/10 rounded-full opacity-80">
            <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            <span key={signalIndex} className="text-[8px] font-mono font-bold tracking-widest text-cyan-400 uppercase animate-in slide-in-from-bottom-1 fade-in duration-300">
               {LIVE_SIGNALS[signalIndex]}
            </span>
         </div>
      </div>

      {/* ⚡ HERO CONTENT */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full max-w-4xl mt-[-5vh]">
        
        {/* BREACH BADGE */}
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-900/10 backdrop-blur-md animate-in zoom-in-50 duration-700 delay-200">
           <Zap size={10} className="text-pink-500" />
           <span className="text-[8px] font-mono font-bold tracking-widest text-pink-400 uppercase">
             Breach_Active
           </span>
        </div>

        {/* MAIN TITLE */}
        <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter leading-[0.9] text-white mix-blend-screen animate-in slide-in-from-bottom-5 fade-in duration-1000">
            DOMINATE<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-800">
               THE SIGNAL
            </span>
        </h1>

        <div className="mt-6 text-sm font-mono text-gray-400 max-w-xs md:max-w-lg mx-auto leading-relaxed animate-in slide-in-from-bottom-5 fade-in duration-1000 delay-300">
            <HackerText text="The high-frequency growth economy." speed={30} />
            <br/>
            <span className="text-white opacity-80">Earn Intel. Grind Coins. Control the Narrative.</span>
        </div>

        {/* 🎁 BONUS PILL */}
        <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-sm animate-in fade-in duration-1000 delay-500">
            <span className="text-[8px] font-mono text-yellow-500 uppercase tracking-widest">Enlistment_Bonus:</span>
            <span className="text-[10px] font-black text-white">+300 PC</span>
        </div>

        {/* CTA STACK */}
        <div className="flex flex-col w-full max-w-xs gap-3 mt-8 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-700">
           <MagneticWrapper>
             <TransitionLink 
               href="/auth/signup"
               onClick={() => play("click")}
               className="h-14 w-full bg-cyan-500 text-black font-black font-orbitron tracking-widest uppercase hover:bg-white transition-all clip-path-slant flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
             >
               Join_Cartel <ArrowRight size={16} />
             </TransitionLink>
           </MagneticWrapper>
           
           <button 
             onClick={() => { play("error"); toast.error("ACCESS_DENIED // LOGIN_REQUIRED"); }}
             className="h-12 w-full border border-white/10 bg-black/40 backdrop-blur-md text-gray-400 font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-white/5 hover:text-white transition-all"
           >
             <LayoutGrid size={14} /> View_Intel
           </button>
        </div>

      </section>

      {/* 📱 SWIPEABLE SECTORS (Bottom Teaser) */}
      <div className="fixed bottom-20 md:bottom-24 w-full max-w-2xl overflow-x-auto no-scrollbar flex items-center justify-center gap-3 px-4 snap-x snap-mandatory mask-gradient opacity-60 hover:opacity-100 transition-opacity duration-500 z-20">
          {['TECH', 'FASHION', 'FITNESS', 'CRYPTO', 'TRAVEL'].map((sector, i) => (
              <div key={i} className="flex-none snap-center w-20 h-20 md:w-24 md:h-24 border border-white/10 bg-black/40 flex flex-col items-center justify-center gap-2 rounded-sm backdrop-blur-sm animate-in slide-in-from-bottom-5 fade-in duration-500" style={{ animationDelay: `${1000 + (i * 100)}ms` }}>
                  <Lock size={14} className="text-white/30" />
                  <span className="text-[8px] font-mono tracking-widest text-white/50">{sector}</span>
              </div>
          ))}
      </div>

      {/* CSS UTILS */}
      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(5% 0, 100% 0, 100% 100%, 0 100%, 0 25%);
        }
        .mask-gradient {
            mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
        }
      `}</style>
    </main>
  );
}