"use client";

import { useState } from "react";
import { User, Crosshair, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Using simple English props matching your user data
export default function PlayerStatusCard({ userData, className }: { userData: any, className?: string }) {
  const [imgError, setImgError] = useState(false);
  
  // LOGIC: Determine Rank based on PC (Wealth)
  const score = userData?.wallet?.popCoins || 0;
  const rank = score > 10000 ? "SPECIAL GRADE" : score > 1000 ? "GRADE 1" : "GRADE 4";
  
  // LOGIC: Weapon Status (Daily Limit)
  // If user is paid (tier > 0), they have "Dual Wield". Else "Rusty Revolver".
  const isPaid = (userData?.tier || 0) > 0;
  const weaponName = isPaid ? "CURSED TOOL: DUAL SIX" : "RUSTY REVOLVER";
  const ammoCount = isPaid ? "12/12" : "6/6";

  return (
    <div className={cn("relative w-full max-w-[320px] aspect-[3/4] bg-neutral-900 border-4 border-neutral-200 flex flex-col shadow-2xl overflow-hidden group", className)}>
      
      {/* 1. THE NOISE TEXTURE (Cursed Vibe) */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 pointer-events-none mix-blend-overlay" />
      
      {/* 2. HEADER: ID & RANK */}
      <div className="z-10 bg-neutral-100 text-black p-3 flex justify-between items-center border-b-4 border-black">
        <div>
           <h2 className="text-[10px] font-black font-mono tracking-widest leading-none">UNIT_ID</h2>
           <p className="text-xl font-black font-sans leading-none mt-0.5">{userData?.username?.substring(0,8) || "UNKNOWN"}</p>
        </div>
        <div className="text-right">
           <div className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 inline-block">
             {rank}
           </div>
        </div>
      </div>

      {/* 3. VISUAL: THE VESSEL (Your Random Image) */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         {/* The Glitch Effect on Hover */}
         <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/20 transition-colors z-20 pointer-events-none mix-blend-color-burn" />
         
         {!imgError ? (
            <Image 
              src={userData?.photoURL || "/images/random-boy.jpg"} // Fallback to your public randoms
              alt="Vessel" 
              fill
              className="object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              onError={() => setImgError(true)}
            />
         ) : (
            <div className="flex flex-col items-center opacity-50">
               <User size={48} className="text-neutral-500" />
               <span className="text-[10px] text-neutral-500 font-mono mt-2">NO VISUAL DATA</span>
            </div>
         )}

         {/* Overlay Stats */}
         <div className="absolute bottom-2 left-2 z-30">
            <div className="flex items-center gap-1 bg-black/80 backdrop-blur px-2 py-1 border border-white/20">
               <Crosshair size={12} className="text-red-500" />
               <span className="text-[10px] text-white font-mono">{weaponName}</span>
            </div>
         </div>
      </div>

      {/* 4. FOOTER: CURRENT STATUS */}
      <div className="z-10 bg-neutral-900 p-4 border-t-4 border-white/20">
         <div className="flex justify-between items-end">
            <div>
               <p className="text-[9px] text-neutral-500 font-mono uppercase mb-1">Total Score</p>
               <p className="text-3xl font-black text-white font-sans tracking-tighter tabular-nums">
                 {score.toLocaleString()}
               </p>
            </div>
            <div className="text-right">
               <p className="text-[9px] text-neutral-500 font-mono uppercase mb-1">Ammo Capacity</p>
               <p className="text-xl font-bold text-red-500 font-mono">{ammoCount}</p>
            </div>
         </div>

         {/* The "Enter" Prompt */}
         <div className="mt-3 w-full h-[2px] bg-neutral-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-red-600 w-1/2 animate-loading-bar" />
         </div>
         <p className="text-[8px] text-center text-neutral-600 mt-2 font-mono">
            GAME STATUS: <span className="text-green-500 animate-pulse">ACTIVE</span>
         </p>
      </div>
    </div>
  );
}