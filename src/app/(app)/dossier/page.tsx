"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Terminal, Crown, Pencil, ArrowLeft, 
  LogOut, Instagram, CheckCircle2, ShieldCheck, 
  UserCog, Shirt, Lock, Check, ShoppingCart, AlertTriangle,
  Zap, Flame, Trophy, Diamond, Skull, Radio, Sparkles, User, Settings, Database, Activity
} from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { HackerText } from "@/components/ui/hacker-text";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const SKIN_DB = [
  // TIER 1: STANDARD ISSUE
  { id: "recruit_m1", src: "/avatars/1.jpg", name: "Base Node (M)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_m2", src: "/avatars/2.jpg", name: "Operator (M)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_f1", src: "/avatars/3.jpg", name: "Base Node (F)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_f2", src: "/avatars/4.jpg", name: "Operator (F)", type: "standard", cost: 0, rarity: "common" },
  
  // TIER 2: PREMIUM MODULES
  { id: "cyber_1", src: "/avatars/cyber_1.jpg", name: "Neon Architect", type: "premium", cost: 800, rarity: "rare" },
  { id: "cyber_2", src: "/avatars/cyber_2.jpg", name: "Data Broker", type: "premium", cost: 900, rarity: "rare" },
  { id: "assassin_1", src: "/avatars/assassin_1.jpg", name: "Dark Pool Spec", type: "premium", cost: 1200, rarity: "epic" },
  { id: "shadow_1", src: "/avatars/shadow_1.jpg", name: "Yield Arbitrage", type: "premium", cost: 1500, rarity: "epic" },

  // TIER 3: EXCLUSIVE ASSETS
  { id: "gold_1", src: "/avatars/gold_1.jpg", name: "The Executive", type: "elite", cost: 3000, rarity: "legendary" },
  { id: "boss_1", src: "/avatars/boss_1.jpg", name: "Sector Principal", type: "elite", cost: 6000, rarity: "legendary" },
  { id: "glitch_1", src: "/avatars/glitch_1.jpg", name: "System Override", type: "elite", cost: 8000, rarity: "mythic" },
];

const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case "mythic": return { border: "border-white", bg: "bg-white text-black" };
    case "legendary": return { border: "border-neutral-300", bg: "bg-neutral-300 text-black" };
    case "epic": return { border: "border-neutral-500", bg: "bg-neutral-800 text-white" };
    case "rare": return { border: "border-neutral-700", bg: "bg-neutral-900 text-white" };
    default: return { border: "border-white/10", bg: "bg-transparent text-neutral-500" };
  }
};

