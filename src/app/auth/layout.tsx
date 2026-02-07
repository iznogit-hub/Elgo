"use client";

import React from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden selection:bg-red-900 selection:text-white">
      
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         {/* Noise Filter */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
         
         {/* Red Vignette Center */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-950/30 via-black to-black" />
         
         {/* Subtle Grid */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}