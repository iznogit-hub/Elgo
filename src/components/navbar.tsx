"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, 
  LayoutDashboard, Radar, ShoppingBag, Users, UserCircle, ShieldAlert
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
  // Note: You listed these pages to HIDE the navbar. 
  // If you want these icons visible WHILE on the dashboard, we need to remove this check.
  // However, your prompt implies "change this navbar", so I will assume the visibility logic remains same 
  // and this navbar is for the "Landing/Marketing" pages, but you want quick access if logged in.
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
          "mx-auto max-w-7xl flex items-center justify-between transition-all duration-500 px-6 py-3",
          scrolled 
            ? "bg-black border border-white/10 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.8)] w-[95%] md:w-full" 
            : "bg-transparent border-transparent w-full"
      )}>
        
        {/* LEFT: IDENTITY */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group shrink-0"
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

        {/* RIGHT: ACTIONS & CONTROLS */}
        <div className="flex items-center gap-4">
          
          {/* LOGGED IN NAVIGATION ICONS */}
          {!loading && userData && (
            <div className="flex items-center gap-2 mr-2">
              {APP_ROUTES.map((route) => (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-500/30 transition-all group"
                    onClick={() => play("click")}
                    title={route.name} // Native tooltip fallback
                  >
                    <route.icon className={cn("w-4 h-4 transition-colors", route.color, "group-hover:text-white")} />
                  </Button>
                </Link>
              ))}

              {isAdmin && (
                <Link href="/admin">
                   <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-full bg-red-900/10 border border-red-500/20 hover:bg-red-900/30 hover:border-red-500/50 transition-all group"
                    onClick={() => play("click")}
                    title="Admin Console"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-500 group-hover:text-red-400" />
                  </Button>
                </Link>
              )}
              
              {/* Divider between Nav and System Controls */}
              <div className="h-6 w-px bg-white/10 mx-2" />
            </div>
          )}

          {/* SYSTEM CONTROLS (Always visible or toggleable) */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-1 border border-white/5">
            <div className="scale-75"><CommandTrigger /></div>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <div className="scale-75"><ThemeToggle /></div>
            <div className="scale-75"><SoundToggle /></div>
          </div>

          {/* AUTH BUTTONS (If NOT logged in) */}
          {!loading && !userData && (
               <div className="flex items-center gap-3">
                   <Link href="/auth/login" className="hidden sm:block text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-colors tracking-widest uppercase">
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
      </nav>
    </header>
  );
}