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
  UserCog, Shirt, Lock, Check, ShoppingCart, AlertTriangle
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

// --- SKINS DATABASE ---
// In a real app, this should be fetched from a 'items' collection in Firestore
const SKIN_DB = [
  // TIER 1: STANDARD ISSUE (Free)
  { id: "recruit_m1", src: "/avatars/1.jpg", name: "Recruit (M)", type: "standard", cost: 0 },
  { id: "recruit_m2", src: "/avatars/2.jpg", name: "Soldier (M)", type: "standard", cost: 0 },
  { id: "recruit_f1", src: "/avatars/3.jpg", name: "Recruit (F)", type: "standard", cost: 0 },
  { id: "recruit_f2", src: "/avatars/4.jpg", name: "Soldier (F)", type: "standard", cost: 0 },
  
  // TIER 2: BLACK MARKET (Purchasable)
  { id: "cyber_1", src: "/avatars/cyber_1.jpg", name: "Neon Ronin", type: "premium", cost: 500, rarity: "rare" },
  { id: "cyber_2", src: "/avatars/cyber_2.jpg", name: "Netrunner", type: "premium", cost: 500, rarity: "rare" },
  { id: "assassin_1", src: "/avatars/assassin_1.jpg", name: "Night Ops", type: "premium", cost: 800, rarity: "epic" },

  // TIER 3: ELITE (Rank Locked or High Cost)
  { id: "gold_1", src: "/avatars/gold_1.jpg", name: "The Executive", type: "elite", cost: 2000, rarity: "legendary" },
  { id: "boss_1", src: "/avatars/boss_1.jpg", name: "Warlord", type: "elite", cost: 5000, rarity: "legendary" },
];

