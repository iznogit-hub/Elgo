"use client";

import React from "react";
import { Instagram, Crown, Sparkles, ArrowRight, ShieldCheck, Zap, Cpu } from "lucide-react";
import { Background } from "@/components/ui/background";
import { buttonVariants } from "@/components/ui/button";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function NainaLandingPage() {
  const { play } = useSfx();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Using Naina's specific video or a high-fashion backdrop */}
      <VideoStage src="/video/naina.mp4" overlayOpacity={0.9} />
      
      {/* Pink Tint Overlays for the "Sisterhood" vibe */}
      <div className="absolute inset-0 bg-pink-900/5 mix-blend-screen pointer-events-none z-10" />
      
      <Background /> 
      <SoundPrompter />

      {/* 📱 NAVIGATION HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <TransitionLink href="/" className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 flex items-center justify-center rounded-xs shadow-[0_0_20px_rgba(236,72,153,0.4)]">
             <Crown size={18} className="text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-black tracking-[0.2em] text-xs uppercase">
                BPOP<span className="text-pink-500">_AMBASSADOR</span>
            </span>
            <span className="text-[7px] font-mono text-pink-500/60 tracking-widest uppercase">NODE: NAINA_SINGH_800K</span>
          </div>
        </TransitionLink>

        <div className="pointer-events-auto flex items-center gap-4">
          <a 
            href="https://instagram.com/naina_singh" 
            target="_blank" 
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }), 
              "font-mono text-[10px] border-pink-500/30 bg-black/40 backdrop-blur-md px-4 text-pink-400"
            )}
            onMouseEnter={() => play("hover")}
          >
            <Instagram size={12} className="mr-2" /> VERIFY_STATUS
          </a>
        </div>
      </nav>

      {/* 🧪 PRIMARY INTERFACE: Restricted to Max-Width to feel like a Mobile HUD */}
      <section className="relative z-50 flex-1 w-full max-w-md flex flex-col justify-end px-8 pb-32 space-y-8">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-pink-500/50" />
            <div className="px-2 py-0.5 border border-pink-500/30 bg-pink-950/40 text-pink-400 font-mono text-[8px] tracking-[0.3em] uppercase backdrop-blur-xl">
               SISTER_PROTOCOL: ACTIVE
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black font-orbitron tracking-tighter leading-[0.9] uppercase">
            NAINA <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-white to-purple-500 brightness-125">
              SINGH
            </span>
          </h1>

          <p className="text-[10px] text-white/60 font-bold tracking-[0.15em] leading-relaxed uppercase">
            The era of "pick me" is over. Join the <span className="text-white">Apex Female Network</span>. 
            800k Reach. Zero Apologies.
          </p>
        </div>

        {/* FEATURE TILES: Mini HUDs */}
        <div className="grid grid-cols-1 gap-3">
            {[
                { icon: Crown, title: "QUEEN'S GAMBIT", desc: "Direct access to the Sister Protocol boost." },
                { icon: Zap, title: "VELOCITY INJECTION", desc: "+500 Bonus Points on uplink." }
            ].map((feature, i) => (
                <div key={i} className="p-4 bg-white/5 border border-white/10 backdrop-blur-xl flex items-start gap-4 transition-all hover:border-pink-500/40">
                    <feature.icon size={18} className="text-pink-500 mt-1" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black tracking-widest uppercase">{feature.title}</span>
                        <span className="text-[9px] text-white/40 font-medium uppercase tracking-tighter">{feature.desc}</span>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex flex-col gap-4">
           <MagneticWrapper strength={0.1}>
              <TransitionLink 
                href="/auth/signup?ref=naina_queen"
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "w-full h-20 text-lg font-black font-orbitron shadow-[0_0_50px_rgba(236,72,153,0.2)] border-pink-500 bg-pink-600 text-white flex items-center justify-between px-10 hover:bg-pink-500"
                )}
              >
                CLAIM THRONE <ArrowRight className="w-6 h-6" />
              </TransitionLink>
           </MagneticWrapper>
        </div>
      </section>

      {/* 🧪 SYSTEM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between border-t border-white/5 bg-black/60 backdrop-blur-3xl">
         <div className="flex items-center gap-4">
            <ShieldCheck size={14} className="text-pink-500 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-0.5 w-24 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-pink-500 w-full animate-pulse" />
              </div>
              <span className="text-[7px] font-mono uppercase tracking-[0.3em] font-bold opacity-40">ENCRYPTION: LEVEL_9</span>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">AMBASSADOR_UPLINK</span>
            <span className="text-[7px] font-mono text-cyan-400 uppercase">SIGNAL_STRENGTH: MAX</span>
         </div>
      </footer>
    </main>
  );
}