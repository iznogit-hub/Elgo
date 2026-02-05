"use client";

import React from "react";
import { Instagram, Crown, ArrowRight, Zap, BarChart3, Globe, ShieldCheck } from "lucide-react";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function ProProfilePage() {
  const { play } = useSfx();

  // 📝 MOCK DATA: In a real app, you'd fetch this via props or ID
  const PRO_USER = {
    name: "NAINA SINGH",
    handle: "@naina_singh",
    role: "ELITE_OPERATIVE",
    sector: "FASHION_NODE",
    stats: {
      reach: "800K",
      velocity: "99.8",
      status: "TOP_1%"
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-pink-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THEATER: High-End Portrait Video */}
      <VideoStage src="/video/naina.mp4" overlayOpacity={0.7} />
      
      {/* Gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 pointer-events-none z-10" />
      
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <TransitionLink href="/" className="pointer-events-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-sm">
              <Crown size={18} className="text-yellow-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-black tracking-widest text-xs uppercase">
                PRO<span className="text-yellow-400">_FILE</span>
            </span>
            <span className="text-[7px] font-mono text-white/50 tracking-[0.2em] uppercase">VERIFIED_UPLINK</span>
          </div>
        </TransitionLink>

        <div className="pointer-events-auto">
           <div className="flex items-center gap-2 px-3 py-1 bg-pink-500/10 border border-pink-500/30 backdrop-blur-md rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              <span className="text-[8px] font-mono font-black tracking-widest text-pink-500 uppercase">Live_Signal</span>
           </div>
        </div>
      </nav>

      {/* ⚡ HERO SECTION (Mobile Optimized) */}
      <section className="relative z-50 flex-1 w-full max-w-md flex flex-col justify-end px-6 pb-28 space-y-6">
        
        {/* IDENTITY BADGE */}
        <div className="space-y-2 animate-in slide-in-from-bottom-10 duration-700">
           <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-[8px] font-black tracking-widest uppercase">
                {PRO_USER.role}
              </span>
              <span className="px-2 py-0.5 border border-white/20 text-white/60 text-[8px] font-mono tracking-widest uppercase">
                {PRO_USER.sector}
              </span>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tighter leading-[0.85] uppercase text-white">
              {PRO_USER.name.split(' ')[0]}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                {PRO_USER.name.split(' ')[1]}
              </span>
           </h1>
        </div>

        {/* BIO / INTEL */}
        <div className="border-l-2 border-pink-500 pl-4">
            <p className="text-[10px] font-mono text-gray-300 leading-relaxed max-w-xs uppercase">
                Dominating the algorithm. <br/>
                Access exclusive growth strategies used to secure <span className="text-white font-bold">{PRO_USER.stats.reach}</span> reach.
            </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-2">
            <div className="p-3 bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between h-20 group hover:border-pink-500/30 transition-colors">
               <Globe size={14} className="text-white/30 mb-2" />
               <div>
                   <span className="text-[8px] font-mono text-white/40 uppercase block">Total_Reach</span>
                   <span className="text-xl font-black font-orbitron text-white">{PRO_USER.stats.reach}</span>
               </div>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between h-20 group hover:border-cyan-500/30 transition-colors">
               <Zap size={14} className="text-cyan-500/50 mb-2" />
               <div>
                   <span className="text-[8px] font-mono text-white/40 uppercase block">Velocity</span>
                   <span className="text-xl font-black font-orbitron text-cyan-400">{PRO_USER.stats.velocity}</span>
               </div>
            </div>
            <div className="p-3 bg-white/5 border border-white/10 backdrop-blur-md flex flex-col justify-between h-20 group hover:border-yellow-500/30 transition-colors">
               <ShieldCheck size={14} className="text-yellow-500/50 mb-2" />
               <div>
                   <span className="text-[8px] font-mono text-white/40 uppercase block">Rank</span>
                   <span className="text-xl font-black font-orbitron text-yellow-400">{PRO_USER.stats.status}</span>
               </div>
            </div>
        </div>

        {/* CTA MATRIX */}
        <div className="space-y-3 pt-2">
           <MagneticWrapper>
              <TransitionLink 
                href="/auth/signup?ref=pro_naina"
                onClick={() => play("click")}
                className="w-full h-14 bg-white text-black font-black font-orbitron tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-pink-500 hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Sync_With_Operative <ArrowRight size={16} />
              </TransitionLink>
           </MagneticWrapper>
           
           <div className="flex gap-2">
              <button 
                className="flex-1 h-10 border border-white/10 bg-black/40 backdrop-blur-md text-[9px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/70 hover:text-white"
                onClick={() => window.open('https://instagram.com/naina_singh', '_blank')}
              >
                 <Instagram size={12} /> View_Comms
              </button>
              <button className="flex-1 h-10 border border-white/10 bg-black/40 backdrop-blur-md text-[9px] font-bold tracking-widest uppercase hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/70 hover:text-white">
                 <BarChart3 size={12} /> View_Data
              </button>
           </div>
        </div>

      </section>

      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <Zap size={12} className="text-yellow-500 animate-pulse" />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">
                PRO_NODE_ACTIVE
            </span>
         </div>
         <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">ID: 884_NN</span>
      </footer>

    </main>
  );
}