export default function DossierPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"ALLOCATE" | "SETTINGS">("ALLOCATE");
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [igHandle, setIgHandle] = useState(userData?.instagramHandle || "");
  const [isBinding, setIsBinding] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any>(null);

  const tier = userData?.membership?.tier || "Base Node";
  const popCoins = userData?.wallet?.popCoins || 0;
  const username = userData?.username || "OPERATOR";
  const currentAvatar = userData?.avatar || "/avatars/1.jpg";
  const inventory = userData?.inventory || [];
  const ownedCount = inventory.length;
  const totalSkins = SKIN_DB.length;

  const handlePurchaseOrEquip = async (skin: any) => {
      if (!user) return;

      const isOwned = skin.type === "standard" || inventory.some((item: any) => item.itemId === skin.id);

      if (isOwned) {
          play("click");
          try {
              await updateDoc(doc(db, "users", user.uid), { avatar: skin.src });
              toast.success(`MODULE EQUIPPED // ${skin.name.toUpperCase()} ACTIVE`);
              setSelectedSkin(skin);
          } catch (e) {
              toast.error("SYSTEM ERROR // RETRY");
          }
          return;
      }

      if (popCoins < skin.cost) {
          play("error");
          toast.error(`INSUFFICIENT CAPITAL // EXTRACT MORE YIELD`);
          return;
      }

      if (!confirm(`AUTHORIZE TRANSFER // ${skin.cost} CREDITS FOR ${skin.name.toUpperCase()}?`)) return;

      setBuyingId(skin.id);
      play("kaching");

      try {
          await updateDoc(doc(db, "users", user.uid), {
              "wallet.popCoins": increment(-skin.cost),
              inventory: arrayUnion({ itemId: skin.id, name: skin.name, purchasedAt: new Date().toISOString() }),
              avatar: skin.src
          });
          toast.success(`TRANSACTION CLEAR // ${skin.name.toUpperCase()} ACQUIRED`);
          setSelectedSkin(skin);
      } catch (e) {
          toast.error("TRANSACTION FAILED");
      } finally {
          setBuyingId(null);
      }
  };

  const handleLogout = async () => {
      play("off");
      await signOut(auth);
      router.push("/");
  };

  const handleBindInstagram = async () => {
      if (!igHandle.startsWith("@")) return toast.error("INVALID HANDLE FORMAT");
      if (!user) return;
      setIsBinding(true);
      play("click");
      try {
          await updateDoc(doc(db, "users", user.uid), { instagramHandle: igHandle });
          toast.success("DIGITAL ASSET VERIFIED");
          play("success");
      } catch (e) { toast.error("VERIFICATION FAILED"); } 
      finally { setIsBinding(false); }
  };

  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     play("click");
     try {
        await updateDoc(doc(db, "users", user.uid), { username: newUsername.trim().toUpperCase() });
        toast.success("OPERATOR ID UPDATED");
        setShowNameEdit(false);
     } catch (e) { toast.error("UPDATE REJECTED"); }
  };

  if (!userData) return null;

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-white selection:text-black">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/profile-bg.jpg" alt="Data Core" fill priority className="object-cover opacity-10 grayscale contrast-150 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/90 via-[#050505]/60 to-[#050505]/95" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      <SoundPrompter />
      <Background />

      {/* TOP HUD - Brutalist Architecture */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-10 h-10 border border-white/20 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <ArrowLeft size={18} className="text-white group-hover:text-black" />
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest group-hover:text-white transition-colors">Terminal Return</span>
          </TransitionLink>

          <div className="flex flex-wrap items-center gap-6 border border-white/10 p-2 bg-white/5">
            <div className="text-right px-4">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Liquid Capital</span>
              <div className="flex items-center gap-2">
                <Database size={14} className="text-white/50" />
                <span className="text-xl font-mono text-white leading-none">{popCoins.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="h-8 w-px bg-white/20 hidden md:block" />
            
            <div className="text-right px-4">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Assets Owned</span>
              <span className="text-xl font-mono text-white leading-none">{ownedCount}/{totalSkins}</span>
            </div>
          </div>
        </div>

        {/* Tabs - 1px Grid */}
        <div className="flex border-t border-white/10 bg-[#050505]">
          <button onClick={() => setActiveTab("ALLOCATE")} className={cn("flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-colors border-r border-white/10", activeTab === "ALLOCATE" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <ShoppingCart size={14} className="inline mr-2 mb-0.5" /> Asset_Market
          </button>
          <button onClick={() => setActiveTab("SETTINGS")} className={cn("flex-1 py-4 text-xs font-mono uppercase tracking-widest transition-colors", activeTab === "SETTINGS" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <Settings size={14} className="inline mr-2 mb-0.5" /> System_Protocols
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-px bg-white/10 border-b border-white/10 overflow-hidden">

        {/* LEFT: OPERATIVE DOSSIER */}
        <aside className="w-full lg:w-[400px] flex flex-col bg-[#050505] p-6 md:p-10 shrink-0">
          
          {/* AVATAR PREVIEW */}
          <div className="relative border border-white/10 bg-white/5 p-8 flex flex-col items-center text-center mb-6">
            <div className="relative w-48 h-48 mb-8">
              <div className="absolute inset-0 border border-white/20 animate-pulse" />
              <Image 
                src={currentAvatar} 
                alt="Identity" 
                fill 
                className="object-cover grayscale contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
            </div>

            <HackerText text={username} className="text-2xl font-medium tracking-widest mb-4 uppercase" />

            <div className="w-full border-t border-white/10 pt-4 flex justify-between items-center text-xs font-mono uppercase text-neutral-400 mb-8">
              <span>Class // {tier}</span>
              <span>Yield // {(userData as any).dailyTracker?.bountiesClaimed || 0} Tx</span>
            </div>

            <Button 
              onClick={() => { setNewUsername(username); setShowNameEdit(true); play("click"); }}
              className="w-full h-12 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black text-[10px] font-mono uppercase tracking-widest rounded-none transition-colors"
            >
              <Pencil size={14} className="mr-2" /> Modify ID
            </Button>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
            <div className="bg-[#050505] p-6 text-center hover:bg-white/5 transition-colors">
              <Sparkles size={18} className="text-white/50 mx-auto mb-3" />
              <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Inventory</span>
              <span className="text-2xl font-mono text-white">{ownedCount}</span>
            </div>
            <div className="bg-[#050505] p-6 text-center hover:bg-white/5 transition-colors">
              <Activity size={18} className="text-white mx-auto mb-3 animate-pulse" />
              <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Network Status</span>
              <span className="text-lg font-mono text-white">OPTIMAL</span>
            </div>
          </div>
        </aside>

        {/* RIGHT: CONTENT AREA */}
        <section className="flex-1 bg-[#050505] flex flex-col h-full overflow-hidden">
          
          {activeTab === "ALLOCATE" && (
            <div className="flex flex-col h-full">
              <div className="p-8 md:p-10 border-b border-white/10 shrink-0">
                <HackerText text="Asset_Allocation" className="text-[5vw] md:text-4xl font-medium tracking-tighter uppercase mb-2" />
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Acquire identity modules to modify digital presence.</p>
              </div>

              <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10 border-b border-white/10 pb-32">
                  {SKIN_DB.map((skin) => {
                      const isOwned = skin.type === "standard" || inventory.some((item: any) => item.itemId === skin.id);
                      const isEquipped = currentAvatar === skin.src;
                      const isAffordable = popCoins >= skin.cost;
                      const isBuying = buyingId === skin.id;
                      const rarityStyle = getRarityStyle(skin.rarity || "common");

                      return (
                          <div 
                              key={skin.id} 
                              onClick={() => handlePurchaseOrEquip(skin)}
                              className={cn(
                                  "group relative aspect-square bg-[#050505] overflow-hidden cursor-pointer transition-colors duration-500",
                                  isEquipped ? "bg-white/10" : "hover:bg-white/5"
                              )}
                          >
                              {/* Image */}
                              <div className="absolute inset-0 z-0">
                                <Image 
                                    src={skin.src} 
                                    alt={skin.name} 
                                    fill 
                                    className={cn("object-cover transition-all duration-700 mix-blend-screen", !isOwned && "grayscale opacity-30", "group-hover:grayscale-0 group-hover:opacity-70 group-hover:scale-105")} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/20" />
                              </div>

                              {/* Rarity Tag */}
                              <div className="absolute top-4 left-4 z-10">
                                <div className={cn("px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest border", rarityStyle.border, rarityStyle.bg)}>
                                  {skin.rarity}
                                </div>
                              </div>

                              {/* Equipped Badge */}
                              {isEquipped && (
                                <div className="absolute top-4 right-4 z-10">
                                  <div className="bg-white text-black px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                                    <Check size={10} /> Active
                                  </div>
                                </div>
                              )}

                              {/* Bottom Panel */}
                              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-10">
                                <h3 className="text-sm font-medium uppercase tracking-widest text-white mb-2">{skin.name}</h3>
                                
                                {isBuying ? (
                                  <div className="text-white font-mono text-[10px] animate-pulse uppercase tracking-widest border border-white/20 p-2 text-center">Processing...</div>
                                ) : isOwned ? (
                                  <div className="text-neutral-400 font-mono text-[10px] uppercase tracking-widest border border-white/20 p-2 text-center group-hover:border-white group-hover:text-white transition-colors">
                                    {isEquipped ? "Installed" : "Initialize"}
                                  </div>
                                ) : (
                                  <div className={cn("font-mono text-xs flex items-center justify-between border p-2 transition-colors", isAffordable ? "border-white/40 text-white group-hover:bg-white group-hover:text-black" : "border-white/10 text-neutral-600")}>
                                    <span className="uppercase tracking-widest text-[9px]">Acquire</span>
                                    <span>{skin.cost.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                          </div>
                      );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === "SETTINGS" && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="w-full max-w-xl bg-[#050505] border border-white/20 p-12">
                <HackerText text="System_Protocols" className="text-2xl font-medium tracking-widest uppercase mb-10" />

                {/* Instagram Bind */}
                <div className="space-y-6">
                  <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest border-b border-white/10 pb-2">
                    Digital Footprint Synchronization
                  </label>
                  
                  <div className="flex flex-col gap-4">
                    <Input 
                        value={igHandle}
                        onChange={(e) => setIgHandle(e.target.value)}
                        placeholder="@INSTAGRAM_HANDLE"
                        disabled={!!userData?.instagramHandle}
                        className="h-14 bg-transparent border-white/20 text-white font-mono text-sm uppercase focus:border-white rounded-none"
                    />
                    {!userData?.instagramHandle && (
                        <Button 
                          onClick={handleBindInstagram} 
                          disabled={isBinding}
                          className="h-14 bg-white text-black hover:bg-neutral-200 text-[10px] font-mono font-bold uppercase tracking-[0.2em] rounded-none"
                        >
                          {isBinding ? "TRANSMITTING..." : "VERIFY ASSET"}
                        </Button>
                    )}
                  </div>
                  
                  {userData?.instagramHandle && (
                    <div className="p-4 border border-white/20 bg-white/5 flex items-center gap-3 text-xs font-mono uppercase text-white">
                      <CheckCircle2 size={16} /> Asset Linked // @{userData.instagramHandle}
                    </div>
                  )}
                </div>

                <div className="h-px bg-white/10 my-10" />

                <Button 
                  onClick={handleLogout} 
                  className="w-full h-14 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-mono text-[10px] uppercase tracking-[0.2em] rounded-none transition-colors"
                >
                  <LogOut size={14} className="mr-3" /> Terminate Session
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* NAME EDIT MODAL - Brutalist Overlay */}
      {showNameEdit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-6">
          <div className="w-full max-w-lg bg-[#050505] border border-white/20 p-10">
            <HackerText text="Operator_Reassignment" className="text-xl font-medium tracking-widest uppercase mb-8" />
            
            <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-3">
              New Identifier
            </label>
            <Input 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value.toUpperCase())} 
              className="h-16 text-lg bg-transparent border-white/30 text-white focus:border-white font-mono uppercase tracking-widest rounded-none mb-8"
              placeholder="ENTER_ID"
            />
            
            <div className="flex gap-4">
              <Button onClick={handleNameUpdate} className="flex-1 h-14 bg-white text-black hover:bg-neutral-200 font-mono text-[10px] uppercase tracking-[0.2em] rounded-none">
                Execute
              </Button>
              <Button onClick={() => setShowNameEdit(false)} className="flex-1 h-14 bg-transparent border border-white/20 text-neutral-400 hover:text-white hover:border-white font-mono text-[10px] uppercase tracking-[0.2em] rounded-none">
                Abort
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}