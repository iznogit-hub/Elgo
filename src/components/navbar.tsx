"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, Menu, X, LogIn, LayoutDashboard, Shield
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
  const pathname = usePathname();
  const { play } = useSfx();
  const { userData, loading } = useAuth();

  // Hide Navbar on dashboard pages (AppLayout handles that)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/hunter") || pathname.startsWith("/store")) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:py-6">
      <nav className="mx-auto max-w-7xl flex items-center justify-between rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl px-6 py-3 shadow-2xl">
        
        {/* LOGO */}
        <Link 
          href="/" 
          className="flex items-center gap-2 group"
          onClick={() => play("click")}
        >
          <div className="relative flex items-center justify-center w-10 h-10 bg-cyan-950/30 rounded-lg border border-cyan-500/30 group-hover:border-cyan-400 transition-colors">
            <Logo className="w-6 h-6 text-cyan-400" />
          </div>
          <div className="hidden md:block">
            <span className="block font-black font-orbitron text-lg leading-none tracking-tight text-white">
              BUBBLE<span className="text-cyan-500">POPS</span>
            </span>
            <span className="block text-[9px] font-mono text-gray-500 tracking-[0.3em]">
              ZAIBATSU OS
            </span>
          </div>
        </Link>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <CommandTrigger />
          <div className="h-6 w-px bg-white/10" />
          <ThemeToggle />
          <SoundToggle />
          
          <div className="ml-4">
            {!loading && userData ? (
               <Link href="/dashboard">
                 <Button 
                    className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold h-10 px-6 tracking-widest font-orbitron"
                    onMouseEnter={() => play("hover")}
                 >
                    ENTER LAUNCHER
                 </Button>
               </Link>
            ) : (
               <Link href="/auth/login">
                 <Button 
                    variant="outline"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/30 h-10 px-6 tracking-widest font-mono"
                    onMouseEnter={() => play("hover")}
                 >
                    <LogIn className="w-4 h-4 mr-2" /> LOGIN
                 </Button>
               </Link>
            )}
          </div>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="absolute top-20 left-4 right-4 bg-black border border-white/10 rounded-xl p-4 flex flex-col gap-4 md:hidden animate-in slide-in-from-top-5">
           <CommandTrigger />
           <div className="flex justify-between">
              <ThemeToggle />
              <SoundToggle />
           </div>
           {!loading && userData ? (
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-cyan-600 text-black font-bold">DASHBOARD</Button>
              </Link>
           ) : (
              <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-cyan-500 text-cyan-500">LOGIN</Button>
              </Link>
           )}
        </div>
      )}
    </header>
  );
}