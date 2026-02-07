"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { collection, getDocs, doc, updateDoc, query, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  ShieldAlert, Search, RefreshCw, Terminal, 
  Lock, ArrowLeft, Users, UserMinus, Crown, 
  Banknote, ShieldCheck, Database, Skull
} from "lucide-react";
import { toast } from "sonner";
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

// 🔌 SUB-COMPONENTS (Code provided below)
import DatabaseSeeder from "@/components/seeder";
import CampaignManager from "@/components/campaign-manager";

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

export default function OverseerPage() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔒 HARDCODED GOD MODE EMAIL
  const isOverseer = userData?.email === "iznoatwork@gmail.com"; 

  useEffect(() => {
    if (!authLoading) {
        if (!userData) {
            router.push("/auth/login");
        } else if (!isOverseer) {
            play("error");
            toast.error("UNAUTHORIZED ACCESS DETECTED");
            router.push("/dashboard");
        }
    }
  }, [isOverseer, authLoading, router, userData, play]);

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
      toast.error("DATABASE CONNECTION FAILED");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOverseer) fetchOperatives();
  }, [isOverseer]);

  // LOGIC: PROMOTE TO COUNCIL
  const handlePromoteToCouncil = async (uid: string, username: string) => {
    if (!confirm(`AUTHORIZE PROMOTION: ${username} to HIGH COMMAND?`)) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), {
        "membership.tier": "council",
        "wallet.bubblePoints": increment(5000), 
        status: "active"
      });
      toast.success(`${username} PROMOTED TO COMMAND.`);
      await fetchOperatives(); 
    } catch (e) {
      toast.error("PROMOTION FAILED");
    } finally {
      setProcessing(null);
    }
  };

  // LOGIC: BAN USER (PURGE)
  const handleBan = async (uid: string) => {
    if (!confirm("INITIATE PURGE PROTOCOL? This cannot be undone.")) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success("OPERATIVE PURGED.");
      await fetchOperatives();
    } catch (e) {
      toast.error("PURGE FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.instagramHandle && u.instagramHandle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading || (!isOverseer && !loading)) return null;

  return (
    <main className="relative min-h-screen bg-black text-white selection:bg-red-500 selection:text-black font-sans overflow-hidden flex flex-col">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/admin-bg.jpg" 
          alt="Overseer Grid"
          fill
          priority
          className="object-cover opacity-20 grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-black to-black z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_50%,transparent_50%)] z-10 bg-[length:100%_4px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <Background /> 
      <SoundPrompter />

      {/* --- TOP HUD --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center justify-between pointer-events-auto">
          <TransitionLink href="/dashboard" className="w-10 h-10 border border-red-500/20 bg-black/60 backdrop-blur-md flex items-center justify-center rounded-sm hover:border-red-500 hover:text-red-500 transition-all">
            <ArrowLeft size={18} />
          </TransitionLink>
          <div className="px-4 py-1.5 bg-red-950/50 border border-red-600/30 backdrop-blur-md rounded-sm flex items-center gap-2">
            <ShieldAlert size={12} className="text-red-500 animate-pulse" />
            <span className="text-[8px] font-mono font-black tracking-widest uppercase text-red-500">Overseer_Mode: Active</span>
          </div>
        </div>
      </nav>

      {/* --- MAIN TERMINAL --- */}
      <section className="relative z-50 flex-1 w-full max-w-md mx-auto flex flex-col pt-28 px-6 pb-28 space-y-8 overflow-y-auto no-scrollbar">
        
        {/* TITLE */}
        <div className="space-y-2 text-center md:text-left">
           <h1 className="text-3xl font-black font-sans tracking-tighter italic uppercase leading-none text-white">
              <HackerText text="Global_Control" speed={40} />
           </h1>
           <div className="flex items-center justify-center md:justify-start gap-2 text-red-600/60">
              <Terminal size={12} />
              <span className="text-[8px] font-mono font-bold tracking-[0.4em] uppercase italic">System_Override_V3.1</span>
           </div>
        </div>

        {/* 1. OPERATIVE SEARCH */}
        <div className="flex gap-2 bg-neutral-900/50 border border-white/10 p-1 backdrop-blur-md rounded-sm">
           <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 group-focus-within:text-red-500 transition-colors" />
              <Input 
                placeholder="SEARCH_DB..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-white h-10 pl-8 font-mono text-[10px] focus:ring-0 uppercase placeholder:text-white/20 rounded-none"
              />
           </div>
           <Button onClick={fetchOperatives} variant="ghost" className="w-10 h-10 p-0 hover:bg-white/10 hover:text-red-500 rounded-sm">
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
           </Button>
        </div>

        {/* 2. OPERATIVE LIST */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-1 text-red-500/80">
              <div className="flex items-center gap-2">
                 <Users size={12} />
                 <h3 className="text-[9px] font-black uppercase tracking-widest">Active_Units</h3>
              </div>
              <span className="text-[8px] font-mono">{filteredUsers.length} ONLINE</span>
           </div>

           <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.uid} className={cn(
                  "p-3 border backdrop-blur-md rounded-sm transition-all group relative overflow-hidden",
                  user.status === 'banned' ? "bg-red-950/20 border-red-900/40 grayscale" : "bg-neutral-900/40 border-white/5 hover:border-red-500/30"
                )}>
                    {/* Council Badge */}
                    {user.membership.tier === 'council' && (
                        <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={40} className="text-yellow-500" /></div>
                    )}
                    
                    <div className="relative z-10 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          {/* Avatar/Icon */}
                          <div className={cn("w-8 h-8 flex items-center justify-center border rounded-sm", user.membership.tier === 'council' ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" : "border-white/10 text-white/30")}>
                             {user.membership.tier === 'council' ? <Crown size={14} /> : user.status === 'banned' ? <Skull size={14} /> : <Terminal size={14} />}
                          </div>
                          
                          {/* Info */}
                          <div>
                             <p className="text-xs font-black font-sans leading-none uppercase flex items-center gap-2 text-white">
                                {user.username}
                                {user.status === 'banned' && <span className="text-[6px] bg-red-900 text-red-500 px-1 py-0.5 font-mono rounded-[1px]">PURGED</span>}
                             </p>
                             <div className="flex flex-col mt-1">
                                <span className="text-[7px] font-mono text-white/40 uppercase tracking-widest">{user.wallet.popCoins} PTS // {user.membership.tier}</span>
                                {user.instagramHandle && <span className="text-[7px] font-mono text-green-500 uppercase tracking-widest mt-0.5">{user.instagramHandle}</span>}
                             </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {user.membership.tier !== "council" && user.status !== "banned" && (
                            <button onClick={() => handlePromoteToCouncil(user.uid, user.username)} disabled={processing === user.uid} className="w-7 h-7 flex items-center justify-center bg-green-900/20 border border-green-900/50 text-green-600 hover:bg-green-600 hover:text-black transition-all rounded-sm" title="Promote">
                               {processing === user.uid ? <span className="animate-spin text-[8px]">...</span> : <Banknote size={12} />}
                            </button>
                          )}
                          {user.status !== "banned" ? (
                            <button onClick={() => handleBan(user.uid)} disabled={processing === user.uid} className="w-7 h-7 flex items-center justify-center bg-red-900/20 border border-red-900/50 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-sm" title="Purge">
                               <UserMinus size={12} />
                            </button>
                          ) : <div className="w-7 h-7 flex items-center justify-center text-red-900 opacity-40 border border-red-900/30 rounded-sm"><Lock size={12} /></div>}
                        </div>
                    </div>
                </div>
              ))}
           </div>
        </section>

        {/* 🚨 GOD TOOLS */}
        <div className="space-y-6 pt-8 border-t border-white/10">
            <div>
                <div className="flex items-center gap-2 mb-2 text-white/50">
                    <Database size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Global_Campaigns</span>
                </div>
                <div className="bg-neutral-900/20 border border-white/5 p-4 rounded-sm">
                    <CampaignManager />
                </div>
            </div>

            <div className="pb-12">
                <div className="flex items-center gap-2 mb-2 text-red-500">
                    <ShieldAlert size={12} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">System_Initialization (Danger)</span>
                </div>
                <div className="bg-red-950/10 border border-red-900/30 p-4 rounded-sm">
                    <DatabaseSeeder />
                </div>
            </div>
        </div>

      </section>

      {/* --- FOOTER --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/95 backdrop-blur-2xl">
         <div className="flex items-center gap-3 opacity-60 text-red-600">
            <ShieldCheck size={12} />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">GOD_MODE_ACTIVE</span>
         </div>
      </footer>
    </main>
  );
}