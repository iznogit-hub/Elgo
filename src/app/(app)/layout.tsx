"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Activity, Crosshair, Users, ShoppingCart, 
  Crown, ShieldAlert, LogOut, Terminal, 
  FileText, Home, Menu, X, LayoutGrid
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";

// --- DOCK ITEM COMPONENT ---
const DockItem = ({ 
  icon: Icon, 
  label, 
  href, 
  isActive, 
  onClick, 
  vip = false,
  isLogout = false 
}: any) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Link 
      href={href} 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative group flex items-center justify-center"
    >
      {/* TOOLTIP (Appears on Hover) */}
      <div className={cn(
        "absolute left-14 bg-black/90 border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm transition-all duration-200 z-50 pointer-events-none whitespace-nowrap",
        hovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
      )}>
        {label}
      </div>

      {/* ICON CONTAINER */}
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 backdrop-blur-md border shadow-lg",
        isActive 
          ? "bg-neutral-800/80 border-red-500 text-red-500 scale-110 shadow-[0_0_15px_rgba(220,38,38,0.4)]" 
          : "bg-black/40 border-white/10 text-neutral-500 hover:bg-neutral-800 hover:text-white hover:border-white/30 hover:scale-105",
        vip && "border-yellow-500/30 text-yellow-600 hover:text-yellow-400",
        isLogout && "hover:bg-red-950/50 hover:border-red-500/50 hover:text-red-500"
      )}>
        <Icon size={20} strokeWidth={isActive ? 3 : 2} />
      </div>

      {/* ACTIVE INDICATOR DOT */}
      {isActive && (
        <div className="absolute -left-2 w-1 h-8 bg-red-500 rounded-r-full blur-[2px]" />
      )}
    </Link>
  );
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, loading } = useAuth();
  const { play } = useSfx();
  
  const isAdmin = userData?.email === "iznoatwork@gmail.com";

  // --- WAR ROOM NAVIGATION ---
  const NAV_ITEMS = [
    { label: "Status", href: "/dashboard", icon: Activity },
    { label: "Hit List", href: "/hit-list", icon: Crosshair },
    { label: "Squad", href: "/referrals", icon: Users },
    { label: "Loadout", href: "/dossier", icon: FileText },
    { label: "Market", href: "/store", icon: ShoppingCart },
    { label: "High Command", href: "/council", icon: Crown, vip: true },
  ];

  const handleLogout = async (e: any) => {
    e.preventDefault();
    play("off");
    toast.loading("SEVERING CONNECTION...");
    await signOut(auth);
    setTimeout(() => {
        toast.dismiss();
        router.push("/");
    }, 800);
  };

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, loading, router]);

  if (loading) return null; 

  return (
    <div className="min-h-screen bg-black font-sans selection:bg-red-900 selection:text-white flex flex-col md:flex-row">
      
      {/* --- 1. DESKTOP DOCK (LEFT RAIL) --- */}
      <aside className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-50 flex-col gap-4">
         
         {/* BRAND LOGO */}
         <div className="w-12 h-12 flex items-center justify-center bg-red-600 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.5)] mb-4 animate-pulse">
            <Terminal size={24} className="text-white" />
         </div>

         {/* NAVIGATION STACK */}
         <nav className="flex flex-col gap-3 p-2 rounded-2xl bg-neutral-900/20 border border-white/5 backdrop-blur-sm">
            {NAV_ITEMS.map((item) => (
               <DockItem 
                 key={item.href}
                 {...item}
                 isActive={pathname === item.href}
                 onClick={() => play("click")}
               />
            ))}
         </nav>

         {/* ADMIN / LOGOUT STACK */}
         <div className="mt-4 flex flex-col gap-3">
            {isAdmin && (
               <DockItem 
                 icon={ShieldAlert} 
                 label="OVERSEER" 
                 href="/overseer" 
                 isActive={pathname === "/overseer"} 
                 onClick={() => play("click")}
               />
            )}
            <DockItem 
               icon={LogOut} 
               label="ABORT" 
               href="#" 
               onClick={handleLogout} 
               isLogout 
            />
         </div>
      </aside>

      {/* --- 2. MOBILE BOTTOM BAR (Horizontal Dock) --- */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
         <div className="flex items-center justify-between bg-neutral-900/90 border border-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl overflow-x-auto no-scrollbar">
            {NAV_ITEMS.slice(0, 5).map((item) => ( // Show top 5 on mobile
               <Link 
                 key={item.href} 
                 href={item.href}
                 onClick={() => play("click")}
                 className={cn(
                   "p-3 rounded-xl transition-all",
                   pathname === item.href ? "bg-red-600 text-white" : "text-neutral-500 hover:text-white"
                 )}
               >
                 <item.icon size={20} />
               </Link>
            ))}
            <button onClick={handleLogout} className="p-3 text-red-500/50 hover:text-red-500">
               <LogOut size={20} />
            </button>
         </div>
      </div>

      {/* --- 3. MAIN CONTENT WRAPPER --- */}
      {/* Added left padding for desktop to account for the Dock */}
      <main className="flex-1 md:pl-28 min-h-screen relative">
        
        {/* Mobile Top Header (Brand only) */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center border-b border-white/5">
            <span className="text-xs font-black font-sans tracking-[0.2em] text-white">BOYZ <span className="text-red-600">'N'</span> GALZ</span>
        </div>

        {/* The Page Content */}
        <div className="md:pt-0 pt-14 h-full">
           {children}
        </div>

      </main>

    </div>
  );
}