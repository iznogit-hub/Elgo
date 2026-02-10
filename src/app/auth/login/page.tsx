"use client";

import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { ShieldCheck, ArrowLeft, AlertTriangle } from "lucide-react";
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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center selection:bg-red-900 selection:text-white overflow-hidden">
      
      {/* --- IMMERSIVE BACKGROUND LAYER --- */}
      <div className="fixed inset-0 z-[-1] w-full h-full">
        {/* The Image: Object Cover + Center ensures perfect crop on mobile */}
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Auth Background" 
          fill 
          priority
          className="object-cover object-center opacity-40 grayscale contrast-125"
        />
        
        {/* Overlays for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />
      <Background />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-red-500 transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-red-500" />
            </Link>
        </div>
        <div className="px-3 py-1 bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Secure_Gateway_V2</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="relative z-50 flex flex-col items-center justify-center text-center space-y-12 w-full max-w-md px-4">
        
        <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-950/30 border border-red-900/30 rounded-full mx-auto backdrop-blur-md">
               <ShieldCheck size={12} className="text-red-500" />
               <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">Authentication Protocol</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-sans italic uppercase leading-none tracking-tighter drop-shadow-2xl">
                <HackerText text="IDENTIFY" speed={50} /> <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-500">YOURSELF</span>
            </h1>
            <p className="text-sm font-mono text-neutral-400 tracking-[0.2em] uppercase max-w-sm mx-auto drop-shadow-md">
               Access restricted. Authentication via Google required for clearance.
            </p>
        </div>

        {/* GOOGLE BUTTON ONLY */}
        <Button 
            onClick={handleGoogleLogin}
            className="relative overflow-hidden w-full max-w-xs h-16 bg-white text-black font-black tracking-widest uppercase hover:bg-neutral-200 transition-all group flex items-center justify-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] rounded-none"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <svg className="w-6 h-6" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            <span>Google Access</span>
        </Button>

        <div className="flex items-center gap-2 text-[9px] text-red-500 font-mono uppercase tracking-widest opacity-60">
            <AlertTriangle size={10} /> No Manual Override Available
        </div>

      </div>
    </main>
  );
}