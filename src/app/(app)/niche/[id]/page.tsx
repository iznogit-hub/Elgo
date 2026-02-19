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
  Loader2, CheckCircle2, Crown, Skull, Activity, Database, Terminal, Server,
  Swords, Trophy, Users, Flame
} from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/ui/background";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";

// --- GAME CONSTANTS (unchanged) ---
const MAX_ENERGY = 100;
const ENERGY_REGEN_RATE = 1;
const ENERGY_REGEN_INTERVAL = 6000;

export default function NichePage() {
  const params = useParams();
  const { user, userData, loading } = useAuth();
  const { play } = useSfx();

  const id = params.id as string;
  const habitat = NICHE_DATA[id] || NICHE_DATA["general"];
  const HabitatIcon = habitat.icon;

  // STATE (100% same logic)
  const [activeTab, setActiveTab] = useState<"OPS" | "WARZONE" | "LEADERBOARD">("OPS");
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [gymLeader, setGymLeader] = useState<any>(null);
  const [rivalTrainers, setRivalTrainers] = useState<any[]>([]);
  const [arenaRanking, setArenaRanking] = useState<any[]>([]);
  
  const [verifyingJob, setVerifyingJob] = useState<string | null>(null);
  const [verifyStart, setVerifyStart] = useState<Record<string, number>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // REGEN (unchanged)
  useEffect(() => {
    if (energy >= MAX_ENERGY) return;
    const interval = setInterval(() => {
      setEnergy((prev) => Math.min(MAX_ENERGY, prev + ENERGY_REGEN_RATE));
    }, ENERGY_REGEN_INTERVAL);
    return () => clearInterval(interval);
  }, [energy]);

  // DATA FETCH (unchanged)
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const qGymLeader = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), orderBy("wallet.popCoins", "desc"), limit(1));
        const snapLeader = await getDocs(qGymLeader);
        if (!snapLeader.empty) setGymLeader({ ...snapLeader.docs[0].data(), uid: snapLeader.docs[0].id });

        const qRivals = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), where("uid", "!=", user.uid), limit(8));
        const snapRivals = await getDocs(qRivals);
        setRivalTrainers(snapRivals.docs.map((d) => ({ ...d.data(), uid: d.id })));

        const qRanking = query(collection(db, "users"), where("unlockedNiches", "array-contains", id), orderBy("wallet.popCoins", "desc"), limit(10));
        const snapRanking = await getDocs(qRanking);
        setArenaRanking(snapRanking.docs.map((d) => ({ ...d.data(), uid: d.id })));
      } catch (e) { console.error("Habitat intel failed", e); }
    };
    fetchData();
  }, [id, user]);

  // HANDLERS (100% unchanged logic)
  const handleStartMission = (job: any) => {
    const cooldownEnd = cooldowns[job.id] || 0;
    if (cooldownEnd > Date.now()) return toast.error("QUEST ON COOLDOWN");
    if (energy < job.energy) return toast.error("STAMINA DEPLETED // WAIT FOR REGEN");

    play("click");
    
    const targetUrl = gymLeader?.instagramHandle 
        ? `https://instagram.com/${gymLeader.instagramHandle.replace('@','')}` 
        : `https://instagram.com/explore/tags/${habitat.tags ? habitat.tags[0] : 'viral'}`;
    
    window.open(targetUrl, "_blank");
    
    setVerifyingJob(job.id);
    setVerifyStart((prev) => ({ ...prev, [job.id]: Date.now() }));
    toast.info("WILD ENCOUNTER STARTED // COMPLETE THEN VERIFY");
  };

  const handleCompleteMission = async (job: any) => {
    const startTime = verifyStart[job.id] || 0;
    const minTime = 5000; 
    if (Date.now() - startTime < minTime) return toast.error("CAPTURE IN PROGRESS // MAINTAIN LINK");

    play("kaching");
    setVerifyingJob(null);
    setEnergy((prev) => Math.max(0, prev - job.energy));
    setCooldowns((prev) => ({ ...prev, [job.id]: Date.now() + 60000 })); 

    try {
      const userRef = doc(db, "users", user!.uid);
      await updateDoc(userRef, {
        "wallet.popCoins": increment(job.reward),
        "dailyTracker.bountiesClaimed": increment(1),
      });
      toast.success(`CAPTURE SUCCESS! +${job.reward} RUPEES`);
    } catch (e) { toast.error("LEDGER SYNC FAILED"); }
  };

  const handleRaid = async (rival: any) => {
    if (energy < 20) return toast.error("NOT ENOUGH STAMINA");
    play("shot");
    setEnergy((prev) => Math.max(0, prev - 20));
    const stolen = Math.floor(Math.random() * 40) + 10;
    
    try {
       await updateDoc(doc(db, "users", user!.uid), { "wallet.popCoins": increment(stolen) });
       toast.success(`BATTLE WON! STOLE ${stolen} RUPEES FROM ${rival.username}`);
    } catch(e) { toast.error("BATTLE FAILED"); }
  };

  if (loading || !userData) return <div className="bg-[#050505] min-h-screen" />;

  const TABS = [
    { id: "OPS", label: "WILD QUESTS", icon: Zap },
    { id: "WARZONE", label: "RIVAL BATTLES", icon: Swords },
    { id: "LEADERBOARD", label: "HABITAT RANKINGS", icon: Trophy }
  ];

  return (
    <main className="relative h-screen w-full bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-[#FFD4B2] selection:text-black">
      
      {/* HABITAT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image 
            src={habitat.imageSrc || "/images/sectors/general.jpg"} 
            alt={`${habitat.label} Habitat`} 
            fill 
            className="object-cover opacity-15 grayscale contrast-150 mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/70 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* HEADER - POKÉMON GYM STYLE */}
      <header className="flex-none px-6 md:px-10 py-6 border-b border-white/10 bg-[#050505]/90 backdrop-blur-md z-50">
        <div className="flex items-center justify-between mb-8">
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 border border-[#FFD4B2]/30 bg-black/60 flex items-center justify-center group-hover:bg-[#FFD4B2] group-hover:text-black transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest group-hover:text-[#FFD4B2]">RETURN TO WORLD MAP</span>
          </TransitionLink>
          
          {/* STAMINA BAR */}
          <div className="flex items-center gap-4 px-5 py-2 border border-[#FFD4B2]/30 bg-black/60 backdrop-blur-md rounded-full">
            <Flame size={16} className="text-[#FFD4B2] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">STAMINA</span>
            <div className="w-28 h-1.5 bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#FFD4B2] to-white transition-all" style={{ width: `${(energy / MAX_ENERGY) * 100}%` }} />
            </div>
            <span className="font-mono font-bold text-[#FFD4B2]">{energy}/100</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <HabitatIcon size={22} className="text-[#FFD4B2]" />
              <span className="px-3 py-1 text-[10px] font-mono border border-[#FFD4B2]/40 bg-black/50 rounded-full uppercase tracking-widest">
                {habitat.category} HABITAT
              </span>
            </div>
            <h1 className="text-[7vw] md:text-6xl font-black uppercase leading-none tracking-[-0.03em] text-white">
              {habitat.label}
            </h1>
            <p className="text-sm font-mono text-neutral-400 mt-2">EVOLUTION CHAMBER • CATCH • TRAIN • EVOLVE</p>
          </div>
          
          <div className="text-right border-l-2 border-[#FFD4B2]/30 pl-6">
            <div className="text-[10px] font-mono text-neutral-400 uppercase">CURRENT GYM LEADER</div>
            <div className="flex items-center justify-end gap-3 text-white font-mono text-xl mt-1">
              <Crown size={18} className="text-[#FFD4B2]" />
              {gymLeader?.username || "NO GYM LEADER YET"}
            </div>
          </div>
        </div>
      </header>

      {/* TABS - GAME STYLE */}
      <div className="flex border-b border-white/10 bg-[#050505]/95 z-40">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as any)} 
              className={cn(
                  "flex-1 py-5 flex items-center justify-center gap-3 text-xs font-mono uppercase tracking-widest transition-all border-r border-white/10 last:border-r-0",
                  activeTab === tab.id 
                    ? "bg-[#FFD4B2] text-black font-bold" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#050505] z-40 no-scrollbar">
        
        {/* WILD QUESTS (Operations) */}
        {activeTab === "OPS" && (
          <div className="p-6 md:p-10 pb-32">
            <div className="flex items-center gap-4 mb-10">
              <Zap className="text-[#FFD4B2]" size={28} />
              <div>
                <h2 className="text-3xl font-black tracking-tight">WILD QUESTS</h2>
                <p className="text-sm font-mono text-neutral-400">Encounter daily missions • Capture rupees</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {MISSION_TYPES.map((job) => {
                const MissionIcon = job.icon;
                const isVerifying = verifyingJob === job.id;
                const isCooling = (cooldowns[job.id] || 0) > Date.now();
                const canVerify = (Date.now() - (verifyStart[job.id] || 0)) >= 5000;

                return (
                  <div key={job.id} className="group bg-[#050505] hover:bg-white/5 transition-all flex flex-col sm:flex-row overflow-hidden">
                    <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0 border-b sm:border-b-0 sm:border-r border-white/10 overflow-hidden">
                      <Image src={job.thumbnail || "/images/missions/default.jpg"} alt={job.title} fill className="object-cover group-hover:scale-110 transition-transform" />
                      <div className="absolute top-4 left-4 p-2 bg-black/70 rounded-lg">
                        <MissionIcon size={22} className="text-[#FFD4B2]" />
                      </div>
                    </div>

                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold tracking-tight">{job.title}</h3>
                        <p className="text-sm text-neutral-400 mt-2 font-mono leading-relaxed">{job.desc}</p>
                      </div>
                      <div className="flex justify-between items-end mt-8">
                        <div>
                          <div className="text-[10px] uppercase tracking-widest text-neutral-500">REWARD</div>
                          <div className="text-2xl font-black text-[#FFD4B2]">+{job.reward}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-neutral-500">COST</div>
                          <div className="flex items-center gap-1 justify-end">
                            <Flame size={14} className="text-orange-400" /> {job.energy}
                          </div>
                        </div>
                      </div>

                      {isVerifying ? (
                        <button 
                          onClick={() => handleCompleteMission(job)}
                          disabled={!canVerify}
                          className="mt-6 w-full py-3 bg-[#FFD4B2] text-black font-bold text-xs uppercase tracking-widest disabled:bg-neutral-700 disabled:text-neutral-400"
                        >
                          {canVerify ? "✓ CAPTURE COMPLETE" : "HOLD UPLINK..."}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStartMission(job)}
                          disabled={isCooling}
                          className="mt-6 w-full py-3 border border-[#FFD4B2]/50 hover:bg-[#FFD4B2] hover:text-black font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-40"
                        >
                          {isCooling ? "RECHARGING..." : "START ENCOUNTER"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RIVAL BATTLES (Warzone) */}
        {activeTab === "WARZONE" && (
          <div className="p-6 md:p-10 pb-32">
            <div className="max-w-2xl mx-auto mb-12 text-center">
              <Swords size={48} className="mx-auto mb-4 text-[#FFD4B2]" />
              <h2 className="text-4xl font-black">RIVAL TRAINER BATTLES</h2>
              <p className="text-neutral-400 font-mono">Steal rupees from other trainers in this habitat • 20 stamina per battle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {rivalTrainers.length > 0 ? rivalTrainers.map((trainer) => (
                <div key={trainer.uid} className="bg-[#050505] p-6 flex flex-col sm:flex-row items-center justify-between hover:bg-white/5 transition-all gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 border-2 border-[#FFD4B2]/30 overflow-hidden rounded-xl">
                      <Image src={trainer.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{trainer.username}</div>
                      <div className="text-xs font-mono text-neutral-500">₹{(trainer.wallet.popCoins || 0).toLocaleString()} RUPEES</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRaid(trainer)}
                    className="px-8 py-3 border border-red-500/50 hover:bg-red-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-all"
                  >
                    BATTLE &amp; STEAL
                  </button>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center text-neutral-500 font-mono text-sm">No rival trainers in this habitat yet...</div>
              )}
            </div>
          </div>
        )}

        {/* HABITAT RANKINGS (Leaderboard) */}
        {activeTab === "LEADERBOARD" && (
          <div className="p-6 md:p-10 pb-32 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-12">
              <Trophy size={32} className="text-[#FFD4B2]" />
              <div>
                <h2 className="text-4xl font-black">HABITAT ARENA RANKINGS</h2>
                <p className="font-mono text-sm text-neutral-400">Top trainers who evolved this niche</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 divide-y divide-white/10">
              {arenaRanking.map((trainer, i) => (
                <div 
                  key={trainer.uid} 
                  className={cn(
                    "flex items-center p-6 transition-all", 
                    trainer.uid === user?.uid ? "bg-[#FFD4B2] text-black" : "hover:bg-white/5"
                  )}
                >
                  <div className="w-10 text-center font-mono text-xl font-black text-neutral-500">
                    #{i+1}
                  </div>
                  <div className="w-14 h-14 mx-6 border-2 border-current overflow-hidden rounded-2xl relative">
                    <Image src={trainer.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {trainer.username}
                      {trainer.uid === user?.uid && <span className="text-xs bg-black/30 px-2 py-0.5 rounded">YOU</span>}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black">₹{trainer.wallet.popCoins}</div>
                    <div className="text-xs text-neutral-500">TOTAL LOOT</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}