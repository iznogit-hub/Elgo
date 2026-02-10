"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  ShieldAlert, Crosshair, Lock, Play, 
  Activity, Zap, Globe, Skull, Check, X,
  Terminal, BarChart3, Youtube, Instagram, Timer,
  Flame, Trophy, Target, Radio, AlertTriangle,
  Swords, UserCheck, Clock, ChevronRight
} from "lucide-react";
import { 
  collection, query, where, onSnapshot, 
  doc, increment, writeBatch, updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { NICHE_DATA } from "@/lib/niche-data"; 

// UI Components
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import PlayerStatusCard from "@/components/ui/player-status-card";
import { HackerText } from "@/components/ui/hacker-text";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

// --- GAME CONFIGURATION ---
const MAX_TITHE = 100;

// MOCK: Daily Quests 
const DAILY_QUESTS = [
  { id: "login", label: "Login Mainframe", reward: 50, completed: true },
  { id: "scan", label: "Scan 5 Targets", reward: 100, completed: false, progress: 60 },
  { id: "yt_op", label: "Execute 2 YouTube Ops", reward: 200, completed: false, progress: 30 },
  { id: "recruit", label: "Recruit 1 Operative", reward: 300, completed: false, progress: 0 },
];

// MOCK: Atmosphere Data
const FAKE_KILL_FEED = [
  { killer: "SHADOWREAPER", target: "N00B_HUNTER", amount: 250 },
  { killer: "CYBERWOLF", target: "DATA_THIEF", amount: 180 },
  { killer: "NEON_VIPER", target: "GRID_RUNNER", amount: 320 },
  { killer: "GHOST_01", target: "SYSTEM_ADMIN", amount: 500 },
];

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const { userData, loading } = useAuth();
  
  // STATE
  const [incomingAttacks, setIncomingAttacks] = useState<any[]>([]);
  const [networkMode, setNetworkMode] = useState<"INSTA" | "YOUTUBE">("INSTA");
  const [titheProgress, setTitheProgress] = useState(100);
  const [glitch, setGlitch] = useState(false);
  
  // DERIVED DATA
  const score = userData?.wallet?.popCoins || 0;
  const unlockedColonies = userData?.unlockedNiches || ["general"]; 
  const isYoutubeUnlocked = userData?.membership?.tier !== "recruit"; // Locked for Recruits
  const rankTitle = userData?.membership?.tier?.toUpperCase() || "RECRUIT";
  const totalDailyReward = DAILY_QUESTS.reduce((sum, q) => sum + q.reward, 0);

  // --- FX: RANDOM GLITCH ---
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) { 
        setGlitch(true);
        setTimeout(() => setGlitch(false), 150);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- MECHANIC: BLOOD TITHE ---
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

  // --- MECHANIC: DEFENSE SYSTEM ---
  useEffect(() => {
    if (!userData?.username) return;
    
    const q = query(
        collection(db, "kill_claims"), 
        where("targetName", "==", userData.username),
        where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const attacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncomingAttacks(attacks);
        
        if (attacks.length > 0) {
            play("error"); 
            if (typeof navigator !== "undefined" && navigator.vibrate) {
                navigator.vibrate([300, 100, 300, 100, 600]);
            }
        }
    });

    return () => unsubscribe();
  }, [userData, play]);

  // --- HANDLERS ---
  const handleConfirmDeath = async (claim: any) => {
      play("click");
      try {
          const batch = writeBatch(db);
          const killerRef = doc(db, "users", claim.killerId);
          batch.update(killerRef, { 
              "wallet.popCoins": increment(claim.amount),
              "dailyTracker.bountiesClaimed": increment(1)
          });
          const myRef = doc(db, "users", userData!.uid);
          batch.update(myRef, { "wallet.popCoins": increment(10) });
          const claimRef = doc(db, "kill_claims", claim.id);
          batch.update(claimRef, { status: "verified" });
          
          await batch.commit();
          play("success");
          toast.success("CONFIRMED // BLOOD PRICE PAID");
      } catch (e) {
          toast.error("TRANSMISSION FAILED");
      }
  };

  const handleDenyDeath = async (claimId: string) => {
      play("error");
      await updateDoc(doc(db, "kill_claims", claimId), { status: "disputed" });
      toast.error("COUNTER-ATTACK // DISPUTE LOGGED");
  };

  const toggleNetwork = (mode: "INSTA" | "YOUTUBE") => {
      if (mode === "YOUTUBE" && !isYoutubeUnlocked) {
          play("error");
          toast.error("ACCESS DENIED // RANK UP TO UNLOCK YOUTUBE GRID");
          return;
      }
      play("click");
      setNetworkMode(mode);
  };

  if (loading) return null;

  return (
    <main className={cn(
        "relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white transition-all duration-100", 
        glitch && "invert opacity-90"
    )}>
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/dashboard-bg.jpg" 
          alt="War Room"
          fill
          priority
          className="object-cover opacity-20 grayscale contrast-150"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
      </div>

      {/* 🚨 CRITICAL ALERT BANNER */}
      {incomingAttacks.length > 0 && (
         <div className="relative z-[200] bg-gradient-to-r from-red-900 via-red-600 to-red-900 text-white px-6 py-5 flex flex-col lg:flex-row items-center justify-between shadow-[0_0_80px_red] border-b-8 border-red-950 animate-in slide-in-from-top-full">
             <div className="flex items-center gap-6 mb-4 lg:mb-0">
                 <AlertTriangle className="animate-pulse" size={32} />
                 <div>
                   <HackerText text="INCOMING ASSASSINATION PROTOCOLS" className="text-2xl font-black tracking-widest" />
                   <span className="block text-sm font-mono text-red-200 mt-1">
                     {incomingAttacks.length} ACTIVE KILL CONTRACT{incomingAttacks.length !== 1 ? "S" : ""}
                   </span>
                 </div>
             </div>
             <div className="flex flex-wrap gap-4 justify-center">
                 {incomingAttacks.map(attack => (
                     <div key={attack.id} className="flex items-center gap-4 bg-black/60 border-2 border-red-500/50 px-5 py-3 rounded-lg backdrop-blur-xl">
                         <div className="text-left">
                           <span className="text-xs font-mono text-red-300">ASSASSIN:</span>
                           <p className="font-black text-lg">{attack.killerName || "SHADOW"}</p>
                           <span className="text-xs text-red-400">BOUNTY: {attack.amount} PC</span>
                         </div>
                         <div className="flex gap-3">
                           <button onClick={() => handleConfirmDeath(attack)} className="p-3 bg-green-900/50 hover:bg-green-600 transition-all rounded-lg border border-green-500/50">
                             <Check size={20} />
                           </button>
                           <button onClick={() => handleDenyDeath(attack.id)} className="p-3 bg-red-900/50 hover:bg-red-600 transition-all rounded-lg border border-red-500/50">
                             <X size={20} />
                           </button>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      )}

      {/* WAR ROOM GRID LAYOUT */}
      <div className="relative z-40 flex flex-col lg:flex-row h-full flex-1 p-6 md:p-10 gap-10 overflow-hidden">

        {/* --- LEFT: COMMAND CONSOLE --- */}
        <aside className="w-full lg:w-[420px] shrink-0 flex flex-col gap-8">
          
          {/* Player Card */}
          <PlayerStatusCard userData={userData} className="shadow-[0_0_60px_rgba(0,255,255,0.2)] border border-cyan-500/30" />

          {/* 🩸 BLOOD TITHE */}
          <div className="bg-gradient-to-b from-red-950/40 to-black border-2 border-red-800/60 p-6 backdrop-blur-lg relative overflow-hidden rounded-2xl group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.6),transparent_70%)] group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Flame className="text-red-500 animate-pulse" size={28} />
                <HackerText text="BLOOD_TITHE" className="text-2xl font-black text-red-400 tracking-wider" />
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-red-300 tabular-nums">{Math.floor(titheProgress)}%</span>
                <p className="text-[10px] text-red-500 uppercase font-mono">Life Support</p>
              </div>
            </div>
            <Progress value={titheProgress} className="h-4 bg-black/60 border border-red-900/50 mb-3" />
            <div className="flex items-center gap-3 text-xs font-mono text-red-300 uppercase">
              <Skull size={16} className={titheProgress < 30 ? "animate-pulse" : ""} />
              <span>10% Decay at 00:00 // Spill Blood or Perish</span>
            </div>
          </div>

          {/* 📋 DAILY DIRECTIVES */}
          <div className="bg-neutral-900/60 border border-yellow-600/30 p-6 backdrop-blur-lg flex-1 rounded-2xl flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Target className="text-yellow-500" size={24} />
                <HackerText text="Daily_Directives" className="text-xl font-black text-yellow-400" />
              </div>
              <span className="text-sm font-mono text-yellow-500">
                POTENTIAL: {totalDailyReward} PC
              </span>
            </div>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-3">
                {DAILY_QUESTS.map((quest) => (
                  <div key={quest.id} className={cn("p-4 border rounded-lg transition-all", quest.completed ? "border-green-600/50 bg-green-950/20" : "border-white/10 bg-neutral-900/40")}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={cn("text-sm font-black uppercase", quest.completed && "line-through text-neutral-500")}>
                        {quest.label}
                      </p>
                      <span className="text-xs font-bold text-yellow-500">+{quest.reward} PC</span>
                    </div>
                    {!quest.completed && quest.progress !== undefined && (
                      <Progress value={quest.progress} className="h-1.5 bg-black/50" />
                    )}
                    {quest.completed && <span className="text-[10px] text-green-400 uppercase font-mono flex items-center gap-1"><Check size={10}/> Directive Fulfilled</span>}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 💀 KILL FEED */}
          <div className="bg-black/60 border border-red-900/40 p-5 backdrop-blur-md rounded-2xl overflow-hidden hidden md:block">
            <div className="flex items-center gap-3 mb-4 border-b border-red-900/30 pb-2">
              <Radio className="text-red-500 animate-pulse" size={20} />
              <HackerText text="Global_Kill_Feed" className="text-lg text-red-400 font-bold" />
            </div>
            <div className="space-y-3">
              {FAKE_KILL_FEED.map((kill, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono animate-in slide-in-from-left" style={{ animationDelay: `${i * 200}ms` }}>
                  <span className="text-red-400 font-bold">{kill.killer}</span>
                  <Swords size={12} className="text-neutral-600" />
                  <span className="text-neutral-400">{kill.target}</span>
                  <span className="text-yellow-500 font-bold">+{kill.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* --- CENTRAL BATTLE STATION (Map) --- */}
        <section className="flex-1 flex flex-col gap-8 h-full min-h-[500px]">
          
          <header className="flex flex-col md:flex-row items-end justify-between gap-4">
            <div>
              <HackerText text="Mission_Select" className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-cyan-400 mb-2" />
              <div className="flex items-center gap-6 text-sm font-mono text-neutral-400 uppercase">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 rounded-full border border-green-900/50">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online Colonies: {Object.keys(NICHE_DATA).length}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-900/20 rounded-full border border-yellow-900/50">
                  <Trophy size={14} className="text-yellow-500" />
                  Rank: <span className="text-white font-bold">{rankTitle}</span>
                </div>
              </div>
            </div>

            {/* NETWORK SWITCH */}
            <div className="bg-black/70 border-2 border-white/20 p-1.5 rounded-xl flex gap-2 backdrop-blur-xl shadow-2xl">
              <button 
                  onClick={() => toggleNetwork("INSTA")}
                  className={cn(
                      "px-6 py-3 rounded-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all text-sm md:text-base",
                      networkMode === "INSTA" ? "bg-gradient-to-r from-cyan-600 to-cyan-400 text-black shadow-lg shadow-cyan-500/50" : "text-neutral-500 hover:text-white hover:bg-white/5"
                  )}
              >
                  <Instagram size={18} /> Insta_Net
              </button>
              <button 
                  onClick={() => toggleNetwork("YOUTUBE")}
                  className={cn(
                      "px-6 py-3 rounded-lg font-black uppercase tracking-widest flex items-center gap-3 transition-all text-sm md:text-base",
                      networkMode === "YOUTUBE" ? "bg-gradient-to-r from-red-600 to-red-400 text-white shadow-lg shadow-red-500/50" : "text-neutral-600 hover:text-white hover:bg-white/5",
                      !isYoutubeUnlocked && "opacity-60 grayscale cursor-not-allowed"
                  )}
              >
                  {isYoutubeUnlocked ? <Youtube size={18} /> : <Lock size={18} />}
                  YouTube_Grid
              </button>
            </div>
          </header>

          {/* COLONY GRID */}
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
              {Object.entries(NICHE_DATA).map(([key, data]: [string, any], index) => {
                  const isLocked = !unlockedColonies.includes(key);
                  const threatLevel = Math.floor(Math.random() * 90) + 10; 
                  const activeOps = Math.floor(Math.random() * 500) + 50;
                  
                  // FIX: Safely access icon component
                  const SectorIcon = data.icon; 

                  return (
                      <button
                          key={key}
                          disabled={isLocked}
                          onClick={() => { play("click"); router.push(`/niche/${key}`); }}
                          onMouseEnter={() => play("hover")}
                          className={cn(
                              "group relative h-72 w-full border-4 overflow-hidden rounded-xl transition-all duration-500 text-left",
                              isLocked 
                                  ? "border-neutral-800 bg-neutral-900/50 grayscale opacity-40 cursor-not-allowed" 
                                  : networkMode === "YOUTUBE"
                                      ? "border-red-900/60 bg-red-950/20 hover:border-red-500 hover:shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:scale-[1.02]"
                                      : "border-cyan-900/60 bg-cyan-950/20 hover:border-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:scale-[1.02]"
                          )}
                          style={{ animationDelay: `${index * 100}ms` }}
                      >
                          <div className="absolute inset-0 z-0">
                              {data.imageSrc && (
                                  <Image 
                                      src={data.imageSrc} 
                                      alt={data.label}
                                      fill
                                      className="object-cover opacity-40 group-hover:opacity-60 transition-all duration-1000 group-hover:scale-110"
                                  />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                          </div>

                          {!isLocked && (
                            <div className="absolute top-3 left-3 right-3 flex justify-between text-[10px] font-mono font-bold z-20">
                              <div className="bg-black/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm text-red-400">
                                THREAT: {threatLevel}%
                              </div>
                              <div className="bg-black/80 px-2 py-1 rounded border border-white/10 backdrop-blur-sm text-green-400 flex items-center gap-1">
                                <UserCheck size={10} /> {activeOps} UNITS
                              </div>
                            </div>
                          )}

                          <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end">
                            <div className={cn(
                                "w-12 h-12 rounded-lg flex items-center justify-center border-2 mb-4 backdrop-blur-md shadow-xl",
                                isLocked ? "border-neutral-700 bg-neutral-900" : `border-${data.color?.replace('text-', '')}-500 bg-black/50 ${data.color}`
                            )}>
                                {isLocked ? <Lock size={20} /> : networkMode === "YOUTUBE" ? <Youtube size={24} className="text-red-500" /> : <SectorIcon size={24} />}
                            </div>

                            <h3 className="text-3xl font-black uppercase italic leading-none mb-2 text-white drop-shadow-lg group-hover:translate-x-2 transition-transform">
                              {data.label}
                            </h3>
                            
                            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-300">
                              <div className={cn("w-2 h-2 rounded-full", isLocked ? "bg-red-600" : "bg-green-500 animate-pulse")} />
                              <span>
                                {networkMode === "YOUTUBE" ? "VIDEO OPS ACTIVE" : data.category}
                              </span>
                            </div>

                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                <div className="border border-red-500/50 bg-red-950/80 px-4 py-2 rounded text-red-500 font-black uppercase tracking-widest text-sm">
                                  Access Denied
                                </div>
                              </div>
                            )}
                          </div>

                          {!isLocked && (
                              <div className={cn(
                                  "absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm translate-y-4 group-hover:translate-y-0",
                                  networkMode === "YOUTUBE" ? "bg-red-900/80" : "bg-cyan-900/80"
                              )}>
                                  <HackerText text={networkMode === "YOUTUBE" ? "BROADCAST" : "DEPLOY"} className="text-4xl font-black uppercase tracking-widest text-white" />
                                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-[0.2em] text-white/80 border border-white/20 px-4 py-2 rounded-full">
                                    <ChevronRight size={14} className="animate-ping" />
                                    Click to Initialize
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