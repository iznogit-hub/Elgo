"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { doc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Crown, Lock, Megaphone, ArrowLeft, 
  Zap, Send, ShieldCheck, Globe, Loader2, Radio,
  Trophy, Flame, Diamond, Users, Vote, TrendingUp,
  AlertTriangle, Sparkles, Skull, BarChart3, Wallet,
  GanttChart, Database, Activity, Terminal, Briefcase
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- SYNDICATE INTELLIGENCE (Marketing Agency Lingo) ---
const FAKE_BROADCAST_LOG = [
  { author: "OVERSEER_NODE", content: "ALL OPERATIVES: ALGORITHM SHIFT DETECTED ON INSTAGRAM REELS. PRIORITIZE 3-SECOND HOOKS.", time: "2h ago", influence: "+240 Leads" },
  { author: "SYNDICATE_COUNCIL", content: "NEW B2B PAYLOAD UNLOCKED: LINKEDIN FOUNDER AUTHORITY // ALLOCATE BANDWIDTH NOW", time: "5h ago", influence: "+580 MRR" },
  { author: "EXECUTIVE_VOID", content: "BOARD DIRECTIVE: DEPLOY OMNICHANNEL RETARGETING FOR ALL E-COM RETAINERS.", time: "1d ago", influence: "+920 Conversions" },
];

// Backend keys remain unchanged for DB safety, UI labels map to Agency Tiers
const TIER_STATS = {
  recruit: { next: "elite", label: "Junior Operative", cost: 5000, color: "text-neutral-500" },
  elite: { next: "inner_circle", label: "Senior Strategist", cost: 15000, color: "text-cyan-400" },
  inner_circle: { next: "council", label: "Agency Partner", cost: 50000, color: "text-purple-400" },
  council: { next: "max_level", label: "Syndicate Overseer", cost: 0, color: "text-white font-bold" },
};

