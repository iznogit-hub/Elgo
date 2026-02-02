"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, Shirt, Cpu, Coins, Gamepad2, Palette, 
  ArrowLeft, Activity, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

const WORLDS = [
  { id: "fitness", label: "FITNESS", icon: Dumbbell, color: "text-red-500" },
  { id: "fashion", label: "FASHION", icon: Shirt, color: "text-pink-500" },
  { id: "tech", label: "TECH", icon: Cpu, color: "text-cyan-500" },
  { id: "business", label: "BUSINESS", icon: Coins, color: "text-yellow-500" },
  { id: "gaming", label: "GAMING", icon: Gamepad2, color: "text-purple-500" },
  { id: "art", label: "ART", icon: Palette, color: "text-indigo-500" },
];

const AVATAR_CLASSES: Record<string, { id: string, name: string, desc: string }[]> = {
  fitness: [{ id: "lifter", name: "THE LIFTER", desc: "Strength" }, { id: "runner", name: "THE RUNNER", desc: "Speed" }, { id: "yogi", name: "THE YOGI", desc: "Flow" }],
  tech: [{ id: "coder", name: "THE CODER", desc: "Builder" }, { id: "hacker", name: "THE HACKER", desc: "Breaker" }, { id: "analyst", name: "THE ANALYST", desc: "Data" }],
  fashion: [{ id: "model", name: "THE MODEL", desc: "Pose" }, { id: "stylist", name: "THE STYLIST", desc: "Trend" }, { id: "icon", name: "THE ICON", desc: "Viral" }],
  business: [{ id: "mogul", name: "THE MOGUL", desc: "Scale" }, { id: "trader", name: "THE TRADER", desc: "Risk" }, { id: "visionary", name: "THE VISIONARY", desc: "Lead" }],
  gaming: [{ id: "pro", name: "THE PRO", desc: "Skill" }, { id: "streamer", name: "THE STREAMER", desc: "Live" }, { id: "dev", name: "THE DEV", desc: "Code" }],
  art: [{ id: "painter", name: "THE PAINTER", desc: "Color" }, { id: "digital", name: "THE DIGITAL", desc: "Pixel" }, { id: "curator", name: "THE CURATOR", desc: "Taste" }],
};

