"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  ArrowRight, Terminal, AlertTriangle, Play, 
  Instagram, User, Coins, ShieldCheck, Lock, Check, Edit2, Globe, Crosshair, Skull,
  Zap
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";

// --- AVATARS DATA ---
const AVATARS = [
  { id: "1", src: "/avatars/1.jpg" },
  { id: "2", src: "/avatars/2.jpg" },
  { id: "3", src: "/avatars/3.jpg" },
];

const TICKER_TEXT = [
  "PROTOCOL INITIATED: TOTAL WAR",
  "PLAYER COUNT: 14,203 ACTIVE",
  "CURRENT BOUNTY POOL: 1,200,000 PTS",
  "SURVIVAL RATE: 12%",
  "GAME MASTER IS WATCHING"
];

// --- STATIC GAME MODES DATA ---
const COLONIES = [
    { id: "01", name: "Tokyo No. 1", type: "General Warfare", status: "ONLINE", players: 12402 },
    { id: "02", name: "Sendai Colony", type: "Tech Blitz", status: "ONLINE", players: 8392 },
    { id: "03", name: "Sakurajima", type: "Fitness Raid", status: "LOCKED", players: 0 },
    { id: "04", name: "Shibuya", type: "Style War", status: "LOCKED", players: 0 },
];

