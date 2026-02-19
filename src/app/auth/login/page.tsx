"use client";

import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { ShieldCheck, ArrowLeft, AlertTriangle, Database } from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { useAuth } from "@/lib/context/auth-context"; 
import { Background } from "@/components/ui/background"; 
import { SoundPrompter } from "@/components/ui/sound-prompter";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { play } = useSfx();
  const { userData, user, loading: authLoading } = useAuth(); 
  
  // REDIRECT LOGIC
  useEffect(() => {
    if (!authLoading) {
      if (userData?.instagramHandle) {
        router.push("/dashboard");
      } else if (user) {
        router.push("/auth/signup");
      }
    }
  }, [userData, user, authLoading, router]);

  const handleGoogleLogin = async () => {
    play("click");
    try {
      await signInWithPopup(auth, googleProvider);
      play("success");
      toast.success("AUTHENTICATION VERIFIED");
    } catch (error: any) {
      play("error");
      toast.error("ACCESS DENIED // NETWORK ERROR");
    }
  };

  if (authLoading) return null;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#050505] selection:bg-[#FFD4B2] selection:text-black overflow-hidden">
      
      {/* --- RESTORED IMMERSIVE BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-[-1] w-full h-full pointer-events-none">
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Auth Background" 
          fill 
          priority
          className="object-cover object-center opacity-20 grayscale contrast-125 mix-blend-overlay"
        />
        {/* Darkroom Depth Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />
      <Background />

      {/* NAV - Brutalist 1px Grid Style */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-8 py-6 border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
        <div className="pointer-events-auto">
            <Link 
              href="/" 
              onClick={() => play("hover")} 
              className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-neutral-400 hover:text-[#FFD4B2] transition-colors group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>Abort Deployment</span>
            </Link>
        </div>
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD4B2] animate-pulse shadow-[0_0_8px_#FFD4B2]" />
            <span className="text-xs font-mono tracking-[0.2em] text-neutral-400 uppercase hidden md:block">
              Lobby_Gateway_v2.0
            </span>
        </div>
      </nav>

      {/* MAIN CONTENT - Massive Typography & Architectural Spacing */}
      <div className="relative z-50 flex flex-col items-center justify-center text-center space-y-16 w-full max-w-2xl px-4">
        
        <div className="space-y-8 w-full">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border border-[#FFD4B2]/30 mx-auto bg-[#FFD4B2]/5">
               <Database size={14} className="text-[#FFD4B2]" />
               <span className="text-xs font-mono text-[#FFD4B2] uppercase tracking-widest">Protocol 01</span>
            </div>

            {/* Massive Scaling Text with Peach Hue Accent */}
            <h1 className="text-[12vw] md:text-[8vw] leading-[0.85] tracking-tighter uppercase font-medium">
                <HackerText text="IDENTIFY" speed={50} /> <br/>
                <span className="text-[#FFD4B2]/60 italic">YOURSELF</span>
            </h1>

            <p className="text-sm font-mono text-neutral-500 tracking-widest uppercase max-w-md mx-auto leading-relaxed">
                Secure Server Access required. <br/> Initialize Google Uplink to enter the PortalZ Lobby.
            </p>
        </div>

        {/* GOOGLE BUTTON ONLY - High Contrast Inversion */}
        <div className="w-full flex flex-col items-center gap-6">
          <Button 
              onClick={handleGoogleLogin}
              className="group relative w-full max-w-sm h-16 bg-transparent text-[#FFD4B2] border border-[#FFD4B2]/30 hover:bg-[#FFD4B2] hover:text-black font-mono font-bold tracking-widest uppercase transition-all duration-500 flex items-center justify-center gap-4 rounded-none"
          >
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
              </svg>
              <span>Initialize Google Auth</span>
          </Button>

          <div className="flex items-center gap-2 text-[10px] text-neutral-600 font-mono uppercase tracking-widest">
              <AlertTriangle size={12} className="text-neutral-700" /> Manual override disabled
          </div>
        </div>

      </div>
    </main>
  );
}