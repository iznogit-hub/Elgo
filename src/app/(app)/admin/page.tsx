"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  ShieldAlert, Search, CheckCircle2, XCircle, 
  Crown, DollarSign, Instagram, RefreshCw, Terminal, 
  Lock, AlertTriangle, Loader2, ArrowLeft, Activity,
  Users, UserMinus, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

// TYPE DEFINITION (Preserved)
interface AdminUserView {
  uid: string;
  username: string;
  email: string;
  instagramHandle?: string;
  tier: string;
  status: string;
  niche: string;
  metaWhitelisted?: boolean; 
  bubblePoints: number;
}

export default function AdminDashboard() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ⚡ ADMIN GATEKEEPER (Preserved Logic)
  const isAdmin = userData?.email === "iznoatwork@gmail.com"; 

  // 1. SECURITY PROTOCOL (Preserved)
  useEffect(() => {
    if (!authLoading) {
        if (!userData) {
            router.push("/auth/login");
        } else if (!isAdmin) {
            toast.error("UNAUTHORIZED_ACCESS_DETECTED. INCIDENT_LOGGED.");
            router.push("/dashboard");
        }
    }
  }, [isAdmin, authLoading, router, userData]);

  // 2. FETCH INTEL (Preserved)
  const fetchOperatives = async () => {
    play("click");
    setLoading(true);
    try {
      const q = query(collection(db, "users")); 
      const querySnapshot = await getDocs(q);
      const operatives: AdminUserView[] = [];
      querySnapshot.forEach((docSnap) => {
        operatives.push({ ...docSnap.data(), uid: docSnap.id } as AdminUserView);
      });
      setUsers(operatives);
      play("success");
    } catch (error) {
      play("error");
      toast.error("DATABASE_CONNECTION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchOperatives();
  }, [isAdmin]);

  // --- ACTIONS (All details preserved) ---

  const handleApprovePayment = async (uid: string, username: string) => {
    if (!confirm(`CONFIRM: Receive ₹49,999 from ${username}?`)) return;
    play("success");
    setProcessing(uid);
    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, {
        tier: "inner_circle",
        bubblePoints: 5000, 
        status: "active"
      });
      toast.success(`${username} PROMOTED TO INNER_CIRCLE.`);
      await fetchOperatives(); 
    } catch (e) {
      play("error");
      toast.error("PROMOTION_FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleConfirmWhitelist = async (uid: string, username: string) => {
    play("click");
    setProcessing(uid);
    try {
      const ref = doc(db, "users", uid);
      await updateDoc(ref, {
        metaWhitelisted: true,
        status: "active"
      });
      toast.success(`${username} SIGNALED FOR META CONNECTION.`);
      await fetchOperatives();
    } catch (e) {
      play("error");
      toast.error("WHITELIST_UPDATE_FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (uid: string) => {
    if (!confirm("WARNING: Execute PURGE protocol on this user?")) return;
    play("error"); 
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success("OPERATIVE_PURGED.");
      await fetchOperatives();
    } catch (e) {
      toast.error("PURGE_FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (!isAdmin && !loading)) return null;

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-red-500/30 font-sans overflow-hidden flex flex-col">
      
      {/* 📽️ THE THEATER: Admin Console Background */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-between pointer-events-auto">
          <TransitionLink 
            href="/dashboard"
            className="w-10 h-10 border border-red-500/20 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-xs"
          >
            <ArrowLeft size={18} className="text-red-500" />
          </TransitionLink>
          
          <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-mono font-black tracking-widest uppercase text-red-500">God_Mode: Active</span>
          </div>
        </div>
      </nav>

      {/* 🛠️ ADMIN INTERFACE */}
      <section className="relative z-50 flex-1 w-full max-w-md mx-auto flex flex-col pt-28 px-6 pb-28 space-y-8 overflow-y-auto no-scrollbar">
        
        {/* Header Telemetry */}
        <div className="space-y-2">
           <h1 className="text-3xl font-black font-orbitron tracking-tighter italic uppercase leading-none">
              <HackerText text="Operations_Command" speed={40} />
           </h1>
           <div className="flex items-center gap-2 text-red-500/50">
              <Terminal size={12} />
              <span className="text-[8px] font-mono font-bold tracking-[0.4em] uppercase italic">System_Override_V3.1</span>
           </div>
        </div>

        {/* Global Controls */}
        <div className="flex gap-3">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
              <Input 
                placeholder="Search_Operative..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border-white/10 text-white h-12 pl-12 font-mono text-[10px] focus:border-red-500 transition-all"
              />
           </div>
           <Button 
             onClick={fetchOperatives}
             variant="outline"
             className="w-12 h-12 border-white/10 bg-black/40 p-0"
           >
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
           </Button>
        </div>

        {/* 1. PENDING META WHITELIST (Priority preserved) */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <Instagram size={14} className="text-yellow-500" />
                 <h3 className="text-[10px] font-black font-orbitron tracking-widest uppercase italic text-yellow-500">Pending_Whitelist</h3>
              </div>
              <span className="text-[7px] font-mono bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 animate-pulse">Action_Required</span>
           </div>

           <div className="space-y-3">
              {filteredUsers.filter(u => u.tier === "inner_circle" && !u.metaWhitelisted).map(user => (
                <div key={user.uid} className="bg-yellow-500/5 border border-yellow-500/20 p-4 rounded-xl space-y-4 backdrop-blur-md">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="text-sm font-black font-orbitron leading-none">{user.username}</p>
                         <p className="text-[8px] font-mono text-white/30 truncate mt-1">{user.email}</p>
                      </div>
                      <Crown size={14} className="text-red-500" />
                   </div>
                   <Button 
                     onClick={() => handleConfirmWhitelist(user.uid, user.username)}
                     disabled={processing === user.uid}
                     className="w-full h-10 bg-yellow-600 text-black font-black italic text-[9px] tracking-widest"
                   >
                      {processing === user.uid ? <Loader2 className="animate-spin" size={14} /> : "CONFIRM_META_HANDSHAKE"}
                   </Button>
                </div>
              ))}
              {filteredUsers.filter(u => u.tier === "inner_circle" && !u.metaWhitelisted).length === 0 && (
                <p className="text-center text-[9px] font-mono text-white/20 italic uppercase py-4">No operatives in whitelist queue.</p>
              )}
           </div>
        </section>

        {/* 2. FIELD OPERATIVES DATABASE (Preserved) */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <Users size={14} className="text-cyan-500" />
              <h3 className="text-[10px] font-black font-orbitron tracking-widest uppercase italic">Operative_Database</h3>
           </div>

           <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.uid} className={cn(
                  "p-4 border backdrop-blur-xl rounded-xl transition-all group",
                  user.status === 'banned' ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10 hover:border-cyan-500/30"
                )}>
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border",
                            user.tier === 'inner_circle' ? "border-red-500 text-red-500" : "border-cyan-500 text-cyan-500",
                            user.status === 'banned' && "grayscale opacity-20"
                         )}>
                            {user.tier === 'inner_circle' ? <Crown size={14} /> : <Terminal size={14} />}
                         </div>
                         <div>
                            <p className="text-xs font-black font-orbitron leading-none uppercase">{user.username}</p>
                            <p className="text-[7px] font-mono text-white/20 uppercase mt-1">
                               {user.niche} // {user.tier} // {user.bubblePoints}BP
                            </p>
                         </div>
                      </div>

                      <div className="flex items-center gap-2">
                         {/* Approve Payment (Only for non-Inner Circle) */}
                         {user.tier !== "inner_circle" && user.status !== "banned" && (
                           <button 
                             onClick={() => handleApprovePayment(user.uid, user.username)}
                             className="p-2 bg-green-500/10 text-green-500 rounded-xs hover:bg-green-500 hover:text-black transition-all"
                           >
                              <DollarSign size={14} />
                           </button>
                         )}
                         {/* Purge Protocol */}
                         {user.status !== "banned" ? (
                           <button 
                             onClick={() => handleBan(user.uid)}
                             className="p-2 bg-white/5 text-white/20 rounded-xs hover:bg-red-600 hover:text-black transition-all"
                           >
                              <UserMinus size={14} />
                           </button>
                         ) : (
                           <div className="p-2 text-red-900 opacity-40"><Lock size={14} /></div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

      </section>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-red-500">
            <ShieldCheck size={14} />
            <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-red-500 w-full animate-pulse" />
            </div>
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">GOD_MODE_SYNCED</span>
         </div>
         <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">SECURE_ADMIN_UPLINK</div>
      </footer>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}