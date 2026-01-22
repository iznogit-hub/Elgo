"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Zap, Trophy, Shield, Globe, 
  ShoppingCart, Activity, Lock, Users, 
  Play, Radio, AlertTriangle, Terminal,
  Crosshair, User as UserIcon
} from "lucide-react";
import { toast } from "sonner";

// --- ZAIBATSU UI SYSTEM ---
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { Globe as Globe3D } from "@/components/ui/globe"; 
import { useSfx } from "@/hooks/use-sfx";

// ⚠️ NOTE: If you have the 3D viewer file, uncomment the import below.
// import OperativeViewer from "@/components/canvas/operative-viewer"; 

interface UserData {
  username: string;
  tier: string;
  niche: string;
  bubblePoints: number;
  popCoins: number;
  velocity: number;
  avatarId: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { play } = useSfx(); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  
  // COUNTDOWN LOGIC
  const [timeLeft, setTimeLeft] = useState({ d: 27, h: 14, m: 0, s: 0 });

  useEffect(() => {
    // 1. Auth Listener
    const unsub = onAuthStateChanged(auth, async (currentUser) => { // Replaced 'auth' with imported auth instance if available, otherwise assuming context handles it but here direct use for robust check. Ideally useAuth provides user.
      // Better to use context if available to avoid double listeners, but this pattern ensures fresh data on mount.
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserData);
          play("success"); 
        } else {
          // ⚡ SAFETY FALLBACK: Use Default Data if DB entry is missing
          // This prevents the "Profile Corrupted" error for new users
          console.warn("User profile missing, using default data.");
          setUser({
            username: currentUser.displayName || "OPERATIVE",
            tier: "RECRUIT",
            niche: "GENERAL",
            bubblePoints: 0,
            popCoins: 100,
            velocity: 0,
            avatarId: "default"
          });
        }
      } catch (e) {
        console.error("Dashboard Error:", e);
        toast.error("CONNECTION_INTERRUPTED");
      } finally {
        setLoading(false);
      }
    });

    // 2. Simple Ticker for the Clock
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        return prev;
      });
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [router, play]); // Removed 'auth' from dependency array if it's imported. If from context, include it.

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
        <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full animate-spin" />
        <HackerText text="INITIALIZING_LAUNCHER..." speed={30} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative pb-24">
      
      {/* 1. ANIMATED BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background />
      </div>

      {/* 2. THE HEADS UP DISPLAY (HUD) */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-20 flex items-center justify-between px-4 md:px-8 shadow-2xl">
        
        {/* LEFT: IDENTITY & AVATAR */}
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12 rounded-full border-2 border-cyan-500/50 bg-black overflow-hidden group flex items-center justify-center">
            {/* 3D VIEWER PLACEHOLDER (Use this if you don't have the 3D file yet) */}
            <UserIcon className="w-6 h-6 text-cyan-500" />
            
            {/* UNCOMMENT IF YOU HAVE THE FILE:
            <div className="absolute inset-0 z-10 opacity-80 group-hover:opacity-100 transition-opacity">
               <OperativeViewer 
                 url={user?.avatarId ? `/models/${user.avatarId}.glb` : undefined} 
                 showHud={false} 
                 velocity={0}
                 animation="idle"
               />
            </div>
            */}
          </div>
          <div className="hidden md:block">
            <h2 className="font-bold text-sm tracking-widest uppercase font-orbitron">
              {user?.username || "UNKNOWN_OPERATIVE"}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
              <span className="text-cyan-400 uppercase">[{user?.tier || "RECRUIT"}]</span> // {user?.niche || "GENERAL"} SECTION
            </div>
          </div>
        </div>

        {/* CENTER: VELOCITY METER */}
        <div className="flex-1 max-w-md mx-8 hidden md:block relative group">
          <div className="flex justify-between text-[10px] uppercase mb-1 text-gray-500 font-mono group-hover:text-cyan-400 transition-colors">
            <span>Signal Velocity</span>
            {/* ⚡ CRITICAL FIX: Handle undefined velocity safely */}
            <span className="text-cyan-400 font-bold">{user?.velocity || 0} / 1000</span>
          </div>
          <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-white/5 relative">
            <div 
                className="h-full bg-gradient-to-r from-cyan-900 to-cyan-400 shadow-[0_0_15px_#06b6d4] transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min((user?.velocity || 0) / 10, 100)}%` }} 
            />
            {/* Scanline effect on bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-1/2 animate-scanline" />
          </div>
        </div>

        {/* RIGHT: WALLET */}
        <div className="flex items-center gap-6 font-mono text-xs md:text-sm">
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-2 text-cyan-400">
               <Zap className="w-3 h-3 fill-cyan-400" />
               {/* ⚡ CRITICAL FIX: Handle undefined bubblePoints safely */}
               <span className="font-bold">{(user?.bubblePoints || 0).toLocaleString()} BP</span>
             </div>
             <div className="flex items-center gap-2 text-yellow-500/80 text-[10px]">
               <Trophy className="w-3 h-3" />
               {/* ⚡ CRITICAL FIX: Handle undefined popCoins safely */}
               <span>{(user?.popCoins || 0).toLocaleString()} PC</span>
             </div>
          </div>

          <MagneticWrapper>
            <Link href="/store">
                <Button 
                    size="sm" 
                    onMouseEnter={() => play("hover")}
                    onClick={() => play("click")}
                    className="bg-cyan-950/50 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black font-bold h-10 px-6 tracking-wider transition-all"
                >
                    <ShoppingCart className="w-4 h-4 mr-2" /> STORE
                </Button>
            </Link>
          </MagneticWrapper>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* --- 3. HERO SECTION (SEASON PASS) --- */}
        <section 
            className="relative w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
            onMouseEnter={() => play("hover")}
        >
          {/* Backgrounds */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2676&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000 grayscale group-hover:grayscale-0" />
          
          {/* 3D Globe Decoration */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-20 pointer-events-none mix-blend-screen grayscale group-hover:grayscale-0 transition-all duration-1000">
             <Globe3D />
          </div>

          <div className="absolute z-20 bottom-0 left-0 p-8 md:p-16 space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm animate-pulse">
              <AlertTriangle className="w-3 h-3" /> Season 1 Purge Imminent
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white leading-[0.9]">
              <HackerText text="THE INNER CIRCLE" speed={50} />
            </h1>
            
            <p className="text-gray-400 text-sm md:text-lg max-w-lg leading-relaxed">
              Join the 50 Operatives manipulating the algorithm. 
              <br/><span className="text-cyan-400 font-bold">Reward: 500% Reach Velocity via Mothership Protocol.</span>
            </p>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-4">
              <MagneticWrapper>
                  <Button 
                    onClick={() => play("click")}
                    className="bg-white text-black hover:bg-cyan-400 hover:text-black font-bold px-10 py-6 text-lg tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all"
                  >
                    GET ACCESS <Lock className="w-4 h-4 ml-2" />
                  </Button>
              </MagneticWrapper>
              
              <div className="flex items-center gap-4 text-xs font-mono text-gray-500 bg-black/50 px-4 py-2 rounded border border-white/5">
                <div className="text-center">
                    <span className="block text-xl font-bold text-white">{timeLeft.d}</span>
                    <span>DAYS</span>
                </div>
                <div className="text-xl font-bold text-white">:</div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-white">{timeLeft.h}</span>
                    <span>HRS</span>
                </div>
                <div className="text-xl font-bold text-white">:</div>
                <div className="text-center">
                    <span className="block text-xl font-bold text-red-500 w-8">{timeLeft.s}</span>
                    <span>SEC</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. ACTIVE MISSION CONTROL --- */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#0A0A0A]/80 backdrop-blur border border-white/5 rounded-2xl p-8 relative overflow-hidden group hover:border-white/10 transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-32 h-32 text-white" />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <h3 className="text-xl font-bold font-orbitron flex items-center gap-2">
                DAILY SIGNAL // <span className="text-cyan-500">{(user?.niche || "GENERAL").toUpperCase()}</span>
                </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-green-500/50 transition-colors">
                <p className="text-[10px] text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Radio className="w-3 h-3" /> Target Audio
                </p>
                <p className="font-mono text-sm text-gray-300">"Midnight City (Slowed)"</p>
                <p className="text-xs text-gray-600 mt-1">ID: 884291</p>
              </div>
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 hover:border-cyan-500/50 transition-colors">
                <p className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Crosshair className="w-3 h-3" /> Directive
                </p>
                <p className="font-mono text-sm text-gray-300">Create Reel (5-7s Loop).</p>
                <p className="text-xs text-gray-600 mt-1">Tag: #NightShift</p>
              </div>
            </div>

            <MagneticWrapper className="mt-8">
                <Button 
                    className="w-full bg-green-600/20 border border-green-500 text-green-400 hover:bg-green-500 hover:text-black font-bold py-6 font-mono tracking-widest transition-all"
                    onClick={() => {
                        play("success");
                        toast.success("SIGNAL VERIFIED. VELOCITY INCREASED.");
                    }}
                >
                <Play className="w-4 h-4 mr-2 fill-current" /> VERIFY SIGNAL EXECUTION (+50 VELOCITY)
                </Button>
            </MagneticWrapper>
          </div>

          {/* SIDEBAR: RANK */}
          <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
             {/* Decorative grid */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />
             
             <div className="relative z-10">
                 <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-black/50 mb-4 mx-auto">
                    <span className="text-3xl font-black text-gray-700 font-orbitron">?</span>
                 </div>
                 <h4 className="font-bold text-xl font-orbitron text-white tracking-wider">STREET RAT</h4>
                 <p className="text-xs text-gray-500 font-mono mt-1">GLOBAL RANK: 492 / 500</p>
             </div>

             <div className="grid grid-cols-2 gap-4 w-full text-xs relative z-10 border-t border-white/5 pt-6">
               <div>
                 <p className="text-gray-500 mb-1">Posts</p>
                 <p className="font-bold text-white text-lg">0</p>
               </div>
               <div>
                 <p className="text-gray-500 mb-1">Streak</p>
                 <p className="font-bold text-cyan-400 text-lg">0 <span className="text-[10px]">DAYS</span></p>
               </div>
             </div>
          </div>
        </section>

        {/* --- 5. CARTRIDGES (STORE) --- */}
        <section>
          <div className="flex items-center justify-between mb-6 px-1">
             <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-cyan-500" />
                <h3 className="text-xl font-bold font-orbitron text-white tracking-wider">SERVICES_STORE</h3>
             </div>
             <Link href="/store" className="text-cyan-500 text-xs font-mono hover:text-cyan-300 flex items-center gap-1">
                VIEW_ALL_MODULES &rarr;
             </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* CARD 1 */}
            <div 
                className="group bg-black/40 border border-white/10 hover:border-cyan-500 transition-all rounded-xl overflow-hidden cursor-pointer"
                onMouseEnter={() => play("hover")}
            >
              <div className="h-32 bg-gradient-to-br from-cyan-900/40 to-black relative flex items-center justify-center">
                <MusicIcon />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm mb-1 text-white group-hover:text-cyan-400 transition-colors">AUDIO INJECTION</h4>
                <p className="text-[10px] text-gray-400 mb-4 h-8">Trending sounds algorithmically selected for {user?.niche || "you"}.</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs font-mono text-yellow-400">500 PC</span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400">COMMON</span>
                </div>
              </div>
            </div>

            {/* CARD 2 */}
            <div 
                className="group bg-black/40 border border-white/10 hover:border-red-500 transition-all rounded-xl overflow-hidden cursor-pointer"
                onMouseEnter={() => play("hover")}
            >
              <div className="h-32 bg-gradient-to-br from-red-900/40 to-black relative flex items-center justify-center">
                 <Shield className="text-red-500 w-10 h-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                 <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] px-2 py-0.5 rounded font-bold tracking-wider">LEGENDARY</div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm mb-1 text-white group-hover:text-red-500 transition-colors">THE TITAN CALL</h4>
                <p className="text-[10px] text-gray-400 mb-4 h-8">Summon the 800k Mothership for instant validation.</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs font-mono text-cyan-400">10,000 BP</span>
                  <Lock className="w-3 h-3 text-gray-600" />
                </div>
              </div>
            </div>

            {/* CARD 3 */}
            <div 
                className="group bg-black/40 border border-white/10 hover:border-blue-500 transition-all rounded-xl overflow-hidden cursor-pointer"
                onMouseEnter={() => play("hover")}
            >
              <div className="h-32 bg-gradient-to-br from-blue-900/40 to-black relative flex items-center justify-center">
                <Globe className="text-blue-400 w-10 h-10" />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm mb-1 text-white group-hover:text-blue-400 transition-colors">MEDIA AUTHORITY</h4>
                <p className="text-[10px] text-gray-400 mb-4 h-8">Automated press release on Yahoo & Bloomberg.</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs font-mono text-cyan-400">2,500 BP</span>
                  <span className="text-[10px] bg-blue-900/20 text-blue-400 px-2 py-1 rounded">RARE</span>
                </div>
              </div>
            </div>
            
             {/* CARD 4 */}
             <div 
                className="group bg-black/40 border border-white/10 hover:border-green-500 transition-all rounded-xl overflow-hidden cursor-pointer"
                onMouseEnter={() => play("hover")}
            >
              <div className="h-32 bg-gradient-to-br from-green-900/40 to-black relative flex items-center justify-center">
                <Users className="text-green-400 w-10 h-10" />
              </div>
              <div className="p-5">
                <h4 className="font-bold text-sm mb-1 text-white group-hover:text-green-400 transition-colors">SISTER PROTOCOL</h4>
                <p className="text-[10px] text-gray-400 mb-4 h-8">Cross-pollinate with high-level female operatives.</p>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <span className="text-xs font-mono text-cyan-400">1,000 BP</span>
                  <span className="text-[10px] bg-green-900/20 text-green-400 px-2 py-1 rounded">UNCOMMON</span>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

// GRAPHIC HELPER
function MusicIcon() {
  return (
    <div className="flex gap-1 items-end h-8">
      <div className="w-1 bg-cyan-500 h-4 animate-[bounce_1s_infinite]" />
      <div className="w-1 bg-cyan-500 h-8 animate-[bounce_1.2s_infinite]" />
      <div className="w-1 bg-cyan-500 h-6 animate-[bounce_0.8s_infinite]" />
      <div className="w-1 bg-cyan-500 h-3 animate-[bounce_1.1s_infinite]" />
    </div>
  )
}