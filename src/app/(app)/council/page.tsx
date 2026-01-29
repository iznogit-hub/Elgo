"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Crown, Lock, CheckCircle2, AlertTriangle, 
  BarChart3, Instagram, Megaphone, ArrowUpRight, 
  ShieldCheck, Terminal, Activity, Loader2,
  ArrowLeft, Zap, Cpu, Wifi, Crosshair
} from "lucide-react";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { TransitionLink } from "@/components/ui/transition-link";

function CouncilContent() {
  const { userData, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { play } = useSfx();
  const [isSyncing, setIsSyncing] = useState(false);

  // 🛰️ META CONNECTION LOGIC (Preserved)
  useEffect(() => {
    const token = searchParams.get("token");
    const action = searchParams.get("action");
    
    if (token && action === "save_token" && userData && !isSyncing) {
      const saveToken = async () => {
        setIsSyncing(true);
        try {
          await updateDoc(doc(db, "users", userData.uid), {
            instagramToken: token,
            instagramConnected: true,
            lastSync: new Date().toISOString()
          });
          play("success");
          toast.success("ACCESS GRANTED. PROTOCOL OMEGA ACTIVE.");
          router.replace("/council"); 
        } catch (e) {
          play("error");
          toast.error("DATABASE WRITE FAILED.");
          setIsSyncing(false);
        }
      };
      saveToken();
    }
  }, [searchParams, userData, router, play, isSyncing]);

  const handleConnect = () => {
    if (!userData) return;
    play("click");
    toast.loading("ESTABLISHING SECURE HANDSHAKE...");
    setTimeout(() => {
        window.location.href = `/api/auth/instagram/login?uid=${userData.uid}`;
    }, 1000);
  };

  if (loading) return <LoadingState />;

  // 🔐 ACCESS DENIED (LOCKOUT)
  if (userData && userData.tier !== "inner_circle") {
    return <AccessDeniedState tier={userData.tier} />;
  }

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Avatar stays centered for the Briefing */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.4} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD: Navigation pushed to edges */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-yellow-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-yellow-500" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <Crown size={10} className="text-yellow-500" />
                <span className="text-[8px] font-mono font-black tracking-widest text-yellow-500 uppercase">Council_Clearance_L5</span>
            </div>
        </div>
      </nav>

      {/* 👑 COUNCIL INTERFACE: Floating Flanks */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Uplink & Meta Status */}
        <div className="absolute left-6 top-32 w-44 space-y-4 pointer-events-auto">
            <div className="space-y-1 mb-6">
                <div className="flex items-center gap-2 text-yellow-500">
                    <Wifi size={12} className="animate-pulse" />
                    <span className="text-[8px] font-mono font-black uppercase tracking-[0.2em]">Immortal_Uplink</span>
                </div>
                <h1 className="text-xl font-black font-orbitron italic uppercase text-white leading-tight">High_Council</h1>
            </div>

            <section className="p-4 bg-black/40 border-l-2 border-yellow-500/50 backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-pink-500">
                   <Instagram size={12} /> IG_Node
                </div>

                {userData?.instagramConnected ? (
                    <div className="space-y-1">
                        <span className="text-[10px] font-black font-orbitron text-green-400 uppercase tracking-tighter italic flex items-center gap-2">
                           <CheckCircle2 size={10} /> Secure_Linked
                        </span>
                        <p className="text-[7px] font-mono text-white/30 uppercase">Protocol: Hitman</p>
                    </div>
                ) : (
                    <button 
                        onClick={handleConnect}
                        className="w-full py-2 bg-pink-600/20 border border-pink-500/30 text-pink-500 font-black italic tracking-widest text-[8px] hover:bg-pink-600 hover:text-white transition-all uppercase"
                    >
                        Authorize_Uplink
                    </button>
                )}
            </section>
        </div>

        {/* RIGHT FLANK: Active Directives & Metrics */}
        <div className="absolute right-6 top-32 w-48 space-y-6 pointer-events-auto">
            <div className="space-y-3 text-right">
                <h3 className="text-[9px] font-black font-orbitron tracking-widest text-yellow-500 uppercase flex items-center justify-end gap-2">
                    Priority_Alpha <Terminal size={10} />
                </h3>
                <div className="p-4 bg-black/40 border-r-2 border-cyan-500/50 backdrop-blur-xl space-y-3">
                    <div className="flex items-center justify-end gap-2 text-[8px] text-cyan-400 font-black uppercase">
                        Deploy_Ready <Activity size={10} />
                    </div>
                    <p className="text-[9px] font-bold text-white/60 leading-relaxed uppercase">Asset_884: Midnight_City boost protocol.</p>
                    <button 
                        onClick={() => { play("success"); toast.success("VERIFYING_EXECUTION..."); }}
                        className="w-full py-2 bg-white text-black font-black italic text-[8px] uppercase tracking-widest"
                    >
                        Confirm_Execution
                    </button>
                </div>
            </div>

            {/* Metric Cubes */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/60 border border-white/5 p-2 text-right">
                    <span className="text-[7px] font-mono text-yellow-500 block">REACH</span>
                    <span className="text-xs font-black">+145%</span>
                </div>
                <div className="bg-black/60 border border-white/5 p-2 text-right">
                    <span className="text-[7px] font-mono text-cyan-400 block">PR_SYNC</span>
                    <span className="text-xs font-black">2_PEND</span>
                </div>
            </div>
        </div>

        {/* BOTTOM HUD: Heavy Artillery / Armory Link */}
        <div className="absolute bottom-28 left-6 right-6 pointer-events-auto">
            <TransitionLink 
                href="/store"
                className="w-full p-4 bg-gradient-to-r from-red-900/40 via-black/80 to-transparent border border-red-500/30 backdrop-blur-xl flex items-center justify-between group hover:border-red-500 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-red-900/30 rounded-xs text-red-500">
                        <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black font-orbitron uppercase italic">Deploy_Heavy_Artillery?</h4>
                        <p className="text-[8px] font-mono text-red-200/40 uppercase tracking-tighter">Mothership_Summon_Protocol</p>
                    </div>
                </div>
                <Megaphone size={14} className="text-red-500/40" />
            </TransitionLink>
        </div>
      </div>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-yellow-500">
            <Cpu size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-yellow-500 w-3/4 animate-[progress_3s_infinite_linear]" />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Node: Council_L5</span>
            </div>
         </div>
         <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] italic">Immortal_Protocol_v3</div>
      </footer>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-yellow-500 font-mono">
      <Loader2 className="w-12 h-12 animate-spin" />
      <HackerText text="VERIFYING_CLEARANCE..." />
    </div>
  );
}

function AccessDeniedState({ tier }: { tier: string }) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative">
        <VideoStage src="/video/main.mp4" overlayOpacity={0.7} />
        <div className="z-10 border border-red-500/30 bg-black/80 backdrop-blur-3xl p-10 rounded-xs max-w-md shadow-[0_0_50px_rgba(220,38,38,0.2)]">
          <Lock className="w-12 h-12 text-red-600 mx-auto mb-6 animate-pulse" />
          <h1 className="text-3xl font-black text-red-600 font-orbitron mb-4 tracking-tighter italic uppercase">ACCESS_DENIED</h1>
          <p className="text-gray-500 mb-8 font-mono text-xs leading-relaxed uppercase tracking-widest">
            Clearance Required: <span className="text-white">INNER_CIRCLE</span><br/>
            Current: <span className="text-red-500">[{tier}]</span>
          </p>
          <TransitionLink 
            href="/store"
            className="w-full inline-block py-4 border border-red-600 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-black font-black tracking-widest font-orbitron text-[10px]"
          >
            ACQUIRE_CLEARANCE
          </TransitionLink>
        </div>
      </div>
    );
}

export default function CouncilPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CouncilContent />
    </Suspense>
  );
}