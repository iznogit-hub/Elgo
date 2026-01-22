"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Dumbbell, Shirt, Cpu, Coins, Utensils, Gamepad2, Plane, Music, Smile, Palette, 
  Sparkles, PawPrint, Hammer, BookOpen, Trophy, User, ChevronRight, ChevronLeft,
  ScanFace
} from "lucide-react";
import { toast } from "sonner";

// --- CUSTOM COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { useSfx } from "@/hooks/use-sfx";

// ⚡ IMPORT 3D VIEWER (Will use 2D fallback if model missing)
import OperativeViewer from "@/components/canvas/operative-viewer";

// 1. THE 15 WORLDS CONFIG
const WORLDS = [
  { id: "fitness", label: "FITNESS", icon: Dumbbell, color: "text-red-500", border: "border-red-500" },
  { id: "fashion", label: "FASHION", icon: Shirt, color: "text-pink-500", border: "border-pink-500" },
  { id: "tech", label: "TECH", icon: Cpu, color: "text-cyan-500", border: "border-cyan-500" },
  { id: "business", label: "BUSINESS", icon: Coins, color: "text-yellow-500", border: "border-yellow-500" },
  { id: "food", label: "FOOD", icon: Utensils, color: "text-orange-500", border: "border-orange-500" },
  { id: "gaming", label: "GAMING", icon: Gamepad2, color: "text-purple-500", border: "border-purple-500" },
  { id: "travel", label: "TRAVEL", icon: Plane, color: "text-green-500", border: "border-green-500" },
  { id: "music", label: "MUSIC", icon: Music, color: "text-blue-500", border: "border-blue-500" },
  { id: "comedy", label: "COMEDY", icon: Smile, color: "text-yellow-300", border: "border-yellow-300" },
  { id: "art", label: "ART", icon: Palette, color: "text-indigo-500", border: "border-indigo-500" },
  { id: "beauty", label: "BEAUTY", icon: Sparkles, color: "text-rose-400", border: "border-rose-400" },
  { id: "pets", label: "PETS", icon: PawPrint, color: "text-amber-600", border: "border-amber-600" },
  { id: "diy", label: "DIY", icon: Hammer, color: "text-orange-400", border: "border-orange-400" },
  { id: "edu", label: "EDUCATION", icon: BookOpen, color: "text-blue-300", border: "border-blue-300" },
  { id: "sports", label: "SPORTS", icon: Trophy, color: "text-emerald-400", border: "border-emerald-400" },
];

// 2. THE AVATAR CLASSES (3 Per World)
const AVATAR_CLASSES: Record<string, { id: string, name: string, desc: string }[]> = {
  fitness: [
    { id: "lifter", name: "THE LIFTER", desc: "Strength & Power" },
    { id: "runner", name: "THE RUNNER", desc: "Speed & Endurance" },
    { id: "yogi", name: "THE YOGI", desc: "Balance & Flow" },
  ],
  fashion: [
    { id: "model", name: "THE MODEL", desc: "Pose & Presence" },
    { id: "stylist", name: "THE STYLIST", desc: "Curator of Fits" },
    { id: "designer", name: "THE DESIGNER", desc: "Creator of Trends" },
  ],
  tech: [
    { id: "coder", name: "THE CODER", desc: "Builder of Systems" },
    { id: "hacker", name: "THE HACKER", desc: "Breaker of Walls" },
    { id: "analyst", name: "THE ANALYST", desc: "Seer of Data" },
  ],
  business: [
    { id: "founder", name: "THE FOUNDER", desc: "Vision & Scale" },
    { id: "trader", name: "THE TRADER", desc: "Risk & Reward" },
    { id: "mentor", name: "THE MENTOR", desc: "Guide & Wisdom" },
  ],
  food: [
    { id: "chef", name: "THE CHEF", desc: "Master of Flavor" },
    { id: "baker", name: "THE BAKER", desc: "Precision & Sweet" },
    { id: "critic", name: "THE CRITIC", desc: "Taste & Truth" },
  ],
  gaming: [
    { id: "pro", name: "THE PRO", desc: "Skill & Reflex" },
    { id: "streamer", name: "THE STREAMER", desc: "Host & Energy" },
    { id: "speed", name: "SPEEDRUNNER", desc: "Optimized Path" },
  ],
  travel: [
    { id: "explorer", name: "EXPLORER", desc: "Wild & Free" },
    { id: "urban", name: "URBANIST", desc: "City & Concrete" },
    { id: "guide", name: "THE GUIDE", desc: "Story & History" },
  ],
  music: [
    { id: "producer", name: "PRODUCER", desc: "Beat & Rhythm" },
    { id: "dj", name: "THE DJ", desc: "Crowd Control" },
    { id: "vocalist", name: "VOCALIST", desc: "Voice & Soul" },
  ],
  comedy: [
    { id: "standup", name: "STANDUP", desc: "Stage & Mic" },
    { id: "skit", name: "SKIT MAKER", desc: "Act & Edit" },
    { id: "prank", name: "TRICKSTER", desc: "Shock & Awe" },
  ],
  art: [
    { id: "digital", name: "DIGITAL", desc: "Pixel & Vector" },
    { id: "painter", name: "PAINTER", desc: "Brush & Canvas" },
    { id: "sculptor", name: "SCULPTOR", desc: "Form & Shape" },
  ],
  beauty: [
    { id: "makeup", name: "MUA", desc: "Face & Color" },
    { id: "hair", name: "STYLIST", desc: "Cut & Dye" },
    { id: "skin", name: "GLOW", desc: "Care & Health" },
  ],
  pets: [
    { id: "dog", name: "K9 LEADER", desc: "Loyal & Loud" },
    { id: "cat", name: "FELINE", desc: "Grace & Chill" },
    { id: "exotic", name: "WILD KEEPER", desc: "Rare & Unique" },
  ],
  diy: [
    { id: "builder", name: "BUILDER", desc: "Wood & Metal" },
    { id: "fixer", name: "FIXER", desc: "Repair & Restore" },
    { id: "crafter", name: "CRAFTER", desc: "Paper & Glue" },
  ],
  edu: [
    { id: "teacher", name: "TEACHER", desc: "Share & Grow" },
    { id: "student", name: "SEEKER", desc: "Learn & Adapt" },
    { id: "research", name: "SCIENTIST", desc: "Fact & Logic" },
  ],
  sports: [
    { id: "player", name: "ATHLETE", desc: "Field & Ball" },
    { id: "coach", name: "TACTICIAN", desc: "Plan & Win" },
    { id: "fan", name: "SUPERFAN", desc: "Hype & Spirit" },
  ],
};

