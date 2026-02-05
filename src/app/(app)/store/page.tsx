"use client";

import React, { useState } from "react";
import { 
  CreditCard, Lock, Key, 
  Zap, ArrowLeft, Gem,
  Database, ShieldAlert,
  ShoppingCart, Globe, Smartphone, X, ScanLine
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
import Image from "next/image";

// --- ⚡ UPI CONFIGURATION ---
const MERCHANT = {
  vpa: "iznoatwork@okicici", // YOUR VPA
  name: "Pop_Store"
};

// --- DATA STRUCTURES ---
const SUPPLY_DROPS = [
  { id: "drop_s", name: "Ration Pack", amount: 500, bonus: 0, price: 299, tag: "STARTER" },
  { id: "drop_m", name: "Smuggler's Crate", amount: 1200, bonus: 200, price: 899, tag: "POPULAR" },
  { id: "drop_l", name: "Cartel Shipment", amount: 3000, bonus: 600, price: 2499, tag: "VALUE" },
  { id: "drop_xl", name: "The Vault", amount: 8000, bonus: 2000, price: 4999, tag: "WHALE" },
];

const BLACK_MARKET = [
  { id: "key_niche", name: "Sector Key", description: "Universal unlock key.", icon: <Key className="text-yellow-400" />, cost: 100, type: "ACCESS" },
  { id: "boost_genkit", name: "Genkit Overclock", description: "24h Priority queue.", icon: <Zap className="text-cyan-400" />, cost: 50, type: "BOOST" },
  { id: "contract_followers", name: "Mercenary Contract", description: "Bounty for 50 followers.", icon: <Database className="text-pink-500" />, cost: 500, type: "GROWTH" },
  { id: "intel_leak", name: "Insider Leak", description: "Unlocks Trending list.", icon: <Globe className="text-green-500" />, cost: 25, type: "INTEL" }
];

export default function StorePage() {
  const { play } = useSfx();
  const { user, userData, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"MINT" | "MARKET">("MINT");
  const [processing, setProcessing] = useState<string | null>(null);
  
  // QR MODAL STATE
  const [showQR, setShowQR] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const popCoins = userData?.wallet?.popCoins || 0;

  // 🛒 PURCHASE LOGIC
  const handlePurchase = async (item: any) => {
    if (!user) return;

    // A. REAL MONEY (UPI QR & INTENT)
    if (activeTab === "MINT") {
        play("click");
        
        // 1. Generate UPI Link
        // Using a random transaction ref (tr) to avoid caching issues
        const txnRef = `${user.uid.substring(0,4)}_${Date.now().toString().slice(-4)}`;
        const upiUrl = `upi://pay?pa=${MERCHANT.vpa}&pn=${MERCHANT.name}&am=${item.price}&cu=INR&tn=${item.name}`;
        
        // 2. Set State for Modal
        setCurrentOrder({ ...item, upiUrl });
        setShowQR(true);

        // 3. Log Attempt
        try {
            await addDoc(collection(db, "payment_attempts"), {
                uid: user.uid,
                username: userData?.username || "Unknown",
                item: item.name,
                amount: item.price,
                status: "QR_Generated",
                txnRef,
                timestamp: new Date().toISOString()
            });
        } catch(e) { console.error("Log failed", e); }
        
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
        
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="block text-[8px] font-mono text-yellow-500/60 uppercase tracking-widest">Pop_Coins</span>
                <span className="text-xl font-black font-orbitron text-yellow-400 tracking-tighter">
                    <HackerText text={popCoins} />
                </span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-right opacity-50">
                <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest">Gateway</span>
                <span className="text-sm font-bold font-mono text-white tracking-widest flex items-center justify-end gap-2">
                    ONLINE <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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
                                <span className={cn("text-sm font-black font-mono", popCoins >= item.cost ? "text-yellow-400" : "text-red-500")}>
                                    {item.cost} PC
                                </span>
                                <Button 
                                    size="sm"
                                    onClick={() => handlePurchase(item)}
                                    disabled={processing === item.id || popCoins < item.cost}
                                    className={cn("h-7 text-[8px] font-bold tracking-widest uppercase", popCoins >= item.cost ? "bg-cyan-600 hover:bg-cyan-500 text-white" : "bg-white/5 text-white/20 cursor-not-allowed hover:bg-white/5")}
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

      {/* 🚀 UPI QR CODE MODAL */}
      {showQR && currentOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              {/* Backdrop */}
              <div 
                  className="absolute inset-0 bg-black/80 backdrop-blur-md" 
                  onClick={() => setShowQR(false)} 
              />
              
              <div className="relative bg-black border border-white/20 p-6 rounded-lg w-full max-w-sm shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-in zoom-in-95 duration-200">
                  <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                      <X size={20} />
                  </button>

                  <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center gap-2 text-yellow-500 mb-2">
                          <ScanLine className="animate-pulse" />
                          <span className="font-black font-orbitron text-lg tracking-widest">PAYMENT_GATE</span>
                      </div>

                      {/* QR Code (Generated via Public API) */}
                      <div className="p-4 bg-white rounded-lg">
                          {/* We use a simple QR API here for zero-dependency generation */}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentOrder.upiUrl)}`}
                            alt="Scan to Pay"
                            className="w-48 h-48 mix-blend-multiply"
                          />
                      </div>

                      <div className="text-center space-y-1">
                          <p className="text-white font-bold text-lg">₹{currentOrder.price}</p>
                          <p className="text-gray-400 text-xs font-mono">{currentOrder.name}</p>
                      </div>

                      <div className="w-full h-px bg-white/10" />

                      <Button 
                          onClick={() => window.location.href = currentOrder.upiUrl}
                          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-12 uppercase tracking-widest"
                      >
                          OPEN UPI APP <Smartphone size={16} className="ml-2" />
                      </Button>

                      <p className="text-[9px] text-gray-500 font-mono text-center">
                          SCAN ON DESKTOP • TAP ON MOBILE
                      </p>
                  </div>
              </div>
          </div>
      )}

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