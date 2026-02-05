"use client";

import React, { useState } from "react";
import { 
  CreditCard, Lock, Key, 
  Zap, ArrowLeft, Gem,
  Database, ShieldAlert,
  ShoppingCart, Globe, Smartphone
} from "lucide-react";

// 🔥 FIREBASE IMPORTS
import { doc, updateDoc, increment, arrayUnion, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Background } from "@/components/ui/background";
import { Button } from "@/components/ui/button";
import { HackerText } from "@/components/ui/hacker-text";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { Badge } from "@/components/ui/badge";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";

// --- ⚡ UPI CONFIGURATION ---
const MERCHANT = {
  vpa: "iznoatwork@okicici", // ⚠️ REPLACE WITH YOUR ACTUAL UPI ID
  name: "Pop_Store"
};

// --- DATA STRUCTURES ---

const SUPPLY_DROPS = [
  { 
    id: "drop_s", 
    name: "Ration Pack", 
    amount: 500, 
    bonus: 0, 
    price: 299, 
    tag: "STARTER" 
  },
  { 
    id: "drop_m", 
    name: "Smuggler's Crate", 
    amount: 1200, 
    bonus: 200, 
    price: 899, 
    tag: "POPULAR" 
  },
  { 
    id: "drop_l", 
    name: "Cartel Shipment", 
    amount: 3000, 
    bonus: 600, 
    price: 2499, 
    tag: "VALUE" 
  },
  { 
    id: "drop_xl", 
    name: "The Vault", 
    amount: 8000, 
    bonus: 2000, 
    price: 4999, 
    tag: "WHALE" 
  },
];

const BLACK_MARKET = [
  {
    id: "key_niche",
    name: "Sector Key",
    description: "Universal unlock key for any standard sector.",
    icon: <Key className="text-yellow-400" />,
    cost: 100, 
    type: "ACCESS"
  },
  {
    id: "boost_genkit",
    name: "Genkit Overclock",
    description: "24h Priority queue for AI generation.",
    icon: <Zap className="text-cyan-400" />,
    cost: 50, 
    type: "BOOST"
  },
  {
    id: "contract_followers",
    name: "Mercenary Contract",
    description: "Bounty placement for 50 followers.",
    icon: <Database className="text-pink-500" />,
    cost: 500, 
    type: "GROWTH"
  },
  {
    id: "intel_leak",
    name: "Insider Leak",
    description: "Unlocks 'Trending Audio' list for 7 days.",
    icon: <Globe className="text-green-500" />,
    cost: 25, 
    type: "INTEL"
  }
];

