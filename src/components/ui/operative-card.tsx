"use client";

import { useState } from "react";
import { User } from "lucide-react";

export default function OperativeCard({ userData }: any) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-[300px] h-[500px] bg-black border-4 border-white relative overflow-hidden flex flex-col justify-between p-6 shadow-2xl">
      {/* Background Glitch */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      {/* TOP */}
      <div className="z-10 flex justify-between items-start">
        <h2 className="text-3xl font-black font-orbitron text-white leading-none">
          BUBBLE<br/><span className="text-cyan-500">POPS</span>
        </h2>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Clearance</p>
          <p className="text-red-500 font-bold uppercase text-xl font-orbitron">{userData.tier}</p>
        </div>
      </div>

      {/* CENTER - AVATAR */}
      <div className="absolute inset-0 top-10 flex items-center justify-center">
         {!imgError ? (
           // Try to load specific niche avatar
           <img 
             src={`/assets/avatars/${userData.niche}_render.png`} 
             alt="Operative" 
             className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-500"
             onError={() => setImgError(true)}
           />
         ) : (
           // Fallback if file missing
           <div className="flex flex-col items-center justify-center text-gray-800">
              <User className="w-32 h-32 opacity-20" />
              <p className="text-xs uppercase mt-4 tracking-widest">No Visual Data</p>
           </div>
         )}
      </div>

      {/* BOTTOM */}
      <div className="z-10 bg-black/90 backdrop-blur p-4 border-t border-white/20 relative">
        {/* Holographic Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
        
        <h3 className="text-2xl font-bold text-white uppercase font-orbitron truncate">{userData.username}</h3>
        <div className="flex justify-between items-end mt-2">
           <div>
             <p className="text-[10px] text-gray-500 uppercase">Specialization</p>
             <p className="text-cyan-400 font-bold uppercase text-sm">{userData.niche}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] text-gray-500 uppercase">Velocity</p>
             <p className="text-white font-mono text-lg">{userData.velocity}</p>
           </div>
        </div>
      </div>
    </div>
  );
}