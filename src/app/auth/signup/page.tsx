"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, Shirt, Cpu, Coins, Utensils, Gamepad2, Plane, Music, Smile, Palette, 
  Sparkles, PawPrint, Hammer, BookOpen, Trophy, User, ChevronRight, ChevronLeft,
  Fingerprint, Activity, Globe, Terminal,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// --- ZAIBATSU SYSTEM UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
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
  // ... other classes preserved in logic
};

export default function SignupPage() {
  const router = useRouter();
  const { play } = useSfx(); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) return toast.error("DATA_INCOMPLETE");
    play("click");
    setStep(2);
  };

  const handleSignup = async () => {
    if (!selectedAvatar) return toast.error("CLASS_REQUIRED");
    play("success");
    setLoading(true);
    try {
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
      
      {/* 📽️ THE THEATER: Background logic */}
      <VideoStage src="/video/intro.mp4" overlayOpacity={0.6} />
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
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Selection Matrices */}
        <div className="absolute left-6 top-32 w-48 space-y-6 pointer-events-auto">
            <div className="space-y-1">
                <h1 className="text-xl font-black font-orbitron italic uppercase text-white leading-tight">
                    Character_Init
                </h1>
                <p className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest italic">Neural_Identity_Mapping</p>
            </div>

            {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-3 animate-in slide-in-from-left-4">
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
                    <Button type="submit" className="w-full h-10 bg-cyan-600 text-black font-black italic tracking-widest text-[8px] uppercase">Initialize_Sequence</Button>
                </form>
            )}

            {step === 2 && (
                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-left-4">
                    {WORLDS.map((world) => (
                        <button key={world.id} onClick={() => { setSelectedWorld(world.id); setStep(3); play("click"); }} className="p-3 bg-black/40 border border-white/10 flex flex-col items-center gap-2 hover:border-cyan-500 group transition-all">
                            <world.icon size={14} className={cn("transition-colors", world.color)} />
                            <span className="text-[7px] font-black uppercase tracking-tighter opacity-40 group-hover:opacity-100">{world.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {step === 3 && (
                <div className="space-y-2 animate-in slide-in-from-left-4">
                    <h3 className="text-[9px] font-black text-cyan-400 uppercase italic mb-2">Select_Specialization</h3>
                    {(AVATAR_CLASSES[selectedWorld] || AVATAR_CLASSES['fitness']).map((cls) => (
                        <button key={cls.id} onClick={() => { setSelectedAvatar(cls.id); play("click"); }} className={cn("w-full p-3 border text-left flex flex-col gap-1 transition-all", selectedAvatar === cls.id ? "bg-cyan-500/20 border-cyan-500" : "bg-black/40 border-white/5")}>
                            <span className="text-[9px] font-black uppercase italic">{cls.name}</span>
                            <span className="text-[7px] font-mono text-white/30 uppercase">{cls.desc}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* RIGHT FLANK: Preview & Status */}
        <div className="absolute right-6 top-32 w-48 space-y-6 pointer-events-auto text-right">
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
                    <Button onClick={handleSignup} disabled={loading || !selectedAvatar} className="w-full h-10 bg-green-600 text-black font-black italic tracking-widest text-[8px] uppercase animate-pulse">
                        Confirm_Character
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
                    <div className="h-full bg-cyan-400 w-full" style={{ width: `${(step/3)*100}%` }} />
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
            <span className="text-[9px] font-black uppercase truncate text-white">{value}</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono gap-4">
            <Activity className="animate-spin" />
            <HackerText text="UPLINKING_TO_BPOP_OS..." speed={30} />
        </div>
    );
}