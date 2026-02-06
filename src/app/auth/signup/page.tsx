"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { ArrowLeft, Terminal, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context"; // ⚡ IMPORTED AUTH CONTEXT
import VideoStage from "@/components/canvas/video-stage";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";

export default function SignupPage() {
  const router = useRouter();
  const { play } = useSfx();
  const { userData, loading: authLoading } = useAuth(); // ⚡ CHECK AUTH STATE
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // 🚀 1. INSTANT INGRESS (Auto-Redirect if already logged in)
  useEffect(() => {
    if (!authLoading && userData) {
      router.push("/dashboard");
    }
  }, [userData, authLoading, router]);

  // --- 🛠️ THE INITIALIZATION SCRIPT ---
  const createOperativeProfile = async (user: any, customName?: string) => {
    const today = new Date().toISOString().split('T')[0];

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: customName || user.displayName?.toUpperCase().replace(/\s/g, "_") || "UNKNOWN_OPERATIVE",
      
      // 💰 WALLET (The Starter Pack)
      wallet: {
        popCoins: 300,  // Free Gift
        bubblePoints: 0
      },

      // 🔐 KEYRING (Updated to match valid sectors)
      unlockedNiches: ["tech", "fitness"], 

      // 🔋 DAILY TRACKER
      dailyTracker: {
        date: today,
        audiosViewed: 0,
        imagesGenerated: 0,
        bountiesClaimed: 0
      },

      membership: { tier: "recruit" },
      reputation: { intelSubmitted: 0, trustScore: 100 },
      status: "active",
      createdAt: new Date().toISOString()
    });
  };

  const handleGoogleSignup = async () => {
    play("click");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user already exists
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await createOperativeProfile(user);
        play("success");
        toast.success("NEW OPERATIVE REGISTERED // +300 COINS");
      } else {
        play("success");
        toast.success("IDENTITY RECOGNIZED");
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("ENLISTMENT_FAILED");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return toast.error("MISSING_DATA");

    play("click");
    setLoading(true);
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: username });
      await createOperativeProfile(result.user, username);

      play("success");
      toast.success("OPERATIVE INITIALIZED // +300 COINS");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("CREATION_ERROR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ LOADER WHILE CHECKING AUTH
  if (authLoading) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      <VideoStage src="/video/auth.mp4" overlayOpacity={0.7} />
      <Background /> 
      <SoundPrompter />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </Link>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
            <ShieldCheck size={10} className="text-green-500" />
            <span className="text-[8px] font-mono font-black tracking-widest text-green-500 uppercase">Enlistment_Open</span>
        </div>
      </nav>

      <div className="relative z-50 w-full h-screen pointer-events-none flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-20 max-w-7xl mx-auto">
        
        {/* LEFT: TEXT */}
        <div className="pointer-events-auto flex flex-col items-center md:items-start gap-6 text-center md:text-left mb-10 md:mb-0">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black font-orbitron italic uppercase leading-none tracking-tighter text-white">
                    <HackerText text="JOIN_THE_GRID" speed={40} />
                </h1>
                <p className="text-[10px] font-mono text-cyan-700 tracking-[0.3em] uppercase italic">
                    Start_Bonus: 300 Pop_Coins
                </p>
            </div>

            <Button 
                onClick={handleGoogleSignup}
                className="w-72 h-14 bg-white text-black border border-white hover:bg-gray-200 transition-all flex items-center justify-center gap-4 group shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                <span className="text-sm font-bold tracking-wide">Join via Google</span>
            </Button>
        </div>

        {/* RIGHT: MANUAL FORM */}
        <div className="pointer-events-auto relative w-full max-w-sm">
            {!showManual ? (
               <div className="flex flex-col items-end gap-2">
                  <Button 
                    onClick={() => { play("click"); setShowManual(true); }}
                    variant="outline"
                    className="border-white/10 bg-black/60 text-white/50 hover:text-white hover:border-green-500 hover:bg-green-950/20 transition-all h-12 px-6 font-mono text-[9px] tracking-widest"
                  >
                    <Terminal size={12} className="mr-2" /> MANUAL_ENLISTMENT
                  </Button>
               </div>
            ) : (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                   <h3 className="text-[9px] font-black font-orbitron tracking-widest text-green-500 uppercase flex items-center justify-end gap-2 text-right">
                       New_Record <ShieldCheck size={10} />
                   </h3>

                   <form onSubmit={handleEmailSignup} className="p-6 bg-black/80 border-r-2 border-green-500/50 backdrop-blur-xl space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-green-600/70 uppercase">Codename</label>
                           <Input 
                               placeholder="CHOSEN_ALIAS" 
                               className="bg-white/5 border-white/10 text-[10px] h-10 font-mono text-white focus:border-green-500 uppercase"
                               value={username}
                               onChange={(e) => setUsername(e.target.value.toUpperCase())}
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-green-600/70 uppercase">Comms_Channel</label>
                           <Input 
                               type="email" 
                               placeholder="EMAIL_ADDRESS" 
                               className="bg-white/5 border-white/10 text-[10px] h-10 font-mono text-white focus:border-green-500 uppercase"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-green-600/70 uppercase">Secure_Key</label>
                           <Input 
                               type="password" 
                               placeholder="••••••••" 
                               className="bg-white/5 border-white/10 text-[10px] h-10 font-mono text-white focus:border-green-500"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                           />
                       </div>
                       
                       <div className="flex gap-2 pt-2">
                           <Button 
                               type="button"
                               onClick={() => setShowManual(false)}
                               className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-white/40 font-bold text-[8px] uppercase tracking-widest"
                           >
                               Abort
                           </Button>
                           <Button 
                               type="submit" 
                               disabled={loading}
                               className="flex-[2] h-10 bg-green-700 hover:bg-green-600 text-white font-black italic tracking-widest text-[8px] uppercase border border-green-500"
                           >
                               {loading ? "Processing..." : "Confirm_Enlistment"}
                           </Button>
                       </div>
                   </form>
               </div>
            )}
        </div>

      </div>
    </main>
  );
}