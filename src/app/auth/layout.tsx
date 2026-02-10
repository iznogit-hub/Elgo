"use client";

import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full bg-black flex items-center justify-center relative overflow-hidden selection:bg-red-900 selection:text-white">
      
      {/* --- BACKGROUND ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         
         {/* 1. Base Technical Grid (Fixed Scale) */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
         
         {/* 2. Noise Texture (Grain) */}
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 mix-blend-overlay" />
         
         {/* 3. Red Vignette (Focus Pull - Deepened for readability) */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#000000_90%)] opacity-90" />
         
         {/* 4. Core Pulse Glow (Responsive Sizing) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-red-600/10 blur-[100px] rounded-full animate-pulse" />
      
      </div>

      {/* --- CONTENT STAGE --- */}
      <div className="relative z-10 w-full max-w-full flex flex-col items-center justify-center p-4 md:p-8">
        {children}
      </div>
      
    </div>
  );
}