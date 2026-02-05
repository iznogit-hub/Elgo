"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Terminal, Crosshair, Wallet, Lock, Radio, Activity
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { ALL_SECTORS, NICHE_DATA } from "@/lib/niche-data"; // IMPORT DATA

const NICHE_COST = 100; 

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const { user, userData, loading } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [selectedNicheId, setSelectedNicheId] = useState<string | null>(null);

  // 🛡️ SAFE DATA
  const popCoins = userData?.wallet?.popCoins || (userData as any)?.popCoins || 0;
  const unlockedNiches = userData?.unlockedNiches || ["general"];
  const username = userData?.username || "OPERATIVE";

  // 3. PURCHASE & NAVIGATION LOGIC
  const handleNicheInteraction = async (nicheId: string) => {
      const isOwned = unlockedNiches.includes(nicheId);

      // ✅ IF OWNED: WARP TO WORLD
      if (isOwned) {
          play("success");
          router.push(`/niche/${nicheId}`);
          return;
      }

      // 🔒 IF LOCKED: BUY LOGIC
      if (popCoins < NICHE_COST) {
          play("error");
          return toast.error(`NEED ${NICHE_COST} PC TO UNLOCK.`);
      }

      if (!user) return;

      if (selectedNicheId !== nicheId) {
          play("hover");
          setSelectedNicheId(nicheId);
          return;
      }

      setProcessing(true);
      play("success");

      try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
              "wallet.popCoins": increment(-NICHE_COST),
              unlockedNiches: arrayUnion(nicheId)
          });
          toast.success(`SECTOR UNLOCKED: ${nicheId.toUpperCase()}`);
          setSelectedNicheId(null);
          // Auto-redirect after buy
          setTimeout(() => router.push(`/niche/${nicheId}`), 1000);
      } catch (e) {
          play("error");
          toast.error("TRANSACTION FAILED");
      } finally {
          setProcessing(false);
      }
  };

  if (loading) return <LoadingState />;

  return (
    <main className="relative h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none">
        <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
        <Background /> 
        <SoundPrompter />
      </div>

      {/* TOP HUD */}
      <header className="flex-none h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-900/40 backdrop-blur-md border border-cyan-500/30 flex items-center justify-center rounded-sm">
                <span className="text-sm">🇮🇳</span>
            </div>
            <div>
                <div className="text-[7px] font-mono text-cyan-500 uppercase tracking-widest">Operator</div>
                <div className="text-[10px] font-black font-orbitron uppercase text-white tracking-widest truncate max-w-[100px]">
                    {username}
                </div>
            </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-sm">
            <Wallet size={12} className="text-yellow-500" />
            <span className="text-[9px] font-mono font-black tracking-widest text-yellow-500 uppercase">
                {popCoins.toLocaleString()} PC
            </span>
        </div>
      </header>

      {/* CENTRAL COCKPIT */}
      <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden z-40">
        
        {/* 1. ACTIVE SECTORS (Quick Launch) */}
        <div className="flex-none">
            <h2 className="text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-2">Active_Missions</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {unlockedNiches.map((nicheId: string) => {
                    const data = NICHE_DATA[nicheId] || { label: nicheId, icon: <Terminal size={14}/>, color: "gray" };
                    return (
                        <button 
                            key={nicheId}
                            onClick={() => { play("click"); router.push(`/niche/${nicheId}`); }}
                            className={cn(
                                "flex-none flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-sm hover:bg-white/10 transition-all active:scale-95",
                                `hover:border-${data.color}-500/50`
                            )}
                        >
                            <span className={cn(`text-${data.color}-400`)}>{data.icon}</span>
                            <span className="text-[9px] font-black font-orbitron uppercase whitespace-nowrap">{data.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* 2. THE MARKETPLACE */}
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-none">
                <h2 className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Global_Marketplace</h2>
                <span className="text-[7px] text-yellow-500 bg-yellow-500/10 px-2 rounded-sm border border-yellow-500/20">PRICE: {NICHE_COST} PC</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 pb-4 no-scrollbar">
                {ALL_SECTORS.map((sector) => {
                    const isOwned = unlockedNiches.includes(sector.id);
                    const isSelected = selectedNicheId === sector.id;

                    return (
                        <div 
                            key={sector.id}
                            onClick={() => handleNicheInteraction(sector.id)}
                            className={cn(
                                "relative h-14 flex items-center justify-between px-3 border transition-all cursor-pointer overflow-hidden group rounded-sm",
                                isOwned 
                                    ? `bg-black/40 border-${sector.color}-500/30 opacity-60 grayscale hover:grayscale-0 hover:opacity-100` 
                                    : "bg-black/60 border-white/10 hover:border-white/30 hover:bg-white/5"
                            )}
                        >
                            <div className="flex items-center gap-3 z-10">
                                <div className={cn(
                                    "transition-all duration-300",
                                    isOwned ? `text-${sector.color}-400` : "text-gray-500",
                                )}>
                                    {sector.icon}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black font-orbitron uppercase",
                                    isOwned ? "text-white" : "text-gray-400"
                                )}>
                                    {sector.label}
                                </span>
                            </div>

                            <div className="z-10">
                                {isOwned ? (
                                    <span className="text-[7px] font-mono text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-sm">OPEN</span>
                                ) : (
                                    <Lock size={12} className="text-white/20" />
                                )}
                            </div>

                            {!isOwned && isSelected && (
                                <div className="absolute inset-0 bg-yellow-500 flex items-center justify-between px-4 animate-in fade-in slide-in-from-right-10 duration-200 z-20">
                                    <span className="text-[9px] font-black text-black font-mono">CONFIRM?</span>
                                    <span className="text-[10px] font-black text-black">PAY {NICHE_COST}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* 3. BOUNTY TICKER */}
        <div className="flex-none p-2 border-t border-white/10 bg-black/80 backdrop-blur-md flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2">
                <Crosshair size={12} className="text-yellow-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/60">Bounty_Board_Active</span>
            </div>
            <TransitionLink href="/hunter" className="text-[8px] font-bold text-black bg-yellow-500 px-3 py-1 rounded-sm hover:bg-white transition-colors uppercase">
                View Missions
            </TransitionLink>
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
            <Activity className="animate-spin" />
            <HackerText text="LOADING_MARKETPLACE..." speed={30} />
        </div>
    );
}