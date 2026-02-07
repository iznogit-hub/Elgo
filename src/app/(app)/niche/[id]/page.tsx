"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  doc, updateDoc, arrayUnion, increment, onSnapshot, 
  collection, query, where, getDocs, limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { NICHE_DATA } from "@/lib/niche-data";
import { 
  ArrowLeft, Copy, Play, Lock, Crown, Users, 
  Crosshair, ExternalLink, ShieldCheck, Zap, Share2, Music, FileText
} from "lucide-react";
import { toast } from "sonner";
import { Background } from "@/components/ui/background";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";

// --- FAKE ASSET DATA (Replace with Firestore 'sector_assets' later) ---
const MOCK_ASSETS = {
    scripts: [
        { title: "The Controversy Hook", content: "Stop doing [TOPIC] like this. You are burning money. Here is the exact protocol the top 1% use..." },
        { title: "The Storytime Framework", content: "I almost quit [TOPIC] yesterday. But then I found this glitch in the matrix..." },
        { title: "The Value Stack", content: "3 Tools you need for [TOPIC] right now. Number 1 is obvious, but Number 3 is illegal in 4 countries..." },
    ],
    audio: [
        { title: "Trending: Dark Phonk", url: "https://instagram.com/audio/12345" },
        { title: "Trending: Motivational Speech", url: "https://instagram.com/audio/67890" },
        { title: "Trending: Glitch Sound", url: "https://instagram.com/audio/11223" },
    ]
};

