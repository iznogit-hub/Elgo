"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, Menu, X, LogIn, LayoutDashboard, Shield, 
  Cpu, Zap, Activity
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { CommandTrigger } from "@/components/command-trigger";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { play } = useSfx();
  const { userData, loading } = useAuth();

  // 1. SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. HIDE ON APP PAGES (They have their own sidebar)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/hunter") || pathname.startsWith("/store") || pathname.startsWith("/niche") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled ? "py-4" : "py-6"
    )}>
      <nav className={cn(
          "mx-auto max-w-5xl flex items-center justify-between transition-all duration-500 px-6 py-3",
          scrolled 
            ? "bg-black/80 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] w-[90%] md:w-full" 
            : "bg-transparent border-transparent w-full"
      )}>
        
        {/* LEFT: IDENTITY */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          onClick={() => play("click")}
        >
          <div className="relative flex items-center justify-center w-10 h-10 bg-cyan-950/20 rounded-full border border-cyan-500/30 group-hover:border-cyan-400 group-hover:bg-cyan-500/20 transition-all duration-300">
            <Logo className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="font-black font-orbitron text-lg leading-none tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              BUBBLE<span className="text-cyan-500">POPS</span>
            </span>
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-gray-500 tracking-[0.3em] uppercase group-hover:text-white transition-colors">
                   SYSTEM_ONLINE
                </span>
            </div>
          </div>
        </Link>

        {/* CENTER: SYSTEM CONTROLS (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
          <div className="scale-75"><CommandTrigger /></div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="scale-75"><ThemeToggle /></div>
          <div className="scale-75"><SoundToggle /></div>
        </div>

        {/* RIGHT: AUTH ACTION */}
        <div className="hidden md:flex items-center gap-4">
          
          {!loading && userData ? (
               <Link href="/dashboard">
                 <Button 
                   className="bg-cyan-600 hover:bg-cyan-500 text-white font-black h-9 px-6 tracking-widest font-orbitron rounded-full shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all border border-cyan-400/20"
                   onMouseEnter={() => play("hover")}
                 >
                   <LayoutDashboard size={14} className="mr-2" /> ENTER NET
                 </Button>
               </Link>
          ) : (
               <div className="flex items-center gap-3">
                   <Link href="/auth/login" className="text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-colors tracking-widest uppercase">
                       Log_In
                   </Link>
                   <Link href="/auth/signup">
                     <Button 
                       variant="outline"
                       className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 h-9 px-6 tracking-widest font-mono rounded-full uppercase text-[10px]"
                       onMouseEnter={() => play("hover")}
                     >
                        Initialize <Zap size={12} className="ml-2" />
                     </Button>
                   </Link>
               </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          onClick={() => { setIsOpen(!isOpen); play("click"); }}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isOpen && (
        <div className="absolute top-24 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col gap-6 md:hidden animate-in slide-in-from-top-5 shadow-2xl z-50">
            
            <div className="space-y-4">
               <div className="flex items-center justify-between pb-4 border-b border-white/10">
                   <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Controls</span>
                   <div className="flex gap-2">
                      <ThemeToggle />
                      <SoundToggle />
                   </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                   <Link href="/features" className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-cyan-500/30 flex flex-col gap-2 group">
                      <Cpu size={16} className="text-cyan-500" />
                      <span className="text-[10px] font-bold text-white uppercase group-hover:text-cyan-400">Features</span>
                   </Link>
                   <Link href="/pricing" className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-yellow-500/30 flex flex-col gap-2 group">
                      <Shield size={16} className="text-yellow-500" />
                      <span className="text-[10px] font-bold text-white uppercase group-hover:text-yellow-400">Pricing</span>
                   </Link>
               </div>
            </div>

            {!loading && userData ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-white font-black tracking-[0.2em] font-orbitron uppercase rounded-xl">
                    <LayoutDashboard size={16} className="mr-2" /> Open Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                  <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-12 border-white/10 text-white font-mono uppercase tracking-widest rounded-xl hover:bg-white/10">
                        Access Terminal
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-12 bg-white text-black font-black font-orbitron uppercase tracking-widest rounded-xl hover:bg-gray-200">
                        Start Protocol
                    </Button>
                  </Link>
              </div>
            )}
        </div>
      )}
    </header>
  );
}