"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Terminal, Activity, Zap, 
  Target, Globe, BarChart3, Crosshair, 
  ShieldAlert, Fingerprint, Network, Layers, 
  CheckCircle2, ShoppingCart, Eye
} from "lucide-react";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { HackerText } from "@/components/ui/hacker-text";

// FIX: Importing the B2B Marketing Packages
import { MARKETING_PACKAGES } from "@/lib/niche-data";

export default function PackageDemoPage() {
  const params = useParams();
  const router = useRouter();
  const { play } = useSfx();
  const id = params.id as string;
  
  const packageData = MARKETING_PACKAGES[id];
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Terminal Simulation Logic
  useEffect(() => {
    if (!packageData) return;
    
    const baseLogs = [
      "INITIALIZING SECURE UPLINK...",
      "BYPASSING ALGORITHMIC GATEKEEPERS...",
      `LOADING PROTOCOL: ${packageData.label.toUpperCase()}`,
      "CALIBRATING TARGET AUDIENCE DEMOGRAPHICS...",
      "INJECTING PSYCHOLOGICAL TRIGGERS...",
      "ESTABLISHING ESCROW CONNECTION...",
      "SIMULATION ENVIRONMENT ACTIVE."
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < baseLogs.length) {
        setLogs(prev => [...prev, baseLogs[currentIndex]]);
        currentIndex++;
      } else {
        // Generate random operational logs after initialization
        const dynamicLogs = [
          `> Traffic anomaly detected: +${Math.floor(Math.random() * 500)}% spike.`,
          `> Conversion module routing active.`,
          `> A/B Test variant ${Math.random() > 0.5 ? 'Alpha' : 'Omega'} winning.`,
          `> Competitor keyword matrix overridden.`,
          `> Retargeting pixel firing sequence initiated.`
        ];
        setLogs(prev => [...prev, dynamicLogs[Math.floor(Math.random() * dynamicLogs.length)]]);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [packageData]);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!packageData) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center font-mono text-cyan-500">
        <ShieldAlert size={48} className="mb-4 text-red-500 animate-pulse" />
        <p>ERROR: PAYLOAD NOT FOUND IN ARSENAL.</p>
        <button onClick={() => router.push("/dashboard")} className="mt-6 border border-cyan-500 px-6 py-2 hover:bg-cyan-500 hover:text-black transition-colors">
          RETURN TO HQ
        </button>
      </div>
    );
  }

  const Icon = packageData.icon || Target;
  const isDiscounted = packageData.basePrice === 19999;
  const currentPrice = isDiscounted ? 15999 : packageData.basePrice;

  return (
    <main className="relative min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black flex flex-col">
      
      {/* 📽️ BACKGROUND STAGE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/80 to-[#050505]" />
         <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* HEADER HUD */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-10 py-6 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md shrink-0">
        <Link href="/dashboard" className="flex items-center gap-4 group" onClick={() => play("click")}>
          <div className="w-10 h-10 border border-cyan-500/30 bg-black/60 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">ABORT SIMULATION</span>
        </Link>

        <div className="flex items-center gap-4 px-5 py-2 border border-cyan-500/30 bg-black/60 backdrop-blur-md rounded-full">
          <Activity size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">DATA STREAM ACTIVE</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:flex-row relative z-10 w-full">
        
        {/* LEFT: VISUALIZATION & VIDEO */}
        <div className="w-full lg:w-1/2 lg:border-r border-white/10 flex flex-col relative">
          <div className="relative h-[40vh] lg:h-1/2 w-full overflow-hidden border-b border-white/10">
             {packageData.videoSrc ? (
               <video 
                 src={packageData.videoSrc} 
                 autoPlay loop muted playsInline
                 className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
               />
             ) : (
               <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-purple-900/40" />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
             
             {/* HUD Overlays on Video */}
             <div className="absolute top-6 left-6 flex items-center gap-2">
               <Fingerprint size={16} className={packageData.textColor} />
               <span className="text-xs font-mono uppercase tracking-widest text-white/70">CLASS: {packageData.category}</span>
             </div>
             
             <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-4xl md:text-6xl font-black italic uppercase leading-none tracking-tighter drop-shadow-lg mb-2">
                  {packageData.label}
                </h1>
                <p className="text-sm font-mono text-neutral-300 max-w-lg leading-relaxed">
                  {packageData.description}
                </p>
             </div>
          </div>

          {/* SIMULATED METRICS */}
          <div className="p-6 md:p-10 flex-1 bg-[#050505]/60 backdrop-blur-sm">
             <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/10">
               <BarChart3 className="text-cyan-500" size={20} />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Projected Yield</h2>
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-cyan-500/50 transition-colors">
                 <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Est. Conversion Bump</div>
                 <div className="text-3xl font-black text-emerald-400">+240%</div>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-purple-500/50 transition-colors">
                 <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Avg. Monthly Traffic</div>
                 <div className="text-3xl font-black text-purple-400">85K+</div>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-cyan-500/50 transition-colors">
                 <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Deployment Speed</div>
                 <div className="text-3xl font-black text-cyan-400">72 HRS</div>
               </div>
               <div className="bg-white/5 border border-white/10 p-5 rounded-xl hover:border-blue-500/50 transition-colors">
                 <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2">Network Penetration</div>
                 <div className="text-3xl font-black text-blue-400">Tier-1</div>
               </div>
             </div>
          </div>
        </div>

        {/* RIGHT: TECHNICAL SPECS & TERMINAL */}
        <div className="w-full lg:w-1/2 flex flex-col bg-[#050505]/90 backdrop-blur-xl">
          
          {/* Core Features */}
          <div className="p-6 md:p-10 border-b border-white/10">
             <div className="flex items-center gap-3 mb-6">
               <Layers className="text-purple-400" size={20} />
               <h2 className="text-xl font-bold uppercase tracking-widest text-white">Payload Capabilities</h2>
             </div>
             
             <ul className="space-y-4">
               {packageData.features.map((feature: string, idx: number) => (
                 <li key={idx} className="flex items-start gap-4">
                   <div className="mt-1 bg-cyan-900/30 p-1 border border-cyan-500/50 rounded shrink-0">
                     <CheckCircle2 size={14} className="text-cyan-400" />
                   </div>
                   <span className="text-sm font-mono text-neutral-300 leading-relaxed uppercase tracking-wider">{feature}</span>
                 </li>
               ))}
             </ul>
          </div>

          {/* Terminal Logs */}
          <div className="flex-1 p-6 md:p-10 flex flex-col bg-[#050505]">
             <div className="flex items-center gap-3 mb-4">
               <Terminal className="text-neutral-500" size={20} />
               <h2 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Live Operation Log</h2>
             </div>
             
             <div 
               ref={scrollRef}
               className="flex-1 bg-black border border-white/5 rounded-xl p-5 overflow-y-auto font-mono text-[10px] md:text-xs text-cyan-500/70 space-y-2 h-48 lg:h-auto"
             >
               {logs.map((log, i) => (
                 <div key={i} className="animate-in fade-in slide-in-from-bottom-2">
                   {log}
                 </div>
               ))}
               <div className="animate-pulse text-cyan-400">_</div>
             </div>
          </div>

          {/* CHECKOUT ACTION BAR */}
          <div className="p-6 md:p-8 border-t border-cyan-500/30 bg-black/60 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest mb-1">Contract Valuation</div>
                {isDiscounted ? (
                  <div className="flex items-end gap-3">
                    <span className="text-sm font-mono text-cyan-700 line-through mb-1">₹{packageData.basePrice.toLocaleString()}</span>
                    <span className="text-4xl font-black italic text-cyan-400 leading-none drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">₹{currentPrice.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-black italic text-white leading-none">₹{currentPrice.toLocaleString()}</div>
                )}
              </div>

              {/* FIX: Replaced TransitionLink and nested button with a single styled Next.js Link */}
              <Link 
                href="/dashboard" 
                onClick={() => play("click")}
                className="w-full sm:w-auto h-16 px-10 bg-cyan-600 text-black hover:bg-cyan-500 font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
                <ShoppingCart size={18} className="mr-3 relative z-10" /> 
                <span className="relative z-10">ACQUIRE ARSENAL</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}