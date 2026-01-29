"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  Zap, Shield, Lock, Radio, 
  Terminal, Crosshair, User as UserIcon, 
  Cpu, ArrowRight, Activity, Network, Globe,
  Users, Music, ShoppingCart
} from "lucide-react";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { Globe as Globe3D } from "@/components/ui/globe"; 
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { Progress } from "@/components/ui/progress";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
          play("success"); 
        } else {
          setUser({ username: "OPERATIVE", tier: "RECRUIT", niche: "ANIME", velocity: 450 });
        }
      } catch (e) {
        toast.error("CONNECTION_INTERRUPTED");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router, play]);

  if (loading) return <LoadingState />;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: MP4 stays centered and visible */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.3} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD: Pushed to Edges */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
                href="/profile"
                className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all"
            >
                <UserIcon size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono font-black tracking-widest text-cyan-400 uppercase">Neural_Link_Stable</span>
            </div>
            <span className="text-[10px] font-orbitron font-black text-white/40 italic uppercase tracking-tighter">
                {user?.username} // {user?.tier}
            </span>
        </div>
      </nav>

      {/* 🚀 OPERATIVE HUD: Floating Side Elements */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Intelligence & Progress */}
        <div className="absolute left-6 top-32 w-40 space-y-6 pointer-events-auto">
            <div className="space-y-1">
                <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Velocity_Index</span>
                <Progress value={(user?.velocity || 0) / 10} className="h-1 bg-white/5 border border-white/10" />
                <span className="text-[10px] font-black font-mono text-white/40">{user?.velocity || 0} XP</span>
            </div>

            <div className="p-4 bg-black/40 border border-white/10 backdrop-blur-xl rounded-xs space-y-3">
                <div className="flex items-center gap-2 text-[8px] text-cyan-500 font-black uppercase">
                   <Network size={10} /> Sector
                </div>
                <h2 className="text-lg font-black font-orbitron italic uppercase leading-none tracking-tighter text-white">
                    {user?.niche}
                </h2>
                <div className="h-20 w-full grayscale opacity-50 group-hover:opacity-100 transition-all">
                    <Globe3D />
                </div>
            </div>
        </div>

        {/* RIGHT FLANK: Daily Briefing & Mission */}
        <div className="absolute right-6 top-32 w-48 space-y-4 pointer-events-auto text-right">
            <div className="flex flex-col items-end gap-1">
                <h3 className="text-[9px] font-black font-orbitron tracking-widest text-gray-400 uppercase flex items-center gap-2">
                    Briefing <Crosshair size={10} className="text-green-500" />
                </h3>
                <div className="p-3 bg-black/40 border-r-2 border-green-500/50 backdrop-blur-xl space-y-2">
                    <p className="text-[9px] font-mono text-white/60 leading-tight">NEXT_SIGNAL: 14:20:59</p>
                    <div className="h-[1px] w-full bg-white/5" />
                    <p className="text-[10px] font-black italic text-green-400 truncate">REEL_5s_LOOP</p>
                </div>
            </div>

            <button 
                onClick={() => { play("success"); toast.success("SIGNAL_LOCKED: +50 XP"); }}
                className="w-full py-3 bg-green-600/10 border border-green-500/30 text-green-500 font-black italic tracking-widest text-[8px] hover:bg-green-500 hover:text-black transition-all uppercase"
            >
                Verify Execution
            </button>
        </div>

        {/* BOTTOM HUD: Services / Armory */}
        <div className="absolute bottom-28 left-6 right-6 pointer-events-auto">
            <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[9px] font-black font-orbitron tracking-[0.2em] text-cyan-500 uppercase flex items-center gap-2">
                    <Terminal size={12} /> Armory_Cartridges
                </span>
                <TransitionLink href="/store" className="text-[8px] font-mono text-white/20 hover:text-cyan-400 uppercase tracking-widest">Access_Full_Vault &rarr;</TransitionLink>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
                <Cartridge icon={<Music size={16} />} name="AUDIO" cost="500 PC" color="border-cyan-500/30" />
                <Cartridge icon={<Users size={16} />} name="LINK" cost="1000 BP" color="border-pink-500/30" />
                <Cartridge icon={<ShoppingCart size={16} />} name="STORE" cost="FREE" color="border-white/10" />
                <Cartridge icon={<Lock size={16} />} name="TITAN" cost="10k BP" color="border-red-500/30" locked />
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-cyan-500">
            <Cpu size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-1/2 animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Node: 0x88_Syn</span>
            </div>
         </div>
         <div className="flex gap-6">
            <div className="flex flex-col items-end">
                <span className="text-[7px] font-mono text-white/20 uppercase">BubblePoints</span>
                <span className="text-xs font-black text-yellow-400">{(user?.bubblePoints || 0).toLocaleString()}</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[7px] font-mono text-white/20 uppercase">PopCoins</span>
                <span className="text-xs font-black text-white">{(user?.popCoins || 0).toLocaleString()}</span>
            </div>
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

function Cartridge({ icon, name, cost, color, locked }: any) {
    const { play } = useSfx();
    return (
      <div 
        onClick={() => play(locked ? "off" : "click")}
        className={cn(
          "min-w-[120px] bg-black/60 border p-3 rounded-xs space-y-2 cursor-pointer hover:bg-white/5 transition-all relative flex-shrink-0",
          color, locked && "opacity-40"
        )}
      >
        <div className="flex justify-between items-center">
            <div className="text-cyan-500">{icon}</div>
            <span className="text-[8px] font-black text-yellow-400 italic">{cost}</span>
        </div>
        <p className="text-[9px] font-black font-orbitron uppercase italic truncate">{name}</p>
        {locked && <Lock size={10} className="absolute top-2 right-2 text-white/20" />}
      </div>
    );
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
            <Activity className="animate-spin" />
            <HackerText text="UPLINKING_TO_BPOP_OS..." speed={30} />
        </div>
    );
}