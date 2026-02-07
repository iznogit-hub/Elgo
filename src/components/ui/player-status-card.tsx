"use client";

import { useState } from "react";
import Image from "next/image";
import { Crosshair, Shield, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlayerStatusCard({ userData, className }: { userData: any, className?: string }) {
  const [imgError, setImgError] = useState(false);
  
  // LOGIC: Resolve Rank & Avatar
  const score = userData?.wallet?.popCoins || 0;
  const rank = userData?.membership?.tier || "RECRUIT";
  const avatarSrc = userData?.avatar || "/avatars/1.jpg"; // Default fallback

  return (
    <div className={cn("relative w-full aspect-[3/4] bg-neutral-900 border-4 border-neutral-800 flex flex-col shadow-2xl overflow-hidden group", className)}>
      
      {/* 1. VISUAL LAYER (The Vessel) */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
         {/* Glitch Overlay on Hover */}
         <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/10 transition-colors z-20 pointer-events-none mix-blend-color-burn" />
         
         {!imgError ? (
            <Image 
              src={avatarSrc} 
              alt="Vessel" 
              fill
              className="object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-700"
              onError={() => setImgError(true)}
            />
         ) : (
            <div className="flex flex-col items-center opacity-30">
               <User size={64} className="text-white" />
               <span className="text-[10px] text-white font-mono mt-2">NO VISUAL DATA</span>
            </div>
         )}

         {/* Rank Badge */}
         <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1 z-30">
            <span className="text-[10px] font-black font-sans uppercase tracking-widest">{rank}</span>
         </div>
      </div>

      {/* 2. DATA LAYER (The Stats) */}
      <div className="z-30 bg-black/90 border-t-4 border-neutral-800 p-4 backdrop-blur-md">
         <div className="flex justify-between items-end mb-2">
            <div>
               <p className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest mb-1">Unit_ID</p>
               <p className="text-xl font-black text-white font-sans leading-none uppercase truncate max-w-[150px]">
                 {userData?.username || "UNKNOWN"}
               </p>
            </div>
            <div className="text-right">
               <p className="text-[8px] text-neutral-500 font-mono uppercase tracking-widest mb-1">Bounty_Value</p>
               <p className="text-2xl font-black text-yellow-500 font-mono leading-none tracking-tighter">
                 {score.toLocaleString()}
               </p>
            </div>
         </div>

         {/* Health/Status Bar */}
         <div className="w-full h-1 bg-neutral-800 relative overflow-hidden mt-3">
            <div className="absolute inset-0 bg-green-500 w-full animate-pulse" />
         </div>
         <div className="flex justify-between mt-1">
             <span className="text-[8px] font-mono text-green-500 flex items-center gap-1">
                <Activity size={8} /> Vitals_Stable
             </span>
             <span className="text-[8px] font-mono text-neutral-600 uppercase">
                IG: {userData?.instagramHandle || "N/A"}
             </span>
         </div>
      </div>
    </div>
  );
}