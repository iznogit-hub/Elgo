"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Lock, ArrowLeft, Terminal, AlertTriangle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import VideoStage from "@/components/canvas/video-stage";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useSfx();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  const handleGoogleLogin = async () => {
    play("click");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          email: user.email,
          username: user.displayName?.toUpperCase().replace(/\s/g, "_") || "OPERATIVE",
          tier: "recruit",
          niche: "general", 
          bubblePoints: 0,
          popCoins: 100, 
          velocity: 0,
          createdAt: new Date().toISOString(),
          instagramConnected: false
        });
        toast.success("NEW OPERATIVE REGISTERED");
      }

      play("success");
      toast.success("IDENTITY_VERIFIED");
      setTimeout(() => router.push("/dashboard"), 1000); 
    } catch (error: any) {
      play("error");
      toast.error("ACCESS_DENIED");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      play("success");
      toast.success("IDENTITY_VERIFIED");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("INVALID_CREDENTIALS");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      <VideoStage src="/video/auth.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </Link>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono font-black tracking-widest text-cyan-500 uppercase">Gateway_Secure</span>
            </div>
        </div>
      </nav>

      {/* 🔐 AUTH INTERFACE */}
      <div className="relative z-50 w-full h-screen pointer-events-none flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-20 max-w-7xl mx-auto">
        
        {/* LEFT FLANK: Google Login (PRIMARY) */}
        <div className="pointer-events-auto flex flex-col items-center md:items-start gap-6 text-center md:text-left mb-10 md:mb-0">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-black font-orbitron italic uppercase leading-none tracking-tighter text-white">
                    <HackerText text="IDENTIFY_SELF" speed={40} />
                </h1>
                <p className="text-[9px] font-mono text-cyan-700 tracking-[0.3em] uppercase italic">Neural_Link_V1</p>
            </div>

            {/* ⚡ STANDARD GOOGLE BUTTON */}
            <Button 
                onClick={handleGoogleLogin}
                className="w-72 h-14 bg-white text-black border border-white hover:bg-gray-200 transition-all flex items-center justify-center gap-4 group shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
                {/* Google 'G' Icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-bold tracking-wide">Continue with Google</span>
            </Button>
        </div>

        {/* RIGHT FLANK: Manual Override (SECONDARY / CLOAKED) */}
        <div className="pointer-events-auto relative w-full max-w-sm">
            {!showManual ? (
               <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2 text-white/30 text-[9px] uppercase tracking-widest font-mono">
                     <Lock size={10} /> Secure_Channel
                  </div>
                  <Button 
                    onClick={() => { play("click"); setShowManual(true); }}
                    variant="outline"
                    className="border-white/10 bg-black/60 text-white/50 hover:text-white hover:border-red-500 hover:bg-red-950/20 transition-all h-12 px-6 font-mono text-[9px] tracking-widest"
                  >
                    <Terminal size={12} className="mr-2" /> MANUAL_LOGIN_OVERRIDE
                  </Button>
               </div>
            ) : (
               <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
                   <h3 className="text-[9px] font-black font-orbitron tracking-widest text-red-500 uppercase flex items-center justify-end gap-2 text-right">
                       Override_Active <AlertTriangle size={10} />
                   </h3>

                   <form onSubmit={handleEmailLogin} className="p-6 bg-black/80 border-r-2 border-red-500/50 backdrop-blur-xl space-y-4 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-red-600/70 uppercase">Operative_ID</label>
                           <Input 
                               type="email" 
                               placeholder="EMAIL_ADDRESS" 
                               className="bg-white/5 border-white/10 text-[10px] h-10 font-mono text-white focus:border-red-500 uppercase placeholder:text-white/20"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-red-600/70 uppercase">Passcode</label>
                           <Input 
                               type="password" 
                               placeholder="••••••••" 
                               className="bg-white/5 border-white/10 text-[10px] h-10 font-mono text-white focus:border-red-500"
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
                               Cancel
                           </Button>
                           <Button 
                               type="submit" 
                               disabled={loading}
                               className="flex-[2] h-10 bg-red-700 hover:bg-red-600 text-white font-black italic tracking-widest text-[8px] uppercase border border-red-500"
                           >
                               {loading ? "Decrypting..." : "Access_System"}
                           </Button>
                       </div>
                   </form>

                   <div className="flex justify-between items-center px-1">
                       <Link href="/auth/signup" className="text-[8px] font-mono text-white/30 hover:text-cyan-400 uppercase tracking-widest">New_Operative?</Link>
                       <Link href="/auth/reset-password" className="text-[8px] font-mono text-white/30 hover:text-red-400 uppercase tracking-widest flex items-center gap-1">
                          Forgot_Code? <KeyRound size={8} />
                       </Link>
                   </div>
               </div>
            )}
        </div>
      </div>
    </main>
  );
}