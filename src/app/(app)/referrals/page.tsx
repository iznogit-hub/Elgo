"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import VideoStage from "@/components/canvas/video-stage";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { 
  Copy, Users, Network, ArrowLeft, 
  Cpu, Activity, Share, CheckCircle2, Globe
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
        // Assuming 10% commission on a base velocity or fixed amount
        setVelocityCommission(snap.size * 150); 
      } catch (e) {
        toast.error("DATA_SYNC_FAILED");
      } finally {
        setLoading(false);
      }
    };
    fetchRecruits();
  }, [userData]);

  const getReferralLink = () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bubblepops.com';
      return userData ? `${origin}/auth/signup?ref=${userData.uid}` : '';
  };

  const handleCopy = () => {
    if (!userData) return;
    play("click");
    navigator.clipboard.writeText(getReferralLink());
    toast.success("UPLINK COPIED TO CLIPBOARD");
  };

  const handleNativeShare = async () => {
      play("click");
      const link = getReferralLink();
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'Join the Zaibatsu',
                  text: 'Secure your invite to the growth economy.',
                  url: link,
              });
              play("success");
          } catch (err) {
              console.log("Share cancelled");
          }
      } else {
          handleCopy();
      }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ BACKGROUND */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-purple-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-purple-400" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 backdrop-blur-md rounded-full">
            <Network size={12} className="text-purple-400" />
            <span className="text-[8px] font-mono font-black tracking-widest text-purple-400 uppercase">
                Node_Link
            </span>
        </div>
      </nav>

      {/* 🚀 CENTRAL FEED (Mobile First) */}
      <div className="relative z-40 w-full max-w-md h-screen pt-24 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* 1. HIERARCHY STATUS CARD */}
        <div className="w-full bg-gradient-to-br from-purple-900/20 to-black/80 border border-purple-500/30 backdrop-blur-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Activity size={80} className="text-purple-500" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest">Network_Performance</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="block text-[8px] font-mono text-gray-400 uppercase mb-1">Total_Recruits</span>
                        <span className="text-3xl font-black font-orbitron text-white">{recruitCount}</span>
                    </div>
                    <div>
                        <span className="block text-[8px] font-mono text-gray-400 uppercase mb-1">Commission (XP)</span>
                        <span className="text-3xl font-black font-orbitron text-purple-400">+{velocityCommission}</span>
                    </div>
                </div>

                <div className="w-full bg-black/40 border border-white/5 p-2 flex items-center justify-between">
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Current_Rate</span>
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">10% Velocity</span>
                </div>
            </div>
        </div>

        {/* 2. UPLINK SHARE CARD */}
        <div className="w-full bg-black/60 border border-white/10 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black font-orbitron uppercase italic text-white">Generate Uplink</h3>
                 <Globe size={14} className="text-gray-500" />
            </div>
            
            <p className="text-[9px] font-mono text-gray-400 leading-relaxed">
                Distribute your frequency. Any operative who binds to this signal will permanently boost your velocity.
            </p>

            <div className="space-y-3">
                <div className="bg-black/80 border border-white/5 p-3 rounded-sm flex items-center justify-between">
                    <code className="text-[8px] font-mono text-purple-300 truncate max-w-[200px]">
                        {getReferralLink()}
                    </code>
                    <button onClick={handleCopy} className="text-white/40 hover:text-white transition-colors">
                        <Copy size={12} />
                    </button>
                </div>

                <Button 
                    onClick={handleNativeShare}
                    className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-white font-black italic tracking-widest text-[9px] uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                >
                    <Share size={12} /> Transmit_Signal
                </Button>
            </div>
        </div>

        {/* 3. VISUAL NETWORK GRID (The "Downline") */}
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Active_Nodes</span>
                 <span className="text-[8px] font-mono text-purple-500">{recruitCount} Online</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {/* Render actual recruits or placeholders */}
                {Array.from({ length: Math.max(5, recruitCount + 2) }).map((_, i) => {
                    const isActive = i < recruitCount;
                    return (
                        <div key={i} className={cn(
                            "aspect-square flex items-center justify-center border transition-all",
                            isActive 
                                ? "bg-purple-500/20 border-purple-500/50" 
                                : "bg-white/5 border-white/5 opacity-30"
                        )}>
                            {isActive ? (
                                <Users size={12} className="text-purple-400" />
                            ) : (
                                <div className="w-1 h-1 rounded-full bg-white/20" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

      </div>

      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-purple-500">
            <Cpu size={14} className="animate-pulse" />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Ref_ID // {userData?.uid.slice(0, 6)}</span>
         </div>
      </footer>

    </main>
  );
}