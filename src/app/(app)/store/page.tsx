"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image"; 
import { 
  CreditCard, Package, Megaphone, ArrowLeft, 
  ShoppingCart, Smartphone, Box, Sparkles, Database,
  TrendingUp, Activity, Layers, Terminal,
  ArrowRight
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
  name: "PortalZ_Global_Exchange"
};

// CAPITAL INJECTIONS (Formerly Supply Drops)
const SUPPLY_DROPS = [
  { id: "drop_xs", name: "Micro Injection", amount: 300, price: 199, tag: "ENTRY" },
  { id: "drop_s", name: "Seed Capital", amount: 800, price: 499, tag: "STARTER" },
  { id: "drop_m", name: "Series A Allocation", amount: 2000, price: 1499, tag: "POPULAR" },
  { id: "drop_l", name: "Series B Allocation", amount: 5000, price: 3499, tag: "EFFICIENT" },
  { id: "drop_xl", name: "Institutional Fund", amount: 12000, price: 7999, tag: "WHALE" },
  { id: "drop_god", name: "Sovereign Wealth", amount: 25000, price: 14999, tag: "LIQUIDITY MAX", limited: true },
];

// ASSET MARKET (Formerly Black Market)
const BLACK_MARKET = [
  { id: "boost_speed", name: "Algorithmic Routing", desc: "2x Processing Speed • 2 Hours", icon: "/items/boost_speed.jpg", cost: 150, rarity: "rare" },
  { id: "boost_loot", name: "Yield Multiplier", desc: "+50% Extraction Rate • 4 Hours", icon: "/items/boost_loot.jpg", cost: 300, rarity: "epic" },
  { id: "boost_energy", name: "Unmetered Bandwidth", desc: "Infinite Action State • 1 Hour", icon: "/items/boost_energy.jpg", cost: 500, rarity: "legendary" },
  { id: "key_niche", name: "Market Sector Key", desc: "Unlock 1 New Yield Vector", icon: "/items/key_niche.jpg", cost: 800, rarity: "rare" },
  { id: "key_vip", name: "Boardroom Access", desc: "Permanent Executive Tier", icon: "/items/key_vip.jpg", cost: 5000, rarity: "mythic" },
  { id: "skin_legend", name: "Executive Identity Pack", desc: "3 High-Status Avatars", icon: "/items/skin_legend.jpg", cost: 1200, rarity: "epic" },
  { id: "title_warlord", name: "Principal Designation", desc: "Custom Protocol Badge", icon: "/items/title_warlord.jpg", cost: 2000, rarity: "legendary" },
  { id: "growth_squad", name: "Automation Protocol", desc: "+100 Auto-Generated Leads", icon: "/items/growth_squad.jpg", cost: 1000, rarity: "rare" },
];

// CORPORATE BUNDLES
const BUNDLES = [
  { id: "bundle_starter", name: "Startup Package", items: ["Seed Capital", "Algorithmic Routing", "Market Key"], original: 1748, price: 1299, tag: "OPTIMIZED" },
  { id: "bundle_pro", name: "Enterprise Suite", items: ["Series A Allocation", "Yield Multiplier", "Executive Pack"], original: 4499, price: 2999, tag: "HIGH YIELD" },
  { id: "bundle_god", name: "Monopoly Syndicate", items: ["Institutional Fund", "Unmetered Bandwidth", "Principal Designation", "Boardroom Access"], original: 24999, price: 14999, tag: "RESTRICTED" },
];

