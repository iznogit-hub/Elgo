"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, Zap, 
  LayoutDashboard, Radar, ShoppingBag, Users, UserCircle, ShieldAlert,
  ChevronRight
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

  const isAdmin = userData?.email === "iznoatwork@gmail.com";

  // 1. SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. HIDE ON APP PAGES
  if (pathname.startsWith("/dashboard") || 
      pathname.startsWith("/hunter") || 
      pathname.startsWith("/store") || 
      pathname.startsWith("/niche") || 
      pathname.startsWith("/referrals") ||
      pathname.startsWith("/council") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/admin")) {
    return null;
  }

  // 3. DEFINE APP ROUTES
  const APP_ROUTES = [
      { name: "Launch Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-cyan-500" },
      { name: "Signal Hunter", href: "/hunter", icon: Radar, color: "text-green-500" },
      { name: "Black Market", href: "/store", icon: ShoppingBag, color: "text-yellow-500" },
      { name: "My Gang", href: "/referrals", icon: Users, color: "text-purple-500" },
      { name: "Operative Profile", href: "/profile", icon: UserCircle, color: "text-white" },
  ];

  return (
    <header className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        scrolled ? "py-4" : "py-6"
    )}>
      <nav className={cn(
          "mx-auto max-w-5xl flex items-center justify-between transition-all duration-500 px-6 py-3",
          // ⚡ UPDATE: 'bg-black' instead of 'bg-black/80', removed backdrop-blur
          scrolled 
            ? "bg-black border border-white/10 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] w-[90%] md:w-full" 
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

        {/* CENTER: SYSTEM CONTROLS (Desktop Only) */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
          <div className="scale-75"><CommandTrigger /></div>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="scale-75"><ThemeToggle /></div>
          <div className="scale-75"><SoundToggle /></div>
        </div>

        {/* RIGHT: AUTH ACTION (Desktop Only) */}
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
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors z-[1001] relative"
          onClick={() => { setIsOpen(!isOpen); play("click"); }}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* 📱 MOBILE MENU OVERLAY (SOLID BLACK) */}
      {isOpen && (
        <div className="fixed inset-0 z-[999] bg-black animate-in slide-in-from-top-5 duration-300 flex flex-col pt-24 px-6 pb-10 overflow-y-auto">
            
            {/* 1. SYSTEM CONTROLS (Mobile) */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">System Controls</span>
                <div className="flex gap-2">
                   <ThemeToggle />
                   <SoundToggle />
                </div>
            </div>

            {/* 2. NAVIGATION LINKS */}
            <div className="flex-1 space-y-2">
               {!loading && userData ? (
                   <>
                       {/* LOGGED IN: SHOW ALL ROUTES */}
                       {APP_ROUTES.map((route, i) => (
                           <Link 
                                key={route.href} 
                                href={route.href} 
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all"
                                style={{ animationDelay: `${i * 50}ms` }}
                           >
                               <div className="flex items-center gap-4">
                                   <route.icon className={cn("w-5 h-5", route.color)} />
                                   <span className="text-sm font-black font-orbitron uppercase text-white tracking-wide">
                                       {route.name}
                                   </span>
                               </div>
                               <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
                           </Link>
                       ))}

                       {isAdmin && (
                           <Link 
                                href="/admin" 
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center justify-between p-4 bg-red-900/10 rounded-xl border border-red-500/20 hover:bg-red-900/20 transition-all mt-4"
                           >
                               <div className="flex items-center gap-4">
                                   <ShieldAlert className="w-5 h-5 text-red-500" />
                                   <span className="text-sm font-black font-orbitron uppercase text-red-500 tracking-wide">
                                       Admin Console
                                   </span>
                               </div>
                           </Link>
                       )}
                   </>
               ) : (
                   <>
                       {/* LOGGED OUT */}
                       <div className="flex flex-col gap-3">
                           <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                             <Button variant="outline" className="w-full h-14 border-white/10 text-white font-mono uppercase tracking-widest rounded-xl hover:bg-white/10 text-xs">
                                 Access Terminal
                             </Button>
                           </Link>
                           <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                             <Button className="w-full h-14 bg-white text-black font-black font-orbitron uppercase tracking-widest rounded-xl hover:bg-gray-200 text-xs">
                                 Start Protocol <Zap size={14} className="ml-2" />
                             </Button>
                           </Link>
                       </div>
                   </>
               )}
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                    BUBBLEPOPS OS v4.2 // SECURE CONNECTION
                </p>
            </div>

        </div>
      )}
    </header>
  );
}