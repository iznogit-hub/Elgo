"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, doc, updateDoc, query, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  ShieldAlert, Search, RefreshCw, Terminal, 
  Lock, ArrowLeft, Users, UserMinus, Crown, 
  Banknote, AlertTriangle, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

// 🔌 COMPONENTS
import DatabaseSeeder from "@/components/seeder";
import CampaignManager from "@/components/campaign-manager";

// 📝 TYPE DEFINITION
interface AdminUserView {
  uid: string;
  username: string;
  email: string;
  status: string;
  membership: { tier: string };
  wallet: { popCoins: number; bubblePoints: number };
  unlockedNiches: string[];
  instagramHandle?: string;
}

export default function AdminDashboard() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = userData?.email === "iznoatwork@gmail.com"; 

  useEffect(() => {
    if (!authLoading) {
        if (!userData) {
            router.push("/auth/login");
        } else if (!isAdmin) {
            play("error");
            router.push("/dashboard");
        }
    }
  }, [isAdmin, authLoading, router, userData, play]);

  const fetchOperatives = async () => {
    play("click");
    setLoading(true);
    try {
      const q = query(collection(db, "users")); 
      const querySnapshot = await getDocs(q);
      const operatives: AdminUserView[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        operatives.push({ 
            uid: docSnap.id,
            username: data.username || "UNKNOWN",
            email: data.email || "NO_EMAIL",
            status: data.status || "active",
            membership: data.membership || { tier: "recruit" },
            wallet: data.wallet || { popCoins: 0, bubblePoints: 0 },
            unlockedNiches: data.unlockedNiches || [],
            instagramHandle: data.instagramHandle
        } as AdminUserView);
      });
      setUsers(operatives);
      play("success");
    } catch (error) {
      toast.error("DB_ERROR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchOperatives();
  }, [isAdmin]);

  // ACTIONS
  const handlePromoteToCouncil = async (uid: string, username: string) => {
    if (!confirm(`CONFIRM: Receive ₹49,999 from ${username}?`)) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), {
        "membership.tier": "council",
        "wallet.bubblePoints": increment(5000), 
        status: "active"
      });
      toast.success(`${username} PROMOTED.`);
      await fetchOperatives(); 
    } catch (e) {
      toast.error("FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (uid: string) => {
    if (!confirm("PURGE user?")) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success("PURGED.");
      await fetchOperatives();
    } catch (e) {
      toast.error("FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.instagramHandle && u.instagramHandle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading || (!isAdmin && !loading)) return null;

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-red-500/30 font-sans overflow-hidden flex flex-col">
      <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-between pointer-events-auto">
          <TransitionLink href="/dashboard" className="w-10 h-10 border border-red-500/20 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-xs">
            <ArrowLeft size={18} className="text-red-500" />
          </TransitionLink>
          <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
            <span className="text-[9px] font-mono font-black tracking-widest uppercase text-red-500">God_Mode: Active</span>
          </div>
        </div>
      </nav>

      <section className="relative z-50 flex-1 w-full max-w-md mx-auto flex flex-col pt-28 px-6 pb-28 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
           <h1 className="text-3xl font-black font-orbitron tracking-tighter italic uppercase leading-none">
              <HackerText text="Operations_Command" speed={40} />
           </h1>
           <div className="flex items-center gap-2 text-red-500/50">
              <Terminal size={12} />
              <span className="text-[8px] font-mono font-bold tracking-[0.4em] uppercase italic">System_Override_V3.1</span>
           </div>
        </div>

        {/* 1. USERS DB */}
        <div className="flex gap-3">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-red-500 transition-colors" />
              <Input 
                placeholder="Search_Operative..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/40 border-white/10 text-white h-12 pl-12 font-mono text-[10px] focus:border-red-500 transition-all uppercase placeholder:text-white/20"
              />
           </div>
           <Button onClick={fetchOperatives} variant="outline" className="w-12 h-12 border-white/10 bg-black/40 p-0 hover:border-red-500 hover:text-red-500">
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
           </Button>
        </div>

        <section className="space-y-4">
           <div className="flex items-center gap-2 px-2">
              <Users size={14} className="text-red-500" />
              <h3 className="text-[10px] font-black font-orbitron tracking-widest uppercase italic">Operative_Database</h3>
              <span className="text-[8px] font-mono text-white/30 ml-auto">{filteredUsers.length} UNITS</span>
           </div>

           <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.uid} className={cn(
                  "p-4 border backdrop-blur-xl rounded-sm transition-all group relative overflow-hidden",
                  user.status === 'banned' ? "bg-red-500/5 border-red-500/20 grayscale" : "bg-white/5 border-white/10"
                )}>
                    {user.membership.tier === 'council' && (
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={40} className="text-yellow-500" /></div>
                    )}
                    <div className="relative z-10 flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 flex items-center justify-center border", user.membership.tier === 'council' ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" : "border-white/20 text-white/40")}>
                             {user.membership.tier === 'council' ? <Crown size={14} /> : <Terminal size={14} />}
                          </div>
                          <div>
                             <p className="text-xs font-black font-orbitron leading-none uppercase flex items-center gap-2">
                                {user.username}
                                {user.status === 'banned' && <span className="text-[8px] bg-red-900 text-red-500 px-1 font-mono">PURGED</span>}
                             </p>
                             <div className="flex flex-col mt-1">
                                <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">{user.wallet.popCoins} PC // {user.wallet.bubblePoints} BP</span>
                                {user.instagramHandle && <span className="text-[7px] font-mono text-green-500 uppercase tracking-widest mt-0.5">{user.instagramHandle}</span>}
                             </div>
                          </div>
                       </div>
                       <div className="flex items-center gap-2">
                          {user.membership.tier !== "council" && user.status !== "banned" && (
                            <button onClick={() => handlePromoteToCouncil(user.uid, user.username)} disabled={processing === user.uid} className="w-8 h-8 flex items-center justify-center bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-black transition-all">
                               {processing === user.uid ? <span className="animate-spin text-[8px]">...</span> : <Banknote size={14} />}
                            </button>
                          )}
                          {user.status !== "banned" ? (
                            <button onClick={() => handleBan(user.uid)} disabled={processing === user.uid} className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 text-gray-500 hover:bg-red-600 hover:text-black transition-all">
                               <UserMinus size={14} />
                            </button>
                          ) : <div className="w-8 h-8 flex items-center justify-center text-red-900 opacity-40 border border-red-900/30"><Lock size={14} /></div>}
                       </div>
                    </div>
                </div>
              ))}
           </div>
        </section>

        {/* 🚨 DANGER ZONE: CAMPAIGN MANAGER */}
        <section className="pt-8 border-t border-white/10">
           <CampaignManager />
        </section>

        {/* 🚨 DANGER ZONE: SEEDER */}
        <section className="pt-8 border-t border-white/10">
           <div className="flex items-center gap-2 mb-4">
              <ShieldAlert size={14} className="text-red-500" />
              <h3 className="text-[10px] font-black font-orbitron tracking-widest uppercase text-red-500">System_Initialization</h3>
           </div>
           <DatabaseSeeder />
        </section>

      </section>

      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-red-500">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold">GOD_MODE_SYNCED</span>
         </div>
      </footer>
    </main>
  );
}