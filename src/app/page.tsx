"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  ArrowRight, AlertTriangle, Play, 
  Zap, Radio, Target, Lock, ShieldCheck, Skull, Fingerprint
} from "lucide-react";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context";
import { HackerText } from "@/components/ui/hacker-text";
import { cn } from "@/lib/utils";

const TICKER_TEXT = [
  "CULLING PROTOCOL ACTIVE // 48H REMAINING",
  "TOP WARLORD: NEON_VIPER // 1,240 KILLS",
  "TOTAL BOUNTY POOL: 2,847,320 PC",
  "SURVIVAL RATE: 8.2% // DECLINING",
  "NEW COLONY UNLOCKED: SHIBUYA GRID",
  "GLOBAL BROADCAST: ELIMINATE ALL RECRUITS",
  "GOD MODE DETECTED // OVERSEER ONLINE"
];

const COLONIES = [
  { id: "01", name: "Tokyo Core", type: "Total War", status: "ONLINE", players: 18420, threat: "EXTREME" },
  { id: "02", name: "Sendai Outpost", type: "Tech Assault", status: "ONLINE", players: 12394, threat: "HIGH" },
  { id: "03", name: "Sakurajima Arena", type: "Fitness Carnage", status: "LOCKED", players: 0, threat: "UNKNOWN" },
  { id: "04", name: "Shibuya Crossroads", type: "Style Execution", status: "ONLINE", players: 9872, threat: "MEDIUM" },
  { id: "05", name: "Kyoto Shadows", type: "Stealth Hunt", status: "LOCKED", players: 0, threat: "CLASSIFIED" },
  { id: "06", name: "Osaka Vault", type: "Wealth Raid", status: "ONLINE", players: 15678, threat: "CRITICAL" },
];

const PROTOCOLS = [
  {
    id: "01",
    title: "AUTHENTICATE",
    desc: "Secure Google Uplink required to enter the grid.",
    icon: ShieldCheck,
    color: "text-blue-500",
    border: "border-blue-500/50"
  },
  {
    id: "02",
    title: "IDENTIFY",
    desc: "Declare your social frequency. Become visible.",
    icon: Fingerprint,
    color: "text-pink-500",
    border: "border-pink-500/50"
  },
  {
    id: "03",
    title: "DOMINATE",
    desc: "Kill targets. Earn bounties. Ascend the hierarchy.",
    icon: Skull,
    color: "text-red-500",
    border: "border-red-500/50"
  }
];

