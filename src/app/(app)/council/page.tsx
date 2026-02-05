"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useRouter } from "next/navigation";
import { doc, updateDoc, increment, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Crown, Lock, Megaphone, ArrowLeft, 
  Zap, Send, ShieldCheck, Globe, Loader2
} from "lucide-react";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function InnerCirclePage() {
  const { userData, loading } = useAuth();
  const router = useRouter();
  const { play } = useSfx();
  
  const [prPitch, setPrPitch] = useState("");
  const [submittingPr, setSubmittingPr] = useState(false);
  const [claimingStipend, setClaimingStipend] = useState(false);

  // 🛡️ SAFE ACCESSORS (Prevents Crash)
  const tier = userData?.membership?.tier || (userData as any)?.tier || "recruit";
  const isVIP = tier === "council" || tier === "inner_circle";

  // 🔒 RESTRICTED ACTION HANDLER
  const handleRestrictedAction = () => {
      play("error");
      toast.error("CLEARANCE_LEVEL_TOO_LOW");
      setTimeout(() => router.push("/store"), 1000); // Send to store to upgrade
  };

  // 📝 SUBMIT PR REQUEST
  const handlePrSubmit = async () => {
    if (!isVIP) return handleRestrictedAction();
    if (!prPitch.trim()) return toast.error("TRANSMISSION EMPTY");
    
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
      toast.success("PRESS_RELEASE_QUEUED");
      setPrPitch("");
    } catch (e) {
      play("error");
      toast.error("UPLINK_FAILED");
    } finally {
      setSubmittingPr(false);
    }
  };

  // 💰 CLAIM MONTHLY COINS
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
      toast.success("STIPEND_TRANSFERRED: +500 PC");
    } catch (e) {
      play("error");
      toast.error("TRANSACTION_ERROR");
    } finally {
      setClaimingStipend(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ BACKGROUND */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.5} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-yellow-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-yellow-500" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-full">
            <Crown size={12} className="text-yellow-500" />
            <span className="text-[8px] font-mono font-black tracking-widest text-yellow-500 uppercase">
                {isVIP ? "Command_Node" : "Restricted_Area"}
            </span>
        </div>
      </nav>

      {/* 🚀 CENTRAL FEED (Mobile First) */}
      <div className="relative z-40 w-full max-w-md h-screen pt-24 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* 1. VIP STATUS CARD */}
        <div className={cn(
            "w-full border backdrop-blur-xl p-6 relative overflow-hidden group transition-all",
            isVIP ? "bg-gradient-to-br from-yellow-900/20 to-black/80 border-yellow-500/30" : "bg-black/60 border-white/10 grayscale opacity-80"
        )}>
            <div className="absolute top-0 right-0 p-3 opacity-20">
                <Globe size={80} className={isVIP ? "text-yellow-500" : "text-white"} />
            </div>

            <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", isVIP ? "bg-yellow-500" : "bg-red-500")} />
                    <span className={cn("text-[8px] font-mono uppercase tracking-widest", isVIP ? "text-yellow-400" : "text-red-500")}>
                        {isVIP ? "Global_Influence_Active" : "Clearance_Required"}
                    </span>
                </div>
                
                <h1 className="text-2xl font-black font-orbitron text-white italic uppercase tracking-tighter">
                    Inner_Circle
                </h1>
                <p className="text-[9px] font-mono text-white/50 leading-relaxed max-w-[200px]">
                    {isVIP 
                        ? "You control the narrative. Broadcast signals and command the grid."
                        : "Upgrade to Council Tier to access PR uplinks and monthly stipends."}
                </p>
            </div>
        </div>

        {/* 2. PR UPLINK (The Pitch Form) */}
        <div className="w-full bg-black/60 border border-white/10 backdrop-blur-md p-5 space-y-4 relative">
            {!isVIP && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-4 border border-white/5">
                    <Lock size={24} className="text-white/30 mb-2" />
                    <p className="text-[9px] font-mono text-white/50 uppercase">Upgrade to Access PR Uplink</p>
                </div>
            )}

            <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black font-orbitron uppercase italic text-white flex items-center gap-2">
                    <Megaphone size={14} className="text-cyan-400" /> PR_Broadcast
                 </h3>
                 <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-sm">1 Slot / Month</span>
            </div>
            
            <p className="text-[8px] font-mono text-gray-400 leading-relaxed">
                Submit your update for the Monthly Zaibatsu Press Release.
            </p>

            <textarea 
                value={prPitch}
                onChange={(e) => setPrPitch(e.target.value)}
                placeholder="TYPE_YOUR_HEADLINE_HERE..."
                disabled={!isVIP}
                className="w-full h-24 bg-black/40 border border-white/10 text-[10px] font-mono text-white p-3 focus:border-cyan-500 outline-none resize-none uppercase disabled:opacity-50"
            />

            <Button 
                onClick={handlePrSubmit}
                disabled={submittingPr || (!prPitch && isVIP)}
                className="w-full h-10 bg-cyan-600 hover:bg-cyan-500 text-white font-black italic tracking-widest text-[9px] uppercase flex items-center justify-center gap-2"
            >
                {submittingPr ? <Loader2 className="animate-spin" size={12} /> : <><Send size={12} /> TRANSMIT_TO_PRESS</>}
            </Button>
        </div>

        {/* 3. STIPEND CLAIM (The "Salary") */}
        <div className={cn(
            "w-full border backdrop-blur-md p-5 flex items-center justify-between transition-all",
            isVIP ? "bg-yellow-500/5 border-yellow-500/20" : "bg-white/5 border-white/10"
        )}>
            <div className="space-y-1">
                <h3 className={cn("text-xs font-black font-orbitron uppercase", isVIP ? "text-yellow-500" : "text-gray-500")}>
                    Command_Stipend
                </h3>
                <p className="text-[8px] font-mono text-white/30">Monthly Allowance: 500 PC</p>
            </div>
            
            <Button 
                onClick={handleClaimStipend}
                disabled={claimingStipend}
                className={cn(
                    "h-10 px-6 font-black italic tracking-widest text-[9px] uppercase shadow-lg",
                    isVIP 
                        ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)]" 
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
            >
                {claimingStipend ? "Verifying..." : isVIP ? "CLAIM" : "LOCKED"}
            </Button>
        </div>

        {/* 4. UPGRADE CTA (Only visible to non-VIPs) */}
        {!isVIP && (
            <TransitionLink 
                href="/store"
                className="w-full h-14 bg-yellow-600/20 border border-yellow-500 text-yellow-500 font-black font-orbitron tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-yellow-600 hover:text-white transition-all"
            >
                <Zap size={16} /> Upgrade_To_Inner_Circle
            </TransitionLink>
        )}

        {/* 5. BOUNTY OVERRIDE (Set aggressive growth) */}
        <div className="space-y-2 opacity-50 hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between px-1">
                 <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Self_Bounty_Protocol</span>
                 <ShieldCheck size={12} className="text-gray-600" />
            </div>
            <div className="p-4 border border-dashed border-white/10 flex items-center justify-center gap-2 text-[8px] font-mono text-gray-500">
                <Lock size={10} /> AUTOMATED_GROWTH_ENGINE_ACTIVE
            </div>
        </div>

      </div>

      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-yellow-500">
            {isVIP && <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />}
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">
                {isVIP ? "Secure_Line // VIP" : "Public_Access // Limited"}
            </span>
         </div>
      </footer>

    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-yellow-500 font-mono">
      <Loader2 className="w-12 h-12 animate-spin" />
      <HackerText text="VERIFYING_CLEARANCE..." />
    </div>
  );
}