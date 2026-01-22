"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Zap, Trophy, Lock, 
  CheckCircle2, AlertTriangle, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// --- UI COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Background } from "@/components/ui/background";
import { HackerText } from "@/components/ui/hacker-text";
import { useSfx } from "@/hooks/use-sfx";

// --- STORE ITEMS CONFIG ---
const STORE_ITEMS = [
  { 
    id: "velocity_boost", 
    name: "VELOCITY SURGE", 
    desc: "Instant +500 Reach Velocity for 24h.", 
    price: 1500, 
    currency: "BP", 
    icon: Zap,
    color: "text-cyan-400",
    border: "group-hover:border-cyan-500"
  },
  { 
    id: "sister_protocol", 
    name: "SISTER PROTOCOL", 
    desc: "Unlock collaboration with Tier-2 operatives.", 
    price: 300, 
    currency: "PC", 
    icon: UsersIcon, // Helper below
    color: "text-green-400",
    border: "group-hover:border-green-500"
  },
  { 
    id: "titan_call", 
    name: "THE TITAN CALL", 
    desc: "Summon the 800k Mothership. Legend Status required.", 
    price: 10000, 
    currency: "BP", 
    icon: Lock, 
    color: "text-red-500",
    border: "group-hover:border-red-500",
    locked: true
  },
];

function UsersIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )
}

interface UserData {
  uid: string;
  username: string;
  bubblePoints: number;
  popCoins: number;
}

export default function StorePage() {
  const router = useRouter();
  const { play } = useSfx();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }
      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserData);
        } else {
           // ⚡ FALLBACK DATA TO PREVENT CRASH
           setUser({
               uid: currentUser.uid,
               username: currentUser.displayName || "Operative",
               bubblePoints: 0,
               popCoins: 0
           });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [router]);

  const handlePurchase = async (item: typeof STORE_ITEMS[0]) => {
    if (!user) return;
    play("click");

    if (item.locked) {
        play("error");
        toast.error("ACCESS_DENIED: INSUFFICIENT CLEARANCE");
        return;
    }

    // Check Funds
    const balance = item.currency === "BP" ? user.bubblePoints : user.popCoins;
    if (balance < item.price) {
        play("error");
        toast.error(`INSUFFICIENT FUNDS: NEED ${item.price - balance} MORE ${item.currency}`);
        return;
    }

    // Execute Purchase
    setPurchasing(item.id);
    toast.loading("PROCESSING TRANSACTION...");
    
    try {
        const userRef = doc(db, "users", user.uid);
        
        // Deduct Funds
        if (item.currency === "BP") {
            await updateDoc(userRef, { bubblePoints: increment(-item.price) });
            setUser(prev => prev ? ({ ...prev, bubblePoints: prev.bubblePoints - item.price }) : null);
        } else {
            await updateDoc(userRef, { popCoins: increment(-item.price) });
            setUser(prev => prev ? ({ ...prev, popCoins: prev.popCoins - item.price }) : null);
        }

        play("success");
        toast.dismiss();
        toast.success(`PURCHASE SUCCESSFUL: ${item.name} ACQUIRED`);
    } catch (error) {
        play("error");
        toast.dismiss();
        toast.error("TRANSACTION FAILED");
    } finally {
        setPurchasing(null);
    }
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono">
           <HackerText text="LOADING_MARKETPLACE..." />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden relative pb-24">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 h-20 flex items-center justify-between px-4 md:px-8 shadow-2xl">
         <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => play("click")}>
                <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="font-bold font-orbitron text-lg tracking-widest">BLACK MARKET</h1>
         </div>

         <div className="flex items-center gap-6 font-mono text-xs">
            <div className="flex items-center gap-2 text-cyan-400">
               <Zap className="w-3 h-3 fill-cyan-400" />
               {/* ⚡ SAFE CHECK: Prevents crash if user is null */}
               <span className="font-bold">{(user?.bubblePoints || 0).toLocaleString()} BP</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-500/80">
               <Trophy className="w-3 h-3" />
               <span className="font-bold">{(user?.popCoins || 0).toLocaleString()} PC</span>
            </div>
         </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-8">
         
         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {STORE_ITEMS.map((item) => {
                const Icon = item.icon;
                const canAfford = user ? (item.currency === "BP" ? user.bubblePoints : user.popCoins) >= item.price : false;

                return (
                    <div 
                        key={item.id}
                        className={`group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden transition-all hover:bg-white/5 ${item.border}`}
                        onMouseEnter={() => play("hover")}
                    >
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-lg bg-white/5 ${item.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                {item.locked && (
                                    <div className="flex items-center gap-1 text-[10px] bg-red-900/30 text-red-500 px-2 py-1 rounded border border-red-500/30">
                                        <Lock className="w-3 h-3" /> LOCKED
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className={`font-bold font-orbitron text-lg ${item.locked ? 'text-gray-500' : 'text-white'}`}>
                                    {item.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-2 h-8 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <span className={`font-mono font-bold ${item.currency === "BP" ? "text-cyan-400" : "text-yellow-500"}`}>
                                    {item.price.toLocaleString()} {item.currency}
                                </span>
                                
                                <Button 
                                    size="sm"
                                    disabled={purchasing !== null || item.locked || !canAfford}
                                    onClick={() => handlePurchase(item)}
                                    className={`
                                        ${!canAfford && !item.locked ? "opacity-50 cursor-not-allowed" : ""}
                                        bg-white/10 hover:bg-white/20 text-white font-mono text-xs
                                    `}
                                >
                                    {purchasing === item.id ? (
                                        <span className="animate-pulse">PROCESSING...</span>
                                    ) : item.locked ? (
                                        "LOCKED"
                                    ) : canAfford ? (
                                        "ACQUIRE"
                                    ) : (
                                        "INSUFFICIENT FUNDS"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            })}
         </div>

      </main>
    </div>
  );
}