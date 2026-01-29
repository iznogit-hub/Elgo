"use client";

import React, { useState } from "react";
import { 
  Radar, Search, Loader2, Users, 
  Zap, Heart, ExternalLink, Target, Wifi, ArrowLeft,
  Database, Activity, Radio, Cpu
} from "lucide-react";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

const OPERATIVES = [
  { id: "op_1", username: "AMBER_CEO", tier: "inner_circle", niche: "business", instagram: "https://instagram.com/amber_ceo", reward: 100, isBoosted: true },
  { id: "op_2", username: "FIT_WARLORD_99", tier: "captain", niche: "fitness", instagram: "https://instagram.com/fit_warlord", reward: 20, isBoosted: false },
  { id: "op_3", username: "CYBER_VIXEN", tier: "soldier", niche: "fashion", instagram: "https://instagram.com/cyber_vixen", reward: 30, isSisterProtocol: true },
];

export default function SignalHunterPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx(); 
  const [activeTab, setActiveTab] = useState<"scout" | "operatives">("scout");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [claimedOps, setClaimedOps] = useState<string[]>([]);

  const handleSubmitScout = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    if (!url.includes("instagram.com")) {
        play("error");
        return toast.error("INVALID_FREQUENCY: SECURE INSTAGRAM LINKS ONLY");
    }
    setLoading(true);
    const toastId = toast.loading("ENCRYPTING PACKET...");
    try {
      await addDoc(collection(db, "scouting_reports"), {
        submittedBy: userData?.uid,
        username: userData?.username,
        url: url,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      play("success");
      toast.success("SIGNAL LOGGED. PENDING VERIFICATION.", { id: toastId });
      setUrl("");
    } catch (err) {
      play("error");
      toast.error("TRANSMISSION FAILED.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-green-500/30 font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Central Visual Focus */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.5} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-green-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-green-500" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-xs">
                <Zap size={10} className="text-cyan-400 fill-cyan-400" />
                <span className="text-[10px] font-mono font-black tracking-tighter text-cyan-400">
                    {userData?.bubblePoints ?? 0} <span className="opacity-40">BP</span>
                </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 backdrop-blur-md rounded-xs">
                <Database size={10} className="text-pink-400" />
                <span className="text-[10px] font-mono font-black tracking-tighter text-pink-400">
                    {userData?.popCoins ?? 0} <span className="opacity-40">PC</span>
                </span>
            </div>
        </div>
      </nav>

      {/* 📡 INTERFACE: Theatrical Flanks */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Radar Status & Mode Toggle */}
        <div className="absolute left-6 top-32 w-44 space-y-6 pointer-events-auto">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center bg-green-950/20 rounded-full border border-green-500/40 relative">
                    <Radar className="w-6 h-6 text-green-500 animate-[spin_4s_linear_infinite]" />
                    <span className="absolute inset-0 rounded-full border border-green-500/20 animate-ping opacity-30" />
                </div>
                <div>
                    <h1 className="text-sm font-black font-orbitron uppercase italic text-white tracking-tighter">Signal_Radar</h1>
                    <div className="flex items-center gap-1 text-green-500/60">
                        <Wifi size={8} className="animate-pulse" />
                        <span className="text-[7px] font-mono font-bold uppercase tracking-widest">Scanning...</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <button 
                    onClick={() => { setActiveTab("scout"); play("click"); }}
                    className={cn(
                        "py-4 px-2 flex items-center gap-3 font-black tracking-widest text-[8px] uppercase border transition-all backdrop-blur-md",
                        activeTab === "scout" ? "bg-green-500/20 border-green-500 text-green-400" : "bg-black/40 border-white/5 text-white/30"
                    )}
                >
                    <Search size={12} /> Audio_Scout
                </button>
                <button 
                    onClick={() => { setActiveTab("operatives"); play("click"); }}
                    className={cn(
                        "py-4 px-2 flex items-center gap-3 font-black tracking-widest text-[8px] uppercase border transition-all backdrop-blur-md",
                        activeTab === "operatives" ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-black/40 border-white/5 text-white/30"
                    )}
                >
                    <Users size={12} /> Operatives
                </button>
            </div>
        </div>

        {/* RIGHT FLANK: Submissions / Operative Detail Feed */}
        <div className="absolute right-6 top-32 w-52 pointer-events-auto max-h-[60vh] overflow-y-auto no-scrollbar">
            {activeTab === "scout" ? (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                    <div className="p-4 bg-black/60 border-r-2 border-green-500/50 backdrop-blur-xl space-y-4">
                        <div className="flex items-center gap-2 text-[8px] font-black text-green-500 uppercase tracking-widest">
                            <Radio size={10} /> Intercept_Protocol
                        </div>
                        <p className="text-[9px] font-bold text-white/40 uppercase leading-relaxed">Logged viral frequencies bypass standard filters.</p>
                        
                        <form onSubmit={handleSubmitScout} className="space-y-2">
                            <Input 
                                placeholder="IG_URL_REEL..." 
                                className="bg-black/40 border-white/10 text-[9px] h-10 font-mono text-white focus:border-green-500"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                            <Button 
                                type="submit" 
                                disabled={loading || !url}
                                className="w-full h-10 bg-green-600 text-black font-black italic tracking-widest text-[8px] uppercase"
                            >
                                {loading ? <Loader2 className="animate-spin" size={12} /> : "Transmit"}
                            </Button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 animate-in slide-in-from-right-4 duration-500">
                    {OPERATIVES.map((op) => (
                        <div key={op.id} className={cn(
                            "p-3 bg-black/60 border-r-2 backdrop-blur-xl transition-all group",
                            op.isBoosted ? "border-yellow-500" : op.isSisterProtocol ? "border-pink-500" : "border-white/10"
                        )}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-[9px] font-black font-orbitron uppercase text-white truncate w-24 italic">{op.username}</div>
                                <span className="text-[8px] font-mono text-yellow-400">+{op.reward}PC</span>
                            </div>
                            <a 
                                href={op.instagram} 
                                target="_blank"
                                className="w-full py-2 bg-white/5 border border-white/10 text-[7px] font-black tracking-widest uppercase hover:bg-white hover:text-black flex items-center justify-center gap-1 transition-all"
                            >
                                Link <ExternalLink size={8} />
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-green-500">
            <Activity size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-green-500 w-1/2 animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Radar_Sync: v3.1</span>
            </div>
         </div>
         <div className="flex items-center gap-2">
             <Cpu size={12} className="text-white/20" />
             <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em]">Secure_SigInt</span>
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