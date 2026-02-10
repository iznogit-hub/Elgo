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
  Zap, Sparkles, Ban, Gift, Database
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

// Sub-components
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

  // GOD MODE CHECK
  const isOverseer = userData?.email === "iznoatwork@gmail.com"; 

  useEffect(() => {
    if (!authLoading) {
      if (!userData) router.push("/auth/login");
      else if (!isOverseer) {
        play("error");
        toast.error("INTRUSION DETECTED // PURGE INITIATED");
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
          username: data.username || "SHADOW_UNIT",
          email: data.email || "CLASSIFIED",
          status: data.status || "active",
          membership: data.membership || { tier: "recruit" },
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
      toast.error("GRID FAILURE // RECONNECTING");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOverseer) fetchOperatives();
  }, [isOverseer]);

  // GOD ACTIONS
  const handlePromote = async (uid: string, username: string, newTier: string) => {
    if (!confirm(`EXECUTE PROMOTION: ${username.toUpperCase()} → ${newTier.toUpperCase()}?`)) return;
    setProcessing(uid);
    try {
      const updates: any = { "membership.tier": newTier };
      if (newTier === "council") updates["wallet.popCoins"] = increment(10000);
      else if (newTier === "inner_circle") updates["wallet.popCoins"] = increment(5000);
      await updateDoc(doc(db, "users", uid), updates);
      toast.success(`${username.toUpperCase()} ASCENDED TO ${newTier.toUpperCase()}`);
      await fetchOperatives();
    } catch (e) {
      toast.error("ASCENSION FAILED");
    } finally {
      setProcessing(null);
    }
  };

  const handleBan = async (uid: string, username: string) => {
    if (!confirm(`INITIATE TERMINATION PROTOCOL ON ${username.toUpperCase()}?`)) return;
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { status: "banned" });
      toast.success(`${username.toUpperCase()} ELIMINATED FROM GRID`);
      await fetchOperatives();
    } catch (e) {
      toast.error("TERMINATION ERROR");
    } finally {
      setProcessing(null);
    }
  };

  const handleGrantPC = async (uid: string, username: string, amount: number) => {
    setProcessing(uid);
    try {
      await updateDoc(doc(db, "users", uid), { "wallet.popCoins": increment(amount) });
      toast.success(`+${amount} PC INJECTED INTO ${username.toUpperCase()}`);
      await fetchOperatives();
    } catch (e) {
      toast.error("INJECTION FAILED");
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
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/admin-bg.jpg" 
          alt="Overseer Grid"
          fill
          priority
          className="object-cover opacity-15 grayscale contrast-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/40 via-black to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay animate-pulse" />
      </div>

      <Background /> 
      <SoundPrompter />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-8 border-red-900/80 bg-black/95 backdrop-blur-2xl">
        <div className="px-8 py-8 flex items-center justify-between">
          <TransitionLink href="/dashboard" className="group">
            <div className="w-16 h-16 border-4 border-red-600/60 bg-black/70 backdrop-blur-md flex items-center justify-center group-hover:border-red-400 transition-all">
              <ArrowLeft size={40} className="text-red-500 group-hover:text-red-300" />
            </div>
          </TransitionLink>

          <div className="text-center">
            <HackerText text="OVERSEER_PROTOCOL" className="text-6xl font-black text-red-500" />
            <div className="flex items-center justify-center gap-12 mt-4 text-2xl font-mono">
              <div className="flex items-center gap-4">
                <Users size={40} className="text-red-400" />
                <span>{globalStats.totalUsers} UNITS</span>
              </div>
              <div className="flex items-center gap-4">
                <Diamond size={40} className="text-yellow-500" />
                <span>{globalStats.totalPC.toLocaleString()} PC</span>
              </div>
              <div className="flex items-center gap-4">
                <Flame size={40} className="text-orange-500 animate-pulse" />
                <span>{globalStats.activeToday} ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="w-16 h-16" /> {/* Spacer */}
        </div>
      </header>

      {/* MAIN COMMAND CENTER */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-10 p-8 overflow-hidden">

        {/* LEFT: OPERATIVE DATABASE */}
        <section className="flex-1 flex flex-col">
          <div className="mb-8 flex items-center justify-between">
            <HackerText text="GRID_DATABASE" className="text-4xl font-black text-red-400" />
            <Button onClick={fetchOperatives} className="bg-red-900/60 hover:bg-red-600 text-white font-black">
              <RefreshCw size={24} className={cn("mr-3", loading && "animate-spin")} /> Resync Grid
            </Button>
          </div>

          <div className="mb-6 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-red-500" size={28} />
            <Input 
              placeholder="LOCATE OPERATIVE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 h-16 text-2xl bg-black/70 border-4 border-red-900/60 focus:border-red-500 font-mono uppercase"
            />
          </div>

          <ScrollArea className="flex-1 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pr-4">
              {filteredUsers.map((op) => (
                <div key={op.uid} className={cn(
                  "relative bg-gradient-to-br from-black/80 to-neutral-900/80 border-4 rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105",
                  op.status === "banned" ? "border-red-900/80 opacity-70 grayscale" : "border-red-600/60"
                )}>
                  {op.membership.tier === "council" && (
                    <div className="absolute inset-0 border-4 border-yellow-500/40 rounded-3xl animate-ping opacity-30" />
                  )}
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className={cn("w-24 h-24 rounded-full border-4 flex items-center justify-center", op.membership.tier === "council" ? "border-yellow-500 bg-yellow-950/40" : "border-white/20")}>
                          {op.membership.tier === "council" ? <Crown size={48} className="text-yellow-500" /> : <Terminal size={48} className="text-red-500" />}
                        </div>
                        <div>
                          <h3 className="text-3xl font-black uppercase">{op.username}</h3>
                          <p className="text-lg font-mono text-red-400 uppercase">{op.membership.tier}</p>
                          {op.instagramHandle && <p className="text-sm font-mono text-green-400">@{op.instagramHandle}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black text-yellow-400">{op.wallet.popCoins.toLocaleString()}</div>
                        <p className="text-lg font-mono text-yellow-600 uppercase">PC</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {op.status !== "banned" && op.membership.tier !== "council" && (
                        <>
                          <Button onClick={() => handlePromote(op.uid, op.username, "elite")} className="bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xl py-6">
                            <Zap size={28} className="mr-3" /> Elite
                          </Button>
                          <Button onClick={() => handlePromote(op.uid, op.username, "inner_circle")} className="bg-purple-600 hover:bg-purple-500 text-black font-black text-xl py-6">
                            <Sparkles size={28} className="mr-3" /> Inner Circle
                          </Button>
                          <Button onClick={() => handlePromote(op.uid, op.username, "council")} className="col-span-2 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xl py-6">
                            <Crown size={32} className="mr-3" /> Council Ascension
                          </Button>
                        </>
                      )}
                      <Button onClick={() => handleGrantPC(op.uid, op.username, 10000)} className="bg-green-600 hover:bg-green-500 text-black font-black text-xl py-6">
                        <Gift size={28} className="mr-3" /> +10K PC
                      </Button>
                      {op.status !== "banned" ? (
                        <Button onClick={() => handleBan(op.uid, op.username)} className="bg-red-600 hover:bg-red-500 text-black font-black text-xl py-6">
                          <Ban size={28} className="mr-3" /> Terminate
                        </Button>
                      ) : (
                        <div className="col-span-2 text-center text-3xl font-black text-red-500 uppercase py-6">PURGED</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* RIGHT: GOD TOOLS */}
        <aside className="w-full lg:w-96 flex flex-col gap-10">
          <div className="bg-gradient-to-b from-red-950/60 to-black border-4 border-red-600/80 rounded-3xl p-10">
            <HackerText text="DIVINE_INTERVENTION" className="text-4xl font-black text-red-400 mb-8" />
            
            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-black uppercase mb-4 flex items-center gap-4">
                  <Database size={36} className="text-red-500" /> Global Campaigns
                </h4>
                <div className="bg-black/60 border-2 border-red-900/60 rounded-2xl p-6">
                  {/* Campaign Manager controls global missions */}
                  <CampaignManager />
                </div>
              </div>

              <div>
                <h4 className="text-2xl font-black uppercase mb-4 flex items-center gap-4 text-orange-500">
                  <AlertTriangle size={36} /> System Purge Tools
                </h4>
                <div className="bg-black/60 border-2 border-orange-900/60 rounded-2xl p-6">
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