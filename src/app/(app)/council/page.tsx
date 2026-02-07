"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { doc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Crown, Lock, Megaphone, ArrowLeft, 
  Zap, Send, ShieldCheck, Globe, Loader2, Radio
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

export default function HighCommandPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { play } = useSfx();
  
  const [prPitch, setPrPitch] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [claimingStipend, setClaimingStipend] = useState(false);

  // Check if user is VIP (Inner Circle or Council)
  const tier = (userData?.membership?.tier as any) || "recruit";
  const isVIP = tier === "council" || tier === "inner_circle" || tier === "elite";

  const handleRestrictedAction = () => {
      play("error");
      toast.error("ACCESS DENIED // RANK TOO LOW");
      setTimeout(() => router.push("/store"), 1000);
  };

  const handlePrSubmit = async () => {
    if (!isVIP) return handleRestrictedAction();
    if (!prPitch.trim()) return toast.error("EMPTY TRANSMISSION");
    
    setSubmittingPr(true);
    play("click");

    try {
      await addDoc(collection(db, "pr_requests"), {
        uid: userData?.uid,
        username: userData?.username,
        pitch: prPitch,
        tier: tier,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      play("success");
      toast.success("ORDER TRANSMITTED // AWAITING EXECUTION");
      setPrPitch("");
    } catch (e) {
      play("error");
      toast.error("UPLINK FAILED");
    } finally {
      setSubmittingPr(false);
    }
  };

  const handleClaimStipend = async () => {
    if (!isVIP) return handleRestrictedAction();
    if (!userData) return;
    
    setClaimingStipend(true);
    play("click");

    try {
      await updateDoc(doc(db, "users", userData.uid), {
        "wallet.popCoins": increment(500),
        "dailyTracker.bountiesClaimed": increment(1)
      });
      play("success");
      toast.success("FUNDS SECURED: +500 PTS");
    } catch (e) {
      play("error");
      toast.error("TRANSACTION ERROR");
    } finally {
      setClaimingStipend(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center selection:bg-yellow-500 selection:text-black">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/inner-circle-bg.jpg" 
          alt="High Command"
          fill
          priority
          className="object-cover opacity-20 grayscale contrast-125"
        />
        {/* GOLDEN GLOW */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-20" />
        <div className="absolute top-0 right-0 w-full h-1/2 bg-yellow-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />
      <Background />

      {/* --- TOP HUD --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              onClick={() => play("hover")}
              className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-yellow-500 transition-all rounded-sm"
            >
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-yellow-500" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-sm">
            <Crown size={12} className="text-yellow-500" />
            <span className="text-[8px] font-mono font-black tracking-widest text-yellow-500 uppercase">
                {isVIP ? "High_Command" : "Restricted_Access"}
            </span>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-40 w-full max-w-md h-screen pt-24 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* 1. STATUS CARD */}
        <div className={cn(
            "w-full border backdrop-blur-xl p-6 relative overflow-hidden group transition-all rounded-sm",
            isVIP ? "bg-yellow-950/20 border-yellow-500/30" : "bg-neutral-900/60 border-white/10 opacity-80"
        )}>
            {/* Ambient Shine */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-yellow-500/10 blur-[50px] pointer-events-none" />

            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", isVIP ? "bg-yellow-500" : "bg-red-500")} />
                    <span className={cn("text-[8px] font-mono uppercase tracking-widest", isVIP ? "text-yellow-500" : "text-red-500")}>
                        {isVIP ? "Command_Access_Granted" : "Clearance_Required"}
                    </span>
                </div>
                
                <h1 className="text-2xl font-black font-sans text-white italic uppercase tracking-tighter">
                    Inner Circle
                </h1>
                <p className="text-[9px] font-mono text-neutral-400 leading-relaxed max-w-[200px] uppercase">
                    {isVIP 
                        ? "Control the narrative. Issue broadcast orders. Dominate the grid."
                        : "Upgrade to Elite Tier to access Broadcast Uplink and Monthly Funds."}
                </p>
            </div>
        </div>

        {/* 2. BROADCAST UPLINK (PR) */}
        <div className="w-full bg-neutral-900/40 border border-white/10 backdrop-blur-md p-5 space-y-4 relative rounded-sm group">
            {!isVIP && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4">
                    <Lock size={24} className="text-white/30 mb-2" />
                    <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Upgrade to Unlock</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black font-sans uppercase italic text-white flex items-center gap-2 tracking-tighter">
                    <Radio size={14} className="text-yellow-500" /> Broadcast_Order
                 </h3>
                 <span className="text-[8px] font-mono text-neutral-500 bg-white/5 px-2 py-1 rounded-sm uppercase">1 Slot / Month</span>
            </div>

            <textarea 
                value={prPitch}
                onChange={(e) => setPrPitch(e.target.value)}
                placeholder="TYPE_YOUR_COMMAND_HERE..."
                disabled={!isVIP}
                className="w-full h-24 bg-black/50 border border-white/10 text-[10px] font-mono text-white p-3 focus:border-yellow-500 outline-none resize-none uppercase disabled:opacity-50 placeholder:text-neutral-700"
            />

            <Button 
                onClick={handlePrSubmit}
                disabled={submittingPr || (!prPitch && isVIP)}
                className="w-full h-10 bg-yellow-600 hover:bg-yellow-500 text-black font-black italic tracking-widest text-[9px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95 rounded-none"
            >
                {submittingPr ? <Loader2 className="animate-spin" size={12} /> : <><Send size={12} /> TRANSMIT_ORDER</>}
            </Button>
        </div>

        {/* 3. STIPEND CLAIM */}
        <div className={cn(
            "w-full border backdrop-blur-md p-5 flex items-center justify-between transition-all rounded-sm",
            isVIP ? "bg-yellow-500/5 border-yellow-500/20" : "bg-neutral-900/40 border-white/10"
        )}>
            <div className="space-y-1">
                <h3 className={cn("text-xs font-black font-sans uppercase", isVIP ? "text-yellow-500" : "text-neutral-500")}>
                    War_Fund_Payout
                </h3>
                <p className="text-[8px] font-mono text-neutral-500 uppercase">Monthly Allowance: 500 PTS</p>
            </div>
            
            <Button 
                onClick={handleClaimStipend}
                disabled={claimingStipend}
                className={cn(
                    "h-8 px-4 font-black italic tracking-widest text-[8px] uppercase shadow-lg transition-all active:scale-95 rounded-none",
                    isVIP 
                        ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                        : "bg-white/10 text-white/20 cursor-not-allowed"
                )}
            >
                {claimingStipend ? "Verifying..." : isVIP ? "CLAIM" : "LOCKED"}
            </Button>
        </div>

        {/* 4. UPGRADE CTA */}
        {!isVIP && (
            <TransitionLink 
                href="/dossier"
                className="w-full h-12 bg-yellow-900/20 border border-yellow-500 text-yellow-500 font-black font-sans tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-yellow-600 hover:text-black transition-all text-xs rounded-sm"
            >
                <Zap size={14} /> Join_High_Command
            </TransitionLink>
        )}

        {/* 5. PASSIVE STATUS */}
        <div className="space-y-2 opacity-50">
            <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Self_Bounty_Protocol</span>
                 <ShieldCheck size={12} className="text-neutral-600" />
            </div>
            <div className="p-4 border border-dashed border-white/10 flex items-center justify-center gap-2 text-[8px] font-mono text-neutral-600 uppercase">
                <Lock size={10} /> GROWTH_ENGINE_ACTIVE
            </div>
        </div>

      </div>

      {/* --- FOOTER --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-2xl">
         <div className="flex items-center gap-4 text-yellow-500/50">
            {isVIP && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />}
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">
                {isVIP ? "Secure_Line // COMMS_OPEN" : "Public_Channel // LIMITED"}
            </span>
         </div>
      </footer>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-yellow-500 font-mono">
      <Loader2 className="w-10 h-10 animate-spin" />
      <HackerText text="VERIFYING_RANK..." speed={50} />
    </div>
  );
}