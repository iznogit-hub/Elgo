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
  Zap, Flame, Trophy, Diamond, Skull, Radio, Sparkles
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
  { id: "recruit_m1", src: "/avatars/1.jpg", name: "Recruit (M)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_m2", src: "/avatars/2.jpg", name: "Soldier (M)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_f1", src: "/avatars/3.jpg", name: "Recruit (F)", type: "standard", cost: 0, rarity: "common" },
  { id: "recruit_f2", src: "/avatars/4.jpg", name: "Soldier (F)", type: "standard", cost: 0, rarity: "common" },
  
  // TIER 2: BLACK MARKET
  { id: "cyber_1", src: "/avatars/cyber_1.jpg", name: "Neon Ronin", type: "premium", cost: 800, rarity: "rare" },
  { id: "cyber_2", src: "/avatars/cyber_2.jpg", name: "Netrunner", type: "premium", cost: 900, rarity: "rare" },
  { id: "assassin_1", src: "/avatars/assassin_1.jpg", name: "Night Ops", type: "premium", cost: 1200, rarity: "epic" },
  { id: "shadow_1", src: "/avatars/shadow_1.jpg", name: "Void Stalker", type: "premium", cost: 1500, rarity: "epic" },

  // TIER 3: LEGENDARY (High greed factor)
  { id: "gold_1", src: "/avatars/gold_1.jpg", name: "The Executive", type: "elite", cost: 3000, rarity: "legendary" },
  { id: "boss_1", src: "/avatars/boss_1.jpg", name: "Sector Warlord", type: "elite", cost: 6000, rarity: "legendary" },
  { id: "glitch_1", src: "/avatars/glitch_1.jpg", name: "Glitch Phantom", type: "elite", cost: 8000, rarity: "mythic" },
];

const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case "mythic": return { border: "border-purple-500/70", glow: "shadow-purple-500/60", tag: "bg-purple-600 text-white", pulse: "animate-pulse" };
    case "legendary": return { border: "border-yellow-500/70", glow: "shadow-yellow-500/60", tag: "bg-yellow-600 text-black", pulse: "" };
    case "epic": return { border: "border-purple-400/60", glow: "shadow-purple-400/40", tag: "bg-purple-500 text-white", pulse: "" };
    case "rare": return { border: "border-cyan-500/50", glow: "shadow-cyan-500/30", tag: "bg-cyan-600 text-white", pulse: "" };
    default: return { border: "border-white/20", glow: "", tag: "bg-neutral-700 text-neutral-400", pulse: "" };
  }
};

