"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, LayoutDashboard, Crosshair, ShoppingCart, 
  ShieldAlert, Terminal, ChevronRight, Activity 
} from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { SoundToggle } from "@/components/sound-toggle";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { play } = useSfx();
  const { userData, loading } = useAuth();

  const isAdmin = userData?.email === "iznoatwork@gmail.com";

  // 1. SCROLL LISTENER
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. VISIBILITY LOGIC 
  // Hide on these pages because they have the Sidebar Dock
  const appPages = ["/dashboard", "/hit-list", "/store", "/referrals", "/council", "/dossier", "/overseer", "/niche"];
  const isAppPage = appPages.some(path => pathname.startsWith(path));

  if (isAppPage) return null;

  // 3. QUICK LINKS (For Logged In Users on Landing Page)
  const QUICK_LINKS = [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Targets", href: "/hit-list", icon: Crosshair },
      { name: "Store", href: "/store", icon: ShoppingCart },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled ? "py-4" : "py-6"
      )}
    >
      <div 
        className={cn(
          "mx-auto flex items-center justify-between transition-all duration-500",
          scrolled 
            ? "w-[90%] max-w-5xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]" 
            : "w-full max-w-7xl px-6 bg-transparent border-transparent"
        )}
      >
        
        {/* --- LEFT: BRAND --- */}
        <Link 
          href="/" 
          className="flex items-center gap-3 group"
          onClick={() => play("click")}
        >
          <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg group-hover:bg-white/10 group-hover:border-cyan-500/50 transition-all overflow-hidden">
             <Terminal size={20} className="text-white relative z-10" />
             <div className="absolute inset-0 bg-cyan-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-black text-sm tracking-[0.2em] text-white uppercase group-hover:text-cyan-400 transition-colors">
              Boyz<span className="text-red-600">'N'</span>Galz
            </span>
            <span className="text-[8px] font-mono text-white/40 tracking-widest uppercase">
              Protocol_v4.0
            </span>
          </div>
        </Link>

        {/* --- CENTER: QUICK ACCESS (Desktop Only) --- */}
        {!loading && userData && (
           <div className="hidden md:flex items-center gap-1 bg-white/5 border border-white/5 rounded-full p-1 pl-4">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest mr-2">Quick_Launch</span>
              {QUICK_LINKS.map((link) => (
                 <Link key={link.href} href={link.href}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 rounded-full hover:bg-white/10 hover:text-cyan-400 transition-all"
                      onClick={() => play("click")}
                      title={link.name}
                    >
                       <link.icon size={14} />
                    </Button>
                 </Link>
              ))}
           </div>
        )}

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex items-center gap-4">
           
           {/* UTILS */}
           <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
              <SoundToggle />
           </div>

           {/* AUTH STATUS */}
           {!loading && (
              userData ? (
                 <div className="flex items-center gap-3">
                    {isAdmin && (
                        <Link href="/overseer">
                           <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full text-red-500 hover:bg-red-500/10 border border-red-500/20">
                              <ShieldAlert size={16} />
                           </Button>
                        </Link>
                    )}
                    
                    <Link href="/dashboard">
                       <Button className="h-9 px-5 bg-white text-black hover:bg-cyan-400 hover:text-black font-bold text-[10px] uppercase tracking-widest rounded-full transition-all flex items-center gap-2">
                          Enter_System <ChevronRight size={12} />
                       </Button>
                    </Link>
                 </div>
              ) : (
                 <div className="flex items-center gap-3">
                    <Link href="/auth/login" className="hidden sm:block text-[10px] font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
                       Login
                    </Link>
                    <Link href="/auth/signup">
                       <Button className="h-9 px-6 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white font-bold text-[10px] uppercase tracking-widest rounded-full transition-all backdrop-blur-md">
                          Initialize <Zap size={12} className="ml-2 fill-current" />
                       </Button>
                    </Link>
                 </div>
              )
           )}
        </div>

      </div>
    </header>
  );
}