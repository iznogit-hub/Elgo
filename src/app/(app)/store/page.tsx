"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; 
import { 
  CreditCard, Package, Megaphone, ArrowLeft, 
  ShoppingCart, Smartphone, Box, Sparkles, Diamond,
} from "lucide-react";
import { doc, updateDoc, increment, arrayUnion, addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { Badge } from "@/components/ui/badge";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HackerText } from "@/components/ui/hacker-text";

const MERCHANT = {
  vpa: "iznoatwork@okicici", 
  name: "Boyz_N_Galz_Armory"
};

// EXPANDED SUPPLY DROPS
const SUPPLY_DROPS = [
  { id: "drop_xs", name: "Recon Pack", amount: 300, price: 199, tag: "NEW" },
  { id: "drop_s", name: "Recruit Stash", amount: 800, price: 499, tag: "STARTER" },
  { id: "drop_m", name: "Soldier Crate", amount: 2000, price: 1499, tag: "POPULAR" },
  { id: "drop_l", name: "Elite Cache", amount: 5000, price: 3499, tag: "BEST VALUE" },
  { id: "drop_xl", name: "Warlord Vault", amount: 12000, price: 7999, tag: "WHALE" },
  { id: "drop_god", name: "God Mode Bundle", amount: 25000, price: 14999, tag: "LIMITED", limited: true },
];

// EXPANDED BLACK MARKET ITEMS
const BLACK_MARKET = [
  { id: "boost_speed", name: "Adrenaline Surge", desc: "2x Mission Speed • 2 Hours", icon: "/items/boost_speed.jpg", cost: 150, rarity: "rare" },
  { id: "boost_loot", name: "Loot Magnet", desc: "+50% Loot Chance • 4 Hours", icon: "/items/boost_loot.jpg", cost: 300, rarity: "epic" },
  { id: "boost_energy", name: "Infinite Energy", desc: "Unlimited Energy • 1 Hour", icon: "/items/boost_energy.jpg", cost: 500, rarity: "legendary" },
  { id: "key_niche", name: "Sector Key", desc: "Instant Unlock 1 New Colony", icon: "/items/key_niche.jpg", cost: 800, rarity: "rare" },
  { id: "key_vip", name: "Inner Circle Pass", desc: "Permanent Elite Tier Access", icon: "/items/key_vip.jpg", cost: 5000, rarity: "mythic" },
  { id: "skin_legend", name: "Legendary Skin Pack", desc: "3 Exclusive Avatars", icon: "/items/skin_legend.jpg", cost: 1200, rarity: "epic" },
  { id: "title_warlord", name: "Warlord Title", desc: "Custom Chat Badge + Crown", icon: "/items/title_warlord.jpg", cost: 2000, rarity: "legendary" },
  { id: "growth_squad", name: "Mercenary Contract", desc: "+100 Auto-Recruits", icon: "/items/growth_squad.jpg", cost: 1000, rarity: "rare" },
];

// BUNDLES
const BUNDLES = [
  { id: "bundle_starter", name: "Operator Bundle", items: ["Recruit Stash", "Adrenaline", "Sector Key"], original: 1748, price: 1299, tag: "60% OFF" },
  { id: "bundle_pro", name: "Dominance Bundle", items: ["Soldier Crate", "Loot Magnet", "Legendary Skin"], original: 4499, price: 2999, tag: "HOT" },
  { id: "bundle_god", name: "Ascension Bundle", items: ["Warlord Vault", "God Mode Boost", "Warlord Title", "Inner Circle Pass"], original: 24999, price: 14999, tag: "LIMITED TIME" },
];

// EXPANDED AGENCY
const AGENCY_PACKS = [
  { id: "pr_debut", name: "The Debut", price: 7999, features: ["1 Global PR", "100+ News Sites", "Google Indexing", "Social Boost"], tag: "ENTRY" },
  { id: "pr_viral", name: "Viral Vector", price: 24999, features: ["3 Major Features", "Yahoo/Forbes Potential", "Instagram Verification Assist", "1M Reach Campaign"], tag: "POPULAR" },
  { id: "pr_icon", name: "Icon Status", price: 79999, features: ["Full Media Domination", "Guaranteed Major Publication", "Wikipedia Draft", "Lifetime VIP + Custom Skin"], tag: "LEGENDARY" },
  { id: "pr_empire", name: "Empire Builder", price: 199999, features: ["Everything in Icon + TV Interview Slot", "Brand Partnership Intro", "Personal PR Team 6 Months"], tag: "WHALE ONLY" },
];