export default function SignupPage() {
  const router = useRouter();
  const { play } = useSfx(); 
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  // FORM DATA
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [selectedWorld, setSelectedWorld] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    
    // ⚡ VALIDATION
    if (!email || !password || !username) {
        play("error");
        return toast.error("DATA FIELDS INCOMPLETE");
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        play("error");
        return toast.error("INVALID COMMS ID (EMAIL)");
    }
    if (password.length < 6) {
        play("error");
        return toast.error("PASSCODE TOO WEAK (MIN 6 CHARS)");
    }

    setStep(2);
  };

  const handleWorldSelect = (worldId: string) => {
    play("click");
    setSelectedWorld(worldId);
    setStep(3); 
  };

  const handleSignup = async () => {
    if (!selectedAvatar) {
        play("error");
        return toast.error("AVATAR CLASS REQUIRED");
    }
    
    play("success");
    setLoading(true);
    toast.loading("INITIALIZING NEURAL LINK...");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: username });
      
      const finalAvatarId = `${selectedWorld}_${selectedAvatar}`;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username.toUpperCase(), // Normalize username
        niche: selectedWorld,
        avatarClass: selectedAvatar,
        avatarId: finalAvatarId,
        tier: "recruit",
        bubblePoints: 0,
        popCoins: 100, // Welcome Bonus
        velocity: 0,
        createdAt: new Date().toISOString(),
        instagramConnected: false
      });

      toast.dismiss();
      toast.success("CHARACTER INITIALIZED. WELCOME, OPERATIVE.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.dismiss();
      play("error");
      
      if (error.code === "auth/email-already-in-use") {
        toast.error("IDENTITY ALREADY REGISTERED. PLEASE LOGIN.");
      } else {
        toast.error(`INITIALIZATION FAILED: ${error.message}`);
      }
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* 1. VISUAL LAYER */}
      <Background />

      <div className="relative z-10 w-full max-w-5xl">
        
        {/* HEADER */}
        <div className="text-center mb-8">
            <HackerText text="CREATE CHARACTER" className="text-3xl md:text-5xl font-black font-orbitron text-cyan-400" />
            <div className="flex items-center justify-center gap-2 mt-4 text-xs font-mono text-gray-500 tracking-[0.2em]">
                <span className={step >= 1 ? "text-cyan-500" : ""}>01. IDENTITY</span>
                <span>//</span>
                <span className={step >= 2 ? "text-cyan-500" : ""}>02. WORLD</span>
                <span>//</span>
                <span className={step >= 3 ? "text-cyan-500" : ""}>03. CLASS</span>
            </div>
        </div>

        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
            
            {/* PROGRESS BAR */}
            <div className="absolute top-0 left-0 h-1 bg-cyan-900 w-full">
                <div 
                    className="h-full bg-cyan-500 transition-all duration-500 ease-out shadow-[0_0_10px_#06b6d4]" 
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            {/* STEP 1: ACCOUNT */}
            {step === 1 && (
            <form onSubmit={handleNextStep} className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Codename</label>
                    <Input 
                        placeholder="e.g. CYBER_WOLF" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value.toUpperCase())} 
                        className="bg-black/50 border-white/10 focus:border-cyan-500 text-white text-lg p-6 font-orbitron uppercase"
                        onFocus={() => play("hover")}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Secure Comms (Email)</label>
                    <Input 
                        type="email" 
                        placeholder="operative@guild.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="bg-black/50 border-white/10 focus:border-cyan-500 text-white text-lg p-6 font-mono"
                        onFocus={() => play("hover")}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest font-mono">Passcode</label>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="bg-black/50 border-white/10 focus:border-cyan-500 text-white text-lg p-6 font-mono"
                        onFocus={() => play("hover")}
                    />
                </div>
                
                <MagneticWrapper>
                    <Button 
                        type="submit" 
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xl py-6 mt-4 font-orbitron tracking-widest"
                        onMouseEnter={() => play("hover")}
                    >
                        PROCEED <ChevronRight className="ml-2" />
                    </Button>
                </MagneticWrapper>

                <div className="text-center mt-6">
                    <TransitionLink href="/auth/login" className="text-xs text-gray-500 hover:text-cyan-400 font-mono transition-colors">
                        [ ALREADY AN OPERATIVE? LOGIN ]
                    </TransitionLink>
                </div>
            </form>
            )}

            {/* STEP 2: WORLD SELECTION */}
            {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                {WORLDS.map((world) => {
                    const Icon = world.icon;
                    return (
                    <button
                        key={world.id}
                        onClick={() => handleWorldSelect(world.id)}
                        onMouseEnter={() => play("hover")}
                        className="relative flex flex-col items-center justify-center p-3 rounded-lg border border-white/5 bg-black/40 hover:bg-white/5 hover:border-cyan-500/50 transition-all h-28 group"
                    >
                        <div className={`p-3 rounded-full bg-white/5 mb-2 group-hover:scale-110 transition-transform ${world.color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-gray-500 group-hover:text-white transition-colors font-mono">
                            {world.label}
                        </span>
                    </button>
                    );
                })}
                </div>
                <Button 
                    variant="ghost" 
                    onClick={() => { play("click"); setStep(1); }} 
                    className="w-full py-6 text-gray-500 hover:text-white font-mono"
                    onMouseEnter={() => play("hover")}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" /> RECONFIGURE IDENTITY
                </Button>
            </div>
            )}

            {/* STEP 3: AVATAR SELECTION */}
            {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
                <h3 className="text-center text-xl text-white font-orbitron mb-8 tracking-wide">
                    SELECT YOUR <span className="text-cyan-400 px-2 border-b border-cyan-500/50">{WORLDS.find(w => w.id === selectedWorld)?.label}</span> SPECIALIZATION
                </h3>

                {/* ⚡ NEW: 3D PREVIEW STAGE */}
                <div className="h-64 w-full bg-gradient-to-b from-gray-900 to-black rounded-xl mb-8 relative border border-white/10 overflow-hidden flex items-center justify-center group">
                    {selectedAvatar ? (
                        <div className="w-full h-full animate-in fade-in zoom-in duration-500">
                            {/* Falls back to 2D icon if 3D model missing */}
                            <OperativeViewer 
                                url={`/models/${selectedWorld}_${selectedAvatar}.glb`}
                                animation="idle"
                            />
                        </div>
                    ) : (
                        <div className="text-center opacity-30">
                            <ScanFace className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                            <p className="text-xs font-mono tracking-widest">AWAITING SELECTION...</p>
                        </div>
                    )}
                    
                    {/* Grid Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {AVATAR_CLASSES[selectedWorld]?.map((avatar) => {
                    const isSelected = selectedAvatar === avatar.id;
                    return (
                    <button
                        key={avatar.id}
                        onClick={() => { play("click"); setSelectedAvatar(avatar.id); }}
                        onMouseEnter={() => play("hover")}
                        className={`
                        relative flex flex-col items-center p-8 rounded-xl border transition-all duration-300 group
                        ${isSelected 
                            ? "border-cyan-500 bg-cyan-950/30 shadow-[0_0_30px_rgba(6,182,212,0.2)] scale-105 z-10" 
                            : "border-white/10 bg-black/40 hover:border-white/30 hover:bg-white/5"
                        }
                        `}
                    >
                        <div className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center bg-black border-2 transition-colors ${isSelected ? "border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "border-white/10 group-hover:border-white/30"}`}>
                            <User className={`w-12 h-12 ${isSelected ? "text-cyan-400" : "text-gray-600 group-hover:text-gray-400"}`} />
                        </div>
                        <h4 className={`text-xl font-black font-orbitron mb-2 ${isSelected ? "text-cyan-400" : "text-gray-300"}`}>
                            {avatar.name}
                        </h4>
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-mono">{avatar.desc}</p>
                    </button>
                    )
                })}
                </div>

                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        onClick={() => { play("click"); setStep(2); }} 
                        className="flex-1 py-6 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-mono"
                        onMouseEnter={() => play("hover")}
                    >
                        CHANGE WORLD
                    </Button>
                    
                    <Button 
                        onClick={handleSignup} 
                        disabled={loading || !selectedAvatar}
                        className="flex-[2] bg-green-600 hover:bg-green-500 text-black font-bold py-6 text-xl shadow-[0_0_30px_rgba(34,197,94,0.3)] font-orbitron tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        onMouseEnter={() => play("hover")}
                    >
                        {loading ? "INITIALIZING..." : "CONFIRM CHARACTER"}
                    </Button>
                </div>
            </div>
            )}

        </div>
      </div>
    </main>
  );
}