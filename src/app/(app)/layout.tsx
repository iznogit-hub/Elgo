"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Activity, Crosshair, Users, ShoppingCart, 
  Crown, ShieldAlert, LogOut, FileText, Database
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

// Lingo Updated to match PortalZ Financial Architecture
const NAV_ITEMS = [
  { label: "Terminal", href: "/dashboard", icon: Activity },
  { label: "Market_Scan", href: "/hit-list", icon: Crosshair },
  { label: "Acquisition", href: "/referrals", icon: Users },
  { label: "Operator_ID", href: "/dossier", icon: FileText },
  { label: "Exchange", href: "/store", icon: ShoppingCart },
  { label: "Boardroom", href: "/council", icon: Crown, vip: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, loading, isAdmin, isVIP } = useAuth();
  const { play } = useSfx();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    play("off");
    toast.loading("TERMINATING UPLINK...", { duration: 1200 });
    await signOut(auth);
    router.push("/");
  };

  useEffect(() => {
    if (!loading && !userData) {
      router.push("/auth/login");
    }
  }, [userData, loading, router]);

  if (loading) return null;

  // Filter visible items
  const visibleNavItems = NAV_ITEMS.filter(item => !item.vip || isVIP);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden relative flex flex-col selection:bg-white selection:text-black">
      
      {/* ATMOSPHERE - 1px Grid Architecture Noise */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        {/* Subtle structural grid lines in the deep background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] mask-gradient-b" />
      </div>

      {/* TOP COMMAND DECK (Navigation) */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#050505]/95 backdrop-blur-md border-b border-white/10 h-20">
        <div className="w-full h-full mx-auto flex items-center justify-between">
          
          {/* LEFT: CORE LOGO - Architectural Block */}
          <Link href="/dashboard" onClick={() => play("click")} className="h-full px-6 md:px-8 border-r border-white/10 flex items-center gap-4 group hover:bg-white/5 transition-colors">
             <div className="w-8 h-8 flex items-center justify-center bg-white text-black shrink-0">
               <Database size={16} />
             </div>
             <div className="hidden md:flex flex-col">
               <span className="font-medium text-sm tracking-widest text-white uppercase group-hover:text-neutral-300 transition-colors">
                 PortalZ
               </span>
               <span className="text-[8px] font-mono text-neutral-500 tracking-[0.2em] uppercase">
                 Ops_Terminal
               </span>
             </div>
          </Link>

          {/* CENTER: TACTICAL NAV (Horizontal Scroll on Mobile) */}
          <nav className="flex-1 flex items-center h-full overflow-x-auto no-scrollbar mask-gradient-x">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => play("click")}
                className={cn(
                  "relative flex items-center justify-center h-full px-4 md:px-6 transition-colors group shrink-0 border-r border-white/10",
                  pathname === item.href
                    ? "bg-white text-black"
                    : "bg-transparent text-neutral-500 hover:text-white hover:bg-white/5",
                  item.vip && !pathname.includes(item.href) && "text-white hover:text-white"
                )}
              >
                <item.icon size={16} className={cn(
                  "md:mr-3", 
                  pathname === item.href && "animate-pulse"
                )} />
                <span className={cn(
                    "hidden md:inline text-[10px] font-mono uppercase tracking-[0.2em]",
                    item.vip && !pathname.includes(item.href) && "font-bold"
                )}>
                  {item.label}
                </span>
                
                {/* Mobile Active Indicator Bar */}
                {pathname === item.href && (
                  <div className="md:hidden absolute bottom-0 left-0 w-full h-1 bg-black" />
                )}
              </Link>
            ))}
          </nav>

          {/* RIGHT: SYSTEM CONTROLS */}
          <div className="h-full flex items-center">
            
            {isAdmin && (
              <Link
                href="/overseer"
                onClick={() => play("click")}
                className={cn(
                  "flex items-center justify-center h-full w-16 md:w-20 transition-colors border-l border-white/10",
                  pathname === "/overseer"
                    ? "bg-white text-black"
                    : "bg-transparent hover:bg-white/5 text-white/50 hover:text-white"
                )}
              >
                <ShieldAlert size={18} />
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center justify-center h-full w-16 md:w-20 bg-[#050505] border-l border-white/10 text-neutral-500 hover:bg-white hover:text-black transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      {/* pt-20 pushes content down so the fixed header doesn't cover it */}
      <main className="flex-1 pt-20 min-h-screen relative overflow-x-hidden">
        <div className="h-full w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}