"use client";

import React, { useState } from "react";
import { 
  Radar, Search, Loader2, Users, 
  Zap, ExternalLink, Target, Wifi, ArrowLeft,
  Database, Activity, Radio, CheckCircle2, AlertTriangle
} from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

// 📡 MOCK BOUNTY DATA (Eventually this comes from 'bounties' collection)
const TARGETS = [
  { id: "op_1", username: "AMBER_CEO", tier: "inner_circle", url: "https://instagram.com", reward: 100, type: "BOOST" },
  { id: "op_2", username: "FIT_WARLORD", tier: "captain", url: "https://instagram.com", reward: 20, type: "STANDARD" },
  { id: "op_3", username: "CYBER_VIXEN", tier: "soldier", url: "https://instagram.com", reward: 30, type: "SISTER_PROTOCOL" },
  { id: "op_4", username: "NEO_TOKYO", tier: "recruit", url: "https://instagram.com", reward: 15, type: "STANDARD" },
];

export default function SignalHunterPage() {
  const { userData } = useAuth();
  const { play } = useSfx(); 
  
  const [activeTab, setActiveTab] = useState<"SCOUT" | "HUNT">("SCOUT");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Local state to track which bounties are "Clicked" vs "Claimed"
  const [clickedTargets, setClickedTargets] = useState<string[]>([]);
  const [claimedTargets, setClaimedTargets] = useState<string[]>([]);

  // --- 📡 HANDLERS ---

  const handleSubmitScout = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    
    if (!url.includes("instagram.com")) {
        play("error");
        return toast.error("INVALID_FREQUENCY: SECURE INSTAGRAM LINKS ONLY");
    }

    setLoading(true);
    // Simulating a "Scan" effect
    setTimeout(async () => {
        try {
            await addDoc(collection(db, "scouting_reports"), {
                submittedBy: userData?.uid,
                username: userData?.username,
                url: url,
                status: "pending",
                timestamp: new Date().toISOString()
            });
            play("success");
            toast.success("SIGNAL UPLOADED // PENDING ANALYSIS");
            setUrl("");
        } catch (err) {
            play("error");
            toast.error("TRANSMISSION FAILED");
        } finally {
            setLoading(false);
        }
    }, 1500);
  };

  const handleTargetClick = (id: string, link: string) => {
      play("click");
      window.open(link, '_blank');
      // Mark as clicked so "Verify" button appears
      if (!clickedTargets.includes(id)) {
          setClickedTargets(prev => [...prev, id]);
      }
  };

  const handleClaimReward = (id: string, reward: number) => {
      play("success");
      setClaimedTargets(prev => [...prev, id]);
      toast.success(`BOUNTY CLAIMED: +${reward} PC`);
      // TODO: In production, this calls an API to actually add coins
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-green-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ BACKGROUND */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-green-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-green-500" />
            </TransitionLink>
        </div>
        
        {/* WALLET DISPLAY */}
        <div className="pointer-events-auto flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-[10px] font-mono font-black tracking-widest text-yellow-500 uppercase">
                    {userData?.wallet?.popCoins ?? 0} <span className="opacity-40">PC</span>
                </span>
            </div>
        </div>
      </nav>

      {/* 🚀 CENTRAL FEED (Mobile First) */}
      <div className="relative z-40 w-full max-w-md h-screen pt-28 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* MODE TOGGLE */}
        <div className="flex p-1 bg-white/5 border border-white/10 rounded-sm backdrop-blur-xl">
            <button 
                onClick={() => { setActiveTab("SCOUT"); play("click"); }}
                className={cn(
                    "flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                    activeTab === "SCOUT" ? "bg-green-600 text-black shadow-lg" : "text-gray-500 hover:text-white"
                )}
            >
                <Radar size={12} /> Scout_Intel
            </button>
            <button 
                onClick={() => { setActiveTab("HUNT"); play("click"); }}
                className={cn(
                    "flex-1 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                    activeTab === "HUNT" ? "bg-yellow-500 text-black shadow-lg" : "text-gray-500 hover:text-white"
                )}
            >
                <Target size={12} /> Bounty_List
            </button>
        </div>

        {/* --- SCOUT MODE --- */}
        {activeTab === "SCOUT" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* RADAR VISUAL */}
                <div className="relative w-full h-48 border border-green-500/30 bg-green-900/5 rounded-sm flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(34,197,94,0.1)_70%)]" />
                    <div className="w-64 h-64 border border-green-500/20 rounded-full animate-ping absolute opacity-20" />
                    <div className="w-48 h-48 border border-green-500/30 rounded-full animate-ping delay-75 absolute opacity-30" />
                    
                    <div className="relative z-10 text-center space-y-2">
                        <Wifi size={24} className="text-green-500 mx-auto animate-pulse" />
                        <div className="space-y-0.5">
                            <h2 className="text-sm font-black font-orbitron text-green-400 uppercase tracking-widest">Signal_Scanner</h2>
                            <p className="text-[8px] font-mono text-green-600/60 uppercase">Listening for viral frequencies...</p>
                        </div>
                    </div>
                    
                    {/* Grid Lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20" />
                </div>

                {/* INPUT FORM */}
                <div className="p-5 bg-black/60 border border-white/10 backdrop-blur-xl space-y-4">
                     <div className="flex justify-between items-start">
                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Target_Parameters</label>
                        <span className="text-[8px] font-mono text-green-500 bg-green-900/20 px-2 py-0.5 rounded-full">Reward: Variable</span>
                     </div>

                     <form onSubmit={handleSubmitScout} className="space-y-3">
                         <div className="relative">
                            <Input 
                                placeholder="PASTE_INSTAGRAM_LINK_HERE" 
                                className="pl-9 bg-black/40 border-white/10 text-[10px] h-12 font-mono text-white focus:border-green-500 placeholder:text-white/20"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <div className="absolute left-3 top-3.5 text-white/30">
                                <Search size={14} />
                            </div>
                         </div>
                         
                         <Button 
                            type="submit" 
                            disabled={loading || !url}
                            className="w-full h-12 bg-white/5 border border-green-500/50 hover:bg-green-500 hover:text-black transition-all text-[10px] font-black italic tracking-[0.2em] uppercase group"
                         >
                            {loading ? (
                                <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> ENCRYPTING...</span>
                            ) : (
                                <span className="flex items-center gap-2">UPLOAD_SIGNAL <Radio size={12} className="group-hover:animate-pulse" /></span>
                            )}
                         </Button>
                     </form>
                     
                     <p className="text-[8px] font-mono text-gray-500 text-center leading-relaxed">
                        Authorized agents receive PC for verified viral intel.<br/>
                        <span className="text-red-500">Do not upload corrupted data.</span>
                     </p>
                </div>
            </div>
        )}

        {/* --- HUNT MODE --- */}
        {activeTab === "HUNT" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Active_Contracts</span>
                    <span className="text-[8px] font-mono text-yellow-500 animate-pulse">LIVE_FEED</span>
                </div>

                {TARGETS.map((target) => {
                    const isClaimed = claimedTargets.includes(target.id);
                    const isClicked = clickedTargets.includes(target.id);

                    return (
                        <div key={target.id} className={cn(
                            "relative p-4 bg-black/60 border backdrop-blur-xl transition-all",
                            isClaimed ? "border-white/5 opacity-50 grayscale" : "border-white/10 hover:border-yellow-500/50"
                        )}>
                             {target.type === "BOOST" && (
                                 <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[7px] font-black px-2 py-0.5 uppercase tracking-widest skew-x-[-10deg]">
                                     High_Value
                                 </div>
                             )}

                             <div className="flex justify-between items-start mb-4">
                                 <div>
                                     <h3 className="text-sm font-black font-orbitron uppercase text-white italic tracking-tighter">{target.username}</h3>
                                     <div className="flex items-center gap-2 mt-1">
                                         <span className="text-[8px] font-mono text-gray-400 uppercase">{target.tier}</span>
                                         {target.type === "SISTER_PROTOCOL" && <span className="text-[7px] text-pink-500 border border-pink-500/30 px-1">ALLY</span>}
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-lg font-black font-mono text-yellow-400 leading-none">{target.reward}</div>
                                     <div className="text-[7px] font-mono text-yellow-600 uppercase">PopCoins</div>
                                 </div>
                             </div>

                             {isClaimed ? (
                                 <div className="w-full h-9 bg-white/5 border border-white/5 flex items-center justify-center gap-2 text-[9px] font-bold text-gray-500 uppercase tracking-widest cursor-not-allowed">
                                     <CheckCircle2 size={12} /> Contract_Closed
                                 </div>
                             ) : isClicked ? (
                                 <Button 
                                    onClick={() => handleClaimReward(target.id, target.reward)}
                                    className="w-full h-9 bg-yellow-500 text-black font-black italic tracking-widest text-[9px] uppercase hover:bg-yellow-400"
                                 >
                                     <Database size={12} className="mr-2" /> CLAIM_BOUNTY
                                 </Button>
                             ) : (
                                 <Button 
                                    onClick={() => handleTargetClick(target.id, target.url)}
                                    className="w-full h-9 bg-white/5 border border-white/10 hover:bg-white hover:text-black transition-all text-[9px] font-black tracking-widest uppercase group"
                                 >
                                     ACQUIRE_TARGET <ExternalLink size={10} className="ml-2 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                 </Button>
                             )}
                        </div>
                    );
                })}
            </div>
        )}

      </div>
      
      {/* 🧪 FOOTER STATUS */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <Activity size={12} className="text-green-500 animate-pulse" />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">
                Network_Sync
            </span>
         </div>
         <span className="text-[8px] font-bold text-white/10 uppercase tracking-[0.3em]">SECURE_SIGINT</span>
      </footer>

    </main>
  );
}