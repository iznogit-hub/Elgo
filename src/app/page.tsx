"use client";

import React, { Suspense } from "react";
import { ArrowRight, Play, LayoutGrid, Cpu } from "lucide-react";
// 🧪 SYSTEM IMPORTS: Using standard aliases for build stability
import { Background } from "@/components/ui/background";
import { buttonVariants } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

/**
 * 🧪 BUBBLEPOPS MOBILE_APP_INTERFACE (V3.1)
 * Optimized for the new high-fidelity intro signal.
 * The UI is pinned to safe zones to mimic a native mobile application.
 */
export default function App() {
  const { play } = useSfx();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE INTRO SIGNAL (9:16 Vertical Export) */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.45} />

      {/* 🧪 SYSTEM OVERLAYS: Grid and Sound Initializer */}
      <Background /> 
      <SoundPrompter />

      {/* 📱 MOBILE HUD NAVIGATION (Top-Pinned) */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xs shadow-[0_0_15px_rgba(255,255,255,0.4)]">
             <div className="w-4 h-4 bg-black rotate-45" />
          </div>
          <span className="font-orbitron font-black tracking-[0.2em] text-sm uppercase">
             BPOP<span className="text-cyan-400">_OS</span>
          </span>
        </div>
        
        <div className="pointer-events-auto">
          <TransitionLink 
            href="/auth/login"
            onMouseEnter={() => play("hover")}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }), 
              "font-mono text-[10px] border-white/20 bg-black/40 backdrop-blur-md px-4"
            )}
          >
            LOGIN_SESSION
          </TransitionLink>
        </div>
      </nav>

      {/* 🧪 MAIN HUD CONTENT (Bottom-Heavy Mobile Layout) */}
      <section className="relative z-50 flex-1 w-full max-w-md flex flex-col justify-end px-8 pb-28 space-y-8">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-3 py-1 border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 font-mono text-[9px] tracking-[0.4em] uppercase backdrop-blur-xl">
             PROTOCOL: INTRO_SEQUENCE_STABLE
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black font-orbitron tracking-tighter leading-[0.9] uppercase">
            CREATIVE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 brightness-150">
              DOMINANCE
            </span>
          </h1>

          <p className="text-[11px] text-white/50 font-bold tracking-widest leading-relaxed uppercase max-w-[280px]">
            The BubblePops signal has been established. Viral scaling engine is currently optimizing for your neural link.
          </p>
        </div>

        {/* HUD INTERACTION ZONE (Touch-Optimized) */}
        <div className="flex flex-col gap-4 pt-4">
           <MagneticWrapper strength={0.1}>
              <TransitionLink 
                href="/auth/signup"
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "w-full h-16 text-lg font-black font-orbitron shadow-[0_0_40px_rgba(6,182,212,0.3)] border-cyan-400 flex items-center justify-between px-8"
                )}
              >
                INITIALIZE <ArrowRight className="w-6 h-6" />
              </TransitionLink>
           </MagneticWrapper>

           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
                className="h-14 bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                <Play size={14} className="text-pink-500" fill="currentColor" /> Showcase
              </button>
              <button 
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
                className="h-14 bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                <LayoutGrid size={14} className="text-cyan-400" /> Modules
              </button>
           </div>
        </div>

      </section>

      {/* 🧪 SYSTEM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50">
            <Cpu size={14} className="text-cyan-400" />
            <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-400 w-1/2 animate-[progress_3s_infinite_linear]" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">NODE_SYNCED</span>
         </div>
         
         <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">
            BPOP_V3.1
         </div>
      </footer>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}