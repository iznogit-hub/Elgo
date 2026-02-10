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
  GanttChart
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

// --- MOCK INTELLIGENCE ---
const FAKE_BROADCAST_LOG = [
  { author: "WARLORD_ALPHA", content: "ALL UNITS: PRIORITIZE INSTAGRAM REELS WITH TRENDING AUDIO", time: "2h ago", influence: "+240" },
  { author: "NEON_COUNCIL", content: "NEW SECTOR UNLOCKED: FITNESS GRID // DEPLOY NOW", time: "5h ago", influence: "+580" },
  { author: "VOID_ELITE", content: "EXECUTIVE ORDER: DOUBLE BOUNTIES ON YOUTUBE TARGETS FOR 24H", time: "1d ago", influence: "+920" },
];

const TIER_STATS = {
  recruit: { next: "elite", cost: 5000, color: "text-neutral-400" },
  elite: { next: "inner_circle", cost: 15000, color: "text-yellow-400" },
  inner_circle: { next: "council", cost: 50000, color: "text-purple-400" },
  council: { next: "max_level", cost: 0, color: "text-red-500" },
};

export default function HighCommandPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { play } = useSfx();
  
  const [prPitch, setPrPitch] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [claimingStipend, setClaimingStipend] = useState(false);
  
  // Fake Ecosystem Stats
  const [councilStats, setCouncilStats] = useState({ 
    totalFunds: 1250000, 
    activeMembers: 47, 
    broadcasts: 312, 
    totalInfluence: 842000 
  });

  // SAFE FALLBACKS
  if (loading || !userData) return <LoadingState />;

  const tier = (userData?.membership?.tier as keyof typeof TIER_STATS) || "recruit";
  const isVIP = tier === "council" || tier === "inner_circle" || tier === "elite";
  const popCoins = userData?.wallet?.popCoins ?? 0;
  
  // Progression Logic
  const currentTierData = TIER_STATS[tier] || TIER_STATS.recruit;
  const nextTierCost = currentTierData.cost;
  const progressPercent = tier === "council" ? 100 : Math.min(100, (popCoins / nextTierCost) * 100);

  const handleRestrictedAction = () => {
      play("error");
      toast.error("ACCESS DENIED // INSUFFICIENT CLEARANCE");
      setTimeout(() => router.push("/dossier"), 1500); // Send to upgrade page
  };

  const handlePrSubmit = async () => {
    if (!isVIP) return handleRestrictedAction();
    if (!prPitch.trim()) return toast.error("EMPTY TRANSMISSION // INVALID ORDER");
    
    setSubmittingPr(true);
    play("click");

    try {
      await addDoc(collection(db, "pr_requests"), {
        uid: userData.uid,
        username: userData.username ?? "OPERATIVE",
        pitch: prPitch,
        tier: tier,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      play("success");
      toast.success("BROADCAST ORDER TRANSMITTED // GRID IMPACT IMMINENT");
      setPrPitch("");
    } catch (e) {
      play("error");
      toast.error("UPLINK JAMMED // RETRY");
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
        "wallet.popCoins": increment(stipendAmount),
        "dailyTracker.bountiesClaimed": increment(1)
      });
      play("success");
      toast.success(`WAR FUND PAYOUT SECURED // +${stipendAmount} PC`);
    } catch (e) {
      play("error");
      toast.error("VAULT BREACH DETECTED // CONTACT OVERSEER");
    } finally {
      setClaimingStipend(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-yellow-900 selection:text-black">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/inner-circle-bg.jpg" 
          alt="High Command"
          fill
          priority
          className="object-cover opacity-15 grayscale contrast-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
        {/* Imperial Glow */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-yellow-900/10 via-transparent to-transparent" />
      </div>

      <SoundPrompter />
      <Background />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-4 border-yellow-900/60 bg-black/90 backdrop-blur-2xl">
        <div className="px-6 py-6 flex items-center justify-between">
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 border-2 border-yellow-600/40 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-yellow-400 transition-all rounded-lg">
              <ArrowLeft size={24} className="text-neutral-500 group-hover:text-yellow-400" />
            </div>
            <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Return to</span>
                <span className="text-sm font-bold text-white uppercase group-hover:text-yellow-400 transition-colors">Field Operations</span>
            </div>
          </TransitionLink>

          <div className="flex items-center gap-8 text-right">
            <div>
                <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Clearance Level</span>
                <div className={cn("text-xl font-black uppercase tracking-tighter", currentTierData.color)}>
                    {tier}
                </div>
            </div>
            <div className="hidden md:block w-px h-8 bg-white/10" />
            <div className="hidden md:block">
                <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Personal Treasury</span>
                <span className="text-2xl font-black text-white tabular-nums">{popCoins.toLocaleString()} <span className="text-yellow-500 text-sm">PC</span></span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN WAR ROOM GRID */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-8 p-6 md:p-10 overflow-hidden">

        {/* --- LEFT: THE THRONE (Personal Command) --- */}
        <aside className="w-full lg:w-1/2 flex flex-col gap-8">

          {/* 1. VIP STATUS CARD */}
          <div className={cn(
              "relative bg-gradient-to-br from-yellow-950/20 to-black border-4 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl flex-1 min-h-[400px] flex flex-col",
              isVIP ? "border-yellow-600/50" : "border-red-900/50 opacity-90"
          )}>
            {!isVIP && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4 text-center p-6">
                <Lock size={64} className="text-red-600 animate-pulse" />
                <div>
                    <h2 className="text-2xl font-black text-red-500 uppercase tracking-widest">Restricted Area</h2>
                    <p className="text-xs font-mono text-neutral-400 mt-2">Only Elite Operatives may enter the High Command.</p>
                </div>
                <TransitionLink href="/dossier">
                    <Button className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest px-8">
                        Acquire Clearance
                    </Button>
                </TransitionLink>
              </div>
            )}

            <div className="relative z-10 p-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                    <Crown size={40} className={cn("text-yellow-500", isVIP && "animate-pulse")} />
                  </div>
                  <div>
                      <HackerText text={isVIP ? "HIGH_COMMAND" : "LOCKED"} className="text-4xl font-black text-white leading-none" />
                      <span className="text-xs font-mono text-yellow-600 uppercase tracking-[0.2em]">Sovereign Control Node</span>
                  </div>
              </div>

              {/* PERKS GRID */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-black/40 border border-white/10 p-5 rounded-xl hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                        <Zap size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Monthly Tribute</span>
                    </div>
                    <span className="text-3xl font-black text-white group-hover:text-yellow-400 transition-colors">
                        {tier === "council" ? "5k" : tier === "inner_circle" ? "1k" : tier === "elite" ? "500" : "0"}
                    </span>
                </div>
                <div className="bg-black/40 border border-white/10 p-5 rounded-xl hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-yellow-500">
                        <Megaphone size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Voice of God</span>
                    </div>
                    <span className="text-3xl font-black text-white group-hover:text-yellow-400 transition-colors">
                        {tier === "council" ? "∞" : tier === "inner_circle" ? "3" : tier === "elite" ? "1" : "0"}
                    </span>
                </div>
              </div>

              {/* ACTION: CLAIM STIPEND */}
              <div className="mt-auto">
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500 uppercase mb-2">
                      <span>Allowance Status</span>
                      <span className={claimingStipend ? "text-yellow-500" : "text-green-500"}>{claimingStipend ? "PROCESSING" : "READY"}</span>
                  </div>
                  <Button 
                      onClick={handleClaimStipend}
                      disabled={claimingStipend || !isVIP}
                      className={cn(
                          "w-full h-16 text-xl font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98]",
                          isVIP 
                              ? "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black shadow-yellow-900/20" 
                              : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                      )}
                  >
                      {claimingStipend ? <Loader2 className="animate-spin" /> : "CLAIM WAR FUND"}
                  </Button>
              </div>
            </div>
          </div>

          {/* 2. BROADCAST TERMINAL */}
          <div className="relative bg-black/80 border-2 border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col gap-6">
             <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <Radio size={20} className="text-red-500 animate-pulse" />
                    <h3 className="text-xl font-black uppercase italic text-white">Global_Broadcast</h3>
                </div>
                <div className="px-3 py-1 bg-red-950/30 border border-red-500/30 rounded text-[9px] font-bold text-red-400 uppercase">
                    Live Uplink
                </div>
             </div>

             <div className="relative">
                 <textarea 
                    value={prPitch}
                    onChange={(e) => setPrPitch(e.target.value.toUpperCase())}
                    placeholder="ENTER GLOBAL DIRECTIVE..."
                    disabled={!isVIP}
                    className="w-full h-32 bg-neutral-900/50 border border-white/10 p-4 font-mono text-sm text-yellow-500 placeholder:text-neutral-700 focus:border-yellow-500/50 focus:bg-neutral-900 outline-none resize-none rounded-lg"
                 />
                 <div className="absolute bottom-4 right-4">
                     <span className="text-[8px] font-mono text-neutral-600">{prPitch.length}/140 CHARS</span>
                 </div>
             </div>

             <Button 
                onClick={handlePrSubmit}
                disabled={submittingPr || !prPitch.trim() || !isVIP}
                className="w-full h-12 bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-all"
             >
                {submittingPr ? <Loader2 className="animate-spin" /> : <><Send size={16} className="mr-2" /> TRANSMIT ORDER</>}
             </Button>
          </div>

        </aside>

        {/* --- RIGHT: GLOBAL INTEL (The Map) --- */}
        <section className="flex-1 flex flex-col gap-8">
          
          {/* ECOSYSTEM STATS */}
          <div className="bg-gradient-to-br from-purple-950/20 to-black border-2 border-purple-500/30 backdrop-blur-2xl rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-8">
                <Globe size={32} className="text-purple-500" />
                <div>
                    <HackerText text="Council_Ecosystem" className="text-2xl font-black text-purple-100" />
                    <span className="text-xs font-mono text-purple-400/60 uppercase">Global Economy Metrics</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Active Overlords</span>
                    <span className="text-3xl font-black text-white">{councilStats.activeMembers}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                    <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Total Influence</span>
                    <span className="text-3xl font-black text-purple-400">{councilStats.totalInfluence.toLocaleString()}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 col-span-2 flex items-center justify-between">
                    <div>
                        <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Treasury Holdings</span>
                        <span className="text-4xl font-black text-yellow-400">{councilStats.totalFunds.toLocaleString()} PC</span>
                    </div>
                    <Diamond size={40} className="text-yellow-600 opacity-50" />
                </div>
            </div>
          </div>

          {/* RECENT DECREES */}
          <div className="flex-1 bg-black/60 border-2 border-white/10 backdrop-blur-xl rounded-3xl p-8 flex flex-col overflow-hidden">
             <h3 className="text-xl font-black uppercase italic text-neutral-200 mb-6 flex items-center gap-2">
                <GanttChart size={20} className="text-neutral-500" /> Recent Decrees
             </h3>
             
             <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                    {FAKE_BROADCAST_LOG.map((log, i) => (
                        <div key={i} className="group bg-white/5 border border-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-black text-yellow-500">{log.author}</span>
                                <span className="text-[9px] font-mono text-neutral-500">{log.time}</span>
                            </div>
                            <p className="text-xs font-mono text-white/80 leading-relaxed uppercase">{log.content}</p>
                            <div className="mt-3 flex items-center gap-2 text-[9px] font-bold text-green-500">
                                <TrendingUp size={10} /> IMPACT: {log.influence}
                            </div>
                        </div>
                    ))}
                </div>
             </ScrollArea>
          </div>

          {/* PROGRESSION BAR (If not Max Rank) */}
          {tier !== "council" && (
              <div className="bg-neutral-900/80 border border-white/10 p-4 rounded-xl">
                  <div className="flex justify-between text-[9px] font-mono text-neutral-400 uppercase mb-2">
                      <span>Progression to {currentTierData.next.replace('_', ' ')}</span>
                      <span>{popCoins.toLocaleString()} / {nextTierCost.toLocaleString()} PC</span>
                  </div>
                  <Progress value={progressPercent} className="h-1.5 bg-black" />
              </div>
          )}

        </section>

      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 text-yellow-600 font-mono">
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-yellow-600/20" />
        <Crown size={48} className="relative z-10" />
      </div>
      <HackerText text="VERIFYING_ROYAL_BLOOD..." className="text-2xl tracking-widest" speed={60} />
    </div>
  );
}