export default function DossierPage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  const router = useRouter();
  
  // STATE
  const [activeTab, setActiveTab] = useState<"LOADOUT" | "SETTINGS">("LOADOUT");
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [igHandle, setIgHandle] = useState(userData?.instagramHandle || "");
  const [isBinding, setIsBinding] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  // DATA
  const tier = userData?.membership?.tier || "recruit";
  const popCoins = userData?.wallet?.popCoins || 0;
  const username = userData?.username || "OPERATIVE";
  const currentAvatar = userData?.avatar || "/avatars/1.jpg";
  const inventory = userData?.inventory || [];

  // --- LOGIC: AVATAR TRANSACTION SYSTEM ---
  const handlePurchaseOrEquip = async (skin: any) => {
      if (!user) return;

      // 1. Check Ownership
      // Standard skins are always "owned". Premium ones check inventory.
      const isOwned = skin.type === "standard" || inventory.some((item: any) => item.itemId === skin.id);

      // 2. EQUIP LOGIC (If Owned)
      if (isOwned) {
          play("click");
          try {
              await updateDoc(doc(db, "users", user.uid), { avatar: skin.src });
              toast.success(`EQUIPPED: ${skin.name}`);
          } catch (e) {
              toast.error("EQUIP FAILED");
          }
          return;
      }

      // 3. PURCHASE LOGIC (If Not Owned)
      if (popCoins < skin.cost) {
          play("error");
          toast.error(`INSUFFICIENT FUNDS // NEED ${skin.cost} PC`);
          return;
      }

      // Confirm Purchase
      if (!confirm(`PURCHASE ${skin.name} for ${skin.cost} PC?`)) return;

      setBuyingId(skin.id);
      play("kaching"); // Cash register sound

      try {
          await updateDoc(doc(db, "users", user.uid), {
              "wallet.popCoins": increment(-skin.cost),
              inventory: arrayUnion({ itemId: skin.id, name: skin.name, purchasedAt: new Date().toISOString() }),
              avatar: skin.src // Auto-equip on buy
          });
          toast.success("TRANSACTION COMPLETE // ITEM EQUIPPED");
      } catch (e) {
          toast.error("TRANSACTION FAILED");
      } finally {
          setBuyingId(null);
      }
  };

  // --- ACTIONS ---
  const handleLogout = async () => {
      play("off");
      await signOut(auth);
      router.push("/");
  };

  const handleBindInstagram = async () => {
      if (!igHandle.startsWith("@")) return toast.error("INVALID FORMAT // USE @HANDLE");
      if (!user) return;
      setIsBinding(true);
      play("click");
      try {
          await updateDoc(doc(db, "users", user.uid), { instagramHandle: igHandle });
          toast.success("IDENTITY VERIFIED");
          play("success");
      } catch (e) { toast.error("CONNECTION FAILED"); } 
      finally { setIsBinding(false); }
  };

  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     play("click");
     try {
        await updateDoc(doc(db, "users", user.uid), { username: newUsername.trim().toUpperCase() });
        toast.success("CODENAME REASSIGNED");
        setShowNameEdit(false);
        window.location.reload(); 
     } catch (e) { toast.error("UPDATE ERROR"); }
  };

  if (!userData) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center selection:bg-red-900 selection:text-white">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/profile-bg.jpg" alt="Dossier" fill priority className="object-cover opacity-20 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      <SoundPrompter />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink href="/dashboard" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-red-500 transition-all rounded-sm">
              <ArrowLeft size={18} className="text-neutral-500 group-hover:text-red-500" />
            </TransitionLink>
        </div>
        <div className="px-3 py-1 bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-neutral-400 uppercase">Loadout_Config</span>
        </div>
      </nav>

      {/* CONTENT GRID */}
      <div className="relative z-40 w-full max-w-5xl h-screen pt-24 px-6 pb-12 flex flex-col md:flex-row gap-8 overflow-y-auto no-scrollbar">
        
        {/* --- LEFT COLUMN: ID CARD --- */}
        <aside className="w-full md:w-1/3 flex flex-col gap-6">
            
            {/* ID CARD */}
            <div className="w-full bg-neutral-900/60 border border-white/10 backdrop-blur-xl p-0 relative overflow-hidden group rounded-sm shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50 z-20" />
                
                <div className="flex flex-col items-center pt-8 pb-6 relative">
                    {/* BIG AVATAR PREVIEW */}
                    <div className="relative w-40 h-40 mb-4 group/avatar">
                        <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover/avatar:border-red-500 transition-colors z-10" />
                        <div className="absolute inset-0 rounded-full overflow-hidden">
                            <Image src={currentAvatar} alt="Avatar" fill className="object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-500" />
                        </div>
                        {/* Edit Icon Overlay */}
                        <div className="absolute bottom-2 right-2 bg-black border border-white/20 p-2 rounded-full z-20 text-white">
                            <UserCog size={14} />
                        </div>
                    </div>

                    {/* NAME */}
                    <div onClick={() => { setNewUsername(username); setShowNameEdit(true); play("click"); }} className="flex items-center gap-2 cursor-pointer group/edit mb-2">
                        <h1 className="text-3xl font-black font-sans italic uppercase text-white tracking-tighter leading-none">{username}</h1>
                        <Pencil size={12} className="text-neutral-600 group-hover/edit:text-white transition-colors" />
                    </div>
                    
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-2 bg-black/40 px-2 py-1 rounded-sm border border-white/5">
                       <ShieldCheck size={10} className={tier === "warlord" ? "text-yellow-500" : "text-white"} /> 
                       Rank: <span className="text-white font-bold">{tier}</span>
                    </span>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 border-t border-white/10 bg-black/40">
                    <div className="p-4 border-r border-white/10 text-center">
                        <span className="block text-[7px] font-mono text-neutral-500 uppercase tracking-widest mb-1">War_Chest</span>
                        <span className="text-lg font-black text-yellow-500 uppercase tracking-wide">{popCoins.toLocaleString()}</span>
                    </div>
                    <div className="p-4 text-center">
                        <span className="block text-[7px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Kills_Confirmed</span>
                        <span className="text-lg font-black text-white uppercase tracking-wide">{(userData as any).dailyTracker?.bountiesClaimed || 0}</span>
                    </div>
                </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="space-y-2">
                <Button onClick={() => setActiveTab("LOADOUT")} className={cn("w-full justify-start h-12 text-[10px] tracking-widest font-bold uppercase rounded-sm border", activeTab === "LOADOUT" ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:text-white")}>
                    <Shirt size={14} className="mr-3" /> Wardrobe
                </Button>
                <Button onClick={() => setActiveTab("SETTINGS")} className={cn("w-full justify-start h-12 text-[10px] tracking-widest font-bold uppercase rounded-sm border", activeTab === "SETTINGS" ? "bg-white text-black border-white" : "bg-transparent text-neutral-500 border-white/10 hover:text-white")}>
                    <Terminal size={14} className="mr-3" /> System_Settings
                </Button>
            </div>
        </aside>

        {/* --- RIGHT COLUMN: THE STORE / EDITOR --- */}
        <section className="flex-1 bg-neutral-900/20 border border-white/5 backdrop-blur-md rounded-sm p-6 overflow-hidden flex flex-col">
            
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h2 className="text-xl font-black font-sans uppercase italic text-white flex items-center gap-2">
                    {activeTab === "LOADOUT" ? "Visual_Customization" : "Account_Protocols"}
                </h2>
                {activeTab === "LOADOUT" && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
                        <ShoppingCart size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-mono font-bold text-yellow-500">{popCoins.toLocaleString()} PC AVAILABLE</span>
                    </div>
                )}
            </div>

            {/* TAB: LOADOUT (THE STORE) */}
            {activeTab === "LOADOUT" && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto no-scrollbar pb-10">
                    {SKIN_DB.map((skin) => {
                        const isOwned = skin.type === "standard" || inventory.some((item: any) => item.itemId === skin.id);
                        const isEquipped = currentAvatar === skin.src;
                        const isAffordable = popCoins >= skin.cost;
                        const isBuying = buyingId === skin.id;

                        // Rarity Colors
                        const borderColor = skin.rarity === "legendary" ? "border-yellow-500/50" : skin.rarity === "epic" ? "border-purple-500/50" : "border-white/10";
                        const bgGlow = skin.rarity === "legendary" ? "bg-yellow-500/5" : "bg-white/5";

                        return (
                            <div 
                                key={skin.id} 
                                onClick={() => handlePurchaseOrEquip(skin)}
                                className={cn(
                                    "relative aspect-[4/5] border flex flex-col justify-between group cursor-pointer transition-all overflow-hidden hover:scale-[1.02]",
                                    isEquipped ? "border-green-500 bg-green-500/5" : borderColor,
                                    bgGlow
                                )}
                            >
                                {/* Image Layer */}
                                <div className="absolute inset-0 z-0">
                                    <Image 
                                        src={skin.src} 
                                        alt={skin.name} 
                                        fill 
                                        className={cn("object-cover transition-all duration-500", !isOwned && "grayscale opacity-60", "group-hover:grayscale-0 group-hover:opacity-100")} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                                </div>

                                {/* Status Badges */}
                                <div className="relative z-10 p-2 flex justify-between items-start">
                                    {isEquipped && <div className="bg-green-500 text-black text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest">Equipped</div>}
                                    {skin.rarity && !isEquipped && <div className={cn("text-[7px] font-black px-1.5 py-0.5 uppercase tracking-widest border", skin.rarity === "legendary" ? "text-yellow-500 border-yellow-500" : "text-neutral-400 border-neutral-600")}>{skin.rarity}</div>}
                                </div>

                                {/* Bottom Info */}
                                <div className="relative z-10 p-3 text-center">
                                    <h4 className="text-[10px] font-bold text-white uppercase truncate mb-1">{skin.name}</h4>
                                    
                                    {isBuying ? (
                                        <span className="text-[9px] font-mono text-yellow-500 animate-pulse">PROCESSING...</span>
                                    ) : isOwned ? (
                                        <span className="text-[9px] font-mono text-neutral-400 uppercase flex items-center justify-center gap-1">
                                            {isEquipped ? "ACTIVE" : "OWNED"}
                                        </span>
                                    ) : (
                                        <div className={cn("text-[10px] font-mono font-bold flex items-center justify-center gap-1", isAffordable ? "text-yellow-500" : "text-red-500")}>
                                            {isAffordable ? <ShoppingCart size={10} /> : <Lock size={10} />}
                                            {skin.cost} PC
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === "SETTINGS" && (
                <div className="space-y-6 max-w-md">
                    {/* INSTAGRAM BIND */}
                    <div className="space-y-2">
                        <label className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Digital_Footprint (Instagram)</label>
                        <div className="flex gap-2">
                            <Input 
                                value={igHandle}
                                onChange={(e) => setIgHandle(e.target.value)}
                                placeholder="@HANDLE"
                                disabled={!!userData?.instagramHandle}
                                className="bg-black/50 border-white/10 text-[10px] h-10 font-mono text-white rounded-none"
                            />
                            {!userData?.instagramHandle && (
                                <Button onClick={handleBindInstagram} disabled={isBinding} className="h-10 bg-white text-black font-bold text-[9px] w-24 rounded-none border border-white">
                                    {isBinding ? "..." : "BIND"}
                                </Button>
                            )}
                        </div>
                        {userData?.instagramHandle && <p className="text-[8px] text-green-500 font-mono flex items-center gap-1"><CheckCircle2 size={10} /> LINK_ESTABLISHED</p>}
                    </div>

                    <div className="h-[1px] bg-white/10 w-full my-4" />

                    <Button onClick={handleLogout} className="w-full h-12 bg-red-950/20 text-red-500 border border-red-900/30 hover:bg-red-900/20 hover:text-red-400 font-bold text-[10px] tracking-widest uppercase rounded-sm flex items-center gap-2">
                        <LogOut size={14} /> Disconnect_System
                    </Button>
                </div>
            )}

        </section>

      </div>

      {/* --- EDIT NAME MODAL --- */}
      {showNameEdit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
            <div className="w-full max-w-xs bg-neutral-900 border border-white/20 p-6 space-y-6 shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-white" />
                <h3 className="text-xs font-black font-sans text-white uppercase flex items-center gap-2 tracking-widest">
                    <Terminal size={12} className="text-red-500" /> Reassign_Codename
                </h3>
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value.toUpperCase())} className="bg-black border-white/10 text-white font-mono font-bold text-sm h-12 text-center uppercase rounded-none focus:border-red-500" placeholder="NEW_ALIAS" />
                <div className="flex gap-2">
                    <Button onClick={handleNameUpdate} className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold text-[9px] h-10 uppercase rounded-none">Confirm</Button>
                    <Button onClick={() => setShowNameEdit(false)} variant="ghost" className="text-[9px] uppercase font-bold text-neutral-500 hover:text-white rounded-none">Cancel</Button>
                </div>
            </div>
        </div>
      )}

    </main>
  );
}