"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  ShieldAlert, Crosshair, Lock, Play, 
  Activity, Zap, Globe, Skull, Check, X
} from "lucide-react";
import { 
  collection, query, where, onSnapshot, 
  doc, increment, writeBatch, updateDoc 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { NICHE_DATA } from "@/lib/niche-data"; // Importing your Master Data

// UI Components
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import PlayerStatusCard from "@/components/ui/player-status-card";
import { HackerText } from "@/components/ui/hacker-text";

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const { userData, loading } = useAuth();
  
  // STATE
  const [incomingAttacks, setIncomingAttacks] = useState<any[]>([]);
  
  // DATA
  const score = userData?.wallet?.popCoins || 0;
  const unlockedColonies = userData?.unlockedNiches || ["general"]; 

  // --- 1. DEFENSE LOGIC ---
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
            if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    });

    return () => unsubscribe();
  }, [userData, play]);

  // --- HANDLERS (Confirm/Deny) ---
  const handleConfirmDeath = async (claim: any) => {
      play("success");
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
      toast.success("DEATH CONFIRMED // POINTS TRANSFERRED");
  };

  const handleDenyDeath = async (claimId: string) => {
      play("error");
      await updateDoc(doc(db, "kill_claims", claimId), { status: "disputed" });
      toast.error("ATTACK REPELLED // FLAGGED TO OVERSEER");
  };

  if (loading) return null;

  return (
    <main className="relative min-h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/dashboard-bg.jpg" 
          alt="War Room"
          fill
          priority
          className="object-cover opacity-20 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
      </div>

      {/* --- 1. DEFENSE ALERT (The Red Banner) --- */}
      {incomingAttacks.length > 0 && (
         <div className="relative z-50 bg-red-600 text-white px-6 py-2 flex items-center justify-between animate-in slide-in-from-top-full duration-300 shadow-[0_0_30px_red]">
             <div className="flex items-center gap-4">
                 <ShieldAlert className="animate-pulse text-black" size={24} />
                 <span className="font-black font-mono text-sm tracking-widest uppercase">
                     WARNING: {incomingAttacks.length} HOSTILE SIGNATURES DETECTED
                 </span>
             </div>
             <div className="flex gap-2">
                 {incomingAttacks.map(attack => (
                     <div key={attack.id} className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-sm">
                         <span className="text-[10px] font-mono">{attack.killerName}</span>
                         <button onClick={() => handleConfirmDeath(attack)} className="hover:text-green-300"><Check size={14}/></button>
                         <button onClick={() => handleDenyDeath(attack.id)} className="hover:text-red-300"><X size={14}/></button>
                     </div>
                 ))}
             </div>
         </div>
      )}

      {/* --- MAIN LAYOUT --- */}
      <div className="relative z-40 flex flex-col lg:flex-row h-full flex-1 p-6 gap-8 overflow-y-auto no-scrollbar">
        
        {/* --- LEFT COLUMN: OPERATIVE STATUS --- */}
        <aside className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Player Card */}
            <PlayerStatusCard userData={userData} className="w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]" />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900/50 border border-white/10 p-4 backdrop-blur-md">
                    <span className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest block mb-1">Current_Balance</span>
                    <span className="text-2xl font-black text-yellow-500 font-mono">{score.toLocaleString()}</span>
                </div>
                <div className="bg-neutral-900/50 border border-white/10 p-4 backdrop-blur-md">
                    <span className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest block mb-1">Global_Rank</span>
                    <span className="text-2xl font-black text-white font-mono">#14,203</span>
                </div>
            </div>

            {/* Daily Brief */}
            <div className="bg-neutral-900/50 border border-white/10 p-4 backdrop-blur-md flex-1">
                <div className="flex items-center gap-2 mb-4 text-red-500">
                    <Activity size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Live_Intel</span>
                </div>
                <p className="text-[10px] font-mono text-neutral-400 leading-relaxed uppercase">
                    <HackerText text="Kenjaku has updated the bounty rules for the Shibuya Colony. Tech sector yields +20% efficiency today." speed={30} />
                </p>
            </div>
        </aside>

        {/* --- RIGHT COLUMN: MISSION SELECT (The Grid) --- */}
        <section className="w-full lg:w-2/3 flex flex-col gap-6">
            
            <header className="flex items-end justify-between border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-3xl font-black font-sans uppercase italic text-white tracking-tighter">
                        Mission Select
                    </h1>
                    <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mt-1">
                        Select a Colony to Initialize Link
                    </p>
                </div>
                <div className="flex items-center gap-2 text-green-500 text-[10px] font-mono uppercase font-bold animate-pulse">
                    <Globe size={12} /> Network_Online
                </div>
            </header>

            {/* THE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                {Object.entries(NICHE_DATA).map(([key, data]: [string, any]) => {
                    const isLocked = !unlockedColonies.includes(key);
                    
                    return (
                        <button
                            key={key}
                            disabled={isLocked}
                            onClick={() => { play("click"); router.push(`/niche/${key}`); }}
                            onMouseEnter={() => play("hover")}
                            className={cn(
                                "group relative h-48 w-full border overflow-hidden transition-all duration-300 text-left",
                                isLocked 
                                    ? "border-white/5 bg-neutral-950 grayscale opacity-60 cursor-not-allowed" 
                                    : "border-white/10 bg-neutral-900 hover:border-red-500 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(220,38,38,0.2)]"
                            )}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0 z-0">
                                <Image 
                                    src={data.imageSrc || `/images/sectors/${key}.jpg`} 
                                    alt={data.label}
                                    fill
                                    className="object-cover opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                            </div>

                            {/* Content */}
                            <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className={cn(
                                        "w-8 h-8 flex items-center justify-center border",
                                        isLocked ? "bg-black/50 border-white/10 text-neutral-600" : `bg-${data.color}-900/20 border-${data.color}-500/50 text-${data.color}-500`
                                    )}>
                                        {isLocked ? <Lock size={14} /> : data.icon}
                                    </div>
                                    {isLocked && (
                                        <span className="text-[8px] font-black bg-neutral-800 text-neutral-500 px-2 py-1 uppercase">Classified</span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-black font-sans uppercase italic text-white leading-none mb-1 group-hover:text-red-500 transition-colors">
                                        {data.label}
                                    </h3>
                                    <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest line-clamp-1">
                                        {data.description}
                                    </p>
                                </div>
                            </div>

                            {/* Hover Overlay "DEPLOY" */}
                            {!isLocked && (
                                <div className="absolute inset-0 z-20 bg-red-600/90 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm">
                                    <span className="text-lg font-black font-sans uppercase italic tracking-widest text-white">DEPLOY</span>
                                    <Play fill="currentColor" size={16} className="text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

        </section>
      </div>
    </main>
  );
}