// PR AGENCY
const AGENCY_PACKS = [
  { id: "pr_debut", name: "Market Introduction", price: 7999, features: ["1 Global Press Release", "100+ Syndications", "SEO Indexing", "Network Push"], tag: "INITIAL" },
  { id: "pr_viral", name: "Viral Distribution", price: 24999, features: ["3 Tier-A Features", "Forbes/Yahoo Strategy", "Social Verification Support", "1M Impression Cap"], tag: "SCALING" },
  { id: "pr_icon", name: "Industry Icon", price: 79999, features: ["Media Monopoly Action", "Guaranteed Tier-S Publication", "Wikipedia Archiving", "Lifetime Boardroom Status"], tag: "EXECUTIVE" },
  { id: "pr_empire", name: "Global Empire", price: 199999, features: ["All Icon Features + TV Placement", "Strategic Partnerships", "Dedicated PR Firm (6 Mos)"], tag: "SOVEREIGN" },
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

export default function StorePage() {
  const { play } = useSfx();
  const { user, userData, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"CAPITAL" | "ASSETS" | "BUNDLES" | "AGENCY">("CAPITAL");
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
        toast.error(`INSUFFICIENT CAPITAL // INITIATE DEPOSIT`);
        return;
      }

      if (!confirm(`AUTHORIZE TRANSFER: ${item.cost} CREDITS FOR ${item.name.toUpperCase()}?`)) return;

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
        toast.error("LEDGER SYNC ERROR");
      } finally {
        setProcessing(null);
      }
    }
  };

  const handleSell = async (item: any) => {
    if (!confirm(`LIQUIDATE ${item.name.toUpperCase()} FOR ${(item.cost * 0.5).toFixed(0)} CAP?`)) return;
    play("kaching");
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        "wallet.popCoins": increment(Math.floor(item.cost * 0.5))
      });
      toast.success(`LIQUIDATED // +${Math.floor(item.cost * 0.5)} CAPITAL`);
    } catch (e) {
      toast.error("MARKET ERROR");
    }
  };

  if (loading) return null;

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-white selection:text-black">
      
      {/* ATMOSPHERE - Architectural Treatment */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image src="/images/store-bg.jpg" alt="Exchange" fill priority className="object-cover opacity-10 grayscale contrast-150 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />

      {/* TOP HUD - 1px Grid Architecture */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 border border-white/20 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
              <ArrowLeft size={20} className="text-white group-hover:text-black" />
            </div>
            <div>
              <HackerText text="GLOBAL_EXCHANGE" className="text-2xl font-medium tracking-widest uppercase" />
              <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-[0.2em] mt-1">Asset Management Protocol</span>
            </div>
          </TransitionLink>

          <div className="flex items-center gap-4 border border-white/10 p-2 bg-white/5">
            <div className="text-right px-4">
              <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Liquid Capital</span>
              <div className="flex items-center gap-2">
                <Database size={14} className="text-white animate-pulse" />
                <span className="text-2xl font-mono text-white leading-none tracking-tight">{popCoins.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* TABS - 1px Grid Navigation */}
        <div className="flex border-t border-white/10 bg-[#050505] overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab("CAPITAL")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "CAPITAL" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <CreditCard size={14} className="inline mr-2 mb-0.5" /> Capital_Mint
          </button>
          <button onClick={() => setActiveTab("ASSETS")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "ASSETS" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <ShoppingCart size={14} className="inline mr-2 mb-0.5" /> Asset_Market
          </button>
          <button onClick={() => setActiveTab("BUNDLES")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "BUNDLES" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <Package size={14} className="inline mr-2 mb-0.5" /> Corp_Bundles
          </button>
          <button onClick={() => setActiveTab("AGENCY")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors", activeTab === "AGENCY" ? "bg-white text-black font-bold" : "text-neutral-500 hover:text-white hover:bg-white/5")}>
            <Megaphone size={14} className="inline mr-2 mb-0.5" /> PR_Agency
          </button>
        </div>
      </header>

      {/* MAIN EXCHANGE CONTENT */}
      <div className="relative z-40 flex-1 overflow-hidden bg-[#050505]">
        <ScrollArea className="h-full">
          <div className="p-6 md:p-10 pb-32">

            {/* CAPITAL MINT TAB */}
            {activeTab === "CAPITAL" && (
              <div>
                <div className="mb-8 pb-4 border-b border-white/10">
                  <HackerText text="LIQUIDITY_INJECTIONS" className="text-xl font-medium tracking-widest uppercase mb-2" />
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Convert fiat currency into operational capital.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10 border border-white/10">
                  {SUPPLY_DROPS.map((drop) => (
                    <div key={drop.id} className={cn("relative bg-[#050505] flex flex-col justify-between p-8 hover:bg-white/5 transition-colors group", drop.limited && "bg-[#0a0a0a]")}>
                      
                      <div className="flex justify-between items-start mb-12">
                        <span className={cn("text-[10px] font-mono border px-3 py-1 uppercase tracking-widest", drop.limited ? "border-white text-white" : "border-white/20 text-neutral-400")}>
                          {drop.tag}
                        </span>
                        {drop.limited && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                      </div>

                      <div className="mb-10 text-center">
                        <h3 className="text-lg font-medium uppercase mb-2">{drop.name}</h3>
                        <div className="text-4xl font-mono text-white tracking-tighter mb-2">{drop.amount.toLocaleString()}</div>
                        <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Capital Issued</p>
                      </div>

                      <Button 
                        onClick={() => handlePurchase(drop, "fiat")} 
                        className="w-full h-14 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-mono text-xs uppercase tracking-widest rounded-none transition-colors"
                      >
                        Execute ₹{drop.price}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ASSET MARKET TAB */}
            {activeTab === "ASSETS" && (
              <div>
                <div className="mb-8 pb-4 border-b border-white/10">
                  <HackerText text="DIGITAL_ASSET_MARKET" className="text-xl font-medium tracking-widest uppercase mb-2" />
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Acquire operational upgrades using capital.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
                  {BLACK_MARKET.map((item) => {
                    const rarity = getRarityStyle(item.rarity || "rare");
                    const owned = inventory.some(i => i.itemId === item.id);
                    return (
                      <div key={item.id} className="relative bg-[#050505] flex flex-col justify-between hover:bg-white/5 transition-colors group">
                        
                        <div className="aspect-video relative border-b border-white/10 overflow-hidden bg-black flex items-center justify-center">
                          <Terminal size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-700" strokeWidth={1} />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                          <div className={cn("absolute top-4 left-4 text-[8px] font-mono font-bold uppercase tracking-widest border px-2 py-1", rarity.border, rarity.bg)}>
                            {item.rarity}
                          </div>
                          {owned && (
                            <div className="absolute top-4 right-4 bg-white text-black px-2 py-1 text-[8px] font-mono font-bold uppercase tracking-widest">
                              Installed
                            </div>
                          )}
                        </div>

                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-sm font-medium uppercase mb-2 tracking-widest">{item.name}</h3>
                          <p className="text-[10px] font-mono text-neutral-500 mb-8 uppercase leading-relaxed">{item.desc}</p>
                          
                          <div className="mt-auto">
                            {owned ? (
                              <Button 
                                onClick={() => handleSell(item)} 
                                className="w-full h-12 bg-transparent border border-white/20 text-neutral-400 hover:text-white hover:border-white font-mono text-[10px] uppercase tracking-widest rounded-none transition-colors"
                              >
                                Liquidate: +{Math.floor(item.cost * 0.5)} CAP
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handlePurchase(item, "points")} 
                                disabled={processing === item.id || popCoins < item.cost} 
                                className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-mono text-[10px] uppercase tracking-widest rounded-none flex items-center justify-between px-4 transition-colors"
                              >
                                <span>{processing === item.id ? "SYNCING..." : "Acquire"}</span>
                                <span className="font-bold">{item.cost}</span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CORPORATE BUNDLES TAB */}
            {activeTab === "BUNDLES" && (
              <div>
                <div className="mb-8 pb-4 border-b border-white/10">
                  <HackerText text="CORPORATE_BUNDLES" className="text-xl font-medium tracking-widest uppercase mb-2" />
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Optimized asset packages for rapid scaling.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
                  {BUNDLES.map((bundle) => (
                    <div key={bundle.id} className="relative bg-[#050505] p-10 flex flex-col justify-between hover:bg-[#0a0a0a] transition-colors">
                      
                      <div className="flex justify-between items-start mb-10">
                        <span className="text-[10px] font-mono border border-white px-3 py-1 uppercase tracking-widest bg-white text-black font-bold">
                          {bundle.tag}
                        </span>
                      </div>

                      <div className="mb-10">
                        <h3 className="text-2xl font-medium uppercase mb-6 tracking-tight">{bundle.name}</h3>
                        <ul className="space-y-3 border-l border-white/20 pl-4">
                          {bundle.items.map((it, i) => (
                            <li key={i} className="text-xs font-mono text-neutral-400 uppercase tracking-widest">{it}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-end gap-4 mb-6 border-t border-white/10 pt-6">
                          <span className="text-sm font-mono text-neutral-600 line-through">₹{bundle.original}</span>
                          <span className="text-3xl font-mono text-white tracking-tighter">₹{bundle.price}</span>
                        </div>
                        <Button 
                          onClick={() => handlePurchase({ ...bundle, price: bundle.price }, "fiat")} 
                          className="w-full h-14 bg-transparent border border-white/20 text-white hover:bg-white hover:text-black font-mono text-xs uppercase tracking-widest rounded-none transition-colors"
                        >
                          Execute Contract
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PR AGENCY TAB */}
            {activeTab === "AGENCY" && (
              <div>
                <div className="mb-8 pb-4 border-b border-white/10">
                  <HackerText text="GLOBAL_INFLUENCE_AGENCY" className="text-xl font-medium tracking-widest uppercase mb-2" />
                  <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Acquire media dominance and public verification.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-px bg-white/10 border border-white/10">
                  {AGENCY_PACKS.map((pack) => (
                    <div key={pack.id} className="relative bg-[#050505] p-8 flex flex-col justify-between hover:bg-white/5 transition-colors">
                      
                      <div className="mb-8 border-b border-white/10 pb-6">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-4">Tier: {pack.tag}</span>
                        <h3 className="text-xl font-medium uppercase mb-4 tracking-tight">{pack.name}</h3>
                        <div className="text-3xl font-mono text-white tracking-tighter">₹{pack.price.toLocaleString()}</div>
                      </div>

                      <ul className="space-y-4 mb-10 flex-1">
                        {pack.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-3 text-[10px] font-mono text-neutral-400 uppercase leading-relaxed tracking-widest">
                            <ArrowRight size={12} className="text-white/50 shrink-0 mt-0.5" /> {f}
                          </li>
                        ))}
                      </ul>

                      <Button 
                        onClick={() => handlePurchase(pack, "fiat")} 
                        className="w-full h-12 bg-white text-black hover:bg-neutral-200 font-mono text-[10px] uppercase tracking-[0.2em] rounded-none transition-colors"
                      >
                        Deploy Campaign
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>

      {/* SECURE PAYMENT MODAL - Brutalist Overlay */}
      {showQR && currentOrder && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative bg-[#050505] border border-white/20 p-10 max-w-md w-full shadow-2xl">
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
               <ArrowLeft size={20} className="rotate-180" />
            </button>
            
            <HackerText text="SECURE_GATEWAY" className="text-lg font-medium tracking-widest uppercase mb-8 border-b border-white/10 pb-4" />
            
            <div className="bg-white p-6 mb-8 flex items-center justify-center">
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentOrder.upiUrl)}`} alt="QR Code" className="w-full max-w-[200px]" />
            </div>
            
            <div className="text-left space-y-2 mb-8">
              <span className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Total Valuation</span>
              <div className="text-4xl font-mono text-white tracking-tighter">₹{currentOrder.price.toLocaleString()}</div>
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mt-4">Asset: {currentOrder.name}</p>
              <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Txn ID: {currentOrder.txnRef}</p>
            </div>

            <Button 
              onClick={() => window.location.href = currentOrder.upiUrl} 
              className="w-full h-14 bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-3"
            >
              Open External Gateway <Smartphone size={16} />
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}