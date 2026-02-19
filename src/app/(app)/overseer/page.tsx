"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import { 
  collection, getDocs, doc, updateDoc, query, increment, 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Search, RefreshCw, Terminal, 
  ArrowLeft, Users, Crown, 
  Diamond, Flame, AlertTriangle,
  Zap, Sparkles, Ban, Gift, Database, ShieldAlert, Settings2, Activity,
  Trophy, Swords, Target
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
import { ScrollArea } from "@/components/ui/scroll-area";

// Sub-components (unchanged)
import CampaignManager from "@/components/campaign-manager";
import DatabaseSeeder from "@/components/seeder";

interface AdminUserView {
  uid: string;
  username: string;
  email: string;
  status: string;
  membership: { tier: string };
  wallet: { popCoins: number; bubblePoints?: number };
  unlockedNiches: string[];
  instagramHandle?: string;
  lastActive?: any;
}

export default function OverseerPage() {
  const { userData, loading: authLoading } = useAuth(); 
  const router = useRouter();
  const { play } = useSfx();
  
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalPC: 0, activeToday: 0 });

  // COMMANDER ACCESS CHECK (unchanged)
  const isOverseer = userData?.email === "iznoatwork@gmail.com"; 

  useEffect(() => {
    if (!authLoading) {
      if (!userData) router.push("/auth/login");
      else if (!isOverseer) {
        play("error");
        toast.error("ACCESS DENIED // INCIDENT LOGGED");
        router.push("/dashboard");
      }
    }
  }, [isOverseer, authLoading, router, userData, play]);

  const fetchOperatives = async () => {
    play("scan");
    setLoading(true);
    try {
      const q = query(collection(db, "users")); 
      const snap = await getDocs(q);
      const operatives: AdminUserView[] = [];
      let totalPC = 0;
      let activeToday = 0;
      const today = new Date().setHours(0,0,0,0);

      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const lastActive = data.lastActive?.toMillis() || 0;
        operatives.push({ 
          uid: docSnap.id,
          username: data.username || "UNVERIFIED_TRAINER",
          email: data.email || "CLASSIFIED",
          status: data.status || "active",
          membership: data.membership || { tier: "Rookie Trainer" },
          wallet: data.wallet || { popCoins: 0 },
          unlockedNiches: data.unlockedNiches || [],
          instagramHandle: data.instagramHandle,
          lastActive: data.lastActive
        });
        totalPC += data.wallet?.popCoins || 0;
        if (lastActive > today) activeToday++;
      });

      setUsers(operatives);
      setGlobalStats({
        totalUsers: operatives.length,
        totalPC,
        activeToday
      });
      play("success");
    } catch (error) {
      toast.error("SYNC FAILED // REBOOT TERMINAL");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOverseer) fetchOperatives();
  }, [isOverseer]);

  // GOVERNANCE ACTIONS (logic unchanged)
  const handlePromote = async (uid: string, username: string, newTier: string) => {
    if (!confirm(`AUTHORIZE EVOLUTION: ${username.toUpperCase()} → ${newTier.toUpperCase()}?`)) return;
    setProcessing(uid);
    try {
      const updates: any = { "membership.tier": newTier };
      if (newTier === "Principal") updates["wallet.popCoins"] = increment(10000);
      else if (newTier === "Executive") updates["wallet.popCoins"] = increment(5000);
      
      await updateDoc(doc(db, "users", uid), updates);
      toast.success(`EVOLUTION COMPLETE // ${username.toUpperCase()} NOW ${newTier.toUpperCase()}`);
      await fetchOperatives();
    } catch (e) {
      toast.error("EVOLUTION FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (uid: string, username: string) => {
    if (!confirm(`EXILE TRAINER ${username.toUpperCase()} FROM THE GRID?`)) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success(`TRAINER EXILED // ACCESS REVOKED`);
      await fetchOperatives();
    } catch (e) {
      toast.error("EXILE FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleGrantPC = async (uid: string, username: string, amount: number) => {
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { "wallet.popCoins": increment(amount) });
      toast.success(`LOOT AWARDED // +${amount} RUPEES TO ${username.toUpperCase()}`);
      await fetchOperatives();
    } catch (e) {
      toast.error("LOOT INJECTION FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.uid.includes(searchTerm) ||
    (u.instagramHandle && u.instagramHandle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (authLoading || (!isOverseer && !loading)) return null;

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-[#FFD4B2] selection:text-black">
      
      {/* ATMOSPHERE - Pokémon Command Tower */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/admin-bg.jpg" 
          alt="Overseer Command Tower"
          fill
          priority
          className="object-cover opacity-15 grayscale contrast-150 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay" />
      </div>

      <Background /> 
      <SoundPrompter />

      {/* TOP HUD - Pokémon League Command Tower */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            <TransitionLink href="/dashboard" className="group">
              <div className="w-12 h-12 border border-[#FFD4B2]/40 bg-black/60 flex items-center justify-center group-hover:bg-[#FFD4B2] group-hover:text-black transition-all">
                <ArrowLeft size={20} className="text-white group-hover:text-black" />
              </div>
            </TransitionLink>
            
            <div>
              <HackerText text="OVERSEER COMMAND TOWER" className="text-2xl font-medium tracking-widest uppercase text-[#FFD4B2]" />
              <div className="flex items-center gap-2 mt-1">
                <Crown size={14} className="text-[#FFD4B2]" />
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Poké-World Admin Clearance</span>
              </div>
            </div>
          </div>

          {/* Global Stats Bar */}
          <div className="flex flex-wrap items-center gap-6 border border-[#FFD4B2]/30 p-3 bg-black/60 rounded-full">
            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">TOTAL TRAINERS</span>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-[#FFD4B2]" />
                <span className="text-xl font-mono text-white">{globalStats.totalUsers}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />

            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">CIRCULATING LOOT</span>
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#FFD4B2]" />
                <span className="text-xl font-mono text-[#FFD4B2]">{globalStats.totalPC.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />

            <div className="px-4">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block mb-1">ACTIVE TODAY</span>
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-[#FFD4B2] animate-pulse" />
                <span className="text-xl font-mono text-white">{globalStats.activeToday}</span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN COMMAND TOWER */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-px bg-white/10 overflow-hidden">

        {/* LEFT: TRAINER REGISTRY */}
        <section className="flex-1 flex flex-col bg-[#050505]">
          
          {/* Controls */}
          <div className="p-6 md:p-10 border-b border-white/10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-3">
                <Terminal size={22} className="text-[#FFD4B2]" />
                <h2 className="text-lg font-medium tracking-tight">NATIONAL TRAINER REGISTRY</h2>
              </div>
              <Button 
                onClick={fetchOperatives} 
                className="bg-transparent border-2 border-[#FFD4B2] hover:bg-[#FFD4B2] hover:text-black text-xs font-mono uppercase tracking-widest rounded-none h-11"
              >
                <RefreshCw size={14} className={cn("mr-2", loading && "animate-spin")} /> REFRESH REGISTRY
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFD4B2]" size={18} />
              <Input 
                placeholder="SEARCH TRAINER • UID • INSTA HANDLE..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-sm bg-black/50 border border-[#FFD4B2]/30 focus:border-[#FFD4B2] font-mono uppercase tracking-widest rounded-none placeholder:text-neutral-600"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border-b border-white/10 pb-20">
              
              {filteredUsers.map((op) => (
                <div key={op.uid} className={cn(
                  "relative bg-[#050505] overflow-hidden transition-all hover:bg-white/5 p-8",
                  op.status === "banned" && "opacity-40 grayscale"
                )}>
                  
                  {op.membership.tier === "Principal" && (
                    <div className="absolute -top-1 -right-1 text-[10px] font-mono bg-[#FFD4B2] text-black px-3 py-0.5 tracking-widest">LEGENDARY GYM LEADER</div>
                  )}

                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">TRAINER #{op.uid.slice(0,8)}</div>
                      <h3 className="text-2xl font-bold tracking-tight uppercase mt-1">{op.username}</h3>
                      <p className="text-sm font-mono text-neutral-400">LVL • {op.membership.tier}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-neutral-400">LOOT HELD</div>
                      <div className="text-3xl font-black text-[#FFD4B2] tracking-tighter">₹{op.wallet.popCoins.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* EVOLUTION CONTROLS */}
                  <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
                    {op.status !== "banned" && op.membership.tier !== "Principal" && (
                      <>
                        <Button 
                          onClick={() => handlePromote(op.uid, op.username, "Specialist")} 
                          className="bg-[#050505] hover:bg-white text-neutral-400 hover:text-black font-mono text-xs uppercase tracking-widest rounded-none h-12"
                        >
                          Evolve → Specialist
                        </Button>
                        <Button 
                          onClick={() => handlePromote(op.uid, op.username, "Executive")} 
                          className="bg-[#050505] hover:bg-white text-neutral-400 hover:text-black font-mono text-xs uppercase tracking-widest rounded-none h-12"
                        >
                          Evolve → Executive
                        </Button>
                        <Button 
                          onClick={() => handlePromote(op.uid, op.username, "Principal")} 
                          className="col-span-2 bg-[#050505] hover:bg-white text-white hover:text-black font-mono text-xs uppercase tracking-widest rounded-none h-12 border-t border-white/10"
                        >
                          <Crown size={15} className="mr-2" /> EVOLVE TO LEGENDARY
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      onClick={() => handleGrantPC(op.uid, op.username, 10000)} 
                      className="bg-[#050505] hover:bg-white text-white hover:text-black font-mono text-xs uppercase tracking-widest rounded-none h-12 border-t border-white/10"
                    >
                      <Gift size={15} className="mr-2" /> AWARD 10K LOOT
                    </Button>
                    
                    {op.status !== "banned" ? (
                      <Button 
                        onClick={() => handleBan(op.uid, op.username)} 
                        className="bg-[#050505] hover:bg-red-600 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-widest rounded-none h-12 border-t border-white/10"
                      >
                        <Ban size={15} className="mr-2" /> EXILE TRAINER
                      </Button>
                    ) : (
                      <div className="col-span-2 text-center text-xs font-mono tracking-widest text-red-400/80 uppercase py-5 border-t border-white/10 bg-[#050505]">
                        TRAINER EXILED FROM THE GRID
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* RIGHT: OVERSEER PROTOCOLS */}
        <aside className="w-full lg:w-[460px] flex flex-col bg-[#050505] overflow-y-auto no-scrollbar shrink-0 border-t lg:border-t-0 border-white/10">
          <div className="p-8 md:p-10 space-y-12">
            
            <div className="flex items-center gap-4 pb-6 border-b border-white/10">
               <Settings2 size={26} className="text-[#FFD4B2]" />
               <HackerText text="GLOBAL OVERRIDE PROTOCOLS" className="text-2xl font-medium uppercase tracking-widest text-white" />
            </div>
            
            <div className="space-y-14">
              
              {/* Quest & Campaign Control */}
              <div>
                <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-widest mb-6 flex items-center gap-3">
                  <Target size={16} /> WORLD QUEST DEPLOYMENT
                </h4>
                <div className="bg-[#050505] border-2 border-[#FFD4B2]/30 p-6 hover:border-[#FFD4B2] transition-all">
                  <CampaignManager />
                </div>
              </div>

              {/* Habitat & Spawn Control */}
              <div>
                <h4 className="text-xs font-mono uppercase text-neutral-400 tracking-widest mb-6 flex items-center gap-3">
                  <Sparkles size={16} /> HABITAT & SPAWN ENGINE
                </h4>
                <div className="bg-[#050505] border-2 border-[#FFD4B2]/30 p-6 hover:border-[#FFD4B2] transition-all">
                  <DatabaseSeeder />
                </div>
              </div>

            </div>

          </div>
        </aside>

      </div>
    </main>
  );
}