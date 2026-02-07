"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image"; 
import { 
  Crosshair, Search, Loader2, Target, Skull, User, 
  Wifi, Radar, ShieldAlert, Zap, Globe, RefreshCw
} from "lucide-react";
import { collection, addDoc, getDocs, query, where, limit, orderBy } from "firebase/firestore";
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

export default function HitListPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx(); 
  
  // MODES
  const [mode, setMode] = useState<"SCAN" | "ENGAGE" | "REPORT">("SCAN");
  
  // DATA
  const [targets, setTargets] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  // TRACKING
  const [engagedTargets, setEngagedTargets] = useState<string[]>([]); 
  const [pendingClaims, setPendingClaims] = useState<string[]>([]);
  const [killedTargets, setKilledTargets] = useState<string[]>([]); // Local state for "Stamp" effect

  // FORM DATA
  const [reportUrl, setReportUrl] = useState("");
  const [reporting, setReporting] = useState(false);

  // 1. THE SCANNER LOGIC
  const performScan = async () => {
      if (!user) return;
      setIsScanning(true);
      play("scan"); // Ensure you have a scan sound or use 'click' loop
      
      // Artificial delay for immersion
      setTimeout(async () => {
          try {
              // Fetch random active users (excluding self)
              // In production, use more complex logic (e.g. within Rank range)
              const q = query(
                  collection(db, "users"), 
                  where("uid", "!=", user.uid),
                  limit(10)
              );
              const snapshot = await getDocs(q);
              const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              
              setTargets(data);
              setMode("ENGAGE");
              play("success");
          } catch (e) {
              toast.error("SCAN FAILED // SIGNAL JAMMED");
          } finally {
              setIsScanning(false);
          }
      }, 2000);
  };

  // 2. EXECUTE (Open Link)
  const handleEngage = (id: string, handle: string) => {
      play("lock");
      if (handle) {
          window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
          if (!engagedTargets.includes(id)) setEngagedTargets(prev => [...prev, id]);
      } else {
          toast.info("NO DIGITAL FOOTPRINT // TARGET GHOSTED");
      }
  };

  // 3. CONFIRM KILL (The Dopamine Hit)
  const handleConfirmKill = async (targetId: string, targetName: string) => {
      if (!userData) return;
      play("shot"); // LOUD SOUND
      
      // Visual Feedback Immediately
      setKilledTargets(prev => [...prev, targetId]);

      try {
          await addDoc(collection(db, "kill_claims"), {
              killerId: userData.uid,
              killerName: userData.username,
              targetId: targetId,
              targetName: targetName, 
              amount: 50,
              status: "pending",
              timestamp: new Date().toISOString()
          });
          setPendingClaims(prev => [...prev, targetId]);
          
          setTimeout(() => {
             toast.success("CONFIRMED // BOUNTY PENDING");
          }, 500);

      } catch (e) { 
          toast.error("TRANSMISSION ERROR");
          setKilledTargets(prev => prev.filter(id => id !== targetId)); // Revert if fail
      }
  };

  // 4. REPORT TARGET
  const handleReport = async (e: React.FormEvent) => {
      e.preventDefault();
      play("click");
      if (!reportUrl.includes("instagram.com")) return toast.error("INVALID INTEL");
      
      setReporting(true);
      try {
          await addDoc(collection(db, "scouting_reports"), {
              submittedBy: userData?.uid,
              reporterName: userData?.username,
              url: reportUrl,
              status: "pending",
              timestamp: new Date().toISOString()
          });
          toast.success("INTEL UPLOADED");
          setReportUrl("");
          setMode("SCAN");
      } catch (e) { toast.error("ERROR"); }
      finally { setReporting(false); }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center selection:bg-red-900 selection:text-white">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/radar-bg.jpg" alt="Grid" fill className="object-cover opacity-30 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* --- HUD HEADER --- */}
      <header className="flex-none h-20 w-full max-w-md px-6 flex items-end justify-between pb-4 border-b border-white/10 z-50">
          <div>
              <div className="flex items-center gap-2 text-red-500 animate-pulse mb-1">
                  <Wifi size={12} />
                  <span className="text-[8px] font-mono tracking-widest uppercase">Signal_Strength: 98%</span>
              </div>
              <h1 className="text-2xl font-black font-sans uppercase italic text-white tracking-tighter leading-none">
                  Hit_List
              </h1>
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={() => setMode("SCAN")}
                  className={cn("w-10 h-10 border flex items-center justify-center transition-all", mode === "SCAN" || mode === "ENGAGE" ? "bg-white text-black border-white" : "bg-black text-neutral-500 border-white/20")}
              >
                  <Radar size={18} />
              </button>
              <button 
                  onClick={() => setMode("REPORT")}
                  className={cn("w-10 h-10 border flex items-center justify-center transition-all", mode === "REPORT" ? "bg-red-600 text-white border-red-600" : "bg-black text-neutral-500 border-white/20")}
              >
                  <Crosshair size={18} />
              </button>
          </div>
      </header>

      {/* --- MAIN VIEWPORT --- */}
      <div className="relative z-40 w-full max-w-md flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
          
          {/* VIEW: SCANNER */}
          {mode === "SCAN" && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center">
                      {/* Radar Rings */}
                      <div className={cn("absolute inset-0 border border-red-500/30 rounded-full", isScanning && "animate-ping")} />
                      <div className={cn("absolute w-[80%] h-[80%] border border-red-500/20 rounded-full", isScanning && "animate-[spin_3s_linear_infinite]")} />
                      
                      {/* Center Icon */}
                      <div className="relative z-10 bg-black p-4 border border-white/20 rounded-full">
                          {isScanning ? <Loader2 size={32} className="text-red-500 animate-spin" /> : <Globe size={32} className="text-neutral-500" />}
                      </div>
                  </div>

                  <div className="space-y-2">
                      <h2 className="text-xl font-black font-sans uppercase text-white">
                          {isScanning ? <HackerText text="ACQUIRING_TARGETS..." speed={50} /> : "SECTOR SCAN READY"}
                      </h2>
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest max-w-[200px] mx-auto">
                          Scan the database for active bounties in your vicinity.
                      </p>
                  </div>

                  <Button 
                      onClick={performScan}
                      disabled={isScanning}
                      className="h-14 w-full bg-red-600 hover:bg-red-500 text-white font-black text-lg uppercase tracking-[0.2em] rounded-none clip-path-slant shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                  >
                      {isScanning ? "SCANNING..." : "INITIATE SCAN"}
                  </Button>
              </div>
          )}

          {/* VIEW: ENGAGE (The List) */}
          {mode === "ENGAGE" && (
              <div className="space-y-4 animate-in slide-in-from-bottom-10 duration-500">
                  <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Targets_Identified: {targets.length}</span>
                      <button onClick={performScan} className="text-[9px] font-mono text-red-500 hover:text-white flex items-center gap-1 uppercase">
                          <RefreshCw size={10} /> Refresh
                      </button>
                  </div>

                  {targets.map((target, i) => {
                      const isPending = pendingClaims.includes(target.id);
                      const isEngaged = engagedTargets.includes(target.id);
                      const isKilled = killedTargets.includes(target.id);
                      const avatar = target.avatar || "/avatars/1.jpg";

                      return (
                          <div 
                              key={target.id} 
                              className={cn(
                                  "group relative bg-neutral-900/40 border backdrop-blur-md overflow-hidden transition-all duration-300",
                                  isKilled ? "border-green-500 opacity-50 grayscale" : 
                                  isEngaged ? "border-red-500 bg-red-950/10" : "border-white/10 hover:border-white/30"
                              )}
                          >
                              {/* KILL STAMP */}
                              {isKilled && (
                                  <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                                      <div className="border-4 border-green-500 text-green-500 font-black text-2xl uppercase p-2 -rotate-12 animate-in zoom-in duration-200">
                                          ELIMINATED
                                      </div>
                                  </div>
                              )}

                              <div className="flex p-4 gap-4 items-center">
                                  {/* AVATAR */}
                                  <div className="relative w-16 h-16 shrink-0 border border-white/10 group-hover:border-red-500/50 transition-colors">
                                      <Image src={avatar} alt="Target" fill className="object-cover grayscale group-hover:grayscale-0 transition-all" />
                                      {/* Rank Badge */}
                                      <div className="absolute -bottom-2 -right-1 bg-black border border-white/20 px-1.5 py-0.5 text-[7px] font-mono text-white uppercase">
                                          {target.membership?.tier || "Recruit"}
                                      </div>
                                  </div>

                                  {/* INFO */}
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                          <h3 className="text-sm font-black font-sans uppercase text-white truncate">{target.username}</h3>
                                          <div className="text-right">
                                              <span className="block text-lg font-black font-mono text-yellow-500 leading-none">50</span>
                                              <span className="text-[7px] font-mono text-neutral-500 uppercase">Bounty</span>
                                          </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-[8px] font-mono text-neutral-400 uppercase">
                                          <ShieldAlert size={10} className={isEngaged ? "text-red-500" : "text-neutral-600"} />
                                          {isEngaged ? "STATUS: ENGAGED" : "STATUS: UNKNOWN"}
                                      </div>
                                  </div>
                              </div>

                              {/* ACTIONS */}
                              <div className="grid grid-cols-2 border-t border-white/10">
                                  <button 
                                      onClick={() => handleEngage(target.id, target.instagramHandle)}
                                      className="h-10 text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2 border-r border-white/10"
                                  >
                                      <Search size={10} /> LOCATE
                                  </button>
                                  
                                  {isPending ? (
                                      <div className="h-10 bg-yellow-500/10 flex items-center justify-center gap-2 text-[9px] font-bold text-yellow-500 uppercase cursor-wait">
                                          <Loader2 size={10} className="animate-spin" /> VERIFYING
                                      </div>
                                  ) : (
                                      <button 
                                          onClick={() => handleConfirmKill(target.id, target.username)}
                                          disabled={isKilled}
                                          className={cn(
                                              "h-10 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                              isEngaged ? "bg-red-600 text-white hover:bg-red-500" : "bg-black text-neutral-600 cursor-not-allowed"
                                          )}
                                      >
                                          <Crosshair size={10} /> CONFIRM_KILL
                                      </button>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {/* VIEW: REPORT (Intel) */}
          {mode === "REPORT" && (
              <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="p-6 bg-neutral-900/40 border border-white/10 backdrop-blur-xl">
                      <div className="flex items-center gap-3 mb-4 text-white">
                          <Target size={20} className="text-yellow-500" />
                          <h2 className="text-lg font-black font-sans uppercase italic">Manual Entry</h2>
                      </div>
                      <p className="text-[10px] font-mono text-neutral-400 mb-6 uppercase leading-relaxed">
                          Found a target not on the radar? <br/> Upload their coordinates (Instagram URL) for manual bounty assignment.
                      </p>

                      <form onSubmit={handleReport} className="space-y-4">
                          <div className="space-y-1">
                              <label className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Target_Link</label>
                              <Input 
                                  placeholder="HTTPS://INSTAGRAM.COM/..." 
                                  value={reportUrl} 
                                  onChange={(e) => setReportUrl(e.target.value)} 
                                  className="bg-black/50 border-white/10 text-[10px] h-12 text-white font-mono uppercase" 
                              />
                          </div>
                          <Button 
                              type="submit" 
                              disabled={reporting} 
                              className="w-full h-12 bg-white text-black font-black text-[9px] uppercase tracking-[0.2em] rounded-sm hover:bg-neutral-200"
                          >
                              {reporting ? "UPLOADING..." : "SUBMIT INTEL"}
                          </Button>
                      </form>
                  </div>
              </div>
          )}

      </div>

      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%);
        }
      `}</style>
    </main>
  );
}