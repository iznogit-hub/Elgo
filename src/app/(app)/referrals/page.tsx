"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image"; 
import { useAuth } from "@/lib/context/auth-context";
import { 
  collection, query, where, getDocs, limit, 
  doc, updateDoc, increment, arrayUnion, writeBatch 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { 
  Copy, Users, Network, ArrowLeft, 
  Cpu, Activity, Share, Globe, Crown, 
  UserPlus, ArrowRightLeft, ShieldCheck, Radar
} from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { HackerText } from "@/components/ui/hacker-text";

export default function ReferralPage() {
  const { user, userData } = useAuth();
  const { play } = useSfx();
  
  // STATE
  const [activeTab, setActiveTab] = useState<"SQUAD" | "RADAR">("SQUAD");
  const [squad, setSquad] = useState<any[]>([]);
  const [radarTargets, setRadarTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // TRANSFER STATE
  const [transferTarget, setTransferTarget] = useState<any | null>(null);
  const [transferAmount, setTransferAmount] = useState("");

  // 1. FETCH SQUAD (People I recruited or connected with)
  useEffect(() => {
    const fetchSquad = async () => {
      if (!userData) return; 
      try {
        // Fetch users I invited OR users I follow (My Squad)
        const q = query(
            collection(db, "users"), 
            where("invitedBy", "==", userData.uid),
            limit(10)
        );
        const snap = await getDocs(q);
        const recruits = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSquad(recruits);
      } catch (e) { console.error(e); }
    };
    fetchSquad();
  }, [userData]);

  // 2. FETCH RADAR (Random active users to recruit)
  const scanRadar = async () => {
      if (!user) return;
      setLoading(true);
      play("scan");
      try {
          const q = query(
              collection(db, "users"),
              where("uid", "!=", user.uid),
              limit(5) // Just grab 5 for now
          );
          const snap = await getDocs(q);
          const found = snap.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter((u: any) => !squad.some(s => s.uid === u.uid)); // Filter out existing squad
          
          setRadarTargets(found);
          play("success");
      } catch (e) { toast.error("RADAR OFFLINE"); }
      finally { setLoading(false); }
  };

  // 3. ACTION: RECRUIT (Add to Squad List locally)
  // In a real app, this would send a Friend Request. For MVP, we just "Link" them.
  const handleRecruit = async (target: any) => {
      play("click");
      if (confirm(`Send Squad Invite to ${target.username}?`)) {
          // Logic to add to "allies" array in DB would go here
          setSquad(prev => [...prev, target]);
          setRadarTargets(prev => prev.filter(u => u.uid !== target.uid));
          toast.success("INVITE SENT // UNIT LINKED");
          play("success");
      }
  };

  // 4. ACTION: TRANSFER FUNDS (Quota Sharing)
  const handleTransfer = async () => {
      if (!transferTarget || !user || !userData) return;
      
      const amount = parseInt(transferAmount);
      if (isNaN(amount) || amount <= 0) return toast.error("INVALID AMOUNT");
      if (userData.wallet.popCoins < amount) return toast.error("INSUFFICIENT FUNDS");

      play("kaching");
      
      try {
          const batch = writeBatch(db);
          
          // Deduct from Me
          const myRef = doc(db, "users", user.uid);
          batch.update(myRef, { "wallet.popCoins": increment(-amount) });

          // Add to Them
          const targetRef = doc(db, "users", transferTarget.uid);
          batch.update(targetRef, { "wallet.popCoins": increment(amount) });

          await batch.commit();
          toast.success(`SENT ${amount} PC TO ${transferTarget.username}`);
          setTransferTarget(null);
          setTransferAmount("");
      } catch (e) {
          toast.error("TRANSACTION FAILED");
      }
  };

  const getReferralLink = () => {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://boyzngalz.com';
      return userData ? `${origin}/auth/signup?ref=${userData.uid}` : '';
  };

  const handleCopy = () => {
    play("click");
    navigator.clipboard.writeText(getReferralLink());
    toast.success("UPLINK COPIED");
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center selection:bg-yellow-500 selection:text-black">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/referral-bg.jpg" alt="Grid" fill priority className="object-cover opacity-20 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-10" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />

      {/* --- TOP NAV --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink href="/dashboard" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-yellow-500 transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-yellow-500" />
            </TransitionLink>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1 bg-neutral-900/50 border border-yellow-500/20 backdrop-blur-md rounded-sm">
            <Network size={12} className="text-yellow-500" />
            <span className="text-[8px] font-mono font-black tracking-widest text-yellow-500 uppercase">Squad_Ops</span>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-40 w-full max-w-md h-screen pt-24 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* 1. SQUAD SUMMARY CARD */}
        <div className="w-full bg-neutral-900/40 border border-white/10 backdrop-blur-xl p-6 relative overflow-hidden rounded-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-mono text-white uppercase tracking-widest">Active_Personnel</span>
                </div>
                <span className="text-2xl font-black font-sans italic text-white">{squad.length} <span className="text-[10px] text-neutral-500 not-italic">UNITS</span></span>
            </div>
            
            {/* Invite Link Mini */}
            <div className="flex gap-2">
                <div className="flex-1 bg-black/50 border border-white/10 p-2 flex items-center gap-2">
                    <Globe size={12} className="text-yellow-500" />
                    <code className="text-[8px] font-mono text-white/50 truncate flex-1">{getReferralLink()}</code>
                </div>
                <Button onClick={handleCopy} className="h-full bg-white text-black font-bold text-[8px] uppercase px-3 rounded-none hover:bg-yellow-500 transition-colors">
                    <Copy size={12} />
                </Button>
            </div>
        </div>

        {/* 2. TABS: MY SQUAD vs RADAR */}
        <div className="flex p-1 bg-neutral-900 border border-white/10 rounded-sm">
            <button onClick={() => setActiveTab("SQUAD")} className={cn("flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all", activeTab === "SQUAD" ? "bg-yellow-600 text-black" : "text-neutral-500")}>
                My Squad
            </button>
            <button onClick={() => { setActiveTab("RADAR"); scanRadar(); }} className={cn("flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all", activeTab === "RADAR" ? "bg-white text-black" : "text-neutral-500")}>
                Find Units
            </button>
        </div>

        {/* 3. LIST VIEW */}
        <div className="space-y-3 min-h-[200px]">
            
            {/* SQUAD LIST (With Transfer Option) */}
            {activeTab === "SQUAD" && squad.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-neutral-900/60 border border-white/10 hover:border-yellow-500/50 transition-colors group rounded-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-neutral-800 border border-white/10 overflow-hidden relative">
                            {member.avatar ? (
                                <Image src={member.avatar} alt="Unit" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20"><Users size={12}/></div>
                            )}
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white uppercase">{member.username}</div>
                            <div className="text-[8px] font-mono text-neutral-500 uppercase">{member.membership?.tier || "RECRUIT"}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setTransferTarget(member)}
                        className="px-3 py-1.5 bg-black border border-white/20 text-[8px] font-mono uppercase text-yellow-500 hover:bg-yellow-500 hover:text-black transition-all flex items-center gap-1"
                    >
                        <ArrowRightLeft size={10} /> Transfer
                    </button>
                </div>
            ))}

            {/* RADAR LIST (Find New People) */}
            {activeTab === "RADAR" && (
                <>
                    {loading ? (
                        <div className="text-center py-10 text-[10px] font-mono text-yellow-500 animate-pulse">SCANNING SECTOR...</div>
                    ) : (
                        radarTargets.map((target) => (
                            <div key={target.id} className="flex items-center justify-between p-3 bg-neutral-900/60 border border-white/10 rounded-sm animate-in slide-in-from-right-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-sm border border-white/10 bg-neutral-800 flex items-center justify-center">
                                        <Radar size={12} className="text-red-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white uppercase">{target.username}</div>
                                        <div className="text-[8px] font-mono text-neutral-500 uppercase">Signal Detected</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleRecruit(target)}
                                    className="px-3 py-1.5 bg-white text-black text-[8px] font-bold uppercase hover:bg-green-500 hover:text-white transition-all flex items-center gap-1"
                                >
                                    <UserPlus size={10} /> Add
                                </button>
                            </div>
                        ))
                    )}
                    {!loading && radarTargets.length === 0 && (
                        <div onClick={scanRadar} className="text-center py-10 text-[10px] font-mono text-neutral-600 cursor-pointer hover:text-white">NO SIGNAL // CLICK TO RESCAN</div>
                    )}
                </>
            )}
        </div>

      </div>

      {/* --- MODAL: TRANSFER FUNDS --- */}
      {transferTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-xs bg-neutral-900 border border-yellow-500/30 p-6 space-y-4 shadow-[0_0_50px_rgba(234,179,8,0.2)] relative">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black font-sans text-yellow-500 uppercase flex items-center gap-2 tracking-widest">
                        <ArrowRightLeft size={12} /> Transfer_Funds
                    </h3>
                    <button onClick={() => setTransferTarget(null)} className="text-neutral-500 hover:text-white">✕</button>
                </div>
                
                <div className="bg-black p-3 border border-white/10 text-center">
                    <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Recipient</span>
                    <div className="text-lg font-black text-white uppercase">{transferTarget.username}</div>
                </div>

                <div className="space-y-1">
                    <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Amount (PC)</label>
                    <Input 
                        type="number"
                        value={transferAmount} 
                        onChange={(e) => setTransferAmount(e.target.value)} 
                        className="bg-black border-white/10 text-white font-mono font-bold text-lg h-12 text-center uppercase rounded-none focus:border-yellow-500" 
                        placeholder="0000" 
                    />
                    <div className="text-[8px] text-right text-neutral-500 font-mono">Max: {userData?.wallet.popCoins}</div>
                </div>

                <Button onClick={handleTransfer} className="w-full h-12 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-[10px] uppercase tracking-widest rounded-none">
                    Confirm Transfer
                </Button>
            </div>
        </div>
      )}

    </main>
  );
}