export default function SignupPage() {
  const router = useRouter();
  const { play } = useSfx(); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  // ⚡ GOOGLE SIGN UP
  const handleGoogleSignup = async () => {
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
          bubblePoints: 0,
          popCoins: 100,
          velocity: 0,
          createdAt: new Date().toISOString(),
          instagramConnected: false,
          niche: "pending", 
          avatarClass: "pending"
        });
      }
      
      setUsername(user.displayName?.toUpperCase() || "OPERATIVE");
      play("success");
      toast.success("IDENTITY_CONFIRMED");
      setStep(2); // JUMP TO WORLD SELECTION
    } catch (error) {
      console.error(error);
      play("error");
      toast.error("SIGNUP_FAILED: Check Console");
    }
  };

  // ⚡ MANUAL SIGN UP
  const handleManualNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return toast.error("DATA_INCOMPLETE");
    play("click");
    setStep(2);
  };

  // ⚡ FINAL COMMIT
  const handleFinalize = async () => {
    if (!selectedAvatar) return toast.error("CLASS_REQUIRED");
    play("success");
    setLoading(true);
    
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // If logged in (via Google), just update the existing doc
        await setDoc(doc(db, "users", currentUser.uid), {
           niche: selectedWorld,
           avatarClass: selectedAvatar,
           avatarId: `${selectedWorld}_${selectedAvatar}`,
        }, { merge: true });
      } else {
        // If manual flow, create auth AND doc now
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: username });
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          username: username.toUpperCase(),
          niche: selectedWorld,
          avatarClass: selectedAvatar,
          avatarId: `${selectedWorld}_${selectedAvatar}`,
          tier: "recruit",
          bubblePoints: 0,
          popCoins: 100,
          velocity: 0,
          createdAt: new Date().toISOString(),
          instagramConnected: false
        });
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      toast.error("INITIALIZATION_FAILED");
      setStep(1);
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
            <TransitionLink href="/" className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </TransitionLink>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1 text-right">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[8px] font-mono font-black tracking-widest text-cyan-500 uppercase">Phase: {step}/3 Calibration</span>
            </div>
        </div>
      </nav>

      {/* 🧪 CALIBRATION INTERFACE */}
      <div className="relative z-50 w-full h-screen pointer-events-none flex flex-col md:flex-row items-center justify-center gap-12 px-6">
        
        {/* LEFT FLANK: Selection Matrices */}
        <div className="pointer-events-auto w-full max-w-sm space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-black font-orbitron italic uppercase text-white leading-tight">
                    Character_Init
                </h1>
                <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest italic">Neural_Identity_Mapping</p>
            </div>

            {/* STEP 1: IDENTITY */}
            {step === 1 && (
                <div className="animate-in slide-in-from-left-4 space-y-4">
                    {/* PRIMARY: GOOGLE */}
                    <Button 
                        onClick={handleGoogleSignup}
                        className="w-full h-14 bg-white text-black font-bold tracking-wide text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign Up with Google
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-[8px] text-gray-500 uppercase font-mono">OR</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* SECONDARY: MANUAL TOGGLE */}
                    {!showManual ? (
                        <Button 
                            onClick={() => { setShowManual(true); play("click"); }}
                            variant="outline"
                            className="w-full h-10 border-white/10 text-gray-500 text-[8px] font-mono tracking-widest hover:text-white hover:border-white/30"
                        >
                            Manual_Data_Entry <ChevronDown size={10} className="ml-2" />
                        </Button>
                    ) : (
                        <form onSubmit={handleManualNext} className="space-y-3 bg-black/40 p-4 border-l border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[7px] font-mono text-white/30 uppercase">Codename</label>
                                <Input value={username} onChange={(e) => setUsername(e.target.value.toUpperCase())} className="bg-black/40 border-white/10 text-[9px] h-10 font-mono text-cyan-400" placeholder="ALIAS_ID" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[7px] font-mono text-white/30 uppercase">Secure_Comms</label>
                                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-[9px] h-10 font-mono" placeholder="EMAIL" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[7px] font-mono text-white/30 uppercase">Passcode</label>
                                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-[9px] h-10 font-mono" placeholder="••••••••" />
                            </div>
                            <Button type="submit" className="w-full h-10 bg-white/10 text-white font-black italic tracking-widest text-[8px] uppercase hover:bg-white/20">Next_Phase</Button>
                        </form>
                    )}
                </div>
            )}

            {/* STEP 2: WORLD */}
            {step === 2 && (
                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-left-4">
                    {WORLDS.map((world) => (
                        <button key={world.id} onClick={() => { setSelectedWorld(world.id); setStep(3); play("click"); }} className="p-3 bg-black/40 border border-white/10 flex flex-col items-center gap-2 hover:border-cyan-500 hover:bg-cyan-500/10 group transition-all">
                            <world.icon size={14} className={cn("transition-colors", world.color)} />
                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">{world.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* STEP 3: CLASS */}
            {step === 3 && (
                <div className="space-y-2 animate-in slide-in-from-left-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[9px] font-black text-cyan-400 uppercase italic mb-2">Select_Specialization</h3>
                        <button onClick={() => setStep(2)} className="text-[8px] text-gray-500 hover:text-white uppercase font-mono">Back</button>
                    </div>
                    {(AVATAR_CLASSES[selectedWorld] || AVATAR_CLASSES['fitness']).map((cls) => (
                        <button key={cls.id} onClick={() => { setSelectedAvatar(cls.id); play("click"); }} className={cn("w-full p-3 border text-left flex flex-col gap-1 transition-all", selectedAvatar === cls.id ? "bg-cyan-500/20 border-cyan-500" : "bg-black/40 border-white/5 hover:border-white/20")}>
                            <span className="text-[9px] font-black uppercase italic">{cls.name}</span>
                            <span className="text-[7px] font-mono text-white/30 uppercase">{cls.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT FLANK: Preview & Status */}
        <div className="pointer-events-auto w-full max-w-[200px] text-right hidden md:block">
            <div className="p-4 bg-black/40 border-r-2 border-cyan-500/50 backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-end gap-2 text-[8px] text-cyan-500 font-black uppercase">
                    Calibration_Status <Activity size={10} />
                </div>
                <div className="space-y-2">
                    <StatusRow label="Identity" value={username || "PENDING"} />
                    <StatusRow label="Niche" value={selectedWorld || "WAITING"} />
                    <StatusRow label="Class" value={selectedAvatar || "LOCKING"} />
                </div>
                {step === 3 && (
                    <Button onClick={handleFinalize} disabled={loading || !selectedAvatar} className="w-full h-10 bg-green-600 text-black font-black italic tracking-widest text-[8px] uppercase animate-pulse hover:bg-green-500">
                        {loading ? "Initializing..." : "Confirm_Character"}
                    </Button>
                )}
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM STATUS BAR */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-cyan-500">
            <Cpu size={14} className="animate-pulse" />
            <div className="flex flex-col gap-0.5">
                <div className="h-0.5 w-16 bg-white/10 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-full transition-all duration-500" style={{ width: `${(step/3)*100}%` }} />
                </div>
                <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Calibration_Progress</span>
            </div>
         </div>
         <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] italic">BPOP_INIT_PROTOCOL</div>
      </footer>
    </main>
  );
}

function StatusRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center gap-4">
            <span className="text-[7px] font-mono text-white/20 uppercase">{label}</span>
            <span className="text-[9px] font-black uppercase truncate text-white max-w-[80px]">{value}</span>
        </div>
    );
}