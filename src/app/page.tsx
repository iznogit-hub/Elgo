"use client";

import React from "react";
import { ArrowRight, Play, LayoutGrid, Cpu, Crown, Zap } from "lucide-react";
import { Background } from "@/components/ui/background";
import { buttonVariants } from "@/components/ui/button";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

export default function IntroPage() {
  const { play } = useSfx();
  const { userData } = useAuth();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: 9:16 Cinematic Video Stage */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.5} />

      <Background /> 
      <SoundPrompter />

      {/* 📱 NAVIGATION HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xs shadow-[0_0_20px_rgba(255,255,255,0.3)]">
             <div className="w-4 h-4 bg-black rotate-45 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-black tracking-[0.2em] text-xs uppercase">
                BPOP<span className="text-cyan-400">_OS</span>
            </span>
            <span className="text-[7px] font-mono text-cyan-500/60 tracking-widest uppercase">Global_Edition_v3</span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-4">
          {/* Linked to your /naina page as the "Ambassador" */}
          <TransitionLink
            href="/naina"
            className="hidden sm:flex items-center gap-2 group border border-pink-500/30 bg-pink-500/5 px-4 py-2 rounded-full backdrop-blur-md transition-all hover:border-pink-500"
            onMouseEnter={() => play("hover")}
          >
            <Crown size={12} className="text-pink-500 group-hover:rotate-12 transition-transform" />
            <span className="text-[9px] font-black font-mono tracking-widest text-pink-500">AMBASSADOR</span>
          </TransitionLink>

          <TransitionLink 
            href={userData ? "/dashboard" : "/auth/login"}
            onMouseEnter={() => play("hover")}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }), 
              "font-mono text-[10px] border-white/20 bg-black/40 backdrop-blur-md px-4 tracking-tighter"
            )}
          >
            {userData ? "RECONNECT_SESSION" : "UPLINK_ACCOUNT"}
          </TransitionLink>
        </div>
      </nav>

      {/* 🧪 PRIMARY INTERFACE */}
      <section className="relative z-50 flex-1 w-full max-w-md flex flex-col justify-end px-8 pb-32 space-y-10">
        
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-cyan-500/50" />
            <div className="px-2 py-0.5 border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 font-mono text-[8px] tracking-[0.3em] uppercase backdrop-blur-xl">
               STATUS: SIGNAL_ESTABLISHED
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tighter leading-[0.85] uppercase">
            INNER<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-white to-pink-500 brightness-125">
              STATE
            </span>
          </h1>

          <p className="text-[10px] text-white/40 font-bold tracking-[0.15em] leading-relaxed uppercase max-w-[260px]">
            The social engine has evolved. Experience creator intelligence through the BPOP neural network.
          </p>
        </div>

        <div className="flex flex-col gap-4">
           <MagneticWrapper strength={0.1}>
              <TransitionLink 
                href="/auth/signup"
                onClick={() => play("click")}
                onMouseEnter={() => play("hover")}
                className={cn(
                  buttonVariants({ size: "lg" }), 
                  "w-full h-20 text-xl font-black font-orbitron shadow-[0_0_50px_rgba(6,182,212,0.2)] border-cyan-400 bg-white text-black flex items-center justify-between px-10 hover:bg-cyan-400 transition-colors"
                )}
              >
                INITIALIZE <Zap className="w-6 h-6 fill-current" />
              </TransitionLink>
           </MagneticWrapper>

           <div className="grid grid-cols-2 gap-4">
              {/* Showcase takes user to Naina's page as the example result */}
              <TransitionLink 
                href="/naina"
                onMouseEnter={() => play("hover")}
                className="h-16 bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-pink-500/10 hover:border-pink-500/40 transition-all group"
              >
                <Play size={14} className="text-pink-500 group-hover:scale-110 transition-transform" fill="currentColor" /> SHOWCASE
              </TransitionLink>

              {/* Intelligence triggers the AI chat / Niche brain state */}
              <button 
                onClick={() => window.dispatchEvent(new Event("open-ai-chat"))}
                onMouseEnter={() => play("hover")}
                className="h-16 bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center gap-3 text-[10px] font-black tracking-[0.2em] uppercase hover:bg-cyan-500/10 hover:border-cyan-500/40 transition-all group"
              >
                <LayoutGrid size={14} className="text-cyan-400 group-hover:rotate-90 transition-transform" /> INTEL
              </button>
           </div>
        </div>
      </section>

      {/* 🧪 GLOBAL STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between border-t border-white/5 bg-black/60 backdrop-blur-3xl">
         <div className="flex items-center gap-4">
            <Cpu size={14} className="text-cyan-400 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-0.5 w-24 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-400 w-2/3 animate-[progress_2s_infinite_ease-in-out]" />
              </div>
              <span className="text-[7px] font-mono uppercase tracking-[0.3em] font-bold opacity-40">MEMORY_SYNC: 88%</span>
            </div>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">SYSTEM_BPOP_3.1</span>
            <span className="text-[7px] font-mono text-pink-500/40 uppercase">A_Singh_Signature</span>
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