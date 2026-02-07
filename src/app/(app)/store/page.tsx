"use client";

import React, { useState } from "react";
import Image from "next/image"; 
import { 
  CreditCard, Lock, Key, Zap, ArrowLeft, Gem,
  Database, ShieldAlert, ShoppingCart, Globe, 
  Smartphone, X, ScanLine, Box, Newspaper, Megaphone, CheckCircle2
} from "lucide-react";
import { doc, updateDoc, increment, arrayUnion, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Background } from "@/components/ui/background";
import { Button } from "@/components/ui/button";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { Badge } from "@/components/ui/badge";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

const MERCHANT = {
  vpa: "iznoatwork@okicici", 
  name: "Boyz_N_Galz_Armory"
};

// --- DATA: CURRENCY ---
const SUPPLY_DROPS = [
  { id: "drop_s", name: "Recruit Stash", amount: 500, price: 299, tag: "STARTER" },
  { id: "drop_m", name: "Soldier Crate", amount: 1200, price: 899, tag: "POPULAR" },
  { id: "drop_l", name: "Warlord Chest", amount: 3000, price: 2499, tag: "VALUE" },
  { id: "drop_xl", name: "God Mode", amount: 8000, price: 4999, tag: "WHALE" },
];

// --- DATA: ITEMS ---
const BLACK_MARKET = [
  { id: "key_niche", name: "Colony Key", description: "Unlock new battle zones.", icon: <Key className="text-yellow-500" />, cost: 100, type: "ACCESS" },
  { id: "boost_speed", name: "Adrenaline", description: "2x Kill Speed for 1hr.", icon: <Zap className="text-red-500" />, cost: 50, type: "BOOST" },
  { id: "contract_followers", name: "Mercenary Squad", description: "Gain 50 loyal soldiers.", icon: <Database className="text-white" />, cost: 500, type: "GROWTH" },
  { id: "intel_leak", name: "Spy Network", description: "See who viewed your profile.", icon: <Globe className="text-green-500" />, cost: 25, type: "INTEL" }
];

// --- DATA: PR PACKAGES (New) ---
const AGENCY_PACKS = [
    { 
        id: "pr_starter", 
        name: "The Debut", 
        price: 4999, 
        features: ["1 Global Press Release", "Google News Indexing", "Distribution to 100+ Sites", "verified_ready Tag"],
        icon: <Newspaper size={32} className="text-white" />,
        tag: "ESSENTIAL"
    },
    { 
        id: "pr_growth", 
        name: "Viral Vector", 
        price: 14999, 
        features: ["3 Major Articles", "Yahoo Finance Feature", "Instagram Blue Tick Support", "Dedicated PR Manager"],
        icon: <Megaphone size={32} className="text-yellow-500" />,
        tag: "POPULAR"
    },
    { 
        id: "pr_celeb", 
        name: "Icon Status", 
        price: 49999, 
        features: ["Full Media Takeover", "Forbes/Entrepreneur Mention", "Wikipedia Page Draft", "Lifetime Elite Membership"],
        icon: <Gem size={32} className="text-purple-500" />,
        tag: "LEGENDARY"
    }
];

