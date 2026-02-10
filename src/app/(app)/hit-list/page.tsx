"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; 
import { 
  Crosshair, Search, Loader2, Target, Skull, 
  Wifi, Radar, AlertTriangle, 
  Flame, Swords, Radio, RefreshCw, Activity,
  Ghost, Timer
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

// MOCK: Global Activity Feed
const FAKE_GLOBAL_KILLS = [
  { killer: "NEON_VIPER", target: "GRID_RUNNER", amount: 150, time: "2m ago" },
  { killer: "SHADOWREAPER", target: "DATA_THIEF", amount: 280, time: "5m ago" },
  { killer: "CYBERWOLF", target: "N00B_HUNTER", amount: 90, time: "8m ago" },
  { killer: "VOID_STALKER", target: "PHANTOM_X", amount: 420, time: "12m ago" },
];

export default function HitListPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx(); 
  
  // MODES
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

  // FX: Glitch
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.08) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 300);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // FX: Streak Tracker
  useEffect(() => {
    if (killedTargets.length > 0) {
      setKillStreak(prev => prev + 1);
      setTotalBountiesClaimed(prev => prev + 50);
    }
  }, [killedTargets.length]);

  // 1. SCANNER LOGIC
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
              // Client Side Logic: Fetch random users
              const q = query(
                  collection(db, "users"), 
                  where("uid", "!=", user.uid),
                  limit(12) 
              );
              const snapshot = await getDocs(q);
              
              // Decorate data locally since we don't have Cloud Functions
              let data = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                threatLevel: Math.floor(Math.random() * 80) + 10,
                bounty: 50 + Math.floor(Math.random() * 100),
                isGhost: false
              }));

              // Fake Ghost Spawn
              if (Math.random() < 0.2) {
                  const ghost = {
                      id: "ghost_" + Date.now(),
                      username: "UNKNOWN_SIGNAL",
                      avatar: "/avatars/4.jpg",
                      threatLevel: 99,
                      bounty: 500,
                      isGhost: true,
                      membership: { tier: "SHADOW" },
                      instagramHandle: "instagram"
                  };
                  data = [ghost, ...data];
                  toast.warning("⚠ SHADOW SIGNAL DETECTED");
              }
              
              setTargets(data);
              setMode("ENGAGE");
              play("success");
              toast.success("MATCH FOUND // TARGETS LOCKED");
          } catch (e) {
              toast.error("SCAN DISRUPTED // RETRY");
          } finally {
              setIsScanning(false);
              clearInterval(progressInterval);
              setScanProgress(0);
          }
      }, 3000);
  };

  // 2. ENGAGE
  const handleEngage = (id: string, handle: string) => {
      play("lock");
      if (handle) {
          window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
          if (!engagedTargets.includes(id)) {
            setEngagedTargets(prev => [...prev, id]);
            toast.info("LOCK-ON ACQUIRED // TRACKING ACTIVE");
          }
      } else {
          toast.info("GHOST PROTOCOL // NO TRACE");
      }
  };

  // 3. CONFIRM KILL (CLIENT SIDE)
  const handleConfirmKill = async (targetId: string, targetName: string, bounty: number) => {
      if (!userData) return;
      play("shot");
      setKilledTargets(prev => [...prev, targetId]);

      try {
          const batch = writeBatch(db);
          
          // A. Pay Me
          const myRef = doc(db, "users", userData.uid);
          batch.update(myRef, {
             "wallet.popCoins": increment(bounty),
             "dailyTracker.bountiesClaimed": increment(1)
          });

          // B. Log Kill
          const killRef = doc(collection(db, "kill_claims"));
          batch.set(killRef, {
              killerId: userData.uid,
              killerName: userData.username,
              targetId: targetId,
              targetName: targetName, 
              amount: bounty,
              status: "verified", // Skip verification in Beta
              timestamp: new Date().toISOString()
          });

          await batch.commit();
          setPendingClaims(prev => [...prev, targetId]);
          
          setTimeout(() => {
             play("kaching");
             toast.success(`ELIMINATION CONFIRMED // +${bounty} PC TRANSFERRED`);
          }, 600);

      } catch (e) { 
          toast.error("JAMMED // ABORT");
          setKilledTargets(prev => prev.filter(id => id !== targetId)); 
      }
  };

  // 4. REPORT
  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      play("click");
      if (!reportUrl.includes("instagram.com")) return toast.error("INVALID COORDINATES");
      setReporting(true);
      
      // Fake delay
      setTimeout(() => {
          setReporting(false);
          setReportUrl("");
          setMode("SCAN");
          toast.success("SCOUT REPORT TRANSMITTED // +25 PC BONUS");
      }, 1500);
  };

  return (
    <main className={cn("relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white", glitch && "animate-pulse")}>
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/radar-bg.jpg" alt="Grid" fill className="object-cover opacity-20 grayscale contrast-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay animate-pulse" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-4 border-red-900/60 bg-black/90 backdrop-blur-2xl">
        <div className="px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
            <Skull size={28} className="text-red-500 animate-pulse shrink-0" />
            <div>
              <HackerText text="HIT_LIST" className="text-2xl font-black tracking-wider text-red-400" />
              <span className="block text-[9px] font-mono text-red-300 uppercase tracking-widest">Global Bounty Protocol</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 w-full md:w-auto">
            <div className="text-center md:text-right">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">Kill Streak</span>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Flame size={16} className={killStreak > 3 ? "text-orange-500 animate-pulse" : "text-neutral-600"} />
                <span className="text-xl md:text-2xl font-black text-white leading-none">{killStreak}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="text-center md:text-right">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1">Total Bounty</span>
              <span className="text-xl md:text-2xl font-black text-yellow-500 leading-none">{totalBountiesClaimed} PC</span>
            </div>
            
            <div className="h-8 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2 text-green-500 animate-pulse bg-green-950/20 px-3 py-1 rounded-full border border-green-500/20">
              <Wifi size={14} />
              <span className="text-[9px] font-mono uppercase font-bold tracking-widest">Online</span>
            </div>
          </div>
        </div>

        <div className="flex border-t border-white/10">
          <button onClick={() => setMode("SCAN")} className={cn("flex-1 py-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all", mode === "SCAN" || mode === "ENGAGE" ? "bg-red-950/40 text-red-400 border-b-4 border-red-500" : "text-neutral-600 hover:text-white hover:bg-white/5")}>
            <Radar size={16} className="inline mr-2 mb-0.5" /> Find_Match
          </button>
          <button onClick={() => setMode("REPORT")} className={cn("flex-1 py-4 text-xs md:text-sm font-black uppercase tracking-widest transition-all", mode === "REPORT" ? "bg-yellow-950/30 text-yellow-400 border-b-4 border-yellow-500" : "text-neutral-600 hover:text-white hover:bg-white/5")}>
            <Target size={16} className="inline mr-2 mb-0.5" /> Scout_Target
          </button>
        </div>
      </header>

      {/* MAIN ARENA */}
      <div className="relative z-40 flex-1 overflow-hidden flex flex-col">
        {(mode === "SCAN" || (mode === "ENGAGE" && targets.length === 0)) && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 px-6 py-12 overflow-y-auto">
            <div className="relative w-64 h-64 md:w-96 md:h-96 shrink-0">
              <div className={cn("absolute inset-0 rounded-full border border-red-600/40", isScanning && "animate-ping")} />
              <div className={cn("absolute inset-8 rounded-full border border-red-500/30", isScanning && "animate-ping delay-300")} />
              {isScanning && (
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent -translate-x-1/2 -translate-y-1/2 origin-left animate-[spin_2s_linear_infinite]" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/80 border-4 border-red-600/60 rounded-full p-8 md:p-12 backdrop-blur-sm">
                  {isScanning ? (
                    <div className="text-center">
                      <Loader2 size={48} className="text-red-500 animate-spin mx-auto mb-4" />
                      <Progress value={scanProgress} className="w-32 md:w-48 h-2 mx-auto mb-4 bg-red-900/20" />
                      <HackerText text="SEARCHING..." className="text-lg text-red-400" />
                    </div>
                  ) : <Target size={64} className="text-neutral-500 mx-auto" />}
                </div>
              </div>
            </div>
            <Button onClick={performScan} disabled={isScanning} size="lg" className="w-full max-w-xs h-16 text-lg font-black uppercase tracking-[0.3em] bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-2xl shadow-red-600/60 rounded-none clip-path-slant">
                {isScanning ? "SCANNING..." : "ENTER ARENA"}
            </Button>
          </div>
        )}

        {mode === "ENGAGE" && targets.length > 0 && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-red-500 animate-pulse" />
                <HackerText text={`ACTIVE TARGETS: ${targets.length}`} className="text-lg font-bold text-red-400" />
              </div>
              <button onClick={performScan} className="flex items-center gap-2 text-[10px] font-bold uppercase text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 px-3 py-2 rounded border border-cyan-500/30 hover:border-cyan-500 transition-colors">
                <RefreshCw size={12} className={isScanning ? "animate-spin" : ""} /> Rescan
              </button>
            </div>
            <ScrollArea className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {targets.map((target, i) => {
                    const isPending = pendingClaims.includes(target.id);
                    const isEngaged = engagedTargets.includes(target.id);
                    const isKilled = killedTargets.includes(target.id);
                    const avatar = target.avatar || "/avatars/1.jpg";
                    const isGhost = target.isGhost; 
                    return (
                        <div key={target.id} className={cn("group relative bg-black/60 border-2 backdrop-blur-xl overflow-hidden rounded-xl transition-all duration-300 hover:shadow-2xl", isKilled ? "border-green-600 opacity-60 grayscale" : isGhost ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]" : isEngaged ? "border-red-600 shadow-red-600/40" : "border-white/10 hover:border-red-500/50")} style={{ animationDelay: `${i * 100}ms` }}>
                            {isKilled && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"><div className="text-4xl font-black text-green-500 uppercase -rotate-12 border-4 border-green-500 p-4 animate-in zoom-in duration-300">ELIMINATED</div></div>}
                            <div className="p-5 flex flex-col h-full justify-between gap-4">
                                <div className="flex gap-4 items-start">
                                    <div className={cn("relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2", isGhost ? "border-purple-500" : "border-white/20")}><Image src={avatar} alt="Target" fill className="object-cover" /></div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start mb-1"><h3 className={cn("text-lg font-black uppercase truncate", isGhost ? "text-purple-400" : "text-white")}>{target.username}</h3><span className={cn("text-lg font-black", isGhost ? "text-purple-400" : "text-yellow-400")}>{target.bounty} <span className="text-[10px] text-neutral-500">PC</span></span></div>
                                        <div className="text-xs font-mono text-neutral-500 uppercase mb-2">Rank: {target.membership?.tier || "Recruit"}</div>
                                        <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden"><div className={cn("h-full transition-all duration-1000", isGhost ? "bg-purple-600" : "bg-red-600")} style={{ width: `${target.threatLevel}%` }} /></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                                    <button onClick={() => handleEngage(target.id, target.instagramHandle)} className="py-2.5 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-400 font-bold uppercase text-[10px] tracking-widest border border-cyan-900 hover:border-cyan-500 transition-all rounded flex items-center justify-center gap-2"><Search size={14} /> Lock On</button>
                                    {isPending ? <div className="py-2.5 bg-yellow-950/40 text-yellow-500 font-bold uppercase text-[10px] tracking-widest border border-yellow-900 flex items-center justify-center gap-2 rounded"><Loader2 size={14} className="animate-spin" /> Verifying</div> : <button onClick={() => handleConfirmKill(target.id, target.username, target.bounty || 50)} disabled={!isEngaged || isKilled} className={cn("py-2.5 font-bold uppercase text-[10px] tracking-widest border transition-all rounded flex items-center justify-center gap-2", isEngaged && !isKilled ? "bg-red-950/40 hover:bg-red-900/60 text-red-500 hover:text-white border-red-900 hover:border-red-500" : "bg-neutral-900 text-neutral-600 border-neutral-800 cursor-not-allowed")}><Crosshair size={14} /> Execute</button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {mode === "REPORT" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-lg bg-black/80 border-2 border-yellow-600/60 backdrop-blur-xl rounded-2xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
              <div className="flex items-center gap-4 mb-6"><Target size={32} className="text-yellow-500 animate-pulse" /><HackerText text="Manual_Scouting" className="text-xl md:text-2xl font-black text-yellow-400" /></div>
              <p className="text-xs md:text-sm font-mono text-neutral-400 mb-8 uppercase leading-relaxed border-l-2 border-yellow-800 pl-4">Found a target off the grid?<br/>Submit their coordinates for manual review and bonus credits.</p>
              <form onSubmit={handleReport} className="space-y-6">
                <div><label className="block text-[10px] md:text-xs font-mono text-yellow-600 uppercase mb-2 tracking-widest">Target Coordinates (URL)</label><Input placeholder="HTTPS://INSTAGRAM.COM/..." value={reportUrl} onChange={(e) => setReportUrl(e.target.value)} className="h-12 bg-black/50 border-2 border-yellow-600/30 text-white font-mono text-xs uppercase focus:border-yellow-500 rounded-none placeholder:text-neutral-700" /></div>
                <Button type="submit" disabled={reporting} className="w-full h-12 text-sm font-black uppercase tracking-[0.2em] bg-yellow-600 hover:bg-yellow-500 text-black shadow-lg shadow-yellow-600/20 rounded-none">{reporting ? "TRANSMITTING..." : "UPLOAD INTEL"}</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}