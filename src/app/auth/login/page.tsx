"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Lock, ArrowLeft, Terminal, AlertTriangle, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context"; 
import { Background } from "@/components/ui/background"; // Ensure this component exists or remove if not
import { SoundPrompter } from "@/components/ui/sound-prompter";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useSfx();
  const { userData, loading: authLoading } = useAuth(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && userData) {
      router.push("/dashboard");
    }
  }, [userData, authLoading, router]);

  // Create User Profile if it doesn't exist
  const ensureProfileExists = async (user: any) => {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const today = new Date().toISOString().split('T')[0];
      await setDoc(docRef, {
        uid: user.uid,
        email: user.email,
        username: user.displayName?.toUpperCase().replace(/\s/g, "_") || `UNIT_${Math.floor(Math.random()*9999)}`,
        wallet: { popCoins: 300, bubblePoints: 0 },
        unlockedNiches: ["general"], 
        dailyTracker: { date: today, audiosViewed: 0, imagesGenerated: 0, bountiesClaimed: 0 },
        membership: { tier: "recruit" },
        reputation: { intelSubmitted: 0, trustScore: 100 },
        status: "active",
        createdAt: new Date().toISOString()
      });
      toast.info("ARCHIVE NOT FOUND // CREATING NEW IDENTITY");
    }
  };

  const handleGoogleLogin = async () => {
    play("click");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureProfileExists(result.user);
      play("success");
      toast.success("IDENTITY VERIFIED // WELCOME OPERATIVE");
      router.push("/dashboard"); 
    } catch (error: any) {
      play("error");
      console.error(error);
      toast.error("ACCESS DENIED // NETWORK ERROR");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      play("success");
      toast.success("ACCESS GRANTED");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("INVALID CREDENTIALS // TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-red-900 selection:text-white">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/auth-bg.jpg" // Ensure this image exists in public/images
          alt="Auth Background"
          fill
          priority
          className="object-cover opacity-30 grayscale contrast-125"
        />
        {/* Vignette & Noise */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />

      {/* --- TOP NAV --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-red-500 transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-red-500" />
            </Link>
        </div>
        <div className="px-3 py-1 bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Gateway_Secure</span>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-50 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full">
        
        {/* LEFT COL: IDENTITY PROMPT */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-red-950/30 border border-red-900/30 rounded-sm">
                   <ShieldCheck size={10} className="text-red-500" />
                   <span className="text-[8px] font-mono text-red-400 uppercase tracking-widest">Authentication Required</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-sans italic uppercase leading-[0.85] tracking-tighter">
                    <HackerText text="IDENTIFY" speed={50} /> <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-600">YOURSELF</span>
                </h1>
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase max-w-md">
                   Access to the War Room is restricted to active operatives only.
                </p>
            </div>

            {/* GOOGLE BUTTON */}
            <Button 
                onClick={handleGoogleLogin}
                className="relative overflow-hidden w-full md:w-80 h-14 bg-white text-black font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all group flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                <span>Google Access</span>
            </Button>
        </div>

        {/* RIGHT COL: MANUAL OVERRIDE (Animated Panel) */}
        <div className="flex justify-center md:justify-end w-full">
            {!showManual ? (
               <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 text-neutral-600 text-[9px] uppercase tracking-widest font-mono animate-pulse">
                      <Lock size={10} /> Secure_Channel_Encrypted
                  </div>
                  <Button 
                    onClick={() => { play("click"); setShowManual(true); }}
                    variant="outline"
                    className="h-12 px-6 border border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-red-600 hover:bg-red-950/10 transition-all font-mono text-[9px] tracking-[0.2em] uppercase"
                  >
                    <Terminal size={12} className="mr-2" /> Manual_Override
                  </Button>
               </div>
            ) : (
               <div className="w-full max-w-sm animate-in slide-in-from-right-10 fade-in duration-500">
                   <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-[10px] font-black font-mono tracking-widest text-red-500 uppercase flex items-center gap-2">
                         <AlertTriangle size={12} /> Override_Active
                      </h3>
                      <div className="w-16 h-[1px] bg-red-900/50" />
                   </div>

                   <form onSubmit={handleEmailLogin} className="p-6 bg-black/80 border border-white/5 backdrop-blur-xl space-y-5 shadow-2xl relative overflow-hidden group">
                       {/* Red Scanning Line */}
                       <div className="absolute top-0 left-0 w-full h-[2px] bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_red]" />

                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Unit_ID / Email</label>
                           <Input 
                               type="email" 
                               placeholder="ENTER_ID" 
                               className="bg-neutral-900/50 border-neutral-800 text-[10px] h-10 font-mono text-white focus:border-red-600 focus:ring-0 uppercase placeholder:text-neutral-700 transition-colors"
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                           />
                       </div>
                       <div className="space-y-1">
                           <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Passcode</label>
                           <Input 
                               type="password" 
                               placeholder="••••••••" 
                               className="bg-neutral-900/50 border-neutral-800 text-[10px] h-10 font-mono text-white focus:border-red-600 focus:ring-0 transition-colors"
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                           />
                       </div>
                       
                       <div className="flex gap-3 pt-2">
                           <Button 
                               type="button"
                               onClick={() => setShowManual(false)}
                               className="flex-1 h-10 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 font-bold text-[8px] uppercase tracking-widest"
                           >
                               Abort
                           </Button>
                           <Button 
                               type="submit" 
                               disabled={loading}
                               className="flex-[2] h-10 bg-red-700 hover:bg-red-600 text-white font-bold text-[8px] uppercase tracking-[0.2em] border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                           >
                               {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Access_System"}
                           </Button>
                       </div>
                   </form>

                   <div className="flex justify-between items-center mt-4 px-2">
                       <Link href="/auth/signup" className="text-[8px] font-mono text-neutral-600 hover:text-white uppercase tracking-widest transition-colors">
                          Join_Unit
                       </Link>
                       <Link href="/auth/reset-password" className="text-[8px] font-mono text-neutral-600 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                          Reset_Key <KeyRound size={10} />
                       </Link>
                   </div>
               </div>
            )}
        </div>

      </div>
    </main>
  );
}