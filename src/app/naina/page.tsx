"use client";

import Link from "next/link";
import { 
  Instagram, Crown, Sparkles, ArrowRight, 
  ShieldCheck, Zap 
} from "lucide-react";

// --- ZAIBATSU UI ---
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";

export default function NainaLandingPage() {
  const { play } = useSfx();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-pink-500/30 overflow-x-hidden font-sans relative">
      
      {/* 1. GLOBAL FX */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background />
        {/* Pink Tint Override */}
        <div className="absolute inset-0 bg-pink-900/10 mix-blend-screen" />
      </div>

      {/* --- 2. THE HERO (FULL SCREEN) --- */}
      <section className="relative h-screen w-full flex flex-col justify-end pb-12 md:pb-24 px-6 md:px-12 overflow-hidden">
        
        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40 z-10" />
          {/* High-fashion placeholder image */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 opacity-60" />
        </div>

        <div className="relative z-20 max-w-4xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full border border-pink-500/50 bg-pink-500/10 text-pink-400 text-xs font-bold tracking-widest uppercase backdrop-blur-md">
              Sister Protocol Active
            </span>
            <div className="flex items-center gap-1 text-white text-xs font-mono">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              ONLINE
            </div>
          </div>

          <h1 className="text-6xl md:text-9xl font-black font-orbitron text-white leading-[0.9] mb-6">
            NAINA <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">SINGH</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-300 max-w-2xl mb-10 font-light leading-relaxed">
            The era of "pick me" is over. We are building the <strong className="text-white">Apex Female Network</strong>. 
            800k Reach. Zero Apologies.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
             <MagneticWrapper>
                <Link href="/auth/signup?ref=naina_queen">
                  <Button 
                    onMouseEnter={() => play("hover")}
                    onClick={() => play("click")}
                    className="h-16 px-10 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xl tracking-widest shadow-[0_0_40px_rgba(236,72,153,0.4)] transition-all hover:scale-105"
                  >
                    JOIN THE SISTERHOOD <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
             </MagneticWrapper>
             
             <MagneticWrapper>
                <a href="https://instagram.com/naina_singh" target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline" 
                    className="h-16 px-8 border-white/20 hover:bg-white/10 text-white font-mono uppercase tracking-widest backdrop-blur-md"
                    onMouseEnter={() => play("hover")}
                  >
                    <Instagram className="mr-3 w-5 h-5" /> Verify Status
                  </Button>
                </a>
             </MagneticWrapper>
          </div>
        </div>
      </section>

      {/* --- 3. THE SOCIAL PROOF (Ticker) --- */}
      <div className="py-4 bg-pink-600 text-black font-black text-xl overflow-hidden whitespace-nowrap border-y border-white/10 relative z-20">
        <div className="animate-marquee inline-block">
          NAINA SINGH APPROVED /// 800K REACH VALIDATION /// JOIN THE INNER CIRCLE /// SISTER PROTOCOL ACTIVE /// NAINA SINGH APPROVED /// WE CONTROL THE SIGNAL ///
        </div>
      </div>

      {/* --- 4. FEATURES GRID --- */}
      <section className="py-24 px-6 md:px-12 bg-black relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            
            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-pink-500/50 transition-colors group">
               <Crown className="w-12 h-12 text-pink-500 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold font-orbitron text-white mb-2">QUEEN'S GAMBIT</h3>
               <p className="text-gray-400 leading-relaxed">
                 Direct access to my personal network. When you post, the <span className="text-pink-400">Sister Protocol</span> engages to boost your signal instantly.
               </p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-purple-500/50 transition-colors group">
               <Sparkles className="w-12 h-12 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold font-orbitron text-white mb-2">AESTHETIC DOMINANCE</h3>
               <p className="text-gray-400 leading-relaxed">
                 Unlock exclusive <span className="text-purple-400">"Cyber Vixen"</span> avatars and UI themes unavailable to the general public.
               </p>
            </div>

            <div className="p-8 border border-white/10 rounded-2xl bg-white/5 hover:border-cyan-500/50 transition-colors group">
               <Zap className="w-12 h-12 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-bold font-orbitron text-white mb-2">VELOCITY INJECTION</h3>
               <p className="text-gray-400 leading-relaxed">
                 New members get a <span className="text-cyan-400 font-bold">+500 Velocity Bonus</span> just for using my invite link. Skip the grind.
               </p>
            </div>

        </div>
      </section>

      {/* --- 5. FINAL CTA --- */}
      <section className="py-32 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,72,153,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(236,72,153,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
            <ShieldCheck className="w-20 h-20 text-pink-500 mx-auto mb-8 animate-bounce" />
            <h2 className="text-4xl md:text-7xl font-black font-orbitron mb-8 leading-tight">
              DON'T BE A FOLLOWER.<br/>BE A <span className="text-pink-500">LEADER.</span>
            </h2>
            <MagneticWrapper>
                <Link href="/auth/signup?ref=naina_queen">
                <Button className="h-20 px-12 bg-white text-black hover:bg-pink-500 hover:text-white font-black text-2xl tracking-widest transition-all">
                    CLAIM YOUR THRONE
                </Button>
                </Link>
            </MagneticWrapper>
        </div>
      </section>

    </main>
  );
}