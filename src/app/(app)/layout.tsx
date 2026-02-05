"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Home, Radar, Users, ShoppingBag, 
  Crown, ShieldAlert, LogOut, Menu, X, 
  Terminal, ChevronRight, MessageSquare, UserCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import ChatWindow from "@/components/chat-window"; // The Chat Component

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, loading } = useAuth();
  const { play } = useSfx();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); 

  const isAdmin = userData?.email === "iznoatwork@gmail.com";
  const username = userData?.username || "Operative";

  // 1. PROTECTED ROUTE CHECK
  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, loading, router]);

  const NAV_ITEMS = [
    { label: "Home Base", href: "/dashboard", icon: Home },
    { label: "Scout Mission", href: "/hunter", icon: Radar },
    { label: "My Gang", href: "/referrals", icon: Users },
    { label: "Bazaar", href: "/store", icon: ShoppingBag },
    { label: "Profile", href: "/profile", icon: UserCircle }, // New Profile Link
    { label: "VIP Lounge", href: "/council", icon: Crown, vip: true },
  ];

  const handleLogout = async () => {
    play("off");
    toast.loading("LOGGING OUT...");
    await signOut(auth);
    setTimeout(() => {
        toast.dismiss();
        router.push("/");
    }, 800);
  };

  if (loading) return null; 

  return (
    <div className="flex min-h-screen bg-black font-sans selection:bg-cyan-500/30">
      
      {/* ⚡ GLOBAL SUPPORT CHAT (Hidden until triggered) */}
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* --- SIDEBAR (DESKTOP) --- */}
      <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-black fixed h-full z-50">
        
        {/* LOGO */}
        <div className="p-8 border-b border-white/5">
           <Link href="/dashboard" onClick={() => play("click")} className="flex items-center gap-3 group">
             <div className="w-10 h-10 bg-cyan-950/30 rounded-sm flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                <Terminal className="w-5 h-5" />
             </div>
             <div>
                <h1 className="font-black font-orbitron text-lg text-white leading-none tracking-tighter">
                  BUBBLE<span className="text-cyan-500">POPS</span>
                </h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-widest mt-1 uppercase">India Node</p>
             </div>
           </Link>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
           {NAV_ITEMS.map((item) => (
             <Link key={item.href} href={item.href}>
                <MagneticWrapper>
                    <div 
                        onMouseEnter={() => play("hover")}
                        onClick={() => play("click")}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-sm border transition-all duration-200 group relative overflow-hidden",
                            pathname === item.href 
                              ? "bg-white/5 border-cyan-500/30 text-white" 
                              : "border-transparent text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn(
                            "w-4 h-4 transition-colors",
                            pathname === item.href ? "text-cyan-400" : "text-gray-600 group-hover:text-cyan-400",
                            item.vip && "text-yellow-500"
                        )} />
                        <span className={cn("text-xs font-bold font-mono tracking-widest relative z-10 uppercase", item.vip && "text-yellow-500")}>
                            {item.label}
                        </span>
                        {pathname === item.href && <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
                    </div>
                </MagneticWrapper>
             </Link>
           ))}

           {isAdmin && (
             <div className="pt-6 mt-6 border-t border-white/5">
                <Link href="/admin">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-sm border border-red-900/30 text-red-600 hover:bg-red-950/20 hover:text-red-500 transition-all group" onMouseEnter={() => play("hover")}>
                        <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                        <span className="text-xs font-bold font-mono tracking-widest">ADMIN PANEL</span>
                    </button>
                </Link>
             </div>
           )}
        </nav>

        {/* USER FOOTER (CLEANED) */}
        <div className="p-4 border-t border-white/5 bg-black">
            
            {/* 1. SUPPORT CHAT BUTTON (Replaces Report Anomaly) */}
            <button 
                onClick={() => { play("open"); setIsChatOpen(true); }}
                className="w-full flex items-center gap-3 mb-4 hover:bg-white/5 p-2 rounded-sm transition-colors group text-left"
            >
                <div className="relative">
                    <div className="w-8 h-8 rounded-sm bg-gray-900 border border-gray-800 flex items-center justify-center text-[10px] font-black text-gray-500 group-hover:text-white group-hover:border-cyan-500/50 transition-all">
                        {username?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-black rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="overflow-hidden flex-1">
                    <p className="text-xs font-black text-white truncate font-orbitron tracking-wide">{username}</p>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare size={8} className="text-cyan-500" />
                        <p className="text-[8px] text-cyan-500 font-mono uppercase truncate">Support Uplink</p>
                    </div>
                </div>
            </button>

            {/* 2. LOGOUT */}
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-1 text-red-900 hover:text-red-500 hover:bg-red-950/10 transition-all text-[9px] font-mono tracking-widest">
                <LogOut className="w-3 h-3" /> Logout
            </button>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 h-14 flex items-center justify-between px-4">
         <div className="flex items-center gap-2">
             <Terminal className="w-4 h-4 text-cyan-500" />
             <span className="font-black font-orbitron text-sm tracking-tighter text-white">B<span className="text-cyan-500">POPS</span></span>
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white active:scale-95 transition-transform">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
         </button>
      </div>

      {/* --- MOBILE MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black animate-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col h-full pt-20 px-6 pb-10">
                <div className="space-y-2 flex-1">
                    {NAV_ITEMS.map((item, idx) => (
                        <Link key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={cn("flex items-center justify-between p-4 border-b border-white/10 active:bg-white/5 transition-all", pathname === item.href ? "text-cyan-400 border-cyan-500/50" : "text-gray-400")}>
                            <div className="flex items-center gap-4">
                                <item.icon className={cn("w-6 h-6", item.vip && "text-yellow-500")} />
                                <span className={cn("font-bold text-lg font-orbitron tracking-wide uppercase", item.vip && "text-yellow-500")}>{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 opacity-50" />
                        </Link>
                    ))}
                </div>
                <div className="space-y-4">
                    {/* MOBILE SUPPORT BUTTON */}
                    <button onClick={() => { setIsMobileMenuOpen(false); setIsChatOpen(true); }} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-sm bg-gray-900 border border-cyan-500/30 flex items-center justify-center text-cyan-500"><MessageSquare size={14} /></div>
                            <div className="flex flex-col items-start">
                                <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Support Uplink</span>
                                <span className="text-base font-black text-white font-orbitron">Chat with HQ</span>
                            </div>
                        </div>
                    </button>
                    <button onClick={handleLogout} className="w-full p-4 bg-red-900/20 text-red-500 font-bold font-mono text-xs tracking-widest flex items-center justify-center gap-2 rounded-lg">
                        <LogOut className="w-4 h-4" /> LOGOUT
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 md:pl-64 pt-14 md:pt-0 min-h-screen relative bg-black">
        {children}
      </main>

    </div>
  );
}