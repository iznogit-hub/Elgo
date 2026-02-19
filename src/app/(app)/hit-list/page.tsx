"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; 
import { 
  Crosshair, Search, Loader2, Target, 
  Wifi, Radar, AlertTriangle, 
  Activity, RefreshCw, Database, 
  Terminal, ShieldCheck, Box, LineChart, CheckCircle2,
  Swords, Flame, Trophy, Users
} from "lucide-react";
import { collection, getDocs, query, where, limit, writeBatch, doc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { HackerText } from "@/components/ui/hacker-text";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// MOCK: Global Activity Feed -> Repurposed as Live Loot Stream
const FAKE_GLOBAL_YIELDS = [
  { operator: "NODE_ALPHA", asset: "SAAS_CONTRACT", amount: 150, time: "2m ago" },
  { operator: "YIELD_MAX", asset: "CREATOR_ASSET", amount: 280, time: "5m ago" },
  { operator: "CYBER_CAPITAL", asset: "D2C_LEAD", amount: 90, time: "8m ago" },
  { operator: "VOID_STALKER", asset: "DARK_POOL_NODE", amount: 420, time: "12m ago" },
];

export default function HitListPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx(); 
  
  // MODES (logic unchanged - just themed UI)
  const [mode, setMode] = useState<"SCAN" | "ENGAGE" | "REPORT">("SCAN");
  const [targets, setTargets] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const [engagedTargets, setEngagedTargets] = useState<string[]>([]); 
  const [pendingClaims, setPendingClaims] = useState<string[]>([]);
  const [killedTargets, setKilledTargets] = useState<string[]>([]);
  const [killStreak, setKillStreak] = useState(0);
  const [totalBountiesClaimed, setTotalBountiesClaimed] = useState(0);

  const [reportUrl, setReportUrl] = useState("");
  const [reporting, setReporting] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // FX: Subtle Terminal Glitch (unchanged)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // FX: Conversion Tracker (unchanged)
  useEffect(() => {
    if (killedTargets.length > 0) {
      setKillStreak(prev => prev + 1);
      setTotalBountiesClaimed(prev => prev + 50);
    }
  }, [killedTargets.length]);

  // 1. SCANNER LOGIC (unchanged)
  const performScan = async () => {
      if (!user) return;
      setIsScanning(true);
      setScanProgress(0);
      play("scan");
      
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + Math.random() * 15 + 5;
        });
      }, 200);

      setTimeout(async () => {
          try {
              const q = query(
                  collection(db, "users"), 
                  where("uid", "!=", user.uid),
                  limit(12) 
              );
              const snapshot = await getDocs(q);
              
              let data = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                threatLevel: Math.floor(Math.random() * 80) + 10,
                bounty: 50 + Math.floor(Math.random() * 100),
                isGhost: false
              }));

              if (Math.random() < 0.2) {
                  const darkAsset = {
                      id: "ghost_" + Date.now(),
                      username: "LEGENDARY WILD TRAINER",
                      avatar: "/avatars/4.jpg",
                      threatLevel: 99,
                      bounty: 500,
                      isGhost: true,
                      membership: { tier: "CLASSIFIED" },
                      instagramHandle: "instagram"
                  };
                  data = [darkAsset, ...data];
                  toast.warning("⚠ RARE LEGENDARY TRAINER SPAWNED");
              }
              
              setTargets(data);
              setMode("ENGAGE");
              play("success");
              toast.success("RADAR LOCKED // WILD TRAINERS DETECTED");
          } catch (e) {
              toast.error("RADAR JAMMED // TRY AGAIN");
          } finally {
              setIsScanning(false);
              clearInterval(progressInterval);
              setScanProgress(0);
          }
      }, 3000);
  };

  // 2. ENGAGE (unchanged)
  const handleEngage = (id: string, handle: string) => {
      play("lock");
      if (handle) {
          window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
          if (!engagedTargets.includes(id)) {
            setEngagedTargets(prev => [...prev, id]);
            toast.info("TRAINER PROFILE OPENED // PREPARE BATTLE");
          }
      } else {
          toast.info("CLASSIFIED TRAINER // PROFILE HIDDEN");
      }
  };

  // 3. CONFIRM KILL (EXTRACT YIELD) - DB Logic 100% unchanged
  const handleConfirmKill = async (targetId: string, targetName: string, bounty: number) => {
      if (!userData) return;
      play("shot");
      setKilledTargets(prev => [...prev, targetId]);

      try {
          const batch = writeBatch(db);
          
          const myRef = doc(db, "users", userData.uid);
          batch.update(myRef, {
             "wallet.popCoins": increment(bounty),
             "dailyTracker.bountiesClaimed": increment(1)
          });

          const killRef = doc(collection(db, "kill_claims"));
          batch.set(killRef, {
              killerId: userData.uid,
              killerName: userData.username,
              targetId: targetId,
              targetName: targetName, 
              amount: bounty,
              status: "verified",
              timestamp: new Date().toISOString()
          });

          await batch.commit();
          setPendingClaims(prev => [...prev, targetId]);
          
          setTimeout(() => {
             play("kaching");
             toast.success(`BATTLE WON! +${bounty} RUPEES LOOTED`);
          }, 600);

      } catch (e) { 
          toast.error("BATTLE FAILED // REVERTING");
          setKilledTargets(prev => prev.filter(id => id !== targetId)); 
      }
  };

  // 4. REPORT (unchanged)
  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      play("click");
      if (!reportUrl.includes("instagram.com")) return toast.error("INVALID TRAINER COORDINATES");
      setReporting(true);
      
      setTimeout(() => {
          setReporting(false);
          setReportUrl("");
          setMode("SCAN");
          toast.success("RARE SPAWN REPORTED // +25 RUPEE BONUS");
      }, 1500);
  };

  return (
    <main className={cn(
        "relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-[#FFD4B2] selection:text-black", 
        glitch && "invert opacity-90 transition-all duration-75"
    )}>
      
      {/* ATMOSPHERE - Pokémon Radar Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/radar-bg.jpg" 
          alt="Wild Trainer Radar" 
          fill 
          priority
          className="object-cover opacity-15 grayscale contrast-150 mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/70 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* TOP HUD - Pokémon Bounty Hunter Style */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 flex items-center justify-center border border-[#FFD4B2]/40 bg-black/60">
                <Radar size={26} className="text-[#FFD4B2]" />
            </div>
            <div>
              <HackerText text="WILD ENCOUNTER RADAR" className="text-2xl font-medium tracking-widest uppercase text-[#FFD4B2]" />
              <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-[0.2em] mt-1">Hunt • Battle • Loot Real Rupees</span>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto border border-[#FFD4B2]/30 p-3 bg-black/60 rounded-full">
            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1 tracking-widest">CAPTURE STREAK</span>
              <div className="flex items-center gap-2">
                <Flame size={16} className={killStreak > 3 ? "text-[#FFD4B2] animate-pulse" : "text-neutral-400"} />
                <span className="text-xl font-mono text-white">{killStreak}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />

            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1 tracking-widest">TOTAL LOOT</span>
              <span className="text-xl font-mono text-[#FFD4B2]">₹{totalBountiesClaimed}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD4B2] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-white">RADAR LIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/10 bg-[#050505]">
          <button 
            onClick={() => setMode("SCAN")} 
            className={cn(
                "flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-all border-r border-white/10 flex items-center justify-center gap-2", 
                mode === "SCAN" || mode === "ENGAGE" ? "bg-[#FFD4B2] text-black font-bold" : "text-neutral-400 hover:text-white"
            )}
          >
            <Radar size={14} /> RELEASE RADAR
          </button>
          <button 
            onClick={() => setMode("REPORT")} 
            className={cn(
                "flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                mode === "REPORT" ? "bg-[#FFD4B2] text-black font-bold" : "text-neutral-400 hover:text-white"
            )}
          >
            <Terminal size={14} /> REPORT RARE SPAWN
          </button>
        </div>
      </header>

      {/* MAIN ARENA */}
      <div className="relative z-40 flex-1 overflow-hidden flex flex-col">
        
        {/* SCANNING STATE */}
        {(mode === "SCAN" || (mode === "ENGAGE" && targets.length === 0)) && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 px-6 py-12 overflow-y-auto">
            <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center border-4 border-[#FFD4B2]/30 bg-black/60 rounded-full">
              <div className="absolute inset-0 bg-[radial-gradient(#FFD4B220_1px,transparent_1px)] bg-[size:12px_12px]" />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#FFD4B2]/40 rounded-full animate-ping" />
                  <div className="absolute w-48 h-48 border-2 border-[#FFD4B2] rounded-full animate-[spin_1.5s_linear_infinite]" />
                </div>
              )}
              
              <div className="relative z-10 text-center">
                {isScanning ? (
                  <>
                    <Loader2 size={42} className="text-[#FFD4B2] animate-spin mx-auto mb-6" />
                    <Progress value={scanProgress} className="w-48 h-1 mx-auto mb-6 bg-white/10" />
                    <HackerText text="SCANNING FOR WILD TRAINERS..." className="text-xs font-mono tracking-widest text-[#FFD4B2]" />
                  </>
                ) : (
                  <>
                    <Radar size={72} className="text-[#FFD4B2]/30 mx-auto mb-6" />
                    <span className="text-xs font-mono uppercase tracking-[4px] text-neutral-400">POKÉ-RADAR READY</span>
                  </>
                )}
              </div>
            </div>

            <Button 
                onClick={performScan} 
                disabled={isScanning} 
                className="w-full max-w-xs h-16 text-sm font-mono uppercase tracking-[0.2em] bg-transparent border-2 border-[#FFD4B2] text-[#FFD4B2] hover:bg-[#FFD4B2] hover:text-black transition-all rounded-none"
            >
                {isScanning ? "SCANNING GRASS..." : "RELEASE RADAR • FIND RIVALS"}
            </Button>
          </div>
        )}

        {/* WILD ENCOUNTERS GRID */}
        {mode === "ENGAGE" && targets.length > 0 && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#050505] border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-[#FFD4B2] rounded-full animate-pulse" />
                <HackerText text={`WILD TRAINERS DETECTED: ${targets.length}`} className="text-sm font-mono tracking-widest uppercase text-[#FFD4B2]" />
              </div>
              <button 
                onClick={performScan} 
                className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400 hover:text-white border border-[#FFD4B2]/30 hover:border-[#FFD4B2] px-5 py-2 transition-all"
              >
                <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} /> NEW SCAN
              </button>
            </div>

            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-white/10 border-b border-white/10 pb-32">
                {targets.map((target, i) => {
                    const isPending = pendingClaims.includes(target.id);
                    const isEngaged = engagedTargets.includes(target.id);
                    const isKilled = killedTargets.includes(target.id);
                    const avatar = target.avatar || "/avatars/1.jpg";
                    const isGhost = target.isGhost; 

                    return (
                        <div 
                          key={target.id} 
                          className={cn(
                              "group relative bg-[#050505] overflow-hidden transition-all duration-500 p-8 flex flex-col h-[380px]", 
                              isKilled ? "opacity-40 grayscale" : "hover:bg-white/5"
                          )} 
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {isKilled && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                                    <div className="text-center">
                                      <Trophy size={48} className="text-[#FFD4B2] mx-auto mb-3" />
                                      <div className="font-mono tracking-widest text-[#FFD4B2] text-lg">LOOT CAPTURED</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-8">
                                <span className={cn(
                                    "text-xs font-mono border px-4 py-1.5 uppercase tracking-widest",
                                    isGhost ? "border-[#FFD4B2] text-[#FFD4B2]" : "border-white/30 text-neutral-400"
                                )}>
                                    #{target.id.slice(0,6)}
                                </span>
                                <div className="text-right">
                                    <span className="block text-xs font-mono text-neutral-400 uppercase">LOOT REWARD</span>
                                    <span className="text-3xl font-black text-[#FFD4B2]">₹{target.bounty}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 items-center flex-1">
                                <div className={cn(
                                    "relative w-20 h-20 shrink-0 border-2 overflow-hidden rounded-2xl", 
                                    isGhost ? "border-[#FFD4B2]" : "border-white/30"
                                )}>
                                    <Image src={avatar} alt="Wild Trainer" fill className="object-cover" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold tracking-tight text-white mb-1 truncate">
                                        {target.username}
                                    </h3>
                                    <div className="text-xs font-mono text-neutral-400">LVL {target.threatLevel} • {target.membership?.tier || "Rookie"}</div>
                                    
                                    <div className="mt-6">
                                      <div className="flex justify-between text-[10px] font-mono uppercase mb-1 text-neutral-400">
                                        <span>BATTLE POWER</span>
                                        <span>{target.threatLevel}%</span>
                                      </div>
                                      <div className="h-px bg-white/20">
                                        <div className="h-full bg-[#FFD4B2] transition-all" style={{ width: `${target.threatLevel}%` }} />
                                      </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mt-auto">
                                <button 
                                    onClick={() => handleEngage(target.id, target.instagramHandle)} 
                                    className="py-4 bg-[#050505] hover:bg-white text-neutral-400 hover:text-black font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    <Search size={15} /> INSPECT
                                </button>
                                
                                {isPending ? (
                                    <div className="py-4 bg-[#050505] text-white font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                                        <Loader2 size={15} className="animate-spin" /> PROCESSING LOOT
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleConfirmKill(target.id, target.username, target.bounty || 50)} 
                                        disabled={!isEngaged || isKilled} 
                                        className={cn(
                                            "py-4 font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all",
                                            isEngaged && !isKilled 
                                                ? "bg-[#FFD4B2] text-black hover:bg-white" 
                                                : "bg-[#050505] text-neutral-700 cursor-not-allowed"
                                        )}
                                    >
                                        <Swords size={15} /> BATTLE &amp; LOOT
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* REPORT RARE SPAWN */}
        {mode === "REPORT" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#050505] border-2 border-[#FFD4B2]/40 p-12 md:p-16">
              <div className="flex items-center gap-4 mb-10">
                  <Terminal size={32} className="text-[#FFD4B2]" />
                  <HackerText text="REPORT RARE SPAWN" className="text-3xl font-medium tracking-widest uppercase text-white" />
              </div>
              
              <p className="text-sm font-mono text-neutral-400 mb-10 leading-relaxed">
                Spotted a legendary trainer not on the radar?<br/>
                Submit exact coordinates for instant verification bonus.
              </p>
              
              <form onSubmit={handleReport} className="space-y-8">
                <div>
                    <label className="block text-xs font-mono text-neutral-400 uppercase mb-4 tracking-widest">TRAINER INSTAGRAM URL</label>
                    <Input 
                        placeholder="https://instagram.com/..." 
                        value={reportUrl} 
                        onChange={(e) => setReportUrl(e.target.value)} 
                        className="h-14 bg-transparent border-[#FFD4B2]/40 text-white font-mono text-sm uppercase focus:border-[#FFD4B2] rounded-none placeholder:text-neutral-600" 
                    />
                </div>
                
                <Button 
                    type="submit" 
                    disabled={reporting} 
                    className="w-full h-16 text-sm font-mono font-bold uppercase tracking-[0.2em] bg-[#FFD4B2] text-black hover:bg-white rounded-none transition-all"
                >
                    {reporting ? "SENDING TO OVERSEER..." : "SUBMIT RARE SPAWN"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}