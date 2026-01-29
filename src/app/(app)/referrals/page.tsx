"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import VideoStage from "@/components/canvas/video-stage";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { 
  Copy, Users, Zap, TrendingUp, Share2, Network, 
  Loader2, ArrowLeft, Cpu, Activity 
} from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function ReferralPage() {
  const { userData } = useAuth();
  const { play } = useSfx();
  const [recruitCount, setRecruitCount] = useState(0);
  const [velocityCommission, setVelocityCommission] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruits = async () => {
      if (!userData) return; 
      try {
        const q = query(collection(db, "users"), where("invitedBy", "==", userData.uid));
        const snap = await getDocs(q);
        setRecruitCount(snap.size);
        setVelocityCommission(snap.size * 150); 
      } catch (e) {
        toast.error("DATA_SYNC_FAILED");
      } finally {
        setLoading(false);
      }
    };
    fetchRecruits();
  }, [userData]);

  const copyCode = () => {
    if (!userData) return;
    play("click");
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bubblepops.com';
    const code = `${origin}/auth/signup?ref=${userData.uid}`;
    navigator.clipboard.writeText(code);
    toast.success("UPLINK COPIED TO CLIPBOARD");
  };

  if (loading) return <LoadingState />;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Central Visual Focus */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.5} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-purple-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-purple-400" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <Network size={10} className="text-purple-400" />
                <span className="text-[8px] font-mono font-black tracking-widest text-purple-400 uppercase">Protocol: Downline_Bind</span>
            </div>
        </div>
      </nav>

      {/* 🕸️ INTERFACE: Floating Flanks */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Network Statistics */}
        <div className="absolute left-6 top-32 w-44 space-y-6 pointer-events-auto">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-500">
                    <Activity size={12} className="animate-pulse" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">Hierarchy_Stats</span>
                </div>
                <h1 className="text-xl font-black font-orbitron italic uppercase text-white leading-tight">The_Hierarchy</h1>
            </div>

            <div className="space-y-3">
                <div className="p-4 bg-black/40 border-l-2 border-purple-500/50 backdrop-blur-xl">
                    <p className="text-[7px] font-mono text-white/30 uppercase mb-1">Total_Recruits</p>
                    <p className="text-2xl font-black font-orbitron text-white">{recruitCount}</p>
                </div>
                <div className="p-4 bg-black/40 border-l-2 border-cyan-500/50 backdrop-blur-xl">
                    <p className="text-[7px] font-mono text-white/30 uppercase mb-1">Passive_Velocity</p>
                    <p className="text-2xl font-black font-orbitron text-cyan-400">+{velocityCommission}</p>
                </div>
            </div>
        </div>

        {/* RIGHT FLANK: Recruitment Uplink */}
        <div className="absolute right-6 top-32 w-48 space-y-4 pointer-events-auto text-right">
            <h3 className="text-[9px] font-black font-orbitron tracking-widest text-purple-400 uppercase flex items-center justify-end gap-2">
                Uplink_Share <Share2 size={10} />
            </h3>

            <div className="p-4 bg-black/40 border-r-2 border-purple-500/50 backdrop-blur-xl space-y-4">
                <p className="text-[9px] font-bold text-white/40 uppercase leading-relaxed">
                  Bind new operatives to your node to earn 10% of their velocity.
                </p>
                
                <div className="space-y-2">
                    <div className="bg-black/60 border border-white/5 p-2 font-mono text-[7px] text-purple-200/40 break-all text-left">
                        {userData && `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?ref=${userData.uid}`}
                    </div>
                    <Button 
                        onClick={copyCode}
                        className="w-full h-10 bg-purple-600 text-white font-black italic tracking-widest text-[8px] uppercase hover:bg-purple-500"
                    >
                        Copy_Uplink <Copy size={10} className="ml-2" />
                    </Button>
                </div>
            </div>

            <div className="p-2 bg-purple-500/5 border border-purple-500/20 text-[7px] font-mono text-purple-400 text-center uppercase tracking-widest">
                Commission_Active: 10%
            </div>
        </div>

        {/* BOTTOM HUD: Visual Network Indicator */}
        <div className="absolute bottom-28 left-6 right-6 pointer-events-auto">
            <div className="w-full p-4 bg-gradient-to-r from-purple-900/20 via-black/80 to-transparent border border-purple-500/30 backdrop-blur-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-900/30 rounded-xs text-purple-400">
                        <TrendingUp size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black font-orbitron uppercase italic">Growth_Vector</h4>
                        <p className="text-[8px] font-mono text-purple-200/40 uppercase tracking-tighter italic">Auto-Sync: Daily 00:00 UTC</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-purple-500">
            <Cpu size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-purple-500 w-2/3 animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Node: Hier_Sync_v3</span>
            </div>
         </div>
         <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] font-mono italic">CALCULATING_GRAPH...</div>
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

function LoadingState() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            <p className="text-xs font-mono text-purple-500/50 animate-pulse">CALCULATING_NETWORK_GRAPH...</p>
        </div>
    );
}