export default function HighCommandPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { play } = useSfx();
  
  const [prPitch, setPrPitch] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [claimingStipend, setClaimingStipend] = useState(false);
  
  // Fake Ecosystem Stats (Agency Scale)
  const [councilStats, setCouncilStats] = useState({ 
    totalFunds: 12500000, // Total Escrow Managed
    activeMembers: 47, 
    broadcasts: 312, 
    totalInfluence: 842000 // Total Impressions/Reach
  });

  // SAFE FALLBACKS
  if (loading || !userData) return <LoadingState />;

  const tier = (userData?.membership?.tier as keyof typeof TIER_STATS) || "recruit";
  const isVIP = tier === "council" || tier === "inner_circle" || tier === "elite";
  const popCoins = userData?.wallet?.credits ?? 0; // Adapted from popCoins to credits based on your auth-context
  
  // Progression Logic
  const currentTierData = TIER_STATS[tier] || TIER_STATS.recruit;
  const nextTierCost = currentTierData.cost;
  const progressPercent = tier === "council" ? 100 : Math.min(100, (popCoins / nextTierCost) * 100);

  const handleRestrictedAction = () => {
      play("error");
      toast.error("ACCESS DENIED // INSUFFICIENT CLEARANCE");
      setTimeout(() => router.push("/dossier"), 1500);
  };

  const handlePrSubmit = async () => {
    if (!isVIP) return handleRestrictedAction();
    if (!prPitch.trim()) return toast.error("EMPTY TRANSMISSION // INVALID PROTOCOL");
    
    setSubmittingPr(true);
    play("click");

    try {
      await addDoc(collection(db, "pr_requests"), {
        uid: userData.uid,
        username: userData.username ?? "NODE_OPERATOR",
        pitch: prPitch,
        tier: tier,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      play("success");
      toast.success("PROTOCOL TRANSMITTED // NETWORK DEPLOYMENT IMMINENT");
      setPrPitch("");
    } catch (e) {
      play("error");
      toast.error("UPLINK INTERFERENCE // RETRY");
    } finally {
      setSubmittingPr(false);
    }
  };

  const handleClaimStipend = async () => {
    if (!isVIP) return handleRestrictedAction();
    
    setClaimingStipend(true);
    play("kaching");

    try {
      const stipendAmount = tier === "council" ? 5000 : tier === "inner_circle" ? 1000 : 500;
      await updateDoc(doc(db, "users", userData.uid), {
        "wallet.credits": increment(stipendAmount), // Using credits
        "dailyTracker.tasksCompleted": increment(1) // Adapted from bountiesClaimed
      });
      play("success");
      toast.success(`AGENCY RETAINER SECURED // +${stipendAmount} LEDGER CLEARANCE`);
    } catch (e) {
      play("error");
      toast.error("LEDGER ERROR // CONTACT INFRASTRUCTURE");
    } finally {
      setClaimingStipend(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* ATMOSPHERE - Cyber Agency Data Center */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />
      <Background />

      {/* TOP HUD - 1px Architectural Grid */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 border border-cyan-500/30 bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <ArrowLeft size={20} />
            </div>
            <div>
                <span className="block text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">Return to</span>
                <span className="text-sm font-bold text-white uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Command Center</span>
            </div>
          </TransitionLink>

          <div className="flex flex-wrap items-center gap-6 border border-white/10 p-2 bg-white/5 backdrop-blur-sm">
            <div className="text-left md:text-right px-4">
                <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Clearance Level</span>
                <div className={cn("text-lg font-mono uppercase tracking-widest drop-shadow-md", currentTierData.color)}>
                    {currentTierData.label}
                </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />
            
            <div className="text-left md:text-right px-4">
                <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Agency Ledger</span>
                <span className="text-2xl font-mono text-white tabular-nums leading-none tracking-tight">{popCoins.toLocaleString()}</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN BOARDROOM GRID */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-px bg-white/10 overflow-hidden border-b border-white/10">

        {/* --- LEFT: THE BOARDROOM (Personal Command) --- */}
        <aside className="w-full lg:w-[45%] flex flex-col bg-[#050505] p-6 md:p-10 shrink-0">

          {/* 1. EXECUTIVE STATUS CARD */}
          <div className="relative border border-white/10 bg-[#050505]/40 flex-1 min-h-[400px] flex flex-col mb-8 group hover:border-cyan-500/40 transition-colors shadow-2xl backdrop-blur-md">
            
            {!isVIP && (
              <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-6 text-center p-8">
                <Lock size={48} className="text-cyan-500/50 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" strokeWidth={1} />
                <div>
                    <h2 className="text-xl font-medium text-white uppercase tracking-widest mb-2">Restricted Access</h2>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest max-w-[250px] mx-auto leading-relaxed">
                      Only Authorized Strategists may access the Syndicate Boardroom.
                    </p>
                </div>
                <TransitionLink href="/dossier">
                    <Button className="bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-[10px] font-black uppercase tracking-widest px-8 h-12 rounded-none shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        Acquire Clearance
                    </Button>
                </TransitionLink>
              </div>
            )}

            <div className="relative z-10 p-8 md:p-10 flex flex-col h-full">
              
              <div className="flex items-center gap-6 mb-12 border-b border-white/10 pb-8">
                  <div className="w-16 h-16 bg-[#050505] border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                    <Briefcase size={28} className={cn("text-cyan-400", isVIP && "animate-pulse")} strokeWidth={1.5} />
                  </div>
                  <div>
                      <HackerText text={isVIP ? "SYNDICATE_BOARDROOM" : "SYSTEM_LOCKED"} className="text-2xl font-medium text-white uppercase tracking-widest mb-1" />
                      <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-[0.2em]">High-Command Control Node</span>
                  </div>
              </div>

              {/* PERKS GRID - 1px Architecture */}
              <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 mb-10">
                <div className="bg-[#050505] p-6 group-hover:bg-cyan-950/20 transition-colors text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 text-purple-400">
                        <Database size={14} />
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Retainer</span>
                    </div>
                    <span className="text-2xl font-mono text-white tracking-tight drop-shadow-md">
                        {tier === "council" ? "5,000" : tier === "inner_circle" ? "1,000" : tier === "elite" ? "500" : "0"}
                    </span>
                </div>
                <div className="bg-[#050505] p-6 group-hover:bg-cyan-950/20 transition-colors text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 text-cyan-400">
                        <Megaphone size={14} />
                        <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Directives</span>
                    </div>
                    <span className="text-2xl font-mono text-white tracking-tight drop-shadow-md">
                        {tier === "council" ? "Unlimited" : tier === "inner_circle" ? "3/Day" : tier === "elite" ? "1/Day" : "0"}
                    </span>
                </div>
              </div>

              {/* ACTION: CLAIM DIVIDEND */}
              <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">
                      <span>Capital Disbursement</span>
                      <span className={claimingStipend ? "text-purple-400" : "text-cyan-400 font-bold"}>{claimingStipend ? "PROCESSING" : "READY"}</span>
                  </div>
                  <Button 
                      onClick={handleClaimStipend}
                      disabled={claimingStipend || !isVIP}
                      className={cn(
                          "w-full h-14 font-mono text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-all",
                          isVIP 
                              ? "bg-cyan-600 text-black hover:bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                              : "bg-transparent border border-white/10 text-neutral-600 cursor-not-allowed"
                      )}
                  >
                      {claimingStipend ? <Loader2 className="animate-spin" size={16} /> : "Authorize Agency Retainer"}
                  </Button>
              </div>
            </div>
          </div>

          {/* 2. BROADCAST TERMINAL */}
          <div className="relative bg-[#050505] border border-white/10 flex flex-col group hover:border-purple-500/40 transition-colors shadow-2xl backdrop-blur-sm">
             <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                    <Radio size={16} className="text-purple-400 animate-pulse" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-white">Global_Mandate_Protocol</h3>
                </div>
             </div>

             <div className="relative p-6">
                 <textarea 
                    value={prPitch}
                    onChange={(e) => setPrPitch(e.target.value.toUpperCase())}
                    placeholder="ENTER SYNDICATE DIRECTIVE..."
                    disabled={!isVIP}
                    className="w-full h-32 bg-transparent border border-white/20 p-4 font-mono text-sm text-cyan-400 placeholder:text-neutral-600 focus:border-purple-500 outline-none resize-none transition-colors"
                 />
                 <div className="absolute bottom-10 right-10">
                     <span className="text-[9px] font-mono text-neutral-500">{prPitch.length}/140</span>
                 </div>
             </div>

             <div className="p-6 pt-0">
               <Button 
                  onClick={handlePrSubmit}
                  disabled={submittingPr || !prPitch.trim() || !isVIP}
                  className="w-full h-12 bg-transparent border border-purple-500/50 text-purple-400 font-mono font-black text-[10px] uppercase tracking-[0.2em] hover:bg-purple-500 hover:text-white transition-colors rounded-none shadow-[0_0_15px_rgba(168,85,247,0.1)]"
               >
                  {submittingPr ? <Loader2 className="animate-spin" size={16} /> : <><Send size={14} className="mr-3" /> Transmit Directive</>}
               </Button>
             </div>
          </div>

        </aside>

        {/* --- RIGHT: GLOBAL INTEL (The Map) --- */}
        <section className="flex-1 flex flex-col bg-[#050505]">
          
          <ScrollArea className="h-full">
            <div className="p-6 md:p-10 space-y-10">
              
              {/* ECOSYSTEM STATS - 1px Grid */}
              <div>
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                    <Globe size={20} className="text-cyan-500/50" />
                    <div>
                        <HackerText text="Syndicate_Ecosystem" className="text-lg font-medium tracking-widest uppercase text-white" />
                        <span className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">Global Macro Metrics</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 shadow-2xl">
                    <div className="bg-[#050505] p-6 md:p-8 hover:bg-cyan-950/20 transition-colors">
                        <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Active Operatives</span>
                        <span className="text-4xl font-mono text-white tracking-tighter">{councilStats.activeMembers}</span>
                    </div>
                    <div className="bg-[#050505] p-6 md:p-8 hover:bg-cyan-950/20 transition-colors">
                        <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Total Impressions</span>
                        <span className="text-4xl font-mono text-purple-400 tracking-tighter drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">{councilStats.totalInfluence.toLocaleString()}</span>
                    </div>
                    <div className="bg-[#050505] p-6 md:p-8 col-span-2 flex items-center justify-between hover:bg-cyan-950/20 transition-colors border-t border-white/10">
                        <div>
                            <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Global Escrow Cleared</span>
                            <span className="text-5xl font-mono text-cyan-400 tracking-tighter drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">₹{councilStats.totalFunds.toLocaleString()}</span>
                        </div>
                        <Database size={48} className="text-cyan-500/20" strokeWidth={1} />
                    </div>
                </div>
              </div>

              {/* RECENT DECREES */}
              <div>
                 <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                    <Terminal size={16} className="text-purple-400" />
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">Active Network Mandates</h3>
                 </div>
                 
                 <div className="flex flex-col gap-px bg-white/10 border border-white/10 shadow-2xl">
                    {FAKE_BROADCAST_LOG.map((log, i) => (
                        <div key={i} className="bg-[#050505] p-6 hover:bg-purple-950/20 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold font-mono text-black uppercase tracking-widest bg-purple-400 px-2 py-1 shadow-[0_0_10px_rgba(168,85,247,0.4)]">{log.author}</span>
                                <span className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase">{log.time}</span>
                            </div>
                            <p className="text-sm font-mono text-neutral-300 leading-relaxed uppercase tracking-tight mb-4">{log.content}</p>
                            <div className="flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-neutral-500">
                                <TrendingUp size={12} className="text-cyan-400" /> Market Impact: <span className="text-cyan-400">{log.influence}</span>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>

              {/* PROGRESSION BAR (If not Max Rank) */}
              {tier !== "council" && (
                  <div className="bg-[#050505] border border-white/10 p-8 shadow-2xl">
                      <div className="flex justify-between text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-4">
                          <span>Status: Elevating to {currentTierData.next.replace('_', ' ')}</span>
                          <span className="text-cyan-400">{popCoins.toLocaleString()} / {nextTierCost.toLocaleString()} CAP</span>
                      </div>
                      <Progress value={progressPercent} className="h-1 bg-white/10 rounded-none [&>div]:bg-cyan-500" />
                  </div>
              )}

            </div>
          </ScrollArea>
        </section>

      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-8 text-white font-mono">
      <div className="relative">
        <div className="absolute inset-0 animate-ping border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
        <Database size={32} className="relative z-10 text-cyan-500" strokeWidth={1} />
      </div>
      <HackerText text="AUTHENTICATING_EXECUTIVE_CLEARANCE..." className="text-xs uppercase tracking-[0.2em] text-neutral-500" speed={40} />
    </div>
  );
}