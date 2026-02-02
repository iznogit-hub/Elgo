"use client";

import React from "react";
import { ArrowRight, LayoutGrid, Cpu, ShieldCheck } from "lucide-react";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";

export default function IntroPage() {
  const { play } = useSfx();
  const { userData } = useAuth();

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.5} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 NAVIGATION HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
         <div className="pointer-events-auto flex gap-6">
            <span className="font-orbitron font-black text-xl tracking-tighter">
              BUBBLE<span className="text-cyan-500">POPS</span>
            </span>
         </div>
         <div className="pointer-events-auto">
            {userData ? (
               <TransitionLink 
                 href="/dashboard"
                 className="flex items-center gap-2 px-4 py-2 border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-[10px] font-mono font-bold tracking-widest hover:bg-cyan-500 hover:text-black transition-all"
               >
                 <Cpu size={12} />
                 RETURN_TO_BASE
               </TransitionLink>
            ) : (
               <TransitionLink 
                 href="/auth/login"
                 className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-black/40 text-white/60 text-[10px] font-mono font-bold tracking-widest hover:text-white hover:border-white transition-all"
               >
                 <ShieldCheck size={12} />
                 SECURE_LOGIN
               </TransitionLink>
            )}
         </div>
      </nav>

      {/* ⚡ HERO SECTION */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4 text-center mt-10">
        <div className="space-y-6 max-w-4xl">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-pink-500/30 bg-pink-900/10 backdrop-blur-md animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-[9px] font-mono font-bold tracking-widest text-pink-400 uppercase">
                System_Breach: Imminent
              </span>
           </div>

           <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter leading-[0.9] mix-blend-screen">
              DOMINATE THE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-cyan-700">ALGORITHM</span>
           </h1>

           <p className="text-sm md:text-base font-mono text-gray-400 max-w-lg mx-auto leading-relaxed">
              The only growth cartel powered by high-frequency engagement tactics. 
              Join the Zaibatsu. Control the signal.
           </p>

           <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
              <MagneticWrapper>
                <TransitionLink 
                  href="/auth/signup"
                  onClick={() => play("click")}
                  className="h-14 px-10 bg-cyan-500 text-black font-black font-orbitron tracking-widest uppercase hover:bg-white hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all clip-path-slant flex items-center gap-2"
                >
                  Join_The_Cartel <ArrowRight size={16} />
                </TransitionLink>
              </MagneticWrapper>
              
              <button 
                onClick={() => play("error")} 
                className="h-14 px-8 border border-white/10 bg-black/40 backdrop-blur-md text-gray-400 font-mono text-xs font-bold tracking-widest uppercase hover:text-white hover:border-white/30 flex items-center gap-2 transition-all group"
              >
                <LayoutGrid size={14} className="text-cyan-400 group-hover:rotate-90 transition-transform" /> VIEW_INTEL
              </button>
           </div>
        </div>
      </section>

      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between border-t border-white/5 bg-black/60 backdrop-blur-3xl">
         <div className="flex items-center gap-4">
            <Cpu size={14} className="text-cyan-400 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-0.5 w-24 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-400 w-2/3 animate-[progress_2s_infinite_ease-in-out]" />
              </div>
              <span className="text-[7px] font-mono uppercase tracking-[0.3em] font-bold opacity-40">MEMORY_SYNC: 100%</span>
            </div>
         </div>
         <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.4em]">SYSTEM_BPOP_3.1</span>
      </footer>
    </main>
  );
}