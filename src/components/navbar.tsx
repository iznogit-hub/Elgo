"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Zap, LayoutDashboard, Crosshair, ShoppingCart, 
  ShieldAlert, Terminal, ChevronRight, Activity, Database 
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
  const appPages = ["/dashboard", "/hit-list", "/store", "/referrals", "/council", "/dossier", "/overseer", "/niche"];
  const isAppPage = appPages.some(path => pathname.startsWith(path));

  if (isAppPage) return null;

  // 3. QUICK LINKS (Lingo updated for Financial/Yield Operations)
  const QUICK_LINKS = [
      { name: "Terminal", href: "/dashboard", icon: LayoutDashboard },
      { name: "Operations", href: "/hit-list", icon: Crosshair },
      { name: "Exchange", href: "/store", icon: ShoppingCart },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
        // Brutalist Scroll State: From inverted difference to stark solid border
        scrolled 
            ? "bg-[#050505]/95 border-b border-white/10 py-4 backdrop-blur-md text-white" 
            : "bg-transparent py-6 mix-blend-difference text-white"
      )}
    >
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between transition-all duration-500">
        
        {/* --- LEFT: BRAND --- */}
        <Link 
          href="/" 
          className="flex items-center gap-4 group"
          onClick={() => play("click")}
        >
          {/* Architectural Logo Box */}
          <div className="w-10 h-10 flex items-center justify-center border border-white/20 bg-transparent group-hover:bg-white group-hover:text-black transition-colors duration-300">
             <Database size={18} className="relative z-10" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-[0.2em] uppercase transition-colors">
              PortalZ
            </span>
            <span className="text-[9px] font-mono opacity-50 tracking-widest uppercase">
              Global_Ops_v1.0
            </span>
          </div>
        </Link>

        {/* --- CENTER: QUICK ACCESS (Desktop Only) --- */}
        {!loading && userData && (
           <div className="hidden md:flex items-center gap-2 border border-white/10 p-1 px-4 bg-black/40 backdrop-blur-sm">
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest mr-4">Quick_Access</span>
              {QUICK_LINKS.map((link) => (
                 <Link key={link.href} href={link.href}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="w-8 h-8 rounded-none hover:bg-white hover:text-black transition-colors"
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
        <div className="flex items-center gap-6">
           
           {/* UTILS */}
           <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle />
              <SoundToggle />
           </div>

           {/* AUTH STATUS */}
           {!loading && (
              userData ? (
                 <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link href="/overseer">
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-none border border-white/20 text-white hover:bg-white hover:text-black transition-colors" title="Overseer Terminal">
                              <ShieldAlert size={16} />
                           </Button>
                        </Link>
                    )}
                    
                    <Link href="/dashboard">
                       <Button className="h-10 px-6 bg-white text-black hover:bg-transparent hover:text-white border border-white font-mono font-bold text-[10px] uppercase tracking-widest rounded-none transition-colors flex items-center gap-3">
                          Access_Terminal <ChevronRight size={14} />
                       </Button>
                    </Link>
                 </div>
              ) : (
                 <div className="flex items-center gap-6">
                    <Link 
                        href="/auth/login" 
                        className="hidden sm:block text-[10px] font-mono font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors"
                    >
                       Authenticate
                    </Link>
                    <Link href="/auth/signup">
                       <Button className="h-10 px-6 bg-transparent hover:bg-white text-white hover:text-black border border-white/20 hover:border-white font-mono font-bold text-[10px] uppercase tracking-widest rounded-none transition-colors backdrop-blur-md">
                          Initialize Setup <Zap size={12} className="ml-3 fill-current" />
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