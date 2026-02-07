"use client";

import { useState, useEffect, Suspense } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { ArrowLeft, Terminal, ShieldPlus, Loader2, AlertTriangle, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context"; 
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { cn } from "@/lib/utils";

// --- DEFAULT ASSETS ---
// Make sure these exist in public/avatars/
const DEFAULT_BOYS = ["/avatars/1.jpg", "/avatars/2.jpg"]; 
const DEFAULT_GIRLS = ["/avatars/3.jpg", "/avatars/4.jpg"]; 

// Helper to pick random
const getRandomAvatar = (type: 'boy' | 'girl') => {
  const arr = type === 'boy' ? DEFAULT_BOYS : DEFAULT_GIRLS;
  return arr[Math.floor(Math.random() * arr.length)];
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { play } = useSfx();
  const { userData, loading: authLoading } = useAuth(); 
  
  // 1. CAPTURE DATA FROM LANDING PAGE
  const prefillIg = searchParams.get("ig") || "";
  const prefillAvatar = searchParams.get("av"); // Might be null if they skipped

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(prefillIg.replace("@", "").toUpperCase() || "");
  
  // 2. GENDER SELECTION STATE
  // If they picked an avatar already, we don't need to ask.
  const [selectedType, setSelectedType] = useState<'boy' | 'girl'>('boy');
  
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!authLoading && userData) {
      router.push("/dashboard");
    }
  }, [userData, authLoading, router]);

  // --- DATABASE CREATION ---
  const createOperativeProfile = async (user: any, customName?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const unitId = customName || user.displayName?.toUpperCase().replace(/\s/g, "_") || `UNIT_${Math.floor(Math.random()*99999)}`;
    
    // LOGIC: If prefillAvatar exists, use it. Else, pick random based on Boy/Girl selection.
    const finalAvatar = prefillAvatar || getRandomAvatar(selectedType);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      username: unitId,
      instagramHandle: prefillIg || "", 
      avatar: finalAvatar, // <--- SAVING THE IMAGE HERE
      wallet: { popCoins: 300, bubblePoints: 0 },
      unlockedNiches: ["general"], 
      dailyTracker: { date: today, audiosViewed: 0, imagesGenerated: 0, bountiesClaimed: 0 },
      inventory: [],
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
      const docSnap = await getDoc(doc(db, "users", user.uid));

      if (!docSnap.exists()) {
        await createOperativeProfile(user);
        play("success");
        toast.success("CONTRACT SEALED // WELCOME TO THE WAR");
      } else {
        play("success");
        toast.success("IDENTITY RECOGNIZED // RESUMING SESSION");
      }
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("ENLISTMENT FAILED // NETWORK ERROR");
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return toast.error("INCOMPLETE DATA // FILL ALL FIELDS");
    play("click");
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: username });
      await createOperativeProfile(result.user, username);
      play("success");
      toast.success("UNIT INITIALIZED // +300 POINTS AWARDED");
      router.push("/dashboard");
    } catch (error: any) {
      play("error");
      toast.error("CREATION ERROR: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-red-900 selection:text-white">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/signup-bg.jpg" 
          alt="Signup Grid"
          fill
          priority
          className="object-cover opacity-30 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
      </div>

      <SoundPrompter />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-white transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-white" />
            </Link>
        </div>
        <div className="px-3 py-1 bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_8px_white]" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Enlistment_Channel</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="relative z-50 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center h-full">
        
        {/* LEFT: TITLE & CTA */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
            <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/10 border border-white/20 rounded-sm">
                   <ShieldPlus size={10} className="text-white" />
                   <span className="text-[8px] font-mono text-white/80 uppercase tracking-widest">New Vessel Registration</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-sans italic uppercase leading-[0.85] tracking-tighter">
                    <HackerText text="ACCEPT" speed={50} /> <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-900">CONTRACT</span>
                </h1>
                <p className="text-[10px] font-mono text-neutral-500 tracking-[0.2em] uppercase max-w-md">
                    Starting Bonus: <span className="text-white font-bold">300 Power Credits</span>
                </p>
            </div>

            {/* IF NO PRE-SELECTED AVATAR, SHOW TYPE SELECTOR */}
            {!prefillAvatar && (
              <div className="w-full max-w-xs bg-white/5 border border-white/10 p-3 rounded-sm">
                 <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest block mb-2 text-center">Select Vessel Class</span>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => { setSelectedType('boy'); play("click"); }}
                      className={cn(
                        "flex-1 h-10 border flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all",
                        selectedType === 'boy' ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:text-white"
                      )}
                    >
                       <User size={12} /> BOYZ
                    </button>
                    <button 
                      onClick={() => { setSelectedType('girl'); play("click"); }}
                      className={cn(
                        "flex-1 h-10 border flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all",
                        selectedType === 'girl' ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:text-white"
                      )}
                    >
                       <UserCheck size={12} /> GALZ
                    </button>
                 </div>
              </div>
            )}

            <Button 
                onClick={handleGoogleSignup}
                className="relative overflow-hidden w-full md:w-80 h-14 bg-white text-black font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all group flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(255,255,255,0.1)] rounded-none"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span>Sign Contract (Google)</span>
            </Button>
        </div>

        {/* RIGHT: MANUAL FORM */}
        <div className="flex justify-center md:justify-end w-full">
            {!showManual ? (
               <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2 text-neutral-600 text-[9px] uppercase tracking-widest font-mono animate-pulse">
                      <Terminal size={10} /> Secure_Form_Ready
                  </div>
                  <Button 
                    onClick={() => { play("click"); setShowManual(true); }}
                    variant="outline"
                    className="h-12 px-6 border border-white/10 bg-black/40 text-neutral-400 hover:text-white hover:border-white hover:bg-white/5 transition-all font-mono text-[9px] tracking-[0.2em] uppercase rounded-none"
                  >
                    <Terminal size={12} className="mr-2" /> Manual_Enlistment
                  </Button>
               </div>
            ) : (
               <div className="w-full max-w-sm animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="flex items-center justify-between mb-4 px-1">
                      <h3 className="text-[10px] font-black font-mono tracking-widest text-white uppercase flex items-center gap-2">
                         <AlertTriangle size={12} className="text-red-500"/> Registration_Form
                      </h3>
                      <div className="w-16 h-[1px] bg-white/20" />
                   </div>

                    <form onSubmit={handleEmailSignup} className="p-6 bg-black/80 border border-white/10 backdrop-blur-xl space-y-4 shadow-2xl relative">
                        
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
                        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

                        <div className="space-y-1">
                            <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Unit_Codename</label>
                            <Input 
                                placeholder="CHOSEN_ALIAS" 
                                className="bg-neutral-900/50 border-neutral-800 text-[10px] h-10 font-mono text-white focus:border-white uppercase placeholder:text-neutral-700 rounded-none"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toUpperCase())}
                            />
                        </div>
                        
                        {/* Manual Form also gets the Gender Selector if no Avatar Prefill */}
                        {!prefillAvatar && (
                          <div className="space-y-1">
                             <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Vessel_Class</label>
                             <div className="flex gap-2">
                                <button 
                                  type="button"
                                  onClick={() => setSelectedType('boy')}
                                  className={cn("flex-1 h-8 text-[8px] font-bold border uppercase transition-all", selectedType === 'boy' ? "bg-white text-black border-white" : "text-white/50 border-white/10")}
                                >BOYZ</button>
                                <button 
                                  type="button"
                                  onClick={() => setSelectedType('girl')}
                                  className={cn("flex-1 h-8 text-[8px] font-bold border uppercase transition-all", selectedType === 'girl' ? "bg-white text-black border-white" : "text-white/50 border-white/10")}
                                >GALZ</button>
                             </div>
                          </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Comms_Address</label>
                            <Input 
                                type="email" 
                                placeholder="EMAIL_ADDRESS" 
                                className="bg-neutral-900/50 border-neutral-800 text-[10px] h-10 font-mono text-white focus:border-white uppercase placeholder:text-neutral-700 rounded-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[7px] font-mono text-neutral-500 uppercase tracking-widest">Secure_Key</label>
                            <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="bg-neutral-900/50 border-neutral-800 text-[10px] h-10 font-mono text-white focus:border-white placeholder:text-neutral-700 rounded-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="button"
                                onClick={() => setShowManual(false)}
                                className="flex-1 h-10 bg-neutral-900 hover:bg-neutral-800 text-neutral-500 font-bold text-[8px] uppercase tracking-widest border border-transparent hover:border-white/20 rounded-none"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="flex-[2] h-10 bg-white hover:bg-neutral-200 text-black font-black text-[8px] uppercase tracking-[0.2em] border border-white rounded-none"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm_Enlistment"}
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

// Wrap in Suspense to handle useSearchParams in Next.js 13+
export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}