export default function StorePage() {
  const { play } = useSfx();
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"MINT" | "MARKET">("MINT");
  const [processing, setProcessing] = useState<string | null>(null);

  const popCoins = userData?.wallet?.popCoins || 0;

  // 🛒 PURCHASE LOGIC
  const handlePurchase = async (item: any) => {
    if (!user) return;

    // A. REAL MONEY (THE MINT - UPI INTENT)
    if (activeTab === "MINT") {
        play("click");
        
        // 1. Construct UPI Link
        const upiUrl = `upi://pay?pa=${MERCHANT.vpa}&pn=${MERCHANT.name}&am=${item.price}&cu=INR&tn=${item.name}_${user.uid.substring(0,4)}`;
        
        // 2. Log Attempt to Firestore (So Admin knows they tried to pay)
        try {
            await addDoc(collection(db, "payment_attempts"), {
                uid: user.uid,
                username: userData?.username || "Unknown",
                item: item.name,
                amount: item.price,
                status: "initiated",
                timestamp: new Date().toISOString()
            });
        } catch(e) { console.error("Log failed", e); }

        // 3. Trigger Mobile Intent
        // We use window.location for mobile deep linking
        window.location.href = upiUrl;
        
        // 4. Feedback
        toast.info("OPENING PAYMENT APP...", {
            description: "After payment, please send screenshot to Admin.",
            duration: 6000,
            icon: <Smartphone size={16} />
        });
        return;
    }

    // B. BLACK MARKET (VIRTUAL CURRENCY)
    if (activeTab === "MARKET") {
        if (popCoins < item.cost) {
            play("error");
            toast.error(`INSUFFICIENT FUNDS. NEED ${item.cost} PC.`);
            return;
        }

        if (confirm(`CONFIRM: Spend ${item.cost} PC for ${item.name}?`)) {
            setProcessing(item.id);
            play("click");

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
                toast.success(`ACQUIRED: ${item.name}`);
            } catch (e) {
                console.error(e);
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
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
      
      {/* 📽️ ATMOSPHERE */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.8} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD */}
      <nav className="relative z-50 p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-4">
            <TransitionLink 
              href="/dashboard"
              className="w-10 h-10 border border-white/10 bg-black/40 flex items-center justify-center hover:border-cyan-500 hover:text-cyan-500 transition-all"
            >
              <ArrowLeft size={18} />
            </TransitionLink>
            <div>
                <h1 className="text-xl font-black font-orbitron tracking-tighter italic">THE_EXCHANGE</h1>
                <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Global_Economy_Node</p>
            </div>
        </div>
        
        {/* WALLET */}
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="block text-[8px] font-mono text-yellow-500/60 uppercase tracking-widest">Pop_Coins</span>
                <span className="text-xl font-black font-orbitron text-yellow-400 tracking-tighter">
                    <HackerText text={popCoins} />
                </span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-right opacity-50">
                <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest">UPI_Link</span>
                <span className="text-sm font-bold font-mono text-white tracking-widest flex items-center justify-end gap-2">
                    ACTIVE <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </span>
            </div>
        </div>
      </nav>

      {/* 🎛️ CONTROLS */}
      <div className="relative z-40 max-w-6xl mx-auto w-full px-6 pt-8 pb-4 flex justify-center">
        <div className="flex bg-black/40 border border-white/10 backdrop-blur-md p-1 rounded-sm">
            <button 
                onClick={() => { setActiveTab("MINT"); play("click"); }}
                className={cn(
                    "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                    activeTab === "MINT" ? "bg-white text-black shadow-lg" : "text-white/40 hover:text-white"
                )}
            >
                <CreditCard size={12} /> The_Mint
            </button>
            <button 
                onClick={() => { setActiveTab("MARKET"); play("click"); }}
                className={cn(
                    "px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2",
                    activeTab === "MARKET" ? "bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]" : "text-white/40 hover:text-white"
                )}
            >
                <ShoppingCart size={12} /> Black_Market
            </button>
        </div>
      </div>

      {/* 📦 GRID CONTENT */}
      <div className="relative z-40 max-w-6xl mx-auto w-full px-6 pb-20 overflow-y-auto no-scrollbar h-full">
        
        {/* TAB 1: REAL MONEY (UPI) */}
        {activeTab === "MINT" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                {SUPPLY_DROPS.map((item) => (
                    <div key={item.id} className="group relative bg-black/60 border border-white/10 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all p-6 flex flex-col justify-between h-64 overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Gem size={40} className="text-yellow-500 rotate-12" />
                        </div>
                        
                        <div className="space-y-2 relative z-10">
                            <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 text-[8px] tracking-widest mb-2">{item.tag}</Badge>
                            <h3 className="text-lg font-black font-orbitron italic uppercase text-white group-hover:text-yellow-400 transition-colors">{item.name}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-white">{item.amount.toLocaleString()}</span>
                                <span className="text-[10px] font-mono text-yellow-500">PC</span>
                            </div>
                            {item.bonus > 0 && (
                                <span className="text-[9px] font-bold text-green-400 font-mono">+ {item.bonus} BONUS</span>
                            )}
                        </div>

                        {/* UPI PAYMENT BUTTON */}
                        <Button 
                            onClick={() => handlePurchase(item)}
                            className="w-full bg-white/5 border border-white/10 hover:bg-green-600 hover:text-white hover:border-green-400 transition-all text-[10px] font-black tracking-[0.2em] uppercase h-10 mt-4 group/btn"
                        >
                            <span className="group-hover/btn:hidden">₹{item.price} INR</span>
                            <span className="hidden group-hover/btn:inline flex items-center gap-2">
                                PAY VIA UPI <Smartphone size={12} className="inline ml-1"/>
                            </span>
                        </Button>
                    </div>
                ))}
            </div>
        )}

        {/* TAB 2: VIRTUAL (POPCOINS) */}
        {activeTab === "MARKET" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {BLACK_MARKET.map((item) => (
                    <div key={item.id} className="relative bg-gradient-to-br from-black/80 to-gray-900/80 border border-white/10 hover:border-cyan-500/50 p-6 flex items-center gap-6 group transition-all">
                        <div className="w-16 h-16 bg-black/50 border border-white/5 flex items-center justify-center rounded-sm group-hover:scale-110 transition-transform duration-500">
                            {item.icon}
                        </div>
                        
                        <div className="flex-1 space-y-1">
                            <Badge variant="secondary" className="bg-white/5 text-white/40 text-[7px] tracking-widest mb-1">{item.type}</Badge>
                            <h3 className="text-sm font-black font-orbitron uppercase text-white">{item.name}</h3>
                            <p className="text-[9px] font-mono text-white/50 leading-relaxed">{item.description}</p>
                            
                            <div className="pt-3 flex items-center justify-between">
                                <span className={cn(
                                    "text-sm font-black font-mono",
                                    popCoins >= item.cost ? "text-yellow-400" : "text-red-500"
                                )}>
                                    {item.cost} PC
                                </span>
                                <Button 
                                    size="sm"
                                    onClick={() => handlePurchase(item)}
                                    disabled={processing === item.id || popCoins < item.cost}
                                    className={cn(
                                        "h-7 text-[8px] font-bold tracking-widest uppercase",
                                        popCoins >= item.cost 
                                            ? "bg-cyan-600 hover:bg-cyan-500 text-white" 
                                            : "bg-white/5 text-white/20 cursor-not-allowed hover:bg-white/5"
                                    )}
                                >
                                    {processing === item.id ? "SYNC..." : "ACQUIRE"}
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
      
      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-xl">
         <div className="flex items-center gap-2 text-[8px] font-mono text-white/30">
            <ShieldAlert size={10} className="text-yellow-500" />
            <span>SECURE_PAYMENT_NODE</span>
         </div>
         <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">ENCRYPTED</div>
      </footer>

    </main>
  );
}