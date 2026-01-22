"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  Crown, Lock, CheckCircle2, AlertTriangle, 
  BarChart3, Instagram, Megaphone, ArrowUpRight, 
  ShieldCheck, Terminal, Activity, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- ZAIBATSU UI ---
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { useSfx } from "@/hooks/use-sfx";

function CouncilContent() {
  const { userData, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { play } = useSfx();
  const [isSyncing, setIsSyncing] = useState(false);

  // --- META CONNECTION LOGIC ---
  useEffect(() => {
    const token = searchParams.get("token");
    const action = searchParams.get("action");
    
    // Prevent double-firing in Strict Mode
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
          
          // ⚡ FIX: Redirect to correct spelling
          router.replace("/council"); 
          // Optional: Refresh to update UI context
          window.location.href = "/council";
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
        // ⚡ FIX: Ensure this API route exists
        window.location.href = `/api/auth/instagram/login?uid=${userData.uid}`;
    }, 1000);
  };

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        <HackerText text="VERIFYING_CLEARANCE..." className="text-yellow-500 font-mono" />
      </div>
    );
  }

  // --- ACCESS DENIED (LOCKOUT) ---
  // ⚡ LOGIC: If user exists BUT is not Inner Circle, show Lock Screen
  if (userData && userData.tier !== "inner_circle") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <Background />
        
        {/* Lock Container */}
        <div className="z-10 border-2 border-red-900/50 bg-black/80 backdrop-blur-xl p-8 md:p-12 rounded-2xl max-w-lg shadow-[0_0_100px_rgba(220,38,38,0.2)] animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600 animate-pulse">
             <Lock className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-red-600 font-orbitron mb-4 tracking-wider">
            ACCESS DENIED
          </h1>
          
          <p className="text-gray-500 mb-8 font-mono text-sm leading-relaxed">
            This frequency is reserved for the <span className="text-white font-bold">High Council</span> (Tier 1). 
            <br />
            Your current clearance: <span className="text-red-500 uppercase">[{userData.tier}]</span>
          </p>
          
          <MagneticWrapper>
            <Button 
                onClick={() => { play("click"); router.push("/store"); }} 
                variant="outline" 
                className="border-red-600 text-red-500 hover:bg-red-950/50 h-14 px-8 font-bold tracking-widest font-orbitron"
                onMouseEnter={() => play("hover")}
            >
                APPLY FOR SEAT
            </Button>
          </MagneticWrapper>
        </div>
      </div>
    );
  }

  // --- ACCESS GRANTED (Main Content) ---
  return (
    <div className="min-h-screen bg-[#020202] text-white pb-24 relative overflow-x-hidden">
      <Background />
      
      {/* HEADER */}
      <div className="relative h-72 w-full overflow-hidden border-b border-yellow-900/20 z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-black to-transparent" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay" />
        
        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-yellow-500 font-bold mb-3 animate-pulse">
                <Crown className="w-5 h-5" />
                <span className="text-xs font-mono tracking-[0.3em] uppercase">Level 5 Clearance Verified</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white tracking-tighter">
                <HackerText text="THE HIGH COUNCIL" speed={40} />
              </h1>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-xs text-gray-500 font-mono tracking-widest mb-1">OPERATIVE STATUS</p>
              <div className="flex items-center gap-2 justify-end">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                  <p className="text-xl font-bold text-green-500 font-orbitron">ACTIVE // IMMORTAL</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative z-20 max-w-6xl mx-auto p-6 md:p-8 space-y-12">

        {/* 1. THE HANDSHAKE (Meta Connection) */}
        <section className="grid md:grid-cols-2 gap-8 items-center bg-[#080500]/80 backdrop-blur-md border border-yellow-900/30 rounded-2xl p-8 relative overflow-hidden group hover:border-yellow-600/50 transition-colors">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-600/5 blur-[100px] rounded-full pointer-events-none" />

          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-3 font-orbitron">
              <Instagram className="w-6 h-6 text-pink-500" /> 
              DATA UPLINK STATUS
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 font-mono">
              To activate the <span className="text-yellow-500">"Digital Hitman"</span> protocol, we require a persistent link to your comms channel. 
              This allows us to auto-verify missions and track velocity spikes.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck className={cn("w-4 h-4", userData?.instagramConnected ? "text-green-500" : "text-gray-600")} />
                <span className="tracking-wide text-xs uppercase">Read-Only Analytics Access</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <ShieldCheck className={cn("w-4 h-4", userData?.instagramConnected ? "text-green-500" : "text-gray-600")} />
                <span className="tracking-wide text-xs uppercase">Auto-Mission Verification</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            {userData?.instagramConnected ? (
              <div className="w-full h-40 bg-green-950/10 border border-green-500/30 rounded-xl flex flex-col items-center justify-center gap-3 relative overflow-hidden animate-in fade-in">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(34,197,94,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
                
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-green-400 font-bold font-orbitron text-lg tracking-wider">SECURE CONNECTION</p>
                    <p className="text-[10px] text-green-600/70 font-mono uppercase mt-1">LATENCY: 12ms // SYNCED</p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-4">
                  <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded text-left flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                    <p className="text-xs text-yellow-200/80 font-mono">
                      <strong>REQUIRED:</strong> Approve "Tester Invite" in Instagram settings before connecting.
                    </p>
                  </div>
                  <MagneticWrapper>
                    <Button 
                        onClick={handleConnect}
                        onMouseEnter={() => play("hover")}
                        className="w-full h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white font-bold text-lg shadow-[0_0_30px_rgba(219,39,119,0.3)] tracking-widest font-orbitron"
                    >
                        <Instagram className="w-5 h-5 mr-2" /> AUTHORIZE UPLINK
                    </Button>
                  </MagneticWrapper>
              </div>
            )}
          </div>
        </section>

        {/* 2. THE BRIEFING */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-yellow-500" />
                <h3 className="text-2xl font-bold font-orbitron text-white">ACTIVE DIRECTIVES</h3>
              </div>
              <span className="text-xs font-mono text-yellow-500/50 border border-yellow-500/20 px-2 py-1 rounded">PRIORITY: ALPHA</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* CARD 1: CONTENT STRATEGY */}
            <div className="col-span-2 bg-[#0A0A0A] border border-white/5 p-8 rounded-2xl hover:border-yellow-600/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Megaphone className="w-32 h-32 text-white" />
              </div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg text-cyan-400">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-[10px] bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest animate-pulse">
                    Ready to Deploy
                </span>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2 font-orbitron">Deploy "Trend #884" Asset</h4>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-lg">
                Our scouts identified a velocity spike in audio <span className="text-white font-bold">"Midnight City"</span>. 
                Post a 7s Reel using this audio. We have pre-loaded the Mothership boost protocol for this hash.
              </p>
              
              <div className="flex gap-4 relative z-10">
                <MagneticWrapper>
                    <Button 
                        className="flex-1 bg-white text-black hover:bg-cyan-400 hover:text-black font-bold h-12 tracking-wider font-orbitron"
                        onClick={() => { play("click"); toast.success("VERIFYING POST..."); }}
                        onMouseEnter={() => play("hover")}
                    >
                        CONFIRM EXECUTION
                    </Button>
                </MagneticWrapper>
                <Button 
                    variant="outline" 
                    className="border-white/10 text-gray-500 hover:text-white hover:bg-white/5 h-12 px-6 font-mono"
                    onClick={() => play("click")}
                    onMouseEnter={() => play("hover")}
                >
                  SKIP
                </Button>
              </div>
            </div>

            {/* CARD 2: CAMPAIGN STATUS */}
            <div className="bg-[#0A0A0A] border border-white/5 p-6 rounded-2xl flex flex-col justify-between hover:border-white/10 transition-colors">
               <div>
                 <div className="flex items-center gap-2 mb-6 text-yellow-500">
                   <BarChart3 className="w-5 h-5" />
                   <span className="font-bold text-sm font-orbitron tracking-wider">CAMPAIGN METRICS</span>
                 </div>
                 <div className="space-y-6">
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Est. Reach Boost</p>
                     <p className="text-3xl font-mono text-white font-bold flex items-end gap-2">
                       +145% <span className="text-green-500 text-sm mb-1">(↑)</span>
                     </p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">PR Mentions</p>
                     <p className="text-xl font-mono text-white">2 Pending</p>
                   </div>
                 </div>
               </div>
               <div className="pt-6 border-t border-white/5 mt-4">
                 <p className="text-[10px] text-gray-600 font-mono flex items-center justify-between">
                   <span>NEXT REPORT:</span>
                   <span className="text-white">14h 20m</span>
                 </p>
               </div>
            </div>
          </div>
        </section>

        {/* 3. THE ARMORY LINK */}
        <div className="p-1 rounded-2xl bg-gradient-to-r from-red-900/50 to-transparent">
            <div className="bg-black/90 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-900/20 rounded-full text-red-500">
                        <ArrowUpRight className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white font-orbitron tracking-wide">NEED HEAVY ARTILLERY?</h4>
                        <p className="text-xs text-red-200/70 font-mono">Deploy a Press Release or Mothership Boost manually.</p>
                    </div>
                </div>
                <MagneticWrapper>
                    <Button 
                        onClick={() => { play("click"); router.push("/store"); }} 
                        variant="outline" 
                        onMouseEnter={() => play("hover")}
                        className="border-red-500 text-red-500 hover:bg-red-950 hover:text-red-400 h-12 px-8 font-bold tracking-widest font-orbitron"
                    >
                        ACCESS ARMORY
                    </Button>
                </MagneticWrapper>
            </div>
        </div>

      </main>
    </div>
  );
}

export default function CouncilPage() {
  return (
    <Suspense fallback={<div className="bg-[#020202] min-h-screen text-yellow-500 flex items-center justify-center font-mono">LOADING_COUNCIL_PROTOCOL...</div>}>
      <CouncilContent />
    </Suspense>
  );
}