export default function NichePage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { play } = useSfx();
  
  const id = params.id as string;
  const initialData = NICHE_DATA[id] || NICHE_DATA["general"];
  const [nicheData, setNicheData] = useState<any>(initialData);
  
  // STATE
  const [activeTab, setActiveTab] = useState<"ARMORY" | "RADAR">("ARMORY");
  const [activePlayers, setActivePlayers] = useState<any[]>([]);
  const [followedCreators, setFollowedCreators] = useState<string[]>([]);
  
  // MEMBERSHIP CHECK
  const isElite = userData?.membership?.tier === "elite" || userData?.membership?.tier === "council";

  // 1. FETCH REAL PLAYERS
  useEffect(() => {
    const fetchActiveUnits = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, "users"),
                where("unlockedNiches", "array-contains", id),
                where("uid", "!=", user.uid),
                limit(10)
            );
            const snapshot = await getDocs(q);
            setActivePlayers(snapshot.empty ? [] : snapshot.docs.map(doc => doc.data()));
        } catch (e) { console.error("Radar Offline", e); }
    };
    fetchActiveUnits();
  }, [id, user]);

  // 2. CONNECT TO PLAYER
  const handleConnectPlayer = async (targetUser: any) => {
      const handle = targetUser.instagramHandle;
      if (!handle) return toast.error("NO COMMS LINK");
      if (followedCreators.includes(handle)) return;

      play("click");
      window.open(`https://instagram.com/${handle.replace('@', '')}`, '_blank');
      
      setTimeout(async () => {
          if (confirm(`Link established? Claim 50 PC.`)) {
             try {
                 const userRef = doc(db, "users", user!.uid);
                 await updateDoc(userRef, {
                     "wallet.popCoins": increment(50),
                     "followedCreators": arrayUnion(handle)
                 });
                 setFollowedCreators(prev => [...prev, handle]);
                 toast.success(`LINK ESTABLISHED: +50 PC`);
                 play("success");
             } catch (e) { toast.error("CONNECTION FAILED"); }
          }
      }, 2000);
  };

  // 3. COPY REFERRAL LINK
  const handleCopyReferral = () => {
      const link = `${window.location.origin}/auth/signup?ref=${userData?.username}`;
      navigator.clipboard.writeText(link);
      play("click");
      toast.success("RECRUITMENT LINK COPIED");
  };

  // 4. FAKE PAYMENT TRIGGER
  const handlePayment = () => {
      play("kaching");
      // Integrate Razorpay/UPI Deep Link here
      if(confirm("Open Payment Gateway for ₹99 Lifetime Access?")) {
          // Redirect to payment logic
          alert("Payment Gateway Initializing..."); 
      }
  };

  if (loading || !userData) return <div className="bg-black min-h-screen" />;

  return (
    <main className="relative h-screen w-full bg-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src={nicheData.imageSrc || `/images/sectors/${id}.jpg`} alt="Sector" fill className="object-cover opacity-20 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10" />
      </div>
      
      <SoundPrompter />
      <Background />

      {/* --- HEADER --- */}
      <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4">
              <TransitionLink href="/dashboard" className="w-10 h-10 border border-white/10 bg-white/5 flex items-center justify-center hover:border-red-500 rounded-sm transition-all">
                <ArrowLeft size={18} />
              </TransitionLink>
              <div>
                  <h1 className="text-xl font-black font-sans uppercase italic leading-none">{nicheData.label}</h1>
                  <span className={cn("text-[9px] font-mono tracking-widest uppercase flex items-center gap-2", isElite ? "text-yellow-500" : "text-neutral-500")}>
                     {isElite ? <><Crown size={10} /> ELITE ACCESS</> : <><Lock size={10} /> RESTRICTED MODE</>}
                  </span>
              </div>
          </div>
          <div className="flex bg-neutral-900/50 p-1 rounded-sm border border-white/10">
              <button onClick={() => setActiveTab("ARMORY")} className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-sm transition-all flex items-center gap-2", activeTab === "ARMORY" ? "bg-white text-black" : "text-neutral-500 hover:text-white")}>
                  <Zap size={12} /> Armory
              </button>
              <button onClick={() => setActiveTab("RADAR")} className={cn("px-4 py-2 text-[9px] font-black uppercase rounded-sm transition-all flex items-center gap-2", activeTab === "RADAR" ? "bg-red-600 text-white" : "text-neutral-500 hover:text-white")}>
                  <Crosshair size={12} /> Radar
              </button>
          </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 z-40 relative no-scrollbar">
          
          {/* TAB: ARMORY (Scripts & Audio) */}
          {activeTab === "ARMORY" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  
                  {/* SCRIPTS SECTION */}
                  <section className="space-y-4">
                      <div className="flex items-center gap-2 text-white/50 border-b border-white/10 pb-2">
                          <FileText size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Viral_Scripts</span>
                      </div>
                      <div className="grid gap-4">
                          {MOCK_ASSETS.scripts.map((script, i) => {
                              const isLocked = !isElite && i > 0; // Lock everything after 1st item
                              return (
                                  <div key={i} className="relative group">
                                      <div className={cn("p-6 border rounded-sm transition-all", isLocked ? "bg-neutral-900/30 border-white/5 blur-[2px] opacity-50" : "bg-neutral-900/60 border-white/10 hover:border-white/30")}>
                                          <h3 className="text-xs font-bold text-yellow-500 uppercase mb-3">{script.title}</h3>
                                          <p className="text-lg md:text-xl font-mono leading-relaxed text-white select-all">{script.content}</p>
                                          
                                          {!isLocked && (
                                              <button onClick={() => { navigator.clipboard.writeText(script.content); toast.success("COPIED"); }} className="absolute top-4 right-4 p-2 bg-white/5 rounded-sm hover:bg-white text-neutral-400 hover:text-black transition-all">
                                                  <Copy size={14} />
                                              </button>
                                          )}
                                      </div>
                                      {/* LOCK OVERLAY */}
                                      {isLocked && (
                                          <div className="absolute inset-0 flex items-center justify-center z-10">
                                              <Lock size={24} className="text-white/20" />
                                          </div>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                  </section>

                  {/* AUDIO SECTION */}
                  <section className="space-y-4">
                      <div className="flex items-center gap-2 text-white/50 border-b border-white/10 pb-2">
                          <Music size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Trending_Audio</span>
                      </div>
                      <div className="grid gap-3">
                          {MOCK_ASSETS.audio.map((track, i) => {
                              const isLocked = !isElite && i > 0;
                              return (
                                  <div key={i} className={cn("flex items-center justify-between p-4 border rounded-sm transition-all", isLocked ? "bg-neutral-900/30 border-white/5 opacity-50" : "bg-neutral-900/60 border-white/10 hover:border-white/30")}>
                                      <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
                                              {isLocked ? <Lock size={12} className="text-neutral-600"/> : <Play size={12} className="text-white"/>}
                                          </div>
                                          <div>
                                              <h4 className="text-xs font-bold text-white uppercase">{track.title}</h4>
                                              <span className="text-[8px] font-mono text-neutral-500">Instagram Reel Audio</span>
                                          </div>
                                      </div>
                                      {!isLocked && (
                                          <button onClick={() => window.open(track.url, '_blank')} className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase rounded-sm flex items-center gap-2">
                                              USE AUDIO <ExternalLink size={10} />
                                          </button>
                                      )}
                                  </div>
                              )
                          })}
                      </div>
                  </section>

                  {/* UPSELL FOOTER (If not Elite) */}
                  {!isElite && (
                      <div className="mt-8 p-6 bg-gradient-to-r from-yellow-900/20 to-black border border-yellow-500/30 rounded-sm text-center space-y-4">
                          <div className="flex flex-col items-center gap-2">
                              <Crown size={32} className="text-yellow-500 animate-pulse" />
                              <h3 className="text-xl font-black font-sans uppercase italic text-white">Unlock The Full Armory</h3>
                              <p className="text-[10px] font-mono text-yellow-500/80 uppercase tracking-widest max-w-sm">
                                  Access all scripts, audios, and advanced radar data.
                              </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* OPTION 1: PAY */}
                              <button onClick={handlePayment} className="group p-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-sm transition-all">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                      <span className="text-lg font-black uppercase">Buy License</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold block opacity-70">₹99 LIFETIME ACCESS</span>
                              </button>

                              {/* OPTION 2: REFER */}
                              <button onClick={handleCopyReferral} className="group p-4 bg-neutral-900 border border-white/20 hover:border-white text-white rounded-sm transition-all">
                                  <div className="flex items-center justify-center gap-2 mb-1">
                                      <Share2 size={16} />
                                      <span className="text-lg font-black uppercase">Recruit & Earn</span>
                                  </div>
                                  <span className="text-[10px] font-mono font-bold block text-green-500">GET 10,000 PC PER FRIEND</span>
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* TAB: RADAR (Targets) */}
          {activeTab === "RADAR" && (
              <div className="space-y-4 animate-in slide-in-from-right duration-500">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Sector_Hostiles</span>
                      <span className="text-[9px] font-mono text-red-500 animate-pulse">{activePlayers.length} DETECTED</span>
                  </div>
                  
                  {activePlayers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {activePlayers.map((player: any, i: number) => {
                              const isFollowed = followedCreators.includes(player.instagramHandle);
                              const avatar = player.avatar || "/avatars/1.jpg";
                              return (
                                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-900/60 border border-white/10 rounded-sm">
                                      <div className="flex items-center gap-3">
                                          <div className="relative w-10 h-10 rounded-sm overflow-hidden border border-white/20">
                                              <Image src={avatar} alt="Unit" fill className="object-cover" />
                                          </div>
                                          <div>
                                              <h4 className="text-xs font-bold text-white uppercase">{player.username}</h4>
                                              <span className="text-[8px] font-mono text-neutral-500">{player.membership?.tier || "RECRUIT"}</span>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => handleConnectPlayer(player)}
                                          disabled={isFollowed}
                                          className={cn("px-3 py-1.5 text-[9px] font-bold uppercase rounded-sm border", isFollowed ? "bg-transparent text-green-500 border-green-500/50" : "bg-white text-black border-white hover:bg-neutral-200")}
                                      >
                                          {isFollowed ? "LINKED" : "CONNECT"}
                                      </button>
                                  </div>
                              )
                          })}
                      </div>
                  ) : (
                      <div className="p-8 border border-dashed border-white/10 text-center text-[10px] text-neutral-500 font-mono">
                          SCANNING... NO SIGNALS FOUND.
                      </div>
                  )}
              </div>
          )}

      </div>
    </main>
  );
}