export default function Home() {
  const { play } = useSfx();
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  // STATE FOR ONBOARDING
  const [formData, setFormData] = useState({
    instagram: "",
    avatar: "/avatars/1.jpg",
  });
  const [igConfirmed, setIgConfirmed] = useState(false);
  const [avatarConfirmed, setAvatarConfirmed] = useState(false);
  
  const [tickerIndex, setTickerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!loading && userData) {
      router.push("/dashboard");
    }
  }, [userData, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_TEXT.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // AUTO SCROLL (Pauses on Hover)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    let scrollAmount = 0;
    const speed = 0.5; 
    let animationId: number;

    const step = () => {
      if (!isHovering) {
          scrollAmount += speed;
          if (scrollAmount >= el.scrollWidth / 2) {
             scrollAmount = 0;
             el.scrollLeft = 0;
          } else {
             el.scrollLeft += speed;
          }
      }
      animationId = requestAnimationFrame(step);
    };
    
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isHovering]);

  // FINAL NAVIGATE
  const handleEnterGame = () => {
      play("click");
      const query = new URLSearchParams({
        ig: formData.instagram,
        av: formData.avatar,
        ref: "glass_guide"
      }).toString();
      router.push(`/auth/signup?${query}`);
  };

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-red-900 overflow-x-hidden font-sans flex flex-col">
      
      {/* --- HERO BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
         <Image 
           src="/images/hero-bg.jpg" 
           alt="Barrier"
           fill
           className="object-cover opacity-30 grayscale contrast-125 animate-[pulse_10s_infinite]"
           priority
         />
         <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none" />
         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
      </div>

      {/* --- LIVE TICKER --- */}
      <div className="absolute top-10 left-0 w-full flex justify-center z-20">
        <div className="flex items-center gap-2 px-4 py-1 bg-red-950/80 border border-red-900 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)]">
           <Terminal size={10} className="text-red-500 animate-pulse" />
           <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-red-500 uppercase min-w-[200px] text-center">
              <HackerText text={TICKER_TEXT[tickerIndex]} speed={30} />
           </span>
        </div>
      </div>

      {/* --- HERO CONTENT --- */}
      <section className="relative z-30 flex flex-col items-center justify-center min-h-[90vh] gap-12 pt-20">
         
         <div className="text-center space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/60 border border-white/20 backdrop-blur-md animate-in zoom-in-50 duration-700">
                <AlertTriangle size={12} className="text-yellow-500" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-white uppercase">
                  Participation is Mandatory
                </span>
             </div>
             
             <h1 className="text-7xl md:text-9xl font-black font-sans tracking-tighter leading-[0.85] text-white mix-blend-screen">
                BOYZ <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-black stroke-white stroke-2">
                  'N' GALZ
                </span>
             </h1>

             <p className="text-sm font-mono text-neutral-400 max-w-sm mx-auto tracking-widest uppercase animate-in fade-in delay-300 duration-1000">
                The Culling Game has begun. <br/> Kill for Status. Survive for Wealth.
             </p>
         </div>

         {/* --- THE INTERACTIVE RULES CAROUSEL --- */}
         <div 
            className="w-full max-w-[100vw] overflow-hidden py-10"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
         >
            <div 
              ref={scrollRef}
              className="flex gap-8 px-8 overflow-x-hidden w-max hover:cursor-grab active:cursor-grabbing"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
            >
               {/* DOUBLED ARRAY FOR INFINITE SCROLL */}
               {[1, 2].map((loop) => (
                 <React.Fragment key={loop}>
                    
                    {/* CARD 1: IDENTITY (Interactive Rule 1) */}
                    <div className={cn(
                        "group relative w-[320px] h-[480px] flex-none border backdrop-blur-xl flex flex-col p-8 justify-between relative overflow-hidden transition-all duration-500",
                        igConfirmed ? "bg-neutral-900/80 border-green-500/50" : "bg-black/60 border-white/10"
                    )}>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />
                        <div className="space-y-4 z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest border-b border-red-900 pb-1">RULE_01</span>
                                {igConfirmed && <Check size={16} className="text-green-500" />}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black font-sans uppercase italic text-white leading-none">Declare Identity</h3>
                                <p className="text-xs font-mono text-neutral-400 mt-2 uppercase tracking-widest leading-relaxed">
                                    Link your digital footprint to enter the barrier.
                                </p>
                            </div>
                        </div>

                        <div className="relative z-20 space-y-4">
                            <div className="relative group/input">
                                <div className="absolute left-3 top-3.5 text-pink-500"><Instagram size={18} /></div>
                                <input 
                                    type="text" 
                                    placeholder="@HANDLE" 
                                    value={formData.instagram}
                                    disabled={igConfirmed}
                                    onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                                    className="w-full h-12 bg-black/50 border border-white/20 pl-10 text-white font-mono uppercase focus:border-red-500 focus:outline-none transition-all placeholder:text-white/20 disabled:opacity-50"
                                />
                            </div>
                            {!igConfirmed ? (
                                <button 
                                    onClick={() => { if(formData.instagram) { setIgConfirmed(true); play("success"); } }}
                                    disabled={!formData.instagram.includes("@")}
                                    className="w-full h-10 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    CONFIRM HANDLE
                                </button>
                            ) : (
                                <button onClick={() => setIgConfirmed(false)} className="w-full h-10 bg-neutral-900 text-neutral-500 font-mono text-xs uppercase hover:text-white flex items-center justify-center gap-2">
                                    <Edit2 size={12} /> EDIT
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CARD 2: VESSEL (Interactive Rule 2) */}
                    <div className={cn(
                        "group relative w-[320px] h-[480px] flex-none border backdrop-blur-xl flex flex-col p-8 justify-between relative overflow-hidden transition-all duration-500",
                        avatarConfirmed ? "bg-neutral-900/80 border-green-500/50" : "bg-black/60 border-white/10",
                        !igConfirmed && "opacity-40 pointer-events-none grayscale"
                    )}>
                        <div className="space-y-4 z-10">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest border-b border-red-900 pb-1">RULE_02</span>
                                {!igConfirmed && <Lock size={14} className="text-white/20" />}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black font-sans uppercase italic text-white leading-none">Choose Vessel</h3>
                                <p className="text-xs font-mono text-neutral-400 mt-2 uppercase tracking-widest leading-relaxed">
                                    Select your combat skin. Appearance dictates status.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 z-20">
                            {AVATARS.map((av) => (
                                <div 
                                    key={av.id}
                                    onClick={() => !avatarConfirmed && setFormData({...formData, avatar: av.src})}
                                    className={cn(
                                        "relative aspect-square border-2 cursor-pointer transition-all",
                                        formData.avatar === av.src ? "border-red-500 scale-105" : "border-white/10 hover:border-white",
                                        avatarConfirmed && formData.avatar !== av.src && "opacity-30"
                                    )}
                                >
                                    <Image src={av.src} alt={av.id} fill className="object-cover" />
                                </div>
                            ))}
                        </div>

                        <div className="z-20">
                            {!avatarConfirmed ? (
                                <button 
                                    onClick={() => { setAvatarConfirmed(true); play("success"); }}
                                    className="w-full h-10 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all"
                                >
                                    CONFIRM VESSEL
                                </button>
                            ) : (
                                <button onClick={() => setAvatarConfirmed(false)} className="w-full h-10 bg-neutral-900 text-neutral-500 font-mono text-xs uppercase hover:text-white flex items-center justify-center gap-2">
                                    <Edit2 size={12} /> RESELECT
                                </button>
                            )}
                        </div>
                    </div>

                    {/* CARD 3: REWARD (Interactive Rule 3) */}
                    <div className={cn(
                        "group relative w-[320px] h-[480px] flex-none bg-black/80 border border-white/20 backdrop-blur-xl flex flex-col p-8 justify-center text-center relative overflow-hidden transition-all duration-500",
                        (!igConfirmed || !avatarConfirmed) && "opacity-40 pointer-events-none grayscale"
                    )}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
                        
                        <div className="relative z-10 flex flex-col items-center gap-6">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                                 <Coins size={32} className="text-yellow-500" />
                            </div>
                            
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black font-sans uppercase italic text-white">Rule #3</h3>
                                <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                                    Claim your starting ration.
                                </p>
                            </div>

                            <div className="py-4 border-y border-white/10 w-full">
                                <span className="text-5xl font-black text-yellow-500 font-sans tracking-tighter">300</span>
                                <span className="block text-[8px] font-mono text-yellow-700 uppercase tracking-[0.3em] mt-1">PopCoins</span>
                            </div>

                            <div className="space-y-4 w-full">
                                <p className="text-[9px] font-mono text-neutral-500 uppercase">
                                    By clicking below, you accept the Culling Game Contract.
                                </p>
                                <button 
                                    onClick={handleEnterGame}
                                    className="w-full h-14 bg-red-600 text-white font-black text-lg uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                                >
                                    ENTER GAME <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                 </React.Fragment>
               ))}
            </div>
         </div>

         {/* --- STATIC CTA (For instant access) --- */}
         <div className="w-full max-w-xs animate-in slide-in-from-bottom-10 fade-in duration-1000">
            <MagneticWrapper>
               <button 
                 onClick={handleEnterGame}
                 className="group relative h-16 w-full bg-white text-black font-black font-sans text-xl tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-4 overflow-hidden clip-path-slant shadow-[0_0_30px_rgba(255,255,255,0.2)]"
               >
                 <span>ENTER BARRIER</span>
                 <Play size={20} fill="currentColor" />
               </button>
            </MagneticWrapper>
         </div>

      </section>

      {/* --- SECTION 2: THE ECONOMY & STATUS --- */}
      <section className="relative py-24 bg-neutral-900 border-t border-white/10">
          <div className="text-center mb-16 space-y-4">
              <h2 className="text-4xl font-black font-sans uppercase italic text-white tracking-tighter">Active Colonies</h2>
              <p className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase">Select your battlefield. Once entered, there is no return.</p>
          </div>

          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
              {COLONIES.map((colony, i) => (
                  <div key={i} className="group relative h-64 bg-black border border-white/10 flex flex-col justify-between p-6 hover:border-red-500 transition-colors cursor-crosshair overflow-hidden">
                      <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex justify-between items-start relative z-10">
                          <span className="text-[8px] font-mono text-neutral-500 border border-neutral-800 px-2 py-1">NO. {colony.id}</span>
                          {colony.status === "ONLINE" ? <Zap size={14} className="text-green-500 animate-pulse" /> : <Lock size={14} className="text-red-500" />}
                      </div>

                      <div className="relative z-10 space-y-2">
                          <h3 className="text-2xl font-black font-sans uppercase italic text-white group-hover:text-red-500 transition-colors">{colony.name}</h3>
                          <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">{colony.type}</p>
                      </div>

                      <div className="relative z-10 border-t border-white/10 pt-4 flex justify-between items-end">
                          <div>
                              <span className="block text-[8px] text-neutral-500 uppercase">Population</span>
                              <span className="text-sm font-mono text-white">{colony.players.toLocaleString()}</span>
                          </div>
                          <span className={colony.status === "ONLINE" ? "text-[8px] text-green-500 font-bold" : "text-[8px] text-red-500 font-bold"}>{colony.status}</span>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-white/10 bg-black text-center">
          <p className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
              Warning: By entering, you agree to the rules of the Culling. Death is permanent.
          </p>
      </footer>

      <style jsx global>{`
        .clip-path-slant {
          clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 20%);
        }
      `}</style>
    </main>
  );
}