export default function DossierPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"LOADOUT" | "SETTINGS">("LOADOUT");
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [igHandle, setIgHandle] = useState(userData?.instagramHandle || "");
  const [isBinding, setIsBinding] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [selectedSkin, setSelectedSkin] = useState<any>(null);

  const tier = userData?.membership?.tier || "recruit";
  const popCoins = userData?.wallet?.popCoins || 0;
  const username = userData?.username || "OPERATIVE";
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
              toast.success(`EQUIPPED // ${skin.name.toUpperCase()} ACTIVE`);
              setSelectedSkin(skin);
          } catch (e) {
              toast.error("EQUIP FAILED // SYSTEM ERROR");
          }
          return;
      }

      if (popCoins < skin.cost) {
          play("error");
          toast.error(`INSUFFICIENT PC // EARN MORE IN SECTORS`);
          return;
      }

      if (!confirm(`CONFIRM PURCHASE // ${skin.name.toUpperCase()} FOR ${skin.cost} PC?`)) return;

      setBuyingId(skin.id);
      play("kaching");

      try {
          await updateDoc(doc(db, "users", user.uid), {
              "wallet.popCoins": increment(-skin.cost),
              inventory: arrayUnion({ itemId: skin.id, name: skin.name, purchasedAt: new Date().toISOString() }),
              avatar: skin.src
          });
          toast.success(`ACQUISITION COMPLETE // ${skin.name.toUpperCase()} DEPLOYED`);
          setSelectedSkin(skin);
      } catch (e) {
          toast.error("TRANSACTION ABORTED");
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
          toast.success("DIGITAL FOOTPRINT LINKED");
          play("success");
      } catch (e) { toast.error("BINDING FAILED"); } 
      finally { setIsBinding(false); }
  };

  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     play("click");
     try {
        await updateDoc(doc(db, "users", user.uid), { username: newUsername.trim().toUpperCase() });
        toast.success("CODENAME UPDATED");
        setShowNameEdit(false);
     } catch (e) { toast.error("UPDATE FAILED"); }
  };

  if (!userData) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/profile-bg.jpg" alt="Dossier" fill priority className="object-cover opacity-15 grayscale contrast-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
      </div>
      <SoundPrompter />
      <Background />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-4 border-red-900/60 bg-black/80 backdrop-blur-2xl">
        <div className="px-8 py-6 flex items-center justify-between">
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 border-2 border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-red-500 transition-all">
              <ArrowLeft size={24} className="text-neutral-500 group-hover:text-red-500" />
            </div>
            <span className="text-sm font-mono text-neutral-500 uppercase tracking-widest">Return to War Room</span>
          </TransitionLink>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <span className="text-xs font-mono text-neutral-500 uppercase">War Chest</span>
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-yellow-500 animate-pulse" />
                <span className="text-3xl font-black text-yellow-400">{popCoins.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-neutral-500 uppercase">Collection</span>
              <span className="text-3xl font-black text-cyan-400">{ownedCount}/{totalSkins}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex">
          <button onClick={() => setActiveTab("LOADOUT")} className={cn("flex-1 py-5 text-lg font-black uppercase tracking-widest transition-all", activeTab === "LOADOUT" ? "bg-red-950/40 text-red-400 border-t-4 border-red-500" : "text-neutral-600")}>
            <Shirt size={24} className="inline mr-3" /> Black_Market
          </button>
          <button onClick={() => setActiveTab("SETTINGS")} className={cn("flex-1 py-5 text-lg font-black uppercase tracking-widest transition-all", activeTab === "SETTINGS" ? "bg-neutral-900/40 text-cyan-400 border-t-4 border-cyan-500" : "text-neutral-600")}>
            <Terminal size={24} className="inline mr-3" /> Protocols
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="relative z-40 flex-1 flex flex-col lg:flex-row gap-10 p-8 overflow-hidden">

        {/* LEFT: OPERATIVE DOSSIER + BIG PREVIEW */}
        <aside className="w-full lg:w-1/2 flex flex-col gap-8">
          
          {/* MASSIVE AVATAR PREVIEW */}
          <div className="relative bg-black/60 border-4 border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
            <div className="relative z-10 p-12 flex flex-col items-center text-center">
              <div className="relative w-80 h-80 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse" />
                <Image 
                  src={currentAvatar} 
                  alt="Current Loadout" 
                  fill 
                  className="object-cover rounded-full"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {selectedSkin && selectedSkin.rarity && (
                  <div className={cn("absolute inset-0 rounded-full animate-ping opacity-30", getRarityStyle(selectedSkin.rarity).glow.replace("shadow-", "bg-"))} />
                )}
              </div>

              <HackerText text={username} className="text-5xl font-black tracking-wider mb-4" />

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <Crown size={32} className={tier === "warlord" ? "text-yellow-500 animate-pulse" : "text-neutral-600"} />
                  <span className="text-2xl font-black uppercase">{tier}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy size={32} className="text-yellow-500" />
                  <span className="text-2xl font-black">{(userData as any).dailyTracker?.bountiesClaimed || 0} KILLS</span>
                </div>
              </div>

              <Button 
                onClick={() => { setNewUsername(username); setShowNameEdit(true); play("click"); }}
                className="px-12 py-4 bg-neutral-900/60 border-2 border-white/30 hover:border-red-500 text-lg font-black uppercase tracking-widest"
              >
                <Pencil size={20} className="mr-3" /> Reassign Codename
              </Button>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-cyan-950/40 to-black border border-cyan-600/40 p-6 text-center backdrop-blur-md">
              <Sparkles size={32} className="text-cyan-400 mx-auto mb-3" />
              <span className="block text-xs font-mono text-cyan-300 uppercase">Owned Skins</span>
              <span className="text-3xl font-black">{ownedCount}</span>
            </div>
            <div className="bg-gradient-to-br from-yellow-950/40 to-black border border-yellow-600/40 p-6 text-center backdrop-blur-md">
              <Diamond size={32} className="text-yellow-400 mx-auto mb-3" />
              <span className="block text-xs font-mono text-yellow-300 uppercase">PC Balance</span>
              <span className="text-3xl font-black">{popCoins.toLocaleString()}</span>
            </div>
            <div className="bg-gradient-to-br from-red-950/40 to-black border border-red-600/40 p-6 text-center backdrop-blur-md">
              <Flame size={32} className="text-red-400 mx-auto mb-3 animate-pulse" />
              <span className="block text-xs font-mono text-red-300 uppercase">Threat Level</span>
              <span className="text-3xl font-black">HIGH</span>
            </div>
          </div>
        </aside>

        {/* RIGHT: BLACK MARKET ARMORY */}
        {activeTab === "LOADOUT" && (
          <section className="flex-1">
            <div className="mb-8 flex items-center justify-between">
              <HackerText text="Black_Market_Armory" className="text-4xl font-black text-red-400" />
              <div className="text-right">
                <span className="text-sm font-mono text-neutral-500 uppercase">Available Funds</span>
                <div className="flex items-center gap-3">
                  <Zap size={28} className="text-yellow-500 animate-pulse" />
                  <span className="text-4xl font-black text-yellow-400">{popCoins.toLocaleString()} PC</span>
                </div>
              </div>
            </div>

            <ScrollArea className="h-full pb-32">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
                                "group relative aspect-square border-4 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105",
                                isEquipped ? "border-green-500 shadow-2xl shadow-green-500/60" : rarityStyle.border,
                                rarityStyle.glow && `shadow-2xl ${rarityStyle.glow} ${rarityStyle.pulse}`
                            )}
                        >
                            {/* Image */}
                            <Image 
                                src={skin.src} 
                                alt={skin.name} 
                                fill 
                                className={cn("object-cover transition-all duration-700", !isOwned && "grayscale opacity-70", "group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110")} 
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                            {/* Rarity Tag */}
                            {skin.rarity && (
                              <div className={cn("absolute top-4 left-4 px-3 py-1 text-xs font-black uppercase tracking-widest border", rarityStyle.tag)}>
                                {skin.rarity}
                              </div>
                            )}

                            {/* Equipped Badge */}
                            {isEquipped && (
                              <div className="absolute top-4 right-4 bg-green-600 text-black px-3 py-1 text-xs font-black uppercase">
                                Deployed
                              </div>
                            )}

                            {/* Bottom Panel */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                              <h3 className="text-lg font-black uppercase mb-3 tracking-wider">{skin.name}</h3>
                              
                              {isBuying ? (
                                <div className="text-yellow-400 font-black animate-pulse text-xl">PROCESSING...</div>
                              ) : isOwned ? (
                                <div className="text-cyan-400 font-black text-lg uppercase">
                                  {isEquipped ? "ACTIVE" : "Tap to Equip"}
                                </div>
                              ) : (
                                <div className={cn("text-2xl font-black flex items-center justify-center gap-3", isAffordable ? "text-yellow-400" : "text-red-500")}>
                                  {isAffordable ? <ShoppingCart size={28} /> : <Lock size={28} />}
                                  {skin.cost.toLocaleString()} PC
                                </div>
                              )}
                            </div>

                            {/* Premium Pulse */}
                            {!isOwned && skin.rarity && skin.rarity !== "common" && (
                              <div className={cn("absolute inset-0 border-4 rounded-2xl animate-ping opacity-40", rarityStyle.border)} />
                            )}
                        </div>
                    );
                })}
              </div>
            </ScrollArea>
          </section>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "SETTINGS" && (
          <section className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl bg-black/70 border-4 border-cyan-600/50 backdrop-blur-2xl rounded-3xl p-12 space-y-12">
              <HackerText text="System_Protocols" className="text-4xl font-black text-cyan-400 text-center" />

              {/* Instagram Bind */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <Instagram size={48} className="text-pink-500" />
                  <div className="flex-1">
                    <label className="block text-lg font-mono text-neutral-300 uppercase mb-3">
                      Link Digital Footprint
                    </label>
                    <div className="flex gap-4">
                      <Input 
                          value={igHandle}
                          onChange={(e) => setIgHandle(e.target.value)}
                          placeholder="@YOURHANDLE"
                          disabled={!!userData?.instagramHandle}
                          className="h-16 text-xl bg-black/50 border-2 border-cyan-600/50 text-white font-mono uppercase focus:border-cyan-400"
                      />
                      {!userData?.instagramHandle && (
                          <Button 
                            onClick={handleBindInstagram} 
                            disabled={isBinding}
                            size="lg"
                            className="px-12 text-lg font-black bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300"
                          >
                            {isBinding ? "BINDING..." : "VERIFY"}
                          </Button>
                      )}
                    </div>
                    {userData?.instagramHandle && (
                      <p className="mt-4 text-green-400 font-mono text-lg flex items-center gap-3">
                        <CheckCircle2 size={28} /> FOOTPRINT LOCKED // @{userData.instagramHandle}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <Button 
                onClick={handleLogout} 
                className="w-full py-8 text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 shadow-2xl shadow-red-600/60"
              >
                <LogOut size={32} className="mr-4" /> Disconnect From Grid
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* NAME EDIT MODAL */}
      {showNameEdit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-8">
          <div className="w-full max-w-lg bg-gradient-to-b from-neutral-900 to-black border-4 border-red-600/70 p-12 shadow-2xl">
            <HackerText text="Codename Reassignment" className="text-4xl font-black text-red-400 mb-8 text-center" />
            <Input 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value.toUpperCase())} 
              className="h-20 text-3xl text-center bg-black/60 border-4 border-white/30 focus:border-red-500 font-black uppercase tracking-widest"
              placeholder="NEW CODENAME"
            />
            <div className="flex gap-6 mt-12">
              <Button onClick={handleNameUpdate} className="flex-1 py-8 text-2xl font-black bg-green-600 hover:bg-green-500">
                Confirm
              </Button>
              <Button onClick={() => setShowNameEdit(false)} variant="ghost" className="flex-1 py-8 text-2xl font-black text-neutral-500 hover:text-white">
                Abort
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}