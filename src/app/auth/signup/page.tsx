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
import { ShieldPlus, Loader2, Instagram, Youtube, Linkedin, User, UserCheck } from "lucide-react";
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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center selection:bg-red-900 selection:text-white overflow-hidden">
      
      {/* --- IMMERSIVE BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-[-1] w-full h-full bg-black">
         <Image 
            src="/images/signup-bg.jpg" 
            alt="Grid" 
            fill 
            className="object-cover object-center opacity-30 grayscale contrast-125" 
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black via-black/50 to-black" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="absolute inset-0 z-[-1]">
         <Background /> 
      </div>

      <SoundPrompter />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="px-3 py-1 bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_8px_yellow]" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Profile_Completion_Required</span>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="relative z-50 w-full max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT: INSTRUCTIONS */}
        <div className="space-y-6 text-center md:text-left">
            <h1 className="text-5xl font-black italic uppercase leading-none tracking-tighter drop-shadow-2xl">
                <HackerText text="COMPLETE" /> <br/>
                <span className="text-red-600">PROTOCOL</span>
            </h1>
            <p className="text-sm font-mono text-neutral-400 uppercase tracking-widest leading-relaxed drop-shadow-md">
                Google Authentication Verified.<br/>
                Now, declare your digital footprint to enter the network.
            </p>
            
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-sm backdrop-blur-md">
                <p className="text-[10px] text-red-400 font-mono uppercase flex items-center gap-2">
                    <ShieldPlus size={12} /> Instagram Handle is Mandatory for Tracking.
                </p>
            </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="w-full max-w-md bg-black/80 border border-white/10 p-8 backdrop-blur-xl shadow-2xl relative">
            {/* Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white" />

            <form onSubmit={handleSubmit(onCompleteProfile)} className="space-y-6">
                
                {/* AVATAR SELECTOR */}
                <div className="space-y-2">
                    <label className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Select Vessel</label>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setSelectedType('boy')} className={cn("flex-1 h-10 border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2", selectedType === 'boy' ? "bg-white text-black border-white" : "text-neutral-500 border-white/10")}>
                            <User size={12} /> BOYZ
                        </button>
                        <button type="button" onClick={() => setSelectedType('girl')} className={cn("flex-1 h-10 border text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2", selectedType === 'girl' ? "bg-white text-black border-white" : "text-neutral-500 border-white/10")}>
                            <UserCheck size={12} /> GALZ
                        </button>
                    </div>
                </div>

                {/* INPUTS */}
                <div className="space-y-4">
                    <div className="relative">
                        <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500" />
                        <Input {...register("instagram")} placeholder="INSTAGRAM (REQUIRED) *" className="pl-9 h-12 bg-white/5 border-white/10 text-[10px] font-mono uppercase text-white focus:border-pink-500 placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>
                    
                    <div className="relative">
                        <Youtube size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                        <Input {...register("youtube")} placeholder="YOUTUBE CHANNEL (OPTIONAL)" className="pl-9 h-12 bg-white/5 border-white/10 text-[10px] font-mono uppercase text-white focus:border-red-500 placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>

                    <div className="relative">
                        <Linkedin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                        <Input {...register("linkedin")} placeholder="LINKEDIN PROFILE (OPTIONAL)" className="pl-9 h-12 bg-white/5 border-white/10 text-[10px] font-mono uppercase text-white focus:border-blue-500 placeholder:text-neutral-600 rounded-none transition-colors" />
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full h-14 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-none shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                >
                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "FINALIZE IDENTITY"}
                </Button>

            </form>
        </div>

      </div>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
      <SignupContent />
    </Suspense>
  );
}