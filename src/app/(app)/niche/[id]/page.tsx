"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  doc,
  updateDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { NICHE_DATA, MISSION_TYPES } from "@/lib/niche-data";
import {
  ArrowLeft, Zap, ShieldCheck, ExternalLink,
  Loader2, CheckCircle2, Crown, Skull
} from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/ui/background";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";

// --- GAME CONSTANTS ---
const MAX_ENERGY = 100;
const ENERGY_REGEN_RATE = 1;
const ENERGY_REGEN_INTERVAL = 6000; // 6s

// --- STYLING HELPERS ---
const getPlatformStyle = (platform: string) => {
  switch (platform) {
    case "INSTAGRAM": return { icon: "text-pink-500", tag: "bg-pink-600" };
    case "YOUTUBE": return { icon: "text-red-500", tag: "bg-red-600" };
    case "TIKTOK": return { icon: "text-cyan-500", tag: "bg-cyan-600" };
    default: return { icon: "text-yellow-500", tag: "bg-yellow-600" };
  }
};

const getRarityStyle = (rarity = "common") => {
  switch (rarity) {
    case "rare": return "border-blue-500/30 bg-blue-900/10 hover:border-blue-500/60";
    case "epic": return "border-purple-500/30 bg-purple-900/10 hover:border-purple-500/60";
    case "legendary": return "border-yellow-500/40 bg-yellow-900/10 hover:border-yellow-500";
    default: return "border-white/10 hover:border-white/30";
  }
};