export default function StorePage() {
  const { play } = useSfx();
  const { user, userData, loading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"MINT" | "MARKET" | "AGENCY">("MINT");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const popCoins = userData?.wallet?.popCoins || 0;

  // --- HANDLER: PURCHASE FLOW ---
  const handlePurchase = async (item: any, type: "fiat" | "points") => {
    if (!user) return;

    // 1. FIAT PURCHASE (Minting / Agency) -> SHOW QR
    if (type === "fiat") {
        play("click");
        const txnRef = `${user.uid.substring(0,4)}_${Date.now().toString().slice(-4)}`;
        // Note: For PR, we might want a different note
        const note = activeTab === "AGENCY" ? `PR_ORDER: ${item.name}` : item.name;
        
        const upiUrl = `upi://pay?pa=${MERCHANT.vpa}&pn=${MERCHANT.name}&am=${item.price}&cu=INR&tn=${note}`;
        
        setCurrentOrder({ ...item, upiUrl, txnRef });
        setShowQR(true);

        // Log Intent
        try {
            await addDoc(collection(db, "payment_attempts"), {
                uid: user.uid,
                username: userData?.username || "Unknown",
                item: item.name,
                type: activeTab, // "MINT" or "AGENCY"
                amount: item.price,
                status: "QR_Generated",
                txnRef,
                timestamp: new Date().toISOString()
            });
        } catch(e) { console.error("Log failed", e); }
        return;
    }

    // 2. POINTS PURCHASE (Black Market) -> DIRECT DEDUCT
    if (type === "points") {
        if (popCoins < item.cost) {
            play("error");
            toast.error(`INSUFFICIENT FUNDS // NEED ${item.cost} POINTS`);
            return;
        }

        if (confirm(`CONFIRM PURCHASE: ${item.name} for ${item.cost} PTS?`)) {
            setProcessing(item.id);
            play("kaching");
            try {
                const userRef = doc(db, "users", user.uid);
                await updateDoc(userRef, {
                    "wallet.popCoins": increment(-item.cost),
                    "inventory": arrayUnion({
                        itemId: item.id,
                        name: item.name,
                        purchasedAt: new Date().toISOString()
                    })
                });
                play("success");
                toast.success(`ITEM ACQUIRED: ${item.name}`);
            } catch (e) {
                play("error");
                toast.error("TRANSACTION FAILED");
            } finally {
                setProcessing(null);
            }
        }
    }
  };

  if (loading) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-red-900 selection:text-white">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/store-bg.jpg" alt="Black Market" fill priority className="object-cover opacity-20 grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />

      {/* --- TOP NAV --- */}
      <nav className="relative z-50 p-6 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
            <TransitionLink href="/dashboard" onClick={() => play("hover")} className="w-10 h-10 border border-white/10 bg-black/40 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all rounded-sm">
              <ArrowLeft size={18} />
            </TransitionLink>
            <div>
                <h1 className="text-xl font-black font-sans tracking-tighter italic uppercase text-white">The_Armory</h1>
                <p className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">Global_Supply_Chain</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="block text-[7px] font-mono text-yellow-500/80 uppercase tracking-widest">War_Funds</span>
                <span className="text-xl font-black font-mono text-yellow-400 tracking-tighter tabular-nums">{popCoins.toLocaleString()}</span>
            </div>
        </div>
      </nav>

      {/* --- TABS --- */}
      <div className="relative z-40 max-w-6xl mx-auto w-full px-6 pt-8 pb-4 flex justify-center">
        <div className="flex bg-neutral-900/50 border border-white/10 backdrop-blur-md p-1 rounded-sm overflow-x-auto no-scrollbar">
            <button onClick={() => { setActiveTab("MINT"); play("click"); }} className={cn("px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 rounded-sm whitespace-nowrap", activeTab === "MINT" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white")}>
                <CreditCard size={12} /> Buy_Points
            </button>
            <button onClick={() => { setActiveTab("MARKET"); play("click"); }} className={cn("px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 rounded-sm whitespace-nowrap", activeTab === "MARKET" ? "bg-red-600 text-white shadow-lg" : "text-neutral-500 hover:text-white")}>
                <ShoppingCart size={12} /> Black_Market
            </button>
            <button onClick={() => { setActiveTab("AGENCY"); play("click"); }} className={cn("px-6 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 rounded-sm whitespace-nowrap", activeTab === "AGENCY" ? "bg-yellow-600 text-black shadow-lg" : "text-neutral-500 hover:text-white")}>
                <Globe size={12} /> The_Agency
            </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="relative z-40 max-w-6xl mx-auto w-full px-6 pb-20 overflow-y-auto no-scrollbar h-full">
        
        {/* 1. MINT (Points) */}
        {activeTab === "MINT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                {SUPPLY_DROPS.map((item) => (
                    <div key={item.id} className="group relative bg-neutral-900/40 border border-white/10 hover:border-yellow-500 hover:bg-yellow-950/10 transition-all p-6 flex flex-col justify-between h-64 overflow-hidden rounded-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity"><Box size={40} className="text-yellow-500" /></div>
                        <div className="space-y-2 relative z-10">
                            <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 text-[8px] tracking-widest mb-2 rounded-none">{item.tag}</Badge>
                            <h3 className="text-lg font-black font-sans italic uppercase text-white group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{item.amount.toLocaleString()}</span>
                                <span className="text-[10px] font-mono text-neutral-500">PTS</span>
                            </div>
                        </div>
                        <Button onClick={() => handlePurchase(item, "fiat")} className="w-full bg-white/5 border border-white/10 hover:bg-green-600 hover:text-white hover:border-green-500 transition-all text-[9px] font-black tracking-[0.2em] uppercase h-10 mt-4 group/btn rounded-none">
                            <span className="group-hover/btn:hidden">₹{item.price} INR</span>
                            <span className="hidden group-hover/btn:flex items-center gap-2">PAY NOW <Smartphone size={12}/></span>
                        </Button>
                    </div>
                ))}
            </div>
        )}

        {/* 2. MARKET (Items) */}
        {activeTab === "MARKET" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {BLACK_MARKET.map((item) => (
                    <div key={item.id} className="relative bg-neutral-900/40 border border-white/10 hover:border-red-500/50 p-6 flex items-center gap-6 group transition-all rounded-sm">
                        <div className="w-16 h-16 bg-black border border-white/5 flex items-center justify-center rounded-none group-hover:scale-110 transition-transform">{item.icon}</div>
                        <div className="flex-1 space-y-1">
                            <Badge variant="secondary" className="bg-white/5 text-white/40 text-[7px] tracking-widest mb-1 rounded-none">{item.type}</Badge>
                            <h3 className="text-sm font-black font-sans uppercase text-white">{item.name}</h3>
                            <p className="text-[9px] font-mono text-neutral-500 leading-relaxed uppercase">{item.description}</p>
                            <div className="pt-3 flex items-center justify-between">
                                <span className={cn("text-sm font-black font-mono", popCoins >= item.cost ? "text-yellow-400" : "text-red-500")}>{item.cost} PTS</span>
                                <Button size="sm" onClick={() => handlePurchase(item, "points")} disabled={processing === item.id || popCoins < item.cost} className={cn("h-7 text-[8px] font-bold tracking-widest uppercase rounded-none", popCoins >= item.cost ? "bg-white text-black hover:bg-neutral-200" : "bg-white/5 text-white/20")}>
                                    {processing === item.id ? "SYNC..." : "BUY"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* 3. AGENCY (PR Services) */}
        {activeTab === "AGENCY" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black font-sans italic uppercase text-yellow-500 tracking-tighter">Global Influence Protocol</h2>
                    <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest max-w-md mx-auto">
                        Deploy your narrative to the world. <br/> AccessWire press releases, verified articles, and celebrity status.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {AGENCY_PACKS.map((pack) => (
                        <div key={pack.id} className="relative bg-neutral-900/60 border border-yellow-500/20 hover:border-yellow-500 p-8 flex flex-col items-center text-center gap-6 group transition-all rounded-sm overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50" />
                            
                            <div className="w-20 h-20 bg-black border border-white/5 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform shadow-2xl">
                                {pack.icon}
                            </div>

                            <div className="space-y-2">
                                <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] rounded-none">{pack.tag}</Badge>
                                <h3 className="text-xl font-black font-sans uppercase text-white">{pack.name}</h3>
                                <p className="text-2xl font-mono font-bold text-white">₹{pack.price.toLocaleString()}</p>
                            </div>

                            <ul className="space-y-3 w-full text-left bg-black/40 p-4 border border-white/5">
                                {pack.features.map((feat, i) => (
                                    <li key={i} className="flex items-center gap-2 text-[9px] font-mono text-neutral-300 uppercase">
                                        <CheckCircle2 size={10} className="text-green-500" /> {feat}
                                    </li>
                                ))}
                            </ul>

                            <Button onClick={() => handlePurchase(pack, "fiat")} className="w-full h-12 bg-yellow-600 hover:bg-yellow-500 text-black font-black uppercase tracking-widest rounded-none mt-auto">
                                Purchase Contract
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>

      {/* --- QR CODE MODAL --- */}
      {showQR && currentOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowQR(false)} />
              <div className="relative bg-black border border-white/20 p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"><X size={20} /></button>
                  <div className="flex flex-col items-center space-y-6">
                      <div className="flex items-center gap-2 text-yellow-500 mb-2">
                          <ScanLine className="animate-pulse" size={20} />
                          <span className="font-black font-sans text-lg tracking-widest uppercase">Secure_Gateway</span>
                      </div>
                      <div className="p-4 bg-white border-4 border-yellow-500">
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentOrder.upiUrl)}`} alt="Scan to Pay" className="w-48 h-48 mix-blend-multiply" />
                      </div>
                      <div className="text-center space-y-1">
                          <p className="text-white font-black text-2xl font-mono">₹{currentOrder.price.toLocaleString()}</p>
                          <p className="text-neutral-500 text-[10px] font-mono uppercase tracking-widest">{currentOrder.name}</p>
                          <p className="text-neutral-600 text-[8px] font-mono uppercase">Ref: {currentOrder.txnRef}</p>
                      </div>
                      <Button onClick={() => window.location.href = currentOrder.upiUrl} className="w-full bg-green-600 hover:bg-green-500 text-white font-black h-12 uppercase tracking-widest rounded-none shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all active:scale-95">
                          PAY VIA APP <Smartphone size={16} className="ml-2" />
                      </Button>
                  </div>
              </div>
          </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/95 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[8px] font-mono text-neutral-600">
            <ShieldAlert size={10} className="text-yellow-500" />
            <span>ENCRYPTED_TRANSACTION_LAYER // V4.0</span>
          </div>
      </footer>

    </main>
  );
}