export default function Home() {
  const { play } = useSfx();
  const { userData, loading } = useAuth();
  const router = useRouter();
  
  const [tickerIndex, setTickerIndex] = useState(0);

  // REDIRECT IF LOGGED IN
  useEffect(() => {
    if (!loading && userData) {
      router.push("/dashboard");
    }
  }, [userData, loading, router]);

  // TICKER ANIMATION
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % TICKER_TEXT.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ENTRY HANDLER
  const handleEnterGame = () => {
    play("success");
    // Direct path to Login -> Identity Flow
    router.push("/auth/login");
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* HERO BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/hero-bg.jpg" 
          alt="Culling Barrier"
          fill
          priority
          className="object-cover opacity-20 grayscale contrast-150 animate-pulse"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.15)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>

      {/* LIVE TICKER */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
        <div className="flex items-center justify-center gap-4 px-8 py-3 bg-red-950/90 border-4 border-red-600/80 backdrop-blur-2xl rounded-full shadow-2xl shadow-red-600/60 animate-pulse">
          <Radio size={24} className="text-red-500 hidden md:block" />
          <HackerText text={TICKER_TEXT[tickerIndex]} className="text-xl md:text-2xl font-black text-red-400 tracking-wider text-center" />
        </div>
      </div>

      {/* HERO CONTENT */}
      <section className="relative z-30 flex-1 flex flex-col items-center justify-center gap-12 md:gap-16 px-8 pt-32 pb-20">
        
        {/* TITLE BLOCK */}
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-black/70 border-4 border-red-600/60 backdrop-blur-xl rounded-full shadow-2xl shadow-red-600/50">
            <AlertTriangle size={32} className="text-yellow-500 animate-pulse" />
            <HackerText text="PARTICIPATION IS MANDATORY" className="text-xl md:text-2xl font-black text-yellow-400 tracking-widest" />
          </div>

          <h1 className="text-6xl md:text-9xl lg:text-[12rem] font-black leading-none tracking-tighter drop-shadow-2xl">
            <span className="block text-white mix-blend-screen">BOYZ</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-red-500 to-black stroke-white stroke-4">
              'N' GALZ
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-mono text-neutral-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            The Culling Game Has Begun • Kill for Status • Survive for Eternal Wealth
          </p>
        </div>

        {/* PROTOCOL CARDS (Replacing Form) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          {PROTOCOLS.map((proto, i) => (
            <div 
              key={proto.id}
              className={cn(
                "relative bg-black/60 backdrop-blur-md border-2 p-8 rounded-2xl flex flex-col items-center text-center gap-4 group hover:bg-black/80 transition-all duration-500",
                proto.border
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className={cn("p-4 rounded-full bg-black/50 border border-white/10 mb-2 group-hover:scale-110 transition-transform", proto.color)}>
                <proto.icon size={40} />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-widest text-white">
                <span className="text-neutral-600 mr-2">{proto.id}.</span> {proto.title}
              </h3>
              <p className="text-sm font-mono text-neutral-400 uppercase leading-relaxed">
                {proto.desc}
              </p>
            </div>
          ))}
        </div>

        {/* MASSIVE CTA */}
        <div className="w-full max-w-md">
          <MagneticWrapper>
            <button 
              onClick={handleEnterGame}
              className="group relative w-full py-8 md:py-10 text-3xl md:text-5xl font-black uppercase bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-[0_0_60px_rgba(220,38,38,0.6)] hover:shadow-[0_0_100px_rgba(220,38,38,0.8)] transition-all flex items-center justify-center gap-6 border-4 border-red-500/50"
            >
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
              <span className="relative z-10 flex items-center gap-4">
                BREACH BARRIER <ArrowRight size={48} className="group-hover:translate-x-2 transition-transform" />
              </span>
            </button>
          </MagneticWrapper>
          <p className="text-center mt-6 text-xs font-mono text-neutral-600 uppercase tracking-widest">
            By clicking above, you agree to the lethal terms of service.
          </p>
        </div>

      </section>

      {/* COLONIES PREVIEW */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-black to-neutral-900 border-t-8 border-red-900/60">
        <div className="text-center mb-12 md:mb-20 px-4">
          <HackerText text="ACTIVE BATTLE ZONES" className="text-5xl md:text-7xl font-black text-red-400 mb-6" />
          <p className="text-xl md:text-2xl font-mono text-neutral-400 uppercase tracking-widest">
            Choose Your Graveyard
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 px-6 md:px-12">
          {COLONIES.map((colony) => (
            <div key={colony.id} className={cn(
              "relative h-80 md:h-96 bg-black/80 border-8 rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105 group",
              colony.status === "ONLINE" ? "border-red-600/80" : "border-neutral-800 opacity-60"
            )}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              {colony.status === "LOCKED" && <Lock size={100} className="absolute inset-0 m-auto text-red-600/60" />}
              
              <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-2xl md:text-3xl font-black text-red-500">NO.{colony.id}</span>
                  <div className="text-right">
                    <span className="block text-base md:text-lg font-mono text-neutral-400 uppercase">{colony.threat}</span>
                    {colony.status === "ONLINE" ? <Zap size={32} className="text-green-500 animate-pulse ml-auto mt-2" /> : <Skull size={32} className="text-red-500 ml-auto mt-2" />}
                  </div>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase mb-2 md:mb-4 text-white group-hover:text-red-500 transition-colors">{colony.name}</h3>
                  <p className="text-xl md:text-2xl font-mono text-neutral-300 uppercase">{colony.type}</p>
                </div>

                <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div>
                    <span className="block text-lg md:text-xl font-mono text-neutral-500 uppercase">Population</span>
                    <span className="text-4xl md:text-6xl font-black text-white">{colony.players.toLocaleString()}</span>
                  </div>
                  <span className={cn("text-2xl md:text-3xl font-black", colony.status === "ONLINE" ? "text-green-500" : "text-red-500")}>
                    {colony.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t-8 border-red-900/60 bg-black text-center px-6">
        <HackerText text="WARNING: NO RESPAWNS" className="text-3xl md:text-4xl font-black text-red-500 mb-8" />
        <p className="text-xl md:text-2xl font-mono text-neutral-500 uppercase tracking-widest max-w-4xl mx-auto">
          By entering the barrier, you forfeit all rights. Death is permanent. Wealth is eternal.
        </p>
      </footer>
    </main>
  );
}