"use client";

import React, { useState } from "react";
import { 
  CreditCard, Lock, Key, 
  Zap, ArrowLeft, Gem,
  Database, ShieldAlert,
  ShoppingCart, Globe, TrendingUp
} from "lucide-react";

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

// --- DATA STRUCTURES ---

const SUPPLY_DROPS = [
  { 
    id: "drop_s", 
    name: "Ration Pack", 
    amount: 500, 
    bonus: 0, 
    price: 4.99, 
    tag: "STARTER" 
  },
  { 
    id: "drop_m", 
    name: "Smuggler's Crate", 
    amount: 1200, 
    bonus: 200, 
    price: 9.99, 
    tag: "POPULAR" 
  },
  { 
    id: "drop_l", 
    name: "Cartel Shipment", 
    amount: 2500, 
    bonus: 500, 
    price: 19.99, 
    tag: "VALUE" 
  },
  { 
    id: "drop_xl", 
    name: "The Vault", 
    amount: 6500, 
    bonus: 1500, 
    price: 49.99, 
    tag: "WHALE" 
  },
];

const BLACK_MARKET = [
  {
    id: "key_niche",
    name: "Sector Key",
    description: "Unlocks 1 additional Niche permanently.",
    icon: <Key className="text-yellow-400" />,
    cost: 100, // Pop-Coins
    type: "ACCESS"
  },
  {
    id: "boost_genkit",
    name: "Genkit Overclock",
    description: "24h Unlimited AI generations speed boost.",
    icon: <Zap className="text-cyan-400" />,
    cost: 50, // Pop-Coins
    type: "BOOST"
  },
  {
    id: "contract_followers",
    name: "Mercenary Contract",
    description: "Put a bounty on your head. Gain 50 followers.",
    icon: <Database className="text-pink-500" />,
    cost: 500, // Pop-Coins
    type: "GROWTH"
  },
  {
    id: "intel_leak",
    name: "Insider Leak",
    description: "See tomorrow's trends today.",
    icon: <Globe className="text-green-500" />,
    cost: 25, // Pop-Coins
    type: "INTEL"
  }
];

export default function StorePage() {
  const { play } = useSfx();
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<"MINT" | "MARKET">("MINT");

  // Fallback data if loading
  const wallet = {
    popCoins: userData?.popCoins ?? 300,
    bubblePoints: userData?.bubblePoints ?? 0
  };

  const handlePurchase = (item: any) => {
    // Placeholder logic for now
    if (activeTab === "MARKET") {
        if (wallet.popCoins >= item.cost) {
            play("success");
            toast.success(`ACQUIRED: ${item.name}`);
        } else {
            play("error");
            toast.error("INSUFFICIENT FUNDS // GRIND REQUIRED");
        }
    } else {
        play("click");
        toast.info("REDIRECTING TO STRIPE_GATEWAY...");
    }
  };

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
        
        {/* WALLET DISPLAY */}
        <div className="flex items-center gap-4">
            <div className="text-right">
                <span className="block text-[8px] font-mono text-yellow-500/60 uppercase tracking-widest">Pop_Coins</span>
                <span className="text-xl font-black font-orbitron text-yellow-400 tracking-tighter">
                    <HackerText text={wallet.popCoins} />
                </span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-right opacity-50">
                <span className="block text-[8px] font-mono text-white/40 uppercase tracking-widest">Fiat_Link</span>
                <span className="text-sm font-bold font-mono text-white tracking-widest flex items-center justify-end gap-2">
                    CONNECTED <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
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
        
        {/* TAB 1: SUPPLY DROPS (REAL MONEY) */}
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
                            className="w-full bg-white/5 border border-white/10 hover:bg-white hover:text-black hover:border-white transition-all text-[10px] font-black tracking-[0.2em] uppercase h-10 mt-4"
                        >
                            ${item.price} USD
                        </Button>
                    </div>
                ))}
            </div>
        )}

        {/* TAB 2: BLACK MARKET (VIRTUAL CURRENCY) */}
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
                                    wallet.popCoins >= item.cost ? "text-yellow-400" : "text-red-500"
                                )}>
                                    {item.cost} PC
                                </span>
                                <Button 
                                    size="sm"
                                    onClick={() => handlePurchase(item)}
                                    className={cn(
                                        "h-7 text-[8px] font-bold tracking-widest uppercase",
                                        wallet.popCoins >= item.cost 
                                            ? "bg-cyan-600 hover:bg-cyan-500 text-white" 
                                            : "bg-white/5 text-white/20 cursor-not-allowed hover:bg-white/5"
                                    )}
                                >
                                    Acquire
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* LOCKED SEASON 2 TEASER */}
                <div className="relative bg-black/40 border border-white/5 p-6 flex items-center justify-center opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-not-allowed border-dashed">
                    <div className="text-center space-y-2">
                        <Lock className="mx-auto text-white/30" size={20} />
                        <h3 className="text-xs font-black font-orbitron uppercase text-white/50">Season_02 Items</h3>
                        <p className="text-[8px] font-mono text-white/30">ENCRYPTED // COMING SOON</p>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* 🧪 FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-t border-white/5 bg-black/90 backdrop-blur-xl">
         <div className="flex items-center gap-2 text-[8px] font-mono text-white/30">
            <ShieldAlert size={10} className="text-yellow-500" />
            <span>ALL_TRANSACTIONS_ENCRYPTED</span>
         </div>
         <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.3em]">SECURE_NODE_V9</div>
      </footer>

    </main>
  );
}