"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; 
import { 
  Crosshair, Search, Loader2, Target, 
  Wifi, Radar, AlertTriangle, 
  Activity, RefreshCw, Database, 
  Terminal, ShieldCheck, Box, LineChart, CheckCircle2,
  Swords, Flame, Trophy, Users, Briefcase
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

// MOCK: Live Network Feed -> High-ticket marketing retainers
const FAKE_GLOBAL_YIELDS = [
  { operator: "NODE_ALPHA", asset: "SAAS_SEO_AUDIT", amount: 15000, time: "2m ago" },
  { operator: "YIELD_MAX", asset: "REELS_ENGINE", amount: 28000, time: "5m ago" },
  { operator: "CYBER_CAPITAL", asset: "D2C_META_ADS", amount: 19000, time: "8m ago" },
  { operator: "VOID_STALKER", asset: "PR_DISTRIBUTION", amount: 42000, time: "12m ago" },
];

export default function LeadScannerPage() {
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

  // FX: Subtle Terminal Glitch
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // FX: Conversion Tracker
  useEffect(() => {
    if (killedTargets.length > 0) {
      setKillStreak(prev => prev + 1);
      // Adjusted simulated value for marketing retainers
      setTotalBountiesClaimed(prev => prev + 12500);
    }
  }, [killedTargets.length]);

  // 1. SCANNER LOGIC (Finding Leads)
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
                threatLevel: Math.floor(Math.random() * 80) + 10, // Treated as "Conversion Friction"
                bounty: 5000 + Math.floor(Math.random() * 15000), // Real retainer values
                isGhost: false
              }));

              if (Math.random() < 0.2) {
                  const darkAsset = {
                      id: "ghost_" + Date.now(),
                      username: "ENTERPRISE TARGET",
                      avatar: "/avatars/boss_1.jpg",
                      threatLevel: 99,
                      bounty: 50000,
                      isGhost: true,
                      membership: { tier: "Un-Optimized" },
                      instagramHandle: "instagram"
                  };
                  data = [darkAsset, ...data];
                  toast.warning("⚠ HIGH-TICKET ENTERPRISE LEAD DETECTED");
              }
              
              setTargets(data);
              setMode("ENGAGE");
              play("success");
              toast.success("RADAR LOCKED // PROSPECTS ACQUIRED");
          } catch (e) {
              toast.error("RADAR JAMMED // TRY AGAIN");
          } finally {
              setIsScanning(false);
              clearInterval(progressInterval);
              setScanProgress(0);
          }
      }, 3000);
  };

  // 2. ENGAGE (Audit the Lead)
  const handleEngage = (id: string, handle: string) => {
      play("lock");
      if (handle) {
          window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
          if (!engagedTargets.includes(id)) {
            setEngagedTargets(prev => [...prev, id]);
            toast.info("LEAD PROFILE ACCESSED // INITIATE AUDIT");
          }
      } else {
          toast.info("CLASSIFIED LEAD // PROFILE HIDDEN");
      }
  };

  // 3. CONFIRM KILL (SECURE RETAINER)
  const handleConfirmKill = async (targetId: string, targetName: string, bounty: number) => {
      if (!userData) return;
      play("shot");
      setKilledTargets(prev => [...prev, targetId]);

      try {
          const batch = writeBatch(db);
          
          const myRef = doc(db, "users", userData.uid);
          batch.update(myRef, {
             "wallet.credits": increment(bounty), // Changed to credits based on auth-context
             "dailyTracker.tasksCompleted": increment(1)
          });

          const killRef = doc(collection(db, "kill_claims")); // Kept kill_claims for DB stability
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
             toast.success(`CONTRACT SECURED! +₹${bounty.toLocaleString()} ESCROWED`);
          }, 600);

      } catch (e) { 
          toast.error("NEGOTIATION FAILED // REVERTING");
          setKilledTargets(prev => prev.filter(id => id !== targetId)); 
      }
  };

  // 4. REPORT (Manual Prospecting)
  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      play("click");
      if (!reportUrl.includes("instagram.com")) return toast.error("INVALID LEAD COORDINATES");
      setReporting(true);
      
      setTimeout(() => {
          setReporting(false);
          setReportUrl("");
          setMode("SCAN");
          toast.success("LEAD SUBMITTED TO PIPELINE // +₹500 FINDER FEE");
      }, 1500);
  };

  return (
    <main className={cn(
        "relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-cyan-500 selection:text-black", 
        glitch && "invert opacity-90 transition-all duration-75"
    )}>
      
      {/* ATMOSPHERE - Cyber Radar Theme */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Swapped peach map to a tech/radar map, but keeping the overlay styling */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1)_0%,transparent_80%)]" />
        <Image 
          src="/images/radar-bg.jpg" 
          alt="Network Radar" 
          fill 
          priority
          className="object-cover opacity-10 grayscale contrast-150 mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/70 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* TOP HUD - Syndicate Scouting Ops */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 flex items-center justify-center border border-cyan-500/40 bg-white/5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Radar size={26} className="text-cyan-400" />
            </div>
            <div>
              <HackerText text="PROSPECT ACQUISITION RADAR" className="text-xl md:text-2xl font-medium tracking-widest uppercase text-cyan-400" />
              <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mt-1">Audit • Pitch • Secure Retainer</span>
            </div>
          </div>

          {/* Live Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 w-full md:w-auto border border-cyan-500/30 p-3 bg-white/5 rounded-full backdrop-blur-sm">
            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1 tracking-widest">CONTRACT STREAK</span>
              <div className="flex items-center gap-2">
                <Flame size={16} className={killStreak > 3 ? "text-purple-500 animate-pulse" : "text-neutral-500"} />
                <span className="text-xl font-mono text-white">{killStreak}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />

            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block mb-1 tracking-widest">TOTAL PIPELINE</span>
              <span className="text-xl font-mono text-emerald-400">₹{totalBountiesClaimed.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">RADAR LIVE</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/10 bg-[#050505]">
          <button 
            onClick={() => setMode("SCAN")} 
            className={cn(
                "flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-all border-r border-white/10 flex items-center justify-center gap-2", 
                mode === "SCAN" || mode === "ENGAGE" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400"
            )}
          >
            <Radar size={14} /> SCRAPE LEADS
          </button>
          <button 
            onClick={() => setMode("REPORT")} 
            className={cn(
                "flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-2", 
                mode === "REPORT" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400"
            )}
          >
            <Terminal size={14} /> MANUAL PROSPECT
          </button>
        </div>
      </header>

      {/* MAIN ARENA */}
      <div className="relative z-40 flex-1 overflow-hidden flex flex-col">
        
        {/* SCANNING STATE */}
        {(mode === "SCAN" || (mode === "ENGAGE" && targets.length === 0)) && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 px-6 py-12 overflow-y-auto">
            <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center border-4 border-cyan-500/30 bg-[#050505] rounded-full shadow-[0_0_60px_rgba(6,182,212,0.1)]">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:12px_12px]" />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-cyan-500/40 rounded-full animate-ping" />
                  <div className="absolute w-48 h-48 border-2 border-purple-500 rounded-full animate-[spin_1.5s_linear_infinite]" />
                </div>
              )}
              
              <div className="relative z-10 text-center">
                {isScanning ? (
                  <>
                    <Loader2 size={42} className="text-cyan-400 animate-spin mx-auto mb-6" />
                    <Progress value={scanProgress} className="w-48 h-1 mx-auto mb-6 bg-white/10 [&>div]:bg-cyan-400" />
                    <HackerText text="SCRAPING INSTAGRAM PIPELINE..." className="text-xs font-mono tracking-widest text-cyan-400" />
                  </>
                ) : (
                  <>
                    <Radar size={72} className="text-cyan-500/30 mx-auto mb-6" />
                    <span className="text-xs font-mono uppercase tracking-[4px] text-neutral-500">SYSTEM IDLE</span>
                  </>
                )}
              </div>
            </div>

            <Button 
                onClick={performScan} 
                disabled={isScanning} 
                className="w-full max-w-xs h-16 text-sm font-mono uppercase tracking-[0.2em] bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all rounded-none shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            >
                {isScanning ? "ANALYZING DATA..." : "INITIATE SWEEP"}
            </Button>
          </div>
        )}

        {/* WILD ENCOUNTERS GRID */}
        {mode === "ENGAGE" && targets.length > 0 && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 shrink-0 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <HackerText text={`PROSPECTS IDENTIFIED: ${targets.length}`} className="text-sm font-mono tracking-widest uppercase text-white" />
              </div>
              <button 
                onClick={performScan} 
                className="flex items-center gap-2 text-xs font-mono uppercase text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-400 px-5 py-2 transition-all bg-black/50"
              >
                <RefreshCw size={14} className={isScanning ? "animate-spin" : ""} /> RE-SCAN
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
                              isKilled ? "opacity-40 grayscale" : "hover:bg-cyan-950/20"
                          )} 
                          style={{ animationDelay: `${i * 60}ms` }}
                        >
                            {isKilled && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                                    <div className="text-center">
                                      <Briefcase size={48} className="text-emerald-400 mx-auto mb-3" />
                                      <div className="font-mono tracking-widest text-emerald-400 text-lg uppercase">Contract Secured</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-8">
                                <span className={cn(
                                    "text-xs font-mono border px-4 py-1.5 uppercase tracking-widest",
                                    isGhost ? "border-purple-500 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]" : "border-white/30 text-neutral-400"
                                )}>
                                    ID_{target.id.slice(0,6)}
                                </span>
                                <div className="text-right">
                                    <span className="block text-xs font-mono text-neutral-500 uppercase mb-1">Est. Retainer</span>
                                    <span className="text-3xl font-black text-cyan-400">₹{target.bounty.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className="flex gap-6 items-center flex-1">
                                <div className={cn(
                                    "relative w-20 h-20 shrink-0 border-2 overflow-hidden rounded-2xl", 
                                    isGhost ? "border-purple-500" : "border-white/30"
                                )}>
                                    <Image src={avatar} alt="Lead" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-2xl font-bold tracking-tight text-white mb-1 truncate">
                                        {target.username}
                                    </h3>
                                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                                      {target.membership?.tier || "Un-Optimized"}
                                    </div>
                                    
                                    <div className="mt-6">
                                      <div className="flex justify-between text-[9px] font-mono uppercase mb-1 text-neutral-500 tracking-widest">
                                        <span>Conversion Friction</span>
                                        <span>{target.threatLevel}%</span>
                                      </div>
                                      <div className="h-px bg-white/20">
                                        <div className="h-full bg-purple-500 transition-all" style={{ width: `${target.threatLevel}%` }} />
                                      </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mt-auto">
                                <button 
                                    onClick={() => handleEngage(target.id, target.instagramHandle)} 
                                    className="py-4 bg-[#050505] hover:bg-white/10 text-cyan-400 hover:text-cyan-300 font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    <Search size={15} /> AUDIT ASSET
                                </button>
                                
                                {isPending ? (
                                    <div className="py-4 bg-[#050505] text-white font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                                        <Loader2 size={15} className="animate-spin" /> VERIFYING...
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleConfirmKill(target.id, target.username, target.bounty || 5000)} 
                                        disabled={!isEngaged || isKilled} 
                                        className={cn(
                                            "py-4 font-mono uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all",
                                            isEngaged && !isKilled 
                                                ? "bg-cyan-600 text-black hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]" 
                                                : "bg-[#050505] text-neutral-700 cursor-not-allowed"
                                        )}
                                    >
                                        <Briefcase size={15} /> CLOSE DEAL
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

        {/* REPORT LEAD PIPELINE */}
        {mode === "REPORT" && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
            <div className="w-full max-w-lg bg-[#050505] border border-cyan-500/40 p-12 md:p-16 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
              <div className="flex items-center gap-4 mb-10">
                  <Terminal size={32} className="text-cyan-400" />
                  <HackerText text="MANUAL PIPELINE ENTRY" className="text-2xl font-medium tracking-widest uppercase text-white" />
              </div>
              
              <p className="text-sm font-mono text-neutral-400 mb-10 leading-relaxed">
                Found a high-ticket creator or brand off-radar?<br/>
                Submit their URL for auditing. +₹500 finder's fee on verified leads.
              </p>
              
              <form onSubmit={handleReport} className="space-y-8">
                <div>
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase mb-4 tracking-widest">LEAD INSTAGRAM URL</label>
                    <Input 
                        placeholder="https://instagram.com/..." 
                        value={reportUrl} 
                        onChange={(e) => setReportUrl(e.target.value)} 
                        className="h-14 bg-transparent border-cyan-500/30 text-white font-mono text-sm uppercase focus:border-cyan-400 rounded-none placeholder:text-neutral-600 transition-colors" 
                    />
                </div>
                
                <Button 
                    type="submit" 
                    disabled={reporting} 
                    className="w-full h-16 text-[10px] font-mono font-black uppercase tracking-[0.2em] bg-cyan-600 text-black hover:bg-cyan-500 rounded-none transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                    {reporting ? "TRANSMITTING..." : "SUBMIT PROSPECT"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}