const getRarityStyle = (rarity: string) => {
  switch (rarity) {
    case "mythic": return { border: "border-purple-500/80", glow: "shadow-purple-600/60", tag: "bg-purple-600" };
    case "legendary": return { border: "border-yellow-500/80", glow: "shadow-yellow-600/60", tag: "bg-yellow-600" };
    case "epic": return { border: "border-red-500/70", glow: "shadow-red-600/50", tag: "bg-red-600" };
    case "rare": return { border: "border-cyan-500/60", glow: "shadow-cyan-600/40", tag: "bg-cyan-600" };
    default: return { border: "border-white/30", glow: "", tag: "bg-neutral-700" };
  }
};

export default function StorePage() {
  const { play } = useSfx();
  const { user, userData, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"MINT" | "MARKET" | "BUNDLES" | "AGENCY">("MINT");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);

  const popCoins = userData?.wallet?.popCoins ?? 0;

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (doc) => {
      setInventory(doc.data()?.inventory || []);
    });
    return unsub;
  }, [user]);

  const handlePurchase = async (item: any, type: "fiat" | "points") => {
    if (!user) return;

    if (type === "fiat") {
      play("click");
      const txnRef = `${user.uid.substring(0,6)}_${Date.now()}`;
      const note = `${activeTab.toUpperCase()}: ${item.name}`;
      const upiUrl = `upi://pay?pa=${MERCHANT.vpa}&pn=${MERCHANT.name}&am=${item.price}&cu=INR&tn=${note}`;
      
      setCurrentOrder({ ...item, upiUrl, txnRef });
      setShowQR(true);

      try {
        await addDoc(collection(db, "payment_attempts"), {
          uid: user.uid,
          username: userData?.username,
          item: item.name,
          type: activeTab,
          amount: item.price,
          status: "QR_Shown",
          txnRef,
          timestamp: new Date().toISOString()
        });
      } catch(e) {}
      return;
    }

    if (type === "points") {
      if (popCoins < item.cost) {
        play("error");
        toast.error(`INSUFFICIENT PC // GRIND HARDER`);
        return;
      }

      if (!confirm(`DEPLOY ${item.cost} PC FOR ${item.name.toUpperCase()}?`)) return;

      setProcessing(item.id);
      play("kaching");
      try {
        await updateDoc(doc(db, "users", user.uid), {
          "wallet.popCoins": increment(-item.cost),
          inventory: arrayUnion({
            itemId: item.id,
            name: item.name,
            purchasedAt: new Date().toISOString()
          })
        });
        toast.success(`ACQUIRED: ${item.name.toUpperCase()}`);
        play("success");
      } catch (e) {
        toast.error("SYNC ERROR");
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleSell = async (item: any) => {
    if (!confirm(`SELL ${item.name.toUpperCase()} FOR ${(item.cost * 0.5).toFixed(0)} PC?`)) return;
    play("kaching");
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        "wallet.popCoins": increment(Math.floor(item.cost * 0.5))
      });
      toast.success(`SOLD // +${Math.floor(item.cost * 0.5)} PC`);
    } catch (e) {
      toast.error("MARKET CRASH");
    }
  };

  if (loading) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-yellow-900 selection:text-black">
      
      {/* ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/store-bg.jpg" alt="Armory" fill priority className="object-cover opacity-15 grayscale contrast-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-600/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      <SoundPrompter />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-8 border-yellow-900/60 bg-black/90 backdrop-blur-2xl">
        <div className="px-8 py-6 flex items-center justify-between">
          <TransitionLink href="/dashboard" className="flex items-center gap-6 group">
            <div className="w-16 h-16 border-4 border-yellow-600/40 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-yellow-400 transition-all">
              <ArrowLeft size={40} className="text-neutral-500 group-hover:text-yellow-400" />
            </div>
            <div>
              <HackerText text="THE_ARMORY" className="text-5xl font-black text-yellow-400" />
              <span className="block text-sm font-mono text-yellow-600 uppercase tracking-widest">Black_Market_Protocol_v9</span>
            </div>
          </TransitionLink>

          <div className="flex items-center gap-12">
            <div className="text-right">
              <span className="text-lg font-mono text-neutral-500 uppercase">Vault Balance</span>
              <div className="flex items-center gap-6">
                <Diamond size={48} className="text-yellow-500 animate-pulse" />
                <span className="text-6xl font-black text-yellow-400 tabular-nums">{popCoins.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab("MINT")} className={cn("flex-1 py-6 text-xl font-black uppercase tracking-widest transition-all", activeTab === "MINT" ? "bg-gradient-to-b from-yellow-600 to-yellow-400 text-black border-t-8 border-yellow-300" : "text-neutral-600 hover:text-neutral-300")}>
            <CreditCard size={32} className="inline mr-4" /> Mint_PC
          </button>
          <button onClick={() => setActiveTab("MARKET")} className={cn("flex-1 py-6 text-xl font-black uppercase tracking-widest transition-all", activeTab === "MARKET" ? "bg-gradient-to-b from-red-600 to-red-400 text-white border-t-8 border-red-300" : "text-neutral-600 hover:text-neutral-300")}>
            <ShoppingCart size={32} className="inline mr-4" /> Market
          </button>
          <button onClick={() => setActiveTab("BUNDLES")} className={cn("flex-1 py-6 text-xl font-black uppercase tracking-widest transition-all", activeTab === "BUNDLES" ? "bg-gradient-to-b from-purple-600 to-purple-400 text-white border-t-8 border-purple-300" : "text-neutral-600 hover:text-neutral-300")}>
            <Package size={32} className="inline mr-4" /> Bundles
          </button>
          <button onClick={() => setActiveTab("AGENCY")} className={cn("flex-1 py-6 text-xl font-black uppercase tracking-widest transition-all", activeTab === "AGENCY" ? "bg-gradient-to-b from-cyan-600 to-cyan-400 text-black border-t-8 border-cyan-300" : "text-neutral-600 hover:text-neutral-300")}>
            <Megaphone size={32} className="inline mr-4" /> Agency
          </button>
        </div>
      </header>

      {/* MAIN SHOP */}
      <div className="relative z-40 flex-1 overflow-hidden p-8">
        <ScrollArea className="h-full pr-6">

          {/* MINT TAB */}
          {activeTab === "MINT" && (
            <div>
              <HackerText text="PC_MINTING_VAULT" className="text-5xl font-black text-yellow-400 mb-12 text-center" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {SUPPLY_DROPS.map((drop) => (
                  <div key={drop.id} className={cn("relative bg-gradient-to-b from-neutral-900/80 to-black border-4 rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105", drop.limited && "border-yellow-500/80 shadow-yellow-600/60 animate-pulse")}>
                    {drop.limited && <Badge className="absolute top-4 right-4 bg-red-600 text-white text-lg px-4">LIMITED</Badge>}
                    <div className="p-8 text-center">
                      <Box size={120} className="text-yellow-500 mx-auto mb-6" />
                      <Badge className="mb-4 bg-yellow-600 text-black">{drop.tag}</Badge>
                      <h3 className="text-3xl font-black uppercase mb-4">{drop.name}</h3>
                      <div className="text-6xl font-black text-yellow-400 mb-2">{drop.amount.toLocaleString()}</div>
                      <p className="text-lg font-mono text-neutral-400 mb-8">PC INSTANT</p>
                      <Button onClick={() => handlePurchase(drop, "fiat")} className="w-full py-8 text-2xl font-black bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300">
                        ₹{drop.price} • PAY NOW
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MARKET TAB */}
          {activeTab === "MARKET" && (
            <div>
              <HackerText text="BLACK_MARKET_EXCHANGE" className="text-5xl font-black text-red-400 mb-12 text-center" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {BLACK_MARKET.map((item) => {
                  const rarity = getRarityStyle(item.rarity || "rare");
                  const owned = inventory.some(i => i.itemId === item.id);
                  return (
                    <div key={item.id} className={cn("relative bg-black/80 border-4 rounded-3xl overflow-hidden shadow-2xl transition-all hover:scale-105", rarity.border, rarity.glow)}>
                      <div className="aspect-video relative">
                        <div className={cn("absolute inset-0 bg-gradient-to-br from-black to-neutral-900 flex items-center justify-center")}>
                            <Box size={64} className="text-white/20" />
                        </div>
                        <Badge className={cn("absolute top-4 left-4 text-lg px-4", rarity.tag)}>{item.rarity.toUpperCase()}</Badge>
                        {owned && <Badge className="absolute top-4 right-4 bg-green-600 text-black text-lg px-4">OWNED</Badge>}
                      </div>
                      <div className="p-8 text-center">
                        <h3 className="text-3xl font-black uppercase mb-4">{item.name}</h3>
                        <p className="text-lg font-mono text-neutral-300 mb-8 uppercase">{item.desc}</p>
                        <div className="flex items-center justify-center gap-4 mb-8">
                          <Diamond size={40} className="text-yellow-500" />
                          <span className="text-5xl font-black text-yellow-400">{item.cost}</span>
                        </div>
                        {owned ? (
                          <Button onClick={() => handleSell(item)} className="w-full py-6 text-2xl font-black bg-red-600 hover:bg-red-500">
                            SELL FOR {Math.floor(item.cost * 0.5)} PC
                          </Button>
                        ) : (
                          <Button onClick={() => handlePurchase(item, "points")} disabled={processing === item.id || popCoins < item.cost} className="w-full py-6 text-2xl font-black bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300">
                            {processing === item.id ? "SYNCING..." : "ACQUIRE"}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BUNDLES TAB */}
          {activeTab === "BUNDLES" && (
            <div>
              <HackerText text="LIMITED_EDITION_BUNDLES" className="text-5xl font-black text-purple-400 mb-12 text-center" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {BUNDLES.map((bundle) => (
                  <div key={bundle.id} className="relative bg-gradient-to-br from-purple-950/60 to-black border-4 border-purple-600/80 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all">
                    <Badge className="absolute top-6 right-6 bg-red-600 text-white text-2xl px-6 py-2">{bundle.tag}</Badge>
                    <div className="p-10 text-center">
                      <Package size={140} className="text-purple-500 mx-auto mb-8" />
                      <h3 className="text-4xl font-black uppercase mb-6">{bundle.name}</h3>
                      <div className="space-y-4 mb-10">
                        {bundle.items.map((it, i) => (
                          <div key={i} className="text-xl font-mono text-purple-300 uppercase">{it}</div>
                        ))}
                      </div>
                      <div className="flex items-center justify-center gap-6 mb-8">
                        <span className="text-3xl font-mono text-neutral-500 line-through">₹{bundle.original}</span>
                        <span className="text-6xl font-black text-purple-400">₹{bundle.price}</span>
                      </div>
                      <Button onClick={() => handlePurchase({ ...bundle, price: bundle.price }, "fiat")} className="w-full py-8 text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-500 hover:to-purple-300">
                        GRAB BUNDLE
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AGENCY TAB */}
          {activeTab === "AGENCY" && (
            <div>
              <HackerText text="GLOBAL_INFLUENCE_AGENCY" className="text-5xl font-black text-cyan-400 mb-12 text-center" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {AGENCY_PACKS.map((pack) => (
                  <div key={pack.id} className="relative bg-gradient-to-b from-cyan-950/60 to-black border-4 border-cyan-600/80 rounded-3xl overflow-hidden shadow-2xl hover:scale-105 transition-all">
                    <Badge className="absolute top-6 left-6 bg-cyan-600 text-black text-xl px-4">{pack.tag}</Badge>
                    <div className="p-10 text-center">
                      <Megaphone size={120} className="text-cyan-500 mx-auto mb-8" />
                      <h3 className="text-4xl font-black uppercase mb-6">{pack.name}</h3>
                      <div className="text-6xl font-black text-cyan-400 mb-10">₹{pack.price.toLocaleString()}</div>
                      <ul className="space-y-4 text-left mb-12">
                        {pack.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-4 text-lg font-mono text-cyan-300">
                            <Sparkles size={24} className="text-yellow-500" /> {f}
                          </li>
                        ))}
                      </ul>
                      <Button onClick={() => handlePurchase(pack, "fiat")} className="w-full py-8 text-3xl font-black bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300">
                        DEPLOY CAMPAIGN
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </ScrollArea>
      </div>

      {/* QR MODAL */}
      {showQR && currentOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-8 bg-black/95 backdrop-blur-xl">
          <div className="relative bg-gradient-to-b from-neutral-900 to-black border-8 border-yellow-600/80 rounded-3xl p-12 max-w-lg w-full shadow-2xl">
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-neutral-400 hover:text-white text-4xl">×</button>
            <HackerText text="SECURE PAYMENT GATEWAY" className="text-5xl font-black text-yellow-400 mb-8 text-center" />
            <div className="bg-white p-8 rounded-2xl mb-10">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentOrder.upiUrl)}`} alt="QR" className="w-full" />
            </div>
            <div className="text-center space-y-4">
              <div className="text-6xl font-black text-yellow-400">₹{currentOrder.price.toLocaleString()}</div>
              <p className="text-2xl font-mono uppercase">{currentOrder.name}</p>
              <p className="text-lg text-neutral-400">Ref: {currentOrder.txnRef}</p>
            </div>
            <Button onClick={() => window.location.href = currentOrder.upiUrl} className="w-full mt-12 py-10 text-4xl font-black bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 shadow-2xl shadow-green-600/60">
              OPEN PAYMENT APP <Smartphone size={48} className="ml-6" />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}