"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  LayoutDashboard, 
  Radar, 
  Users, 
  ShoppingBag, 
  Crown, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  X, 
  Terminal,
  ChevronRight,
  UserCircle // Added Icon
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// --- ZAIBATSU UI ---
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, loading, isAdmin } = useAuth();
  const { play } = useSfx();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 1. SECURITY GATE
  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, loading, router]);

  // 2. NAVIGATION CONFIG
  const NAV_ITEMS = [
    { label: "LAUNCHER", href: "/dashboard", icon: LayoutDashboard },
    { label: "HUNTER", href: "/hunter", icon: Radar },
    { label: "HIERARCHY", href: "/referrals", icon: Users },
    { label: "ARMORY", href: "/store", icon: ShoppingBag },
    { label: "IDENTITY", href: "/profile", icon: UserCircle }, // ⚡ ADDED PROFILE LINK
    { label: "COUNCIL", href: "/council", icon: Crown, vip: true }, // ⚡ FIXED TYPO
  ];

  // 3. LOGOUT SEQUENCE
  const handleLogout = async () => {
    play("off");
    toast.loading("SEVERING NEURAL LINK...");
    await signOut(auth);
    setTimeout(() => {
        toast.dismiss();
        router.push("/");
    }, 1000);
  };

  if (loading) return null; 

  return (
    <div className="flex min-h-screen bg-[#050505] font-sans selection:bg-cyan-500/30">
      
      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black/90 backdrop-blur-xl fixed h-full z-40">
        
        {/* LOGO */}
        <div className="p-8 border-b border-white/5">
           <Link href="/dashboard" onClick={() => play("click")} className="flex items-center gap-2 group">
             <div className="w-8 h-8 bg-cyan-900/20 rounded flex items-center justify-center border border-cyan-500/50 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Terminal className="w-5 h-5" />
             </div>
             <div>
                <h1 className="font-black font-orbitron text-lg text-white leading-none">
                  BUBBLE<span className="text-cyan-500">POPS</span>
                </h1>
                <p className="text-[9px] text-gray-500 font-mono tracking-widest">ZAIBATSU OS v2.0</p>
             </div>
           </Link>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
           {NAV_ITEMS.map((item) => (
             <Link key={item.href} href={item.href}>
                <MagneticWrapper>
                    <div 
                        onMouseEnter={() => play("hover")}
                        onClick={() => play("click")}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 group relative overflow-hidden",
                            pathname === item.href 
                              ? "bg-white/5 border-cyan-500/50 text-white" 
                              : "border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                        )}
                    >
                        {/* Hover Highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <item.icon className={cn(
                            "w-5 h-5 relative z-10 transition-colors",
                            pathname === item.href ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400",
                            item.vip && "text-yellow-500"
                        )} />
                        
                        <span className={cn(
                            "text-sm font-bold font-mono tracking-wider relative z-10",
                            item.vip && "text-yellow-500"
                        )}>
                            {item.label}
                        </span>

                        {pathname === item.href && (
                            <div className="ml-auto w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_10px_#06b6d4]" />
                        )}
                    </div>
                </MagneticWrapper>
             </Link>
           ))}

           {/* ADMIN LINK (Conditional) */}
           {isAdmin && (
             <div className="pt-4 mt-4 border-t border-white/5">
                <Link href="/admin">
                    <button 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-900/30 text-red-500 hover:bg-red-950/20 transition-all group"
                        onMouseEnter={() => play("hover")}
                    >
                        <ShieldAlert className="w-5 h-5 group-hover:animate-pulse" />
                        <span className="text-sm font-bold font-mono tracking-wider">GOD MODE</span>
                    </button>
                </Link>
             </div>
           )}
        </nav>

        {/* USER FOOTER */}
        <div className="p-4 border-t border-white/10 bg-black/50">
            <Link href="/profile" className="flex items-center gap-3 mb-4 hover:bg-white/5 p-2 rounded transition-colors" onClick={() => play("click")}>
                <div className="w-10 h-10 rounded bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400">
                    {userData?.username?.substring(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate font-orbitron">{userData?.username}</p>
                    <p className="text-[10px] text-gray-500 font-mono uppercase truncate">{userData?.tier} CLASS</p>
                </div>
            </Link>
            <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full border-red-900/30 text-red-700 hover:bg-red-950/20 hover:text-red-500 h-8 text-xs font-mono"
            >
                <LogOut className="w-3 h-3 mr-2" /> DISCONNECT
            </Button>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 h-16 flex items-center justify-between px-4">
         <Link href="/dashboard" className="font-black font-orbitron text-white">
            BUBBLE<span className="text-cyan-500">POPS</span>
         </Link>
         <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-400 hover:text-white"
         >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black pt-24 px-6 animate-in slide-in-from-top-10">
            <div className="space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-xl border border-white/10 active:scale-95 transition-all",
                            pathname === item.href ? "bg-white/10 border-cyan-500/50" : "bg-transparent"
                        )}
                    >
                        <div className="flex items-center gap-4">
                            <item.icon className={cn("w-6 h-6", pathname === item.href ? "text-cyan-400" : "text-gray-500")} />
                            <span className="font-bold text-lg text-white font-orbitron">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </Link>
                ))}
                {isAdmin && (
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl border border-red-900/50 text-red-500">
                        <ShieldAlert className="w-6 h-6" />
                        <span className="font-bold text-lg font-orbitron">GOD MODE</span>
                    </Link>
                )}
            </div>
            <button 
                onClick={handleLogout}
                className="w-full mt-8 p-4 bg-red-900/20 border border-red-900/50 text-red-500 rounded-xl font-bold font-mono flex items-center justify-center gap-2"
            >
                <LogOut className="w-5 h-5" /> TERMINATE SESSION
            </button>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0 min-h-screen relative overflow-x-hidden">
        {children}
      </main>

    </div>
  );
}