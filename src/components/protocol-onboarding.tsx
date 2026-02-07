"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, Instagram, User, Coins, 
  ShieldCheck, Lock, Check, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";

// AVATAR OPTIONS
const AVATARS = [
  { id: "1", src: "/avatars/1.jpg", label: "Recruit" },
  { id: "2", src: "/avatars/2.jpg", label: "Soldier" },
  { id: "3", src: "/avatars/3.jpg", label: "Scout" },
];

export default function ProtocolOnboarding() {
  const router = useRouter();
  const { play } = useSfx();

  // STATE
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    instagram: "",
    avatar: "/avatars/1.jpg",
  });
  
  // CONFIRMATION STATES
  const [igConfirmed, setIgConfirmed] = useState(false);
  const [avatarConfirmed, setAvatarConfirmed] = useState(false);

  const nextStep = () => {
    play("click");
    setStep((prev) => prev + 1);
  };

  // FINAL ACTION: GO TO SIGNUP
  const handleComplete = () => {
    play("success");
    // Pass data to Signup Page via URL Params
    const query = new URLSearchParams({
      ig: formData.instagram,
      av: formData.avatar,
      ref: "onboarding"
    }).toString();
    
    router.push(`/auth/signup?${query}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-12 relative">
      
      {/* HORIZONTAL SCROLL CONTAINER (The Glass Cards) */}
      <div className="flex gap-6 overflow-x-auto pb-12 px-4 no-scrollbar snap-x snap-mandatory">
        
        {/* --- CARD 1: IDENTITY (Instagram) --- */}
        <div className={cn(
            "snap-center shrink-0 w-[320px] md:w-[350px] h-[500px] border backdrop-blur-xl flex flex-col p-8 justify-between relative overflow-hidden transition-all duration-500",
            igConfirmed ? "bg-neutral-900/80 border-green-500/50" : "bg-black/60 border-white/10"
        )}>
            <div className="space-y-4 z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest border-b border-red-900 pb-1">RULE_01</span>
                    {igConfirmed && <Check size={16} className="text-green-500" />}
                </div>
                <div>
                    <h3 className="text-3xl font-black font-sans uppercase italic text-white leading-none">Identity</h3>
                    <p className="text-xs font-mono text-neutral-400 mt-2 uppercase tracking-widest leading-relaxed">
                        Declare your digital footprint. <br/> This binds your soul to the game.
                    </p>
                </div>
            </div>

            <div className="relative z-20 space-y-4">
                <div className="relative group/input">
                    <div className="absolute left-3 top-3.5 text-pink-500"><Instagram size={18} /></div>
                    <input 
                        type="text" 
                        placeholder="@HANDLE" 
                        value={formData.instagram}
                        disabled={igConfirmed}
                        onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                        className="w-full h-12 bg-black/50 border border-white/20 pl-10 text-white font-mono uppercase focus:border-red-500 focus:outline-none transition-all placeholder:text-white/20 disabled:opacity-50"
                    />
                </div>
                
                {!igConfirmed ? (
                    <button 
                        onClick={() => { if(formData.instagram) { setIgConfirmed(true); play("success"); } }}
                        disabled={!formData.instagram.includes("@")}
                        className="w-full h-10 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        CONFIRM HANDLE
                    </button>
                ) : (
                    <button 
                        onClick={() => setIgConfirmed(false)}
                        className="w-full h-10 bg-neutral-900 text-neutral-500 font-mono text-xs uppercase hover:text-white flex items-center justify-center gap-2"
                    >
                        <Edit2 size={12} /> EDIT
                    </button>
                )}
            </div>
        </div>

        {/* --- CARD 2: VESSEL (Avatar) --- */}
        <div className={cn(
            "snap-center shrink-0 w-[320px] md:w-[350px] h-[500px] border backdrop-blur-xl flex flex-col p-8 justify-between relative overflow-hidden transition-all duration-500",
            avatarConfirmed ? "bg-neutral-900/80 border-green-500/50" : "bg-black/60 border-white/10",
            !igConfirmed && "opacity-30 pointer-events-none grayscale" // Locked until Step 1 done
        )}>
            <div className="space-y-4 z-10">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-red-500 font-bold tracking-widest border-b border-red-900 pb-1">RULE_02</span>
                    {!igConfirmed && <Lock size={14} className="text-white/20" />}
                </div>
                <div>
                    <h3 className="text-3xl font-black font-sans uppercase italic text-white leading-none">Vessel</h3>
                    <p className="text-xs font-mono text-neutral-400 mt-2 uppercase tracking-widest leading-relaxed">
                        Select your combat skin. <br/> Appearance dictates status.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3 z-20">
                {AVATARS.map((av) => (
                    <div 
                        key={av.id}
                        onClick={() => !avatarConfirmed && setFormData({...formData, avatar: av.src})}
                        className={cn(
                            "relative aspect-square border-2 cursor-pointer transition-all",
                            formData.avatar === av.src ? "border-red-500 scale-105" : "border-white/10 hover:border-white",
                            avatarConfirmed && formData.avatar !== av.src && "opacity-30"
                        )}
                    >
                        <Image src={av.src} alt={av.label} fill className="object-cover" />
                    </div>
                ))}
            </div>

            <div className="z-20">
                {!avatarConfirmed ? (
                    <button 
                        onClick={() => { setAvatarConfirmed(true); play("success"); }}
                        className="w-full h-10 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                        CONFIRM VESSEL
                    </button>
                ) : (
                    <button 
                        onClick={() => setAvatarConfirmed(false)}
                        className="w-full h-10 bg-neutral-900 text-neutral-500 font-mono text-xs uppercase hover:text-white flex items-center justify-center gap-2"
                    >
                        <Edit2 size={12} /> RESELECT
                    </button>
                )}
            </div>
        </div>

        {/* --- CARD 3: REWARDS & CONTRACT (Final) --- */}
        <div className={cn(
            "snap-center shrink-0 w-[320px] md:w-[350px] h-[500px] border backdrop-blur-xl flex flex-col p-8 justify-center text-center relative overflow-hidden transition-all duration-500",
            "bg-black/80 border-white/20",
            (!igConfirmed || !avatarConfirmed) && "opacity-30 pointer-events-none grayscale"
        )}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
            
            <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                     <Coins size={32} className="text-yellow-500" />
                </div>
                
                <div className="space-y-2">
                    <h3 className="text-3xl font-black font-sans uppercase italic text-white">Rule #3</h3>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                        Claim your starting ration.
                    </p>
                </div>

                <div className="py-4 border-y border-white/10 w-full">
                    <span className="text-5xl font-black text-yellow-500 font-sans tracking-tighter">300</span>
                    <span className="block text-[8px] font-mono text-yellow-700 uppercase tracking-[0.3em] mt-1">PopCoins</span>
                </div>

                <div className="space-y-4 w-full">
                    <p className="text-[9px] font-mono text-neutral-500 uppercase">
                        By clicking below, you accept the Culling Game Contract.
                    </p>
                    <button 
                        onClick={handleComplete}
                        className="w-full h-14 bg-red-600 text-white font-black text-lg uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                    >
                        ENTER GAME <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}