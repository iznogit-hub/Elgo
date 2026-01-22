"use client";

import React from "react";
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Activity, 
  Users,
  Terminal,
  Crown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

// --- YOUR COMPONENT SYSTEM ---
import { Background } from "@/components/ui/background";
import { buttonVariants } from "@/components/ui/button"; 
import { HackerText } from "@/components/ui/hacker-text";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { Ping } from "@/components/ui/ping";
import { CommandTrigger } from "@/components/command-trigger";
import { Globe } from "@/components/ui/globe";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { play } = useSfx();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      
      {/* 1. CORE VISUALS */}
      <Background /> 

      {/* 2. TOP BAR */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/50 rounded flex items-center justify-center">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="font-bold font-orbitron tracking-widest text-sm">
            ZAIBATSU<span className="text-cyan-500">.OS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
           <CommandTrigger />
           <TransitionLink href="/auth/login" className="text-xs font-mono text-gray-400 hover:text-white transition-colors">
              {"// LOGIN"}
           </TransitionLink>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/10 text-cyan-400 text-[10px] font-mono tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            SYSTEM ONLINE // V2.0
          </div>

          <h1 className="text-5xl md:text-8xl font-black font-orbitron tracking-tighter text-white mb-6 leading-[0.9]">
            CONTROL THE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600">
              ALGORITHM
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            The elite growth cartel for Instagram creators. Join the 
            <span className="text-white font-bold"> Inner Circle</span>. 
            Dominate the feed. We are the signal in the noise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <MagneticWrapper strength={0.3}>
              <TransitionLink 
                href="/auth/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "h-16 px-10 text-xl tracking-widest font-bold font-orbitron shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:scale-105"
                )}
                onMouseEnter={() => play("hover")}
                onClick={() => play("click")}
              >
                INITIALIZE <ArrowRight className="ml-3 w-6 h-6" />
              </TransitionLink>
            </MagneticWrapper>
            
            <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border border-black flex items-center justify-center text-[8px] text-white">
                       <Users className="w-3 h-3" />
                    </div>
                  ))}
               </div>
               <p>500+ Operatives Active</p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE GLOBE / NETWORK */}
      <section className="relative h-[600px] w-full overflow-hidden border-y border-white/5 bg-black/50">
         <div className="absolute inset-0 z-0 opacity-40">
            <Globe />
         </div>
         <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center">
               <h3 className="text-2xl md:text-4xl font-black font-orbitron text-white mb-2">GLOBAL NETWORK</h3>
               <p className="text-gray-400 font-mono text-sm">Nodes active in 42 countries</p>
            </div>
         </div>
      </section>

      {/* ⚡ NAINA SINGH CALLOUT (SISTER PROTOCOL) */}
      <section className="relative py-24 bg-gradient-to-b from-black via-pink-950/10 to-black border-y border-pink-500/10 overflow-hidden">
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
         
         <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
               
               <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold tracking-widest uppercase">
                     <Crown className="w-3 h-3" /> Sister Protocol Detected
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-black font-orbitron text-white leading-tight">
                     MEET THE <br/>
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                        APEX PREDATOR
                     </span>
                  </h2>
                  
                  <p className="text-gray-400 text-lg leading-relaxed">
                     Naina Singh commands an 800k+ network. Her 
                     {/* ⚡ ESCAPED QUOTES BELOW */}
                     <strong className="text-white"> &quot;Sister Protocol&quot;</strong> is the fastest way to bypass the algorithm for female creators.
                  </p>

                  <div className="flex gap-4">
                     <MagneticWrapper>
                        <Link href="/naina">
                           <button 
                              className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold tracking-widest uppercase font-orbitron rounded-sm transition-all hover:scale-105 flex items-center gap-2"
                              onMouseEnter={() => play("hover")}
                              onClick={() => play("click")}
                           >
                              ENTER HER DOMAIN <ChevronRight className="w-4 h-4" />
                           </button>
                        </Link>
                     </MagneticWrapper>
                  </div>
               </div>

               {/* Stylized Card */}
               <Link href="/naina">
                  <div 
                     className="relative aspect-[4/5] md:aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-pink-500/30 group cursor-pointer"
                     onMouseEnter={() => play("hover")}
                  >
                     <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2864&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                     
                     <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-bold text-white font-orbitron">NAINA SINGH</h3>
                        <p className="text-pink-400 font-mono text-xs tracking-widest">800K REACH // QUEENS GAMBIT</p>
                     </div>
                  </div>
               </Link>

            </div>
         </div>
      </section>

      {/* 5. FEATURES GRID */}
      <section className="py-24 px-6 relative z-10">
         <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
               <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur hover:border-cyan-500/50 transition-colors group">
                  <ShieldCheck className="w-10 h-10 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2 font-orbitron">ANTI-BAN PROTOCOLS</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {/* ⚡ ESCAPED QUOTES BELOW */}
                    Our proprietary &quot;Ghost Mode&quot; ensures your growth looks organic to Meta&apos;s AI. Zero flags.
                  </p>
               </div>
               <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur hover:border-cyan-500/50 transition-colors group">
                  <Zap className="w-10 h-10 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2 font-orbitron">VELOCITY INJECTION</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Trigger algorithmic spikes on demand. When you post, the Zaibatsu network engages instantly.
                  </p>
               </div>
               <div className="p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur hover:border-cyan-500/50 transition-colors group">
                  <Activity className="w-10 h-10 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2 font-orbitron">RANKING SYSTEM</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Climb the hierarchy from Recruit to Warlord. Unlock exclusive tools and reach at higher tiers.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* 6. STATS TICKER */}
      <section className="border-t border-white/10 bg-black py-12">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
               <div className="p-4 border border-white/10 rounded-xl bg-black/50 backdrop-blur">
                  <div className="text-3xl font-black text-white">
                    <HackerText text="50M+" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Collective Reach</div>
               </div>
               <div className="p-4 border border-white/10 rounded-xl bg-black/50 backdrop-blur">
                  <div className="text-3xl font-black text-white">
                    <HackerText text="850+" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Active Operatives</div>
               </div>
               <div className="p-4 border border-white/10 rounded-xl bg-black/50 backdrop-blur">
                  <div className="text-3xl font-black text-white">
                    <HackerText text="24/7" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Auto-Verification</div>
               </div>
               <div className="p-4 border border-white/10 rounded-xl bg-black/50 backdrop-blur">
                  <div className="text-3xl font-black text-white">
                    <HackerText text="100%" />
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-widest">Algorithmic Uptime</div>
               </div>
            </div>
         </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="py-12 border-t border-white/10 text-center bg-[#020202]">
        <div className="flex flex-col items-center justify-center gap-4 mb-4 opacity-50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-mono">ENCRYPTED CONNECTION // ZAIBATSU CORP</span>
          </div>
          {/* Server Latency Indicator */}
          <Ping />
        </div>
        <p className="text-gray-700 text-[10px] font-sans">
          © 2026 BubblePops Studios. All Rights Reserved.
        </p>
      </footer>

    </main>
  );
}