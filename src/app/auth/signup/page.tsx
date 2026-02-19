"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { ShieldCheck, Loader2, Instagram, Youtube, Linkedin, User, UserCheck, Database } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context"; 
import { cn } from "@/lib/utils";

// --- ASSETS ---
const DEFAULT_BOYS = ["/avatars/1.jpg", "/avatars/2.jpg"]; 
const DEFAULT_GIRLS = ["/avatars/3.jpg", "/avatars/4.jpg"]; 

const getRandomAvatar = (type: 'boy' | 'girl') => {
  const arr = type === 'boy' ? DEFAULT_BOYS : DEFAULT_GIRLS;
  return arr[Math.floor(Math.random() * arr.length)];
};

const identitySchema = z.object({
  instagram: z.string().min(3, "Instagram handle required"),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
});

type IdentityValues = z.infer<typeof identitySchema>;

function SignupContent() {
  const router = useRouter();
  const { play } = useSfx();
  const { user, userData, loading: authLoading } = useAuth(); 
  
  const [selectedType, setSelectedType] = useState<'boy' | 'girl'>('boy');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (userData?.instagramHandle) {
        router.push("/dashboard");
      }
    }
  }, [user, userData, authLoading, router]);

  const { register, handleSubmit } = useForm<IdentityValues>({
    resolver: zodResolver(identitySchema),
  });

  const onCompleteProfile = async (data: IdentityValues) => {
    if (!user) return;
    play("click");
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const unitId = user.displayName?.toUpperCase().replace(/\s/g, "_") || `UNIT_${Math.floor(Math.random()*99999)}`;
      const finalAvatar = getRandomAvatar(selectedType);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: unitId,
        instagramHandle: data.instagram,
        youtubeHandle: data.youtube || "",
        linkedinHandle: data.linkedin || "",
        avatar: finalAvatar,
        wallet: { popCoins: 300, bubblePoints: 0 },
        unlockedNiches: ["general"], 
        dailyTracker: { date: today, audiosViewed: 0, imagesGenerated: 0, bountiesClaimed: 0 },
        inventory: [],
        completedTasks: [],
        followedCreators: [],
        guildBankContribution: 0,
        guildName: "SHADOW_SYNDICATE",
        guildId: user.uid,
        membership: { tier: "recruit" },
        reputation: { intelSubmitted: 0, trustScore: 100 },
        status: "active",
        createdAt: new Date().toISOString()
      }, { merge: true });

      play("success");
      toast.success("IDENTITY LINKED // WELCOME TO THE NETWORK");
      window.location.href = "/dashboard"; 
    } catch (error) {
      play("error");
      toast.error("DATABASE ERROR // RETRY");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white selection:bg-white selection:text-black overflow-hidden">
      
      {/* --- IMMERSIVE BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-[-1] w-full h-full pointer-events-none">
         <Image 
            src="/images/signup-bg.jpg" 
            alt="Grid" 
            fill 
            className="object-cover object-center opacity-10 grayscale contrast-125 mix-blend-screen" 
         />
         <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/80 via-[#050505]/95 to-[#050505]" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="absolute inset-0 z-[-1]">
         <Background /> 
      </div>

      <SoundPrompter />

      {/* NAV - Brutalist 1px Architecture */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-8 py-6 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
            <Database size={14} className="text-white/50" />
            <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase hidden md:block">
              Registration_Protocol
            </span>
        </div>
        <div className="px-4 py-1.5 border border-white/10 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-white uppercase">Profile_Completion_Required</span>
        </div>
      </nav>

      {/* CONTENT GRID */}
      <div className="relative z-50 w-full max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center mt-16 md:mt-0">
        
        {/* LEFT: INSTRUCTIONS */}
        <div className="space-y-8 text-center md:text-left">
            <h1 className="text-[12vw] md:text-[6vw] leading-[0.85] tracking-tighter uppercase font-medium">
                <HackerText text="INITIALIZE" /> <br/>
                <span className="text-white/40">IDENTITY</span>
            </h1>
            
            <p className="text-sm md:text-base font-mono text-neutral-400 uppercase tracking-widest leading-relaxed max-w-md mx-auto md:mx-0">
                Google Uplink Verified.<br/>
                Declare your digital footprint to execute operations.
            </p>
            
            <div className="p-4 border border-white/10 bg-white/5 inline-flex backdrop-blur-sm">
                <p className="text-xs text-neutral-300 font-mono uppercase flex items-center gap-3 tracking-widest">
                    <ShieldCheck size={14} className="text-white" /> 
                    Instagram footprint required for yield tracking.
                </p>
            </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="w-full max-w-md mx-auto md:mx-0 bg-[#050505] border border-white/10 p-8 md:p-12 shadow-2xl relative group">
            
            {/* Architectural Corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/40" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/40" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/40" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/40" />

            <form onSubmit={handleSubmit(onCompleteProfile)} className="space-y-8">
                
                {/* AVATAR SELECTOR */}
                <div className="space-y-3">
                    <label className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Select Operative Class</label>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setSelectedType('boy')} className={cn("flex-1 h-12 border text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3", selectedType === 'boy' ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:border-white/30")}>
                            <User size={14} /> M-CLASS
                        </button>
                        <button type="button" onClick={() => setSelectedType('girl')} className={cn("flex-1 h-12 border text-xs font-mono uppercase tracking-widest transition-all flex items-center justify-center gap-3", selectedType === 'girl' ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:border-white/30")}>
                            <UserCheck size={14} /> F-CLASS
                        </button>
                    </div>
                </div>

                {/* INPUTS - Stripped colored icons, replaced with monochrome borders */}
                <div className="space-y-4">
                    <div className="relative">
                        <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input {...register("instagram")} placeholder="INSTAGRAM (REQUIRED) *" className="pl-12 h-14 bg-transparent border-white/10 text-xs font-mono uppercase text-white focus:border-white placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>
                    
                    <div className="relative">
                        <Youtube size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input {...register("youtube")} placeholder="YOUTUBE CHANNEL (OPTIONAL)" className="pl-12 h-14 bg-transparent border-white/10 text-xs font-mono uppercase text-white focus:border-white placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>

                    <div className="relative">
                        <Linkedin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                        <Input {...register("linkedin")} placeholder="LINKEDIN PROFILE (OPTIONAL)" className="pl-12 h-14 bg-transparent border-white/10 text-xs font-mono uppercase text-white focus:border-white placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>
                </div>

                {/* SUBMIT BUTTON - Inverted stark contrast */}
                <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full h-16 bg-transparent text-white border border-white/20 hover:bg-white hover:text-black font-mono text-sm uppercase tracking-[0.2em] rounded-none transition-colors duration-500"
                >
                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "Execute Registration"}
                </Button>

            </form>
        </div>

      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
      <SignupContent />
    </Suspense>
  );
}