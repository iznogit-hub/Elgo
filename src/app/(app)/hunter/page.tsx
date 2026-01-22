"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { 
  Radar, Search, Loader2, Link as LinkIcon, Users, 
  Crown, Zap, Heart, ExternalLink, Target, 
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- ZAIBATSU UI ---
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";

// --- MOCK DATA FOR "OPERATIVE SCAN" ---
// In the future, fetch this from Firestore collection "boosted_users"
const OPERATIVES = [
  {
    id: "op_1",
    username: "AMBER_CEO",
    tier: "inner_circle", // PAID USER
    niche: "business",
    instagram: "https://instagram.com/amber_ceo",
    reward: 100,
    isBoosted: true, 
  },
  {
    id: "op_2",
    username: "FIT_WARLORD_99",
    tier: "captain",
    niche: "fitness", 
    instagram: "https://instagram.com/fit_warlord",
    reward: 20,
    isBoosted: false,
  },
  {
    id: "op_3",
    username: "CYBER_VIXEN",
    tier: "soldier",
    niche: "fashion",
    instagram: "https://instagram.com/cyber_vixen",
    reward: 30,
    isSisterProtocol: true, 
  },
];

export default function SignalRadarPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx(); 
  const [activeTab, setActiveTab] = useState<"content" | "operatives">("content");
  
  // FORM STATE
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  
  // CLAIM STATE (Prevent double claiming)
  const [claimedOps, setClaimedOps] = useState<string[]>([]);

  // --- LOGIC: SUBMIT AUDIO ---
  const handleSubmitScout = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    
    if (!url.includes("instagram.com")) {
        play("error");
        return toast.error("INVALID_FREQUENCY: SECURE INSTAGRAM LINKS ONLY");
    }
    
    setLoading(true);
    toast.loading("ENCRYPTING PACKET...");

    try {
      await addDoc(collection(db, "scouting_reports"), {
        submittedBy: userData?.uid,
        username: userData?.username,
        url: url,
        status: "pending",
        timestamp: new Date().toISOString()
      });
      toast.dismiss();
      play("success");
      toast.success("SIGNAL LOGGED. PENDING VERIFICATION.");
      setUrl("");
    } catch (err) {
      toast.dismiss();
      play("error");
      toast.error("TRANSMISSION FAILED.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CLAIM FOLLOW REWARD ---
  const handleFollowClaim = async (opId: string, opName: string, reward: number) => {
    if (claimedOps.includes(opId)) {
        toast.info("ALREADY_LINKED: SIGNAL ESTABLISHED");
        return;
    }

    if (!user) return;

    play("click");
    toast.loading(`ESTABLISHING UPLINK: ${opName}...`);
    
    // Optimistic UI Update (Add to claimed list immediately)
    setClaimedOps(prev => [...prev, opId]);

    // Simulate delay for "verification"
    setTimeout(async () => {
        try {
            // ⚡ REAL DB UPDATE: Credit the user
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                popCoins: increment(reward)
            });

            toast.dismiss();
            play("success");
            toast.success(`REWARD CREDITED: +${reward} PC`);
        } catch (e) {
            console.error(e);
            toast.dismiss();
            toast.error("ERROR SYNCING WALLET");
        }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050505] pb-24 relative overflow-hidden font-sans text-white">
      
      {/* 1. BACKGROUND & VISUALS */}
      <div className="fixed inset-0 z-0">
          <Background />
      </div>
      
      {/* 2. RADAR HEADER */}
      <header className="p-6 md:p-8 border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center bg-green-950/30 rounded-full border border-green-500/50">
               <Radar className="w-6 h-6 text-green-500 animate-[spin_4s_linear_infinite]" />
               <span className="absolute inset-0 rounded-full border border-green-500/30 animate-ping opacity-50" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-green-500 mb-0.5">
                 <Wifi className="w-3 h-3 animate-pulse" />
                 <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">SCANNING_NETWORK</span>
              </div>
              <h1 className="text-2xl font-black font-orbitron tracking-wider text-white">
                <HackerText text="SIGNAL RADAR" speed={40} />
              </h1>
            </div>
          </div>
          
          {/* TOGGLE SWITCH */}
          <div className="flex bg-black/50 border border-white/10 rounded-lg p-1 relative">
            {/* Sliding Background */}
            <div 
                className={cn(
                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 border border-white/20 rounded shadow transition-all duration-300",
                    activeTab === "operatives" ? "left-[50%]" : "left-1"
                )} 
            />
            
            <button
              onClick={() => { setActiveTab("content"); play("click"); }}
              className={cn(
                "relative z-10 px-6 py-2 text-xs font-bold transition-colors w-32 font-mono tracking-wider",
                activeTab === "content" ? "text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              AUDIO_SCOUT
            </button>
            <button
              onClick={() => { setActiveTab("operatives"); play("click"); }}
              className={cn(
                "relative z-10 px-6 py-2 text-xs font-bold transition-colors w-32 font-mono tracking-wider",
                activeTab === "operatives" ? "text-white" : "text-gray-500 hover:text-gray-300"
              )}
            >
              OPERATIVES
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 relative z-20">

        {/* --- MODE A: CONTENT SCOUT --- */}
        {activeTab === "content" && (
          <div className="animate-in fade-in slide-in-from-left-8 duration-500 space-y-8">
            <div className="bg-[#0A0A0A]/90 border border-white/10 p-8 rounded-2xl relative overflow-hidden text-center group hover:border-green-500/50 transition-colors shadow-2xl">
              
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#000_3px)] opacity-10 pointer-events-none" />

              <div className="relative z-10">
                  <div className="w-16 h-16 mx-auto bg-green-900/20 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                    <Search className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2 font-orbitron tracking-wide">AUDIO INTERCEPT</h3>
                  <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                    Found a viral frequency? Upload the secure link. <br/>
                    <span className="text-green-400">Reward: Bounty Payout upon verification.</span>
                  </p>
                  
                  <form onSubmit={handleSubmitScout} className="space-y-4 max-w-lg mx-auto">
                    <div className="relative group/input">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-green-500 transition-colors" />
                      <Input 
                        placeholder="https://instagram.com/reels/audio/..." 
                        className="bg-black/50 border-white/10 text-white pl-12 h-14 font-mono text-sm focus:border-green-500 transition-all focus:ring-1 focus:ring-green-500/50"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onFocus={() => play("hover")}
                      />
                    </div>
                    
                    <MagneticWrapper>
                        <Button 
                        type="submit" 
                        disabled={loading || !url}
                        onMouseEnter={() => play("hover")}
                        className="w-full h-14 bg-green-700 hover:bg-green-600 text-white font-bold tracking-[0.15em] font-orbitron shadow-[0_0_20px_rgba(21,128,61,0.4)] transition-all hover:scale-[1.02]"
                        >
                        {loading ? (
                            <span className="flex items-center gap-2 text-xs md:text-sm">
                                <Loader2 className="animate-spin w-4 h-4" /> UPLOADING PACKET...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2 text-xs md:text-sm">
                                <Search className="w-4 h-4" /> SUBMIT SIGNAL
                            </span>
                        )}
                        </Button>
                    </MagneticWrapper>
                  </form>
              </div>
            </div>
          </div>
        )}

        {/* --- MODE B: OPERATIVE SCAN --- */}
        {activeTab === "operatives" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
            
            {/* INFO BANNER */}
            <div className="p-6 bg-blue-950/10 border border-blue-500/30 rounded-xl flex gap-5 items-center backdrop-blur-sm">
               <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-500/20">
                 <Users className="w-6 h-6 text-blue-400 shrink-0" />
               </div>
               <div>
                 <h4 className="text-sm font-bold text-blue-400 tracking-widest font-orbitron mb-1">NETWORK PROTOCOL ACTIVE</h4>
                 <p className="text-xs text-gray-400 leading-relaxed">
                   Linking with operatives signals <span className="text-white font-bold">"Cluster Relevance"</span> to the algorithm. 
                   <br/>Use "Sister Protocol" for high-trust engagement.
                 </p>
               </div>
            </div>

            <div className="space-y-4">
              {OPERATIVES.map((op) => {
                const isClaimed = claimedOps.includes(op.id);

                return (
                <div 
                  key={op.id}
                  onMouseEnter={() => play("hover")}
                  className={cn(
                    "relative flex flex-col sm:flex-row items-center justify-between p-1 rounded-xl border transition-all duration-300 group hover:scale-[1.01]",
                    op.isBoosted 
                      ? "bg-gradient-to-r from-yellow-900/20 via-black to-black border-yellow-600/50 hover:border-yellow-500" // PAID
                      : op.isSisterProtocol
                        ? "bg-gradient-to-r from-pink-900/10 via-black to-black border-pink-500/30 hover:border-pink-500" // SISTER
                        : "bg-[#0A0A0A] border-white/5 hover:border-cyan-500" // STANDARD
                  )}
                >
                  {/* Inner Container */}
                  <div className="w-full h-full flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4">
                    
                    {/* LEFT: IDENTITY */}
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg",
                        op.isBoosted ? "bg-yellow-900/20 border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]" 
                        : op.isSisterProtocol ? "bg-pink-900/20 border-pink-500 text-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                        : "bg-gray-900 border-gray-700 text-gray-500 group-hover:border-cyan-500 group-hover:text-cyan-500 transition-colors"
                      )}>
                        {op.isBoosted ? <Crown className="w-7 h-7" /> 
                          : op.isSisterProtocol ? <Heart className="w-7 h-7" /> 
                          : <Target className="w-7 h-7" />}
                      </div>

                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "font-bold font-orbitron text-lg",
                            op.isBoosted ? "text-yellow-500" : "text-white group-hover:text-cyan-400 transition-colors"
                          )}>
                            {op.username}
                          </span>
                          {op.isBoosted && <span className="text-[9px] bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-1.5 py-0.5 rounded font-mono font-bold">BOOSTED</span>}
                          {op.isSisterProtocol && <span className="text-[9px] bg-pink-500/20 border border-pink-500/50 text-pink-400 px-1.5 py-0.5 rounded font-mono font-bold">SISTER</span>}
                        </div>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-wide">
                          {op.niche} DIV // <span className={cn(op.isBoosted ? "text-yellow-600" : "text-gray-600")}>{op.tier}</span>
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: ACTION */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-none border-white/5 pt-3 sm:pt-0">
                      <div className="text-right mr-4">
                          <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">BOUNTY</div>
                          <div className={cn(
                            "font-bold font-mono text-lg flex items-center gap-1",
                            op.isBoosted ? "text-yellow-400" : "text-white"
                          )}>
                             <Zap className="w-4 h-4 fill-current" /> {op.reward}
                          </div>
                      </div>
                      
                      <MagneticWrapper>
                        <a 
                            href={op.instagram} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => handleFollowClaim(op.id, op.username, op.reward)}
                            className={isClaimed ? "pointer-events-none" : ""}
                        >
                            <Button size="sm" disabled={isClaimed} className={cn(
                            "h-10 px-6 text-xs font-bold tracking-widest transition-all",
                            isClaimed 
                                ? "bg-green-900/50 text-green-500 border border-green-500/50 opacity-50 cursor-not-allowed"
                                : op.isBoosted ? "bg-yellow-600 hover:bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.3)]" 
                                : op.isSisterProtocol ? "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                : "bg-cyan-950/30 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30"
                            )}>
                            {isClaimed ? "SIGNAL LOCKED" : "LINK"} <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </a>
                      </MagneticWrapper>
                    </div>
                  </div>
                </div>
              )})}
            </div>

            {/* UPSELL FOR BOOST */}
            <div className="mt-8 text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <p className="text-gray-500 text-sm mb-4">Want to be a <span className="text-yellow-500 font-bold">Priority Uplink</span> and gain followers fast?</p>
              <Button variant="outline" className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 font-mono text-xs">
                <Crown className="w-3 h-3 mr-2" /> PURCHASE_BOOST_SLOT
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}