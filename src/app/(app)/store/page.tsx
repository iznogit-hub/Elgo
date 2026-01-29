"use client";

import React, { useState } from "react";
import { 
  Zap, ShoppingBag, Lock, Shield, 
  Cpu, ArrowLeft, Trophy,
  Sparkles, Database,
  Shirt, Users, Activity
} from "lucide-react";

// 🧪 SYSTEM UI COMPONENTS
import { Background } from "@/components/ui/background";
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";

export default function ArmoryPage() {
  const { play } = useSfx();
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<"skins" | "modules">("skins");

  const stats = {
    points: userData?.bubblePoints ?? 2000,
    coins: userData?.popCoins ?? 500,
    velocity: userData?.velocity ?? 1200,
    rank: userData?.tier ?? "RECRUIT"
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Central Focus for Gear Showcase */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.4} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD: Pushed to Edges */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-xs">
                <Zap size={10} className="text-cyan-400 fill-cyan-400" />
                <span className="text-[10px] font-mono font-black tracking-tighter text-cyan-400">
                    <HackerText text={stats.points} /> <span className="opacity-40">BP</span>
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 backdrop-blur-md rounded-xs">
                <Database size={10} className="text-pink-400" />
                <span className="text-[10px] font-mono font-black tracking-tighter text-pink-400">
                    <HackerText text={stats.coins} /> <span className="opacity-40">PC</span>
                </span>
            </div>
        </div>
      </nav>

      {/* 🛠️ ARMORY INTERFACE: Floating Flanks */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Rank & Tab Selector */}
        <div className="absolute left-6 top-32 w-44 space-y-6 pointer-events-auto">
            <div className="space-y-1">
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">System_Rank</span>
                <Progress value={(stats.velocity / 10000) * 100} className="h-1 bg-white/5 border border-white/10" />
                <span className="text-[9px] font-black font-orbitron text-white/40 italic uppercase">{stats.rank}</span>
            </div>

            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => { setActiveTab("skins"); play("click"); }}
                    className={cn(
                        "py-5 flex flex-col items-center justify-center gap-1 font-black tracking-widest text-[8px] uppercase border transition-all backdrop-blur-md",
                        activeTab === "skins" ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]" : "bg-black/40 border-white/5 text-white/30"
                    )}
                >
                    <Shirt size={14} /> Skins
                </button>
                <button 
                    onClick={() => { setActiveTab("modules"); play("click"); }}
                    className={cn(
                        "py-5 flex flex-col items-center justify-center gap-1 font-black tracking-widest text-[8px] uppercase border transition-all backdrop-blur-md",
                        activeTab === "modules" ? "bg-pink-500/20 border-pink-400 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]" : "bg-black/40 border-white/5 text-white/30"
                    )}
                >
                    <Cpu size={14} /> Modules
                </button>
            </div>
        </div>

        {/* RIGHT FLANK: Item Feed */}
        <div className="absolute right-6 top-32 w-52 pointer-events-auto max-h-[60vh] overflow-y-auto no-scrollbar pb-10">
            <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
                {activeTab === "skins" ? (
                    <>
                        <StoreItem name="STEALTH OPS" cost={2000} tier="COMMON" icon={<Shield size={16}/>} userBalance={stats.points} />
                        <StoreItem name="NEON DEMON" cost={5000} tier="RARE" icon={<Sparkles size={16}/>} userBalance={stats.points} glowColor="text-pink-500" border="border-pink-500/30" />
                        <StoreItem name="GOLD EMPEROR" cost={10000} tier="LEGENDARY" icon={<Trophy size={16}/>} userBalance={stats.points} glowColor="text-yellow-500" border="border-yellow-500/30" />
                    </>
                ) : (
                    <>
                        <StoreItem name="NEURAL LINK" cost={1500} tier="UNCOMMON" icon={<Activity size={16}/>} userBalance={stats.points} />
                        <StoreItem name="AMBASSADOR" cost={1000} tier="UNCOMMON" icon={<Users size={16}/>} userBalance={stats.points} glowColor="text-green-400" />
                    </>
                )}
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-cyan-500">
            <ShoppingBag size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-full animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Armory_Sync: Stable</span>
            </div>
         </div>
         <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">BPOP_V3.1</div>
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

function StoreItem({ name, cost, tier, icon, glowColor = "text-cyan-400", border = "border-white/10", userBalance }: any) {
  const { play } = useSfx();
  const canAfford = userBalance >= cost;

  return (
    <div className={cn(
      "p-4 bg-black/60 border-r-2 backdrop-blur-xl space-y-3 transition-all group",
      border
    )}>
      <div className="flex justify-between items-start">
        <div className={cn("p-2 bg-black/40 rounded-xs border border-white/5", glowColor)}>
          {icon}
        </div>
        <Badge variant="outline" className="text-[6px] opacity-30 font-mono italic tracking-widest">{tier}</Badge>
      </div>

      <div className="space-y-1">
        <h3 className="font-orbitron font-black text-[10px] tracking-tight uppercase italic truncate">{name}</h3>
        <p className={cn("text-[9px] font-mono font-black", canAfford ? "text-white/60" : "text-red-500/60")}>
          {cost.toLocaleString()} BP
        </p>
      </div>

      <button 
        onClick={() => play(canAfford ? "success" : "off")}
        className={cn(
          "w-full py-2 text-[8px] font-black tracking-[0.2em] uppercase transition-all",
          canAfford ? "bg-white text-black hover:bg-cyan-400" : "bg-white/5 text-white/20 cursor-not-allowed"
        )}
      >
        {canAfford ? "ACQUIRE" : "LOCKED"}
      </button>
    </div>
  );
}