export default function NichePage() {
  const params = useParams();
  const { user, userData, loading } = useAuth();
  const { play } = useSfx();

  // 1. SAFE DATA ACCESS
  const id = params.id as string;
  const initialData = NICHE_DATA[id] || NICHE_DATA["general"];
  const FactionIcon = initialData.icon; // Capture Component for usage

  // STATE
  const [activeTab, setActiveTab] = useState<"OPS" | "WARZONE" | "LEADERBOARD">("OPS");
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [warlord, setWarlord] = useState<any>(null);
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  // JOB STATE
  const [verifyingJob, setVerifyingJob] = useState<string | null>(null);
  const [verifyStart, setVerifyStart] = useState<Record<string, number>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // --- REGEN LOGIC ---
  useEffect(() => {
    if (energy >= MAX_ENERGY) return;
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(MAX_ENERGY, prev + ENERGY_REGEN_RATE));
    }, ENERGY_REGEN_INTERVAL);
    return () => clearInterval(interval);
  }, [energy]);

  // --- DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Warlord
        const qWarlord = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), orderBy("wallet.popCoins", "desc"), limit(1));
        const snapWarlord = await getDocs(qWarlord);
        if (!snapWarlord.empty) setWarlord({ ...snapWarlord.docs[0].data(), uid: snapWarlord.docs[0].id });

        // Rivals
        const qRivals = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), where("uid", "!=", user.uid), limit(8));
        const snapRivals = await getDocs(qRivals);
        setActivePlayers(snapRivals.docs.map((d) => ({ ...d.data(), uid: d.id })));

        // Leaderboard
        const qLeader = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), orderBy("wallet.popCoins", "desc"), limit(10));
        const snapLeader = await getDocs(qLeader);
        setLeaderboard(snapLeader.docs.map((d) => ({ ...d.data(), uid: d.id })));
      } catch (e) { console.error("Intel Failed", e); }
    };
    fetchData();
  }, [id, user]);

  // --- HANDLERS ---
  const handleStartMission = (job: any) => {
    const cooldownEnd = cooldowns[job.id] || 0;
    if (cooldownEnd > Date.now()) return toast.error("MISSION ON COOLDOWN");
    if (energy < job.energy) return toast.error("ENERGY DEPLETED // REST REQUIRED");

    play("click");
    
    // Fallback URL logic
    const targetUrl = warlord?.instagramHandle 
        ? `https://instagram.com/${warlord.instagramHandle.replace('@','')}` 
        : `https://instagram.com/explore/tags/${initialData.tags ? initialData.tags[0] : 'viral'}`;
    
    window.open(targetUrl, "_blank");
    
    setVerifyingJob(job.id);
    setVerifyStart((prev) => ({ ...prev, [job.id]: Date.now() }));
    toast.info("UPLINK ESTABLISHED // COMPLETE TASK THEN VERIFY");
  };

  const handleCompleteMission = async (job: any) => {
    const startTime = verifyStart[job.id] || 0;
    const minTime = 5000; // 5s fake verify
    if (Date.now() - startTime < minTime) return toast.error("TASK NOT VERIFIED // WAIT LONGER");

    play("kaching");
    setVerifyingJob(null);
    setEnergy((prev) => Math.max(0, prev - job.energy));
    setCooldowns((prev) => ({ ...prev, [job.id]: Date.now() + 60000 })); // 1 min cooldown for MVP

    try {
      const userRef = doc(db, "users", user!.uid);
      await updateDoc(userRef, {
        "wallet.popCoins": increment(job.reward),
        "dailyTracker.bountiesClaimed": increment(1),
      });
      toast.success(`MISSION SUCCESS: +${job.reward} PC`);
    } catch (e) { toast.error("SYNC FAILED"); }
  };

  const handleRaid = async (rival: any) => {
    if (energy < 20) return toast.error("INSUFFICIENT ENERGY");
    play("shot");
    setEnergy((prev) => Math.max(0, prev - 20));
    const stolen = Math.floor(Math.random() * 40) + 10;
    
    try {
       await updateDoc(doc(db, "users", user!.uid), { "wallet.popCoins": increment(stolen) });
       toast.success(`RAID SUCCESS // STOLE ${stolen} PC FROM ${rival.username}`);
    } catch(e) { toast.error("RAID FAILED"); }
  };

  if (loading || !userData) return <div className="bg-black min-h-screen" />;

  return (
    <main className="relative h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
            src={initialData.imageSrc || "/images/sectors/general.jpg"} 
            alt="Sector" 
            fill 
            className="object-cover opacity-15 grayscale contrast-150" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* HEADER */}
      <header className="flex-none px-6 py-5 border-b border-white/10 bg-black/90 backdrop-blur-2xl z-50">
        <div className="flex items-center justify-between mb-5">
          <TransitionLink href="/dashboard" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={18} /> <span className="text-[11px] font-mono uppercase tracking-widest">Base</span>
          </TransitionLink>
          
          {/* Energy Bar */}
          <div className="flex items-center gap-3 px-4 py-2 bg-black/60 border border-green-600/40 rounded-full">
            <Zap size={16} className="text-green-500 animate-pulse fill-green-500/30" />
            <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(energy / MAX_ENERGY) * 100}%` }} />
            </div>
            <span className="text-xs font-mono text-green-400">{energy}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <h1 className={cn("text-3xl md:text-5xl font-black uppercase italic leading-none tracking-tighter", initialData.color)}>
              {initialData.label}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <FactionIcon size={16} className="text-neutral-400" />
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{initialData.category}</span>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Controlled By</div>
             <div className="text-yellow-500 font-bold flex items-center justify-end gap-2">
                {warlord?.username || "UNCLAIMED"} <Crown size={14} />
             </div>
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-white/10 bg-black/80 z-40">
        {["OPS", "WARZONE", "LEADERBOARD"].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab as any)} 
            className={cn(
                "flex-1 py-4 text-[10px] md:text-xs font-black uppercase tracking-widest transition-all hover:bg-white/5", 
                activeTab === tab ? "border-b-4 border-white text-white" : "text-neutral-500"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* CONTENT SCROLL */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-40 z-40 no-scrollbar">
        
        {/* --- OPERATIONS --- */}
        {activeTab === "OPS" && (
          <div className="space-y-4">
            <h2 className="text-sm font-mono text-neutral-500 uppercase tracking-widest mb-4">Active Protocols</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MISSION_TYPES.map((job) => {
                const MissionIcon = job.icon; // FIX: Assign component to Capitalized Variable
                const platformStyle = getPlatformStyle(job.type); // Fixed lookup key
                const isVerifying = verifyingJob === job.id;
                const cooldownEnd = cooldowns[job.id] || 0;
                const isCooling = cooldownEnd > Date.now();
                const canVerify = (Date.now() - (verifyStart[job.id] || 0)) >= 5000;

                return (
                  <div key={job.id} className={cn("relative group bg-neutral-900/60 border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all flex", isCooling && "opacity-50 grayscale")}>
                    
                    {/* THUMBNAIL (Left Side) */}
                    <div className="w-24 md:w-32 relative shrink-0 border-r border-white/10">
                        <Image src={job.thumbnail || "/images/missions/default.jpg"} alt={job.title} fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-neutral-900/90" />
                        <div className="absolute top-2 left-2 p-1 bg-black/60 rounded">
                            <div className={cn(platformStyle.icon)}>
                                <MissionIcon size={14} /> {/* FIX: Render as Element */}
                            </div>
                        </div>
                    </div>

                    {/* CONTENT (Right Side) */}
                    <div className="flex-1 p-4 flex flex-col justify-between relative">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-sm font-black uppercase text-white leading-tight">{job.title}</h3>
                                <p className="text-[10px] font-mono text-neutral-400 mt-1 leading-tight">{job.desc}</p>
                            </div>
                            <span className="text-yellow-500 font-bold text-sm">+{job.reward}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                                <Zap size={10} /> -{job.energy} NRG
                            </span>

                            {isVerifying ? (
                                <button 
                                    onClick={() => handleCompleteMission(job)} 
                                    disabled={!canVerify}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2",
                                        canVerify ? "bg-green-600 text-white animate-pulse" : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                    )}
                                >
                                    {canVerify ? "Confirm" : "Wait..."}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => handleStartMission(job)}
                                    disabled={isCooling}
                                    className={cn(
                                        "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2",
                                        isCooling ? "bg-neutral-800 text-neutral-600" : "bg-white text-black hover:bg-yellow-400"
                                    )}
                                >
                                    {isCooling ? "Cooling..." : "Start"}
                                </button>
                            )}
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- WARZONE --- */}
        {activeTab === "WARZONE" && (
          <div className="space-y-4">
             <div className="p-4 bg-red-950/20 border border-red-900/50 rounded-lg flex items-center gap-4">
                <Skull size={24} className="text-red-500" />
                <div>
                    <h3 className="text-sm font-bold text-red-400 uppercase">Hostile Zone</h3>
                    <p className="text-[10px] text-neutral-400">Raid active players to steal PopCoins. High risk, high reward.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePlayers.length > 0 ? activePlayers.map((player) => (
                    <div key={player.uid} className="flex items-center justify-between p-3 bg-neutral-900/60 border border-white/10 rounded-lg hover:border-red-500/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative">
                                <Image src={player.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-white uppercase">{player.username}</div>
                                <div className="text-[9px] text-neutral-500 font-mono">Inf: {(player.wallet.popCoins/10).toFixed(0)}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleRaid(player)}
                            className="px-3 py-1 bg-red-900/30 text-red-400 border border-red-900/50 text-[10px] font-bold uppercase rounded hover:bg-red-600 hover:text-white transition-all"
                        >
                            Raid
                        </button>
                    </div>
                )) : (
                    <div className="col-span-2 text-center py-10 text-neutral-600 text-xs uppercase font-mono">No hostiles found in this sector.</div>
                )}
             </div>
          </div>
        )}

        {/* --- LEADERBOARD --- */}
        {activeTab === "LEADERBOARD" && (
          <div className="space-y-3">
             {leaderboard.map((player, i) => (
                 <div key={player.uid} className={cn("flex items-center p-3 rounded-lg border", player.uid === user?.uid ? "bg-yellow-950/10 border-yellow-600/30" : "bg-neutral-900/40 border-white/5")}>
                     <div className="w-8 text-center text-sm font-black text-neutral-500">#{i + 1}</div>
                     <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden relative mx-3">
                         <Image src={player.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover" />
                     </div>
                     <div className="flex-1">
                         <div className={cn("text-xs font-bold uppercase", player.uid === user?.uid ? "text-yellow-500" : "text-white")}>
                             {player.username} {player.uid === user?.uid && "(YOU)"}
                         </div>
                     </div>
                     <div className="text-right">
                         <div className="text-xs font-black text-white">{player.wallet.popCoins}</div>
                         <div className="text-[8px] text-neutral-500 uppercase">PopCoins</div>
                     </div>
                 </div>
             ))}
          </div>
        )}

      </div>
    </main>
  );
}