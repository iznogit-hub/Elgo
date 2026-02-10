"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { 
  Activity, Crosshair, Users, ShoppingCart, 
  Crown, ShieldAlert, LogOut, FileText, Zap, Menu
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSfx } from "@/hooks/use-sfx";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";

const NAV_ITEMS = [
  { label: "Status", href: "/dashboard", icon: Activity },
  { label: "Hit List", href: "/hit-list", icon: Crosshair },
  { label: "Squad", href: "/referrals", icon: Users },
  { label: "Loadout", href: "/dossier", icon: FileText },
  { label: "Market", href: "/store", icon: ShoppingCart },
  { label: "High Command", href: "/council", icon: Crown, vip: true },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { userData, loading, isAdmin, isVIP } = useAuth();
  const { play } = useSfx();
  
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    play("off");
    toast.loading("SEVERING NEURAL LINK...", { duration: 1200 });
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
    <div className="min-h-screen bg-black text-white overflow-hidden relative flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* HOLOGRAPHIC BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.15)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="hidden lg:block absolute left-24 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-900/20 to-transparent dashed-line" />
      </div>

      {/* TOP COMMAND DECK (Navigation) */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl h-20">
        <div className="w-full h-full max-w-[1920px] mx-auto px-4 lg:px-8 flex items-center justify-between">
          
          {/* LEFT: CORE LOGO */}
          <MagneticWrapper>
            <Link href="/dashboard" onClick={() => play("click")} className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full bg-red-900/20 border-2 border-red-600/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-red-500 group-hover:text-white transition-colors animate-pulse" />
                <div className="absolute inset-0 bg-red-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="hidden md:block font-black text-xl tracking-tighter text-white/80 group-hover:text-white transition-colors">
                BOYZ 'N' GALZ
              </span>
            </Link>
          </MagneticWrapper>

          {/* CENTER: TACTICAL NAV (Scrollable on Mobile) */}
          <nav className="flex-1 flex items-center justify-center overflow-x-auto no-scrollbar px-4 gap-2 md:gap-4 mask-gradient-x">
            {visibleNavItems.map((item) => (
              <MagneticWrapper key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => play("click")}
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 md:w-auto md:h-10 md:px-4 rounded-xl transition-all duration-300 group shrink-0",
                    pathname === item.href
                      ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                      : "bg-transparent text-neutral-400 hover:text-white hover:bg-white/5",
                    item.vip && !pathname.includes(item.href) && "text-yellow-600 hover:text-yellow-400"
                  )}
                >
                  <item.icon size={22} className={cn(
                    "md:mr-2", 
                    pathname === item.href && "animate-pulse"
                  )} />
                  <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">
                    {item.label}
                  </span>
                  
                  {/* Mobile Active Indicator Dot */}
                  {pathname === item.href && (
                    <div className="md:hidden absolute bottom-1 w-1 h-1 rounded-full bg-white" />
                  )}
                </Link>
              </MagneticWrapper>
            ))}
          </nav>

          {/* RIGHT: SYSTEM CONTROLS */}
          <div className="flex items-center gap-2 md:gap-4 pl-4 border-l border-white/10">
            
            {isAdmin && (
              <MagneticWrapper>
                <Link
                  href="/overseer"
                  onClick={() => play("click")}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300",
                    pathname === "/overseer"
                      ? "bg-purple-600 border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]"
                      : "bg-transparent border-purple-500/30 hover:bg-purple-950/50"
                  )}
                >
                  <ShieldAlert size={18} className="text-purple-400" />
                </Link>
              </MagneticWrapper>
            )}

            <MagneticWrapper>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-950/30 border border-red-900/50 hover:bg-red-900 hover:border-red-600 transition-all group"
              >
                <LogOut size={18} className="text-red-500 group-hover:text-white" />
              </button>
            </MagneticWrapper>
          </div>

        </div>
        
        {/* Bottom Laser Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent opacity-50" />
      </header>

      {/* MAIN CONTENT AREA */}
      {/* pt-24 pushes content down so the fixed header doesn't cover it */}
      <main className="flex-1 pt-24 min-h-screen relative overflow-x-hidden">
        <div className="h-full w-full max-w-[1920px] mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}