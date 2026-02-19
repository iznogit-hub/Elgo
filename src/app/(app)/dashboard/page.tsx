"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  ShieldAlert, Crosshair, Lock, Play, 
  Activity, Zap, Globe, Skull, Check, X,
  Terminal, BarChart3, Youtube, Instagram, Timer,
  Flame, Trophy, Target, Radio, AlertTriangle,
  Swords, UserCheck, Clock, ChevronRight,
  ArrowRight, Database, Cpu
} from "lucide-react";
import { 
  collection, query, where, onSnapshot, 
  doc, increment, writeBatch, updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { NICHE_DATA } from "@/lib/niche-data"; 

import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import PlayerStatusCard from "@/components/ui/player-status-card";
import { HackerText } from "@/components/ui/hacker-text";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// DATA STRUCTURES - FULLY GAMIFIED INDIAN WEALTH PLAYGROUND LINGO
const DAILY_QUESTS = [
  { id: "login", label: "Initialize Daily Terminal", reward: 50, completed: true },
  { id: "scan", label: "Audit 5 Wealth Nodes", reward: 100, completed: false, progress: 60 },
  { id: "yt_op", label: "Run 2 Creator Missions", reward: 200, completed: false, progress: 30 },
  { id: "recruit", label: "Recruit 1 Affiliate Hustler", reward: 300, completed: false, progress: 0 },
];

const FAKE_YIELD_FEED = [
  { operator: "NODE_04", source: "SAAS_SUBSCRIPTION", amount: 250 },
  { operator: "CYBER_YIELD", source: "CREATOR_ASSET", amount: 180 },
  { operator: "NEON_VIPER", source: "AFFILIATE_SALE", amount: 320 },
  { operator: "GHOST_01", source: "FREELANCE_CONTRACT", amount: 500 },
];

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const { userData, loading } = useAuth();
  
  const [incomingClaims, setIncomingClaims] = useState<any[]>([]); 
  const [networkMode, setNetworkMode] = useState<"INSTA" | "YOUTUBE">("INSTA");
  const [titheProgress, setTitheProgress] = useState(100);
  const [glitch, setGlitch] = useState(false);
  
  const unlockedColonies = userData?.unlockedNiches || ["general"]; 
  const isYoutubeUnlocked = userData?.membership?.tier !== "recruit"; 
  const rankTitle = userData?.membership?.tier?.toUpperCase() || "RECRUIT";
  const totalDailyReward = DAILY_QUESTS.reduce((sum, q) => sum + q.reward, 0);

  // LOGIC REMAINS 100% UNCHANGED
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) { 
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateTithe = () => {
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const totalMs = 24 * 60 * 60 * 1000; 
        const remaining = endOfDay.getTime() - Date.now();
        const percent = Math.max(0, (remaining / totalMs) * 100);
        setTitheProgress(percent);
    };
    updateTithe();
    const interval = setInterval(updateTithe, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userData?.username) return;
    const q = query(collection(db, "kill_claims"), where("targetName", "==", userData.username), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const claims = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncomingClaims(claims);
        if (claims.length > 0) {
            play("error");
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 600]);
        }
    });
    return () => unsubscribe();
  }, [userData, play]);

  const handleConfirmYield = async (claim: any) => {
      play("click");
      try {
          const batch = writeBatch(db);
          const operatorRef = doc(db, "users", claim.killerId);
          batch.update(operatorRef, { "wallet.popCoins": increment(claim.amount), "dailyTracker.bountiesClaimed": increment(1) });
          const myRef = doc(db, "users", userData!.uid);
          batch.update(myRef, { "wallet.popCoins": increment(10) });
          const claimRef = doc(db, "kill_claims", claim.id);
          batch.update(claimRef, { status: "verified" });
          await batch.commit();
          play("success");
          toast.success("YIELD VERIFIED // RUPEES DISTRIBUTED");
      } catch (e) { toast.error("TRANSACTION FAILED"); }
  };

  const handleDenyYield = async (claimId: string) => {
      play("error");
      await updateDoc(doc(db, "kill_claims", claimId), { status: "disputed" });
      toast.error("AUDIT REQUESTED // LOGGED TO LEDGER");
  };

  const toggleNetwork = (mode: "INSTA" | "YOUTUBE") => {
      if (mode === "YOUTUBE" && !isYoutubeUnlocked) {
          play("error");
          toast.error("ACCESS DENIED // SCALE YOUR OPERATIONS TO UNLOCK YOUTUBE GRID");
          return;
      }
      play("click");
      setNetworkMode(mode);
  };

  if (loading) return null;

  return (
    <main className={cn(
        "relative min-h-screen w-full bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-white selection:text-black transition-all duration-100", 
        glitch && "invert opacity-90"
    )}>
      
      {/* IMMERSIVE PLAYGROUND BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/dashboard-bg.jpg" 
          alt="Wealth Playground" 
          fill 
          priority 
          className="object-cover opacity-10 grayscale contrast-150 mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/90 to-[#050505]" />
      </div>

      {/* TOP NAVIGATION / STATUS BAR */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
         <div className="flex items-center gap-3">
             <Database size={14} className="text-white/50" />
             <span className="text-xs font-mono tracking-[0.2em] text-neutral-400 uppercase hidden md:block">
               PORTALZ WEALTH PLAYGROUND
             </span>
         </div>
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                 <span className="text-xs font-mono uppercase text-white">LIVE YIELD NETWORK</span>
             </div>
         </div>
      </nav>

      {/* ALERTS: PENDING YIELD DISBURSALS */}
      {incomingClaims.length > 0 && (
         <div className="relative z-[200] bg-white text-black px-6 py-4 flex flex-col lg:flex-row items-center justify-between border-b border-white/10 animate-in slide-in-from-top-full">
             <div className="flex items-center gap-4 mb-4 lg:mb-0">
                 <AlertTriangle className="animate-pulse" size={24} />
                 <div>
                     <HackerText text="PENDING YIELD DISBURSALS" className="text-lg font-bold tracking-widest uppercase" />
                     <span className="block text-xs font-mono mt-1">{incomingClaims.length} UNVERIFIED RUPEE TRANSFERS</span>
                 </div>
             </div>
             <div className="flex flex-wrap gap-4 justify-center">
                 {incomingClaims.map(claim => (
                     <div key={claim.id} className="flex items-center gap-4 bg-black/5 px-4 py-2 border border-black/20">
                         <div className="text-left">
                             <span className="text-[10px] font-mono text-black/60 uppercase">OPERATOR:</span>
                             <p className="font-bold text-sm uppercase">{claim.killerName || "UNKNOWN_NODE"}</p>
                             <span className="text-xs font-mono">Commission: ₹{claim.amount}</span>
                         </div>
                         <div className="flex gap-2">
                             <button onClick={() => handleConfirmYield(claim)} className="p-2 bg-black text-white hover:bg-neutral-800 transition-colors border border-black" title="Verify & Claim"><Check size={16} /></button>
                             <button onClick={() => handleDenyYield(claim.id)} className="p-2 bg-transparent text-black hover:bg-black/10 transition-colors border border-black/20" title="Dispute"><X size={16} /></button>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      )}

      {/* MAIN PLAYGROUND LAYOUT */}
      <div className="relative z-40 flex flex-col lg:flex-row h-full flex-1 overflow-hidden">
        
        {/* LEFT ASIDE - PLAYER HUB */}
        <aside className="w-full lg:w-[420px] shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-[#050505]/80 backdrop-blur-md">
          
          <div className="p-6 md:p-8 space-y-8">
              <div className="border border-white/10 bg-white/5 p-4">
                  <PlayerStatusCard userData={userData} />
              </div>
              
              {/* DAILY ENERGY DECAY */}
              <div className="border border-white/10 p-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                      <Activity className="text-white animate-pulse" size={20} strokeWidth={1.5} />
                      <HackerText text="DAILY ENERGY DECAY" className="text-sm font-mono tracking-widest uppercase" />
                  </div>
                  <div className="text-right">
                      <span className="text-2xl font-mono tracking-tight">{Math.floor(titheProgress)}%</span>
                  </div>
                </div>
                <Progress value={titheProgress} className="h-1 bg-white/10 rounded-none mb-4 relative z-10" />
                <div className="flex items-center gap-3 text-[10px] font-mono text-neutral-500 uppercase tracking-widest relative z-10">
                    <Clock size={12} />
                    <span>Resets 00:00 IST // Keep Hustling</span>
                </div>
              </div>
              
              {/* DAILY YIELD MISSIONS */}
              <div className="border border-white/10 p-6 flex flex-col h-[320px]">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                      <Target className="text-white/50" size={18} />
                      <span className="text-sm font-mono uppercase tracking-widest">DAILY YIELD MISSIONS</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 tracking-widest">MAX REWARD: +₹{totalDailyReward}</span>
                </div>
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-2">
                    {DAILY_QUESTS.map((quest) => (
                      <div key={quest.id} className={cn(
                          "p-4 border transition-all duration-300 group", 
                          quest.completed 
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" 
                            : "border-white/10 bg-transparent hover:border-white/30 hover:bg-white/5"
                      )}>
                        <div className="flex items-center justify-between mb-2">
                            <p className={cn("text-xs font-mono uppercase tracking-widest", quest.completed && "line-through opacity-60")}>
                              {quest.label}
                            </p>
                            <span className="text-xs font-bold font-mono text-emerald-400">+₹{quest.reward}</span>
                        </div>
                        {!quest.completed && quest.progress !== undefined && (
                          <div className="mt-4">
                            <Progress value={quest.progress} className="h-0.5 bg-white/20" />
                            <div className="text-[10px] font-mono text-neutral-500 mt-1">PROGRESS: {quest.progress}%</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* LIVE YIELD STREAM */}
              <div className="border border-white/10 p-6 hidden md:block">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <Globe className="text-white/50" size={16} />
                    <span className="text-xs font-mono tracking-widest uppercase">LIVE YIELD STREAM</span>
                </div>
                <div className="space-y-4">
                  {FAKE_YIELD_FEED.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest animate-in fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                        <span className="text-emerald-400 truncate max-w-[100px]">{tx.operator}</span>
                        <ArrowRight size={10} className="text-neutral-600 shrink-0 mx-2" />
                        <span className="text-neutral-400 truncate max-w-[100px]">{tx.source}</span>
                        <span className="text-emerald-400 ml-auto font-bold">+₹{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

          </div>
        </aside>

        {/* MAIN PLAYGROUND AREA */}
        <section className="flex-1 flex flex-col p-6 md:p-10 h-full overflow-hidden bg-[#050505]/90 backdrop-blur-sm">
          
          <header className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 mb-10 pb-8 border-b border-white/10 shrink-0">
            <div>
              <HackerText text="WEALTH PLAYGROUND" className="text-[6vw] md:text-5xl font-medium tracking-tighter uppercase mb-4" />
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    {Object.keys(NICHE_DATA).length} LIVE ARENAS
                </div>
                <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5">
                    HUSTLER TIER // <span className="text-white">{rankTitle}</span>
                </div>
              </div>
            </div>
            
            {/* NETWORK TOGGLE */}
            <div className="border border-white/10 flex p-1 bg-[#050505]">
              <button 
                onClick={() => toggleNetwork("INSTA")} 
                className={cn(
                    "px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all", 
                    networkMode === "INSTA" ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                )}
              >
                  <Instagram size={14} /> INSTA GRID
              </button>
              <button 
                onClick={() => toggleNetwork("YOUTUBE")} 
                className={cn(
                    "px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-3 transition-all", 
                    networkMode === "YOUTUBE" ? "bg-white text-black" : "text-neutral-400 hover:text-white", 
                    !isYoutubeUnlocked && "opacity-40 cursor-not-allowed"
                )}
              >
                  {isYoutubeUnlocked ? <Youtube size={14} /> : <Lock size={14} />} YOUTUBE ARENA
              </button>
            </div>
          </header>

          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/10 border border-white/10 pb-20">
              
              {Object.entries(NICHE_DATA).map(([key, data]: [string, any], index) => {
                  const isLocked = !unlockedColonies.includes(key);
                  const threatLevel = Math.floor(Math.random() * 90) + 10; 
                  const activeOps = Math.floor(Math.random() * 500) + 50;
                  const SectorIcon = data.icon; 

                  return (
                      <button 
                          key={key} 
                          disabled={isLocked} 
                          onClick={() => { play("click"); router.push(`/niche/${key}`); }} 
                          onMouseEnter={() => play("hover")}
                          className={cn(
                              "group relative h-80 w-full bg-[#050505] overflow-hidden transition-all duration-500 text-left flex flex-col justify-between p-8", 
                              isLocked 
                                  ? "opacity-40 cursor-not-allowed" 
                                  : "hover:bg-[#0a0a0a] cursor-pointer hover:ring-1 hover:ring-white/30"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                      >
                          {/* ARENA BACKGROUND */}
                          <div className="absolute inset-0 z-0 overflow-hidden">
                              {data.imageSrc && (
                                  <Image 
                                      src={data.imageSrc} 
                                      alt={data.label} 
                                      fill 
                                      className="object-cover opacity-10 group-hover:opacity-30 group-hover:scale-110 transition-all duration-700 grayscale contrast-125 mix-blend-screen" 
                                  />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/60 to-[#050505]/90" />
                          </div>

                          {/* TOP META */}
                          <div className="flex justify-between items-start relative z-20">
                              <span className="text-[10px] font-mono border border-white/20 px-2 py-1 uppercase tracking-widest text-neutral-400 backdrop-blur-md bg-black/50">
                                  YIELD: {threatLevel}%
                              </span>
                              {!isLocked && (
                                  <div className="text-[10px] font-mono flex items-center gap-2 uppercase tracking-widest text-emerald-400 bg-black/50 px-2 py-1 border border-white/10 backdrop-blur-md">
                                      <Zap className="animate-pulse" size={12} /> {activeOps} HUSTLERS
                                  </div>
                              )}
                          </div>
                          
                          {/* CENTER ARENA INFO */}
                          <div className="relative z-10 my-auto pt-8">
                            <div className="mb-6 text-white/50 group-hover:text-white transition-colors">
                                {isLocked ? <Lock size={28} /> : networkMode === "YOUTUBE" ? <Youtube size={28} /> : <SectorIcon size={28} strokeWidth={1.5} />}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-medium tracking-tight uppercase leading-[1.05] text-white mb-2 drop-shadow-md">
                                {data.label}
                            </h3>
                            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 drop-shadow-md">
                                {networkMode === "YOUTUBE" ? "VIDEO YIELD ACTIVE" : data.category} • DAILY MISSIONS
                            </div>
                          </div>

                          {/* HOVER ACTION BAR */}
                          {!isLocked && (
                              <div className="absolute inset-x-0 bottom-0 p-8 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 bg-gradient-to-t from-black to-transparent">
                                  <span className="text-xs font-mono uppercase tracking-widest border-b border-emerald-400 pb-1 text-emerald-400">ENTER ARENA</span>
                                  <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform text-emerald-400" />
                              </div>
                          )}

                          {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/90 backdrop-blur-sm z-30">
                                  <div className="border border-white/30 px-6 py-3 text-xs font-mono uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                                    <Lock size={14} /> TIER LOCKED • SCALE UP
                                  </div>
                              </div>
                          )}
                      </button>
                  );
              })}
            </div>
          </ScrollArea>
        </section>

      </div>
    </main>
  );
}