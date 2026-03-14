"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Terminal, ShieldCheck, AlertTriangle, Lock, 
  QrCode, MessageSquare, Send, Loader2, 
  CheckCircle2, Smartphone, Target, ChevronRight,
  ShoppingCart, Eye, Tag, Globe, ExternalLink, ArrowUpRight, Settings,
  Radio, Users, Flame, Skull, Zap, Diamond, Trophy, Megaphone, Briefcase
} from "lucide-react";
import PlayerStatusCard from "@/components/ui/player-status-card";
import { Button } from "@/components/ui/button";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { Ping } from "@/components/ui/ping";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { HackerText } from "@/components/ui/hacker-text";

// FIX: Importing the updated Marketing Packages catalog
import { MARKETING_PACKAGES } from "@/lib/niche-data";

const MERCHANT = { vpa: "iznoatwork@okicici", name: "Loyalties_Network" };
const CR_TO_INR_RATE = 100; 

// Helper to calculate the 20% discount on ₹19,999 items
const getDiscountedPrice = (price: number) => {
  if (price === 19999) return 15999; // 20% off
  return price;
};

export default function Dashboard() {
  const { userData, loading, updateDeployment, commitFeedback } = useAuth();
  const { play } = useSfx();
  const [booting, setBooting] = useState(true);
  const [hasSynced, setHasSynced] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [liveViewers, setLiveViewers] = useState(12402);

  // UI & Support State
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  // Checkout State
  const [checkoutNiche, setCheckoutNiche] = useState<string | null>(null);
  const [checkoutAddons, setCheckoutAddons] = useState<string[]>([]);
  const [showQR, setShowQR] = useState(false);
  
  // User Ownership State
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending_verification" | "verified">("idle");
  const [ownedNiche, setOwnedNiche] = useState<string | null>(null);
  const [ownedAddons, setOwnedAddons] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userData?.deployment && !hasSynced) {
      const dep = userData.deployment as any;
      if (dep.selectedTemplate) setOwnedNiche(dep.selectedTemplate);
      if (dep.selectedAddons) setOwnedAddons(dep.selectedAddons);
      if (dep.paymentStatus) setPaymentStatus(dep.paymentStatus);
      setHasSynced(true);
    }
  }, [userData, hasSynced]);

  // Ambient effects simulation
  useEffect(() => {
    const viewerInterval = setInterval(() => {
      setLiveViewers(prev => prev + Math.floor(Math.random() * 50) - 20);
    }, 2000);

    const glitchInterval = setInterval(() => {
        if (Math.random() < 0.05) {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 150);
        }
    }, 5000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(glitchInterval);
    };
  }, []);

  // === SAFE DYNAMIC PRICING CALCULATIONS ===
  const activeNicheData = checkoutNiche ? MARKETING_PACKAGES[checkoutNiche] : null;
  const ownedNicheData = ownedNiche ? MARKETING_PACKAGES[ownedNiche] : null;

  const basePriceOriginal = activeNicheData ? activeNicheData.basePrice : 0;
  const baseINR = getDiscountedPrice(basePriceOriginal);
  
  const addonsINR = activeNicheData ? checkoutAddons.reduce((sum, addonId) => {
    const addon = activeNicheData.addons?.find((a: any) => a.id === addonId);
    return sum + (addon ? addon.price : 0);
  }, 0) : 0;
  
  const totalINR = baseINR + addonsINR;

  const handleOpenCheckout = (nicheId: string) => {
    if (paymentStatus !== "idle") {
        const proceed = window.confirm("WARNING: You already have an active contract. Acquiring a new one will override your current primary deployment. Do you want to continue?");
        if (!proceed) return;
    }
    play("click");
    setCheckoutNiche(nicheId);
    setCheckoutAddons([]); 
    setShowQR(false);
  };

  const toggleCheckoutAddon = (id: string) => {
    play("hover");
    setCheckoutAddons(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleGenerateInvoice = () => {
    play("success");
    setShowQR(true);
  };

  const handleConfirmPayment = async () => {
    play("success");
    setShowQR(false);
    setCheckoutNiche(null);
    setPaymentStatus("pending_verification");
    setOwnedNiche(checkoutNiche);
    setOwnedAddons(checkoutAddons);
    
    await updateDeployment({
      selectedTemplate: checkoutNiche,
      selectedAddons: checkoutAddons,
      paymentStatus: "pending_verification",
      startTime: Date.now(),
    });

    toast.success("PAYMENT SUBMITTED", { description: "HQ is verifying your retainer transfer." });
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSubmittingFeedback(true);
    play("click");
    try {
      await commitFeedback(feedback);
      setFeedback("");
      play("success");
      toast.success("MESSAGE SENT", { description: "HQ has received your transmission." });
    } catch (e) {
      toast.error("FAILED TO SEND");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading || booting) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] font-mono text-cyan-500 text-sm animate-pulse">
        <Terminal className="mr-2 h-4 w-4" /> INITIATING AGENCY PROTOCOLS...
      </div>
    );
  }

  const isLive = userData?.websiteStatus === "live" && userData?.deployment?.vercelUrl;
  const hasActiveDeployment = paymentStatus !== "idle" && ownedNicheData !== null;

  return (
    <main className={cn(
        "relative min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden flex flex-col selection:bg-purple-500 selection:text-white pb-24",
        glitch && "invert hue-rotate-180"
    )}>
      
      {/* 📽️ BACKGROUND STAGE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-[#050505]/80" />
         <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
         <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/20 blur-[100px] rounded-full mix-blend-screen" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      {/* 🔴 LIVE INDICATOR */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-cyan-600 rounded-md shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-pulse">
            <Radio size={16} className="text-black" />
            <span className="text-xs font-black tracking-widest text-black">ONLINE</span>
        </div>
        <div className="px-4 py-2 bg-[#050505]/60 backdrop-blur-md rounded-md border border-cyan-500/30 flex items-center gap-2">
            <Users size={16} className="text-purple-400" />
            <span className="text-xs font-mono font-bold text-white">{liveViewers.toLocaleString()}</span>
        </div>
      </div>

      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 w-full">
        
        {/* 📡 HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-16 gap-4 border-b border-purple-500/30 pb-6 relative group">
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400">
                <ShieldCheck size={24} className="fill-cyan-500/20" />
                <span className="text-xl md:text-2xl font-mono tracking-widest uppercase">{userData?.username || "GUEST_UNIT"}</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black italic uppercase leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-400 drop-shadow-xl">
              Command Center
            </h1>
            <p className="text-sm md:text-lg font-mono text-cyan-200/60 uppercase tracking-[0.2em] pt-2">
                Client Operations • Alpha Node
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* 🛡️ LEFT COLUMN */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white/5 border border-purple-500/20 backdrop-blur-md rounded-xl p-1 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.1)] transition-all hover:border-cyan-500/50">
                <PlayerStatusCard userData={userData} />
            </div>

            <div className="bg-[#050505]/60 border border-white/10 backdrop-blur-md rounded-xl p-6 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-bold uppercase tracking-widest text-xs text-cyan-400 mb-4 font-mono flex items-center gap-2">
                <MessageSquare size={14} /> Direct Comms
              </h3>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Transmit campaign requests to HQ..."
                className="w-full bg-[#050505]/50 backdrop-blur-sm border border-white/10 p-4 text-xs font-mono text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none h-32 resize-none rounded-lg transition-all"
              />
              <Button onClick={handleSubmitFeedback} disabled={isSubmittingFeedback || !feedback.trim()} className="w-full mt-4 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                {isSubmittingFeedback ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} className="mr-2"/> Transmit</>}
              </Button>
            </div>
          </div>

          {/* 🚀 RIGHT COLUMN */}
          <div className="xl:col-span-9 space-y-12">
            
            {/* --- STATE 1: ACTIVE DEPLOYMENT --- */}
            {hasActiveDeployment && ownedNicheData && (
              <div className={cn("bg-[#050505]/40 backdrop-blur-md border p-1 relative overflow-hidden transition-all duration-500 rounded-2xl", isLive ? "border-purple-500 shadow-[0_0_80px_rgba(168,85,247,0.2)]" : paymentStatus === "verified" ? "border-cyan-500 shadow-[0_0_80px_rgba(6,182,212,0.2)]" : "border-yellow-500/50 shadow-[0_0_80px_rgba(234,179,8,0.1)]")}>
                
                {isLive ? (
                  <div className="bg-[#050505]/60 rounded-xl p-8 md:p-12 relative overflow-hidden text-center flex flex-col items-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-cyan-500" />
                    <div className="w-24 h-24 bg-purple-950/30 border border-purple-500/50 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.2)] group hover:scale-105 transition-transform">
                      <Megaphone size={48} className="text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 tracking-tight mb-4 uppercase">Campaign Live</h2>
                    <p className="text-neutral-400 font-mono text-sm max-w-xl mb-10 leading-relaxed uppercase tracking-wider">
                      Your <span className="text-purple-400 font-bold">{ownedNicheData.label}</span> protocol has been successfully executed.
                    </p>
                    <div className="w-full max-w-lg bg-[#050505] border border-purple-500/30 rounded-xl p-5 mb-10 flex items-center justify-between shadow-inner">
                      <div className="flex items-center gap-4 overflow-hidden">
                        <Globe size={20} className="text-purple-500 shrink-0" />
                        <span className="text-purple-400 font-mono text-sm md:text-base truncate">{userData?.deployment?.vercelUrl}</span>
                      </div>
                      <a href={userData?.deployment?.vercelUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-black p-2.5 bg-purple-950/50 hover:bg-purple-400 rounded-lg border border-purple-500/30 shrink-0 ml-4 transition-colors">
                        <ExternalLink size={18} />
                      </a>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                      <a href={userData?.deployment?.vercelUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center h-14 bg-purple-500 hover:bg-purple-400 text-white font-black tracking-widest uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        View Tracking <ArrowUpRight size={18} className="ml-2" />
                      </a>
                      <Link href={`/niche/${ownedNiche}`} className="flex-1 flex items-center justify-center h-14 bg-[#050505]/50 backdrop-blur-md border border-purple-500/30 hover:border-purple-400 text-purple-400 font-bold tracking-widest uppercase rounded-xl transition-all">
                        <Settings size={18} className="mr-2" /> Configure
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#050505]/60 p-8 md:p-12 rounded-xl relative overflow-hidden backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                      <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                        <video 
                          src={ownedNicheData.videoSrc} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
                      </div>
                      <div className="flex-1 text-center md:text-left w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4 backdrop-blur-sm">
                          {paymentStatus === "pending_verification" ? (
                            <><AlertTriangle size={12} className="text-yellow-500 animate-pulse" /><span className="text-[10px] font-mono text-yellow-500 uppercase tracking-widest">Awaiting Verification</span></>
                          ) : (
                            <><CheckCircle2 size={12} className="text-cyan-500" /><span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Clearance Granted</span></>
                          )}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black italic uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 leading-none mb-4">{ownedNicheData.label}</h2>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl">
                              <div className="text-[10px] font-mono text-cyan-500/70 uppercase mb-1 flex items-center gap-1"><Diamond size={10}/> Sector</div>
                              <div className="text-xs font-bold text-white uppercase">{ownedNicheData.category}</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl">
                              <div className="text-[10px] font-mono text-cyan-500/70 uppercase mb-1 flex items-center gap-1"><Zap size={10}/> Scope</div>
                              <div className="text-xs font-bold text-cyan-400 uppercase">{ownedAddons.length} Modules Active</div>
                            </div>
                        </div>
                        {paymentStatus === "verified" ? (
                          <MagneticWrapper>
                              <Link href={`/niche/${ownedNiche}`} className="inline-flex w-full md:w-auto items-center justify-center h-16 px-10 bg-cyan-600 text-black font-black tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:bg-cyan-500 transition-all rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
                                <span className="relative z-10 flex items-center">INITIALIZE CONFIG <ChevronRight size={20} className="ml-2" /></span>
                              </Link>
                          </MagneticWrapper>
                        ) : (
                          <div className="bg-yellow-950/20 border border-yellow-500/30 p-4 rounded-xl backdrop-blur-sm">
                            <p className="text-[10px] font-mono text-yellow-500/80 uppercase tracking-wider leading-relaxed">Funds detected. Processing clearance via central ledger.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {hasActiveDeployment && (
               <div className="border-t border-purple-500/20 my-10 relative">
                   <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-[#050505] px-4 text-[10px] font-mono text-purple-500 uppercase tracking-widest flex items-center gap-2"><Globe size={12}/> Global Registry</div>
               </div>
            )}

            {/* --- STATE 2: THE STOREFRONT (Digital Armory) --- */}
            <div className="space-y-8">
              <div className="flex items-end justify-between border-b border-purple-500/30 pb-4">
                <div>
                  <h2 className="text-3xl font-black italic uppercase text-white tracking-widest flex items-center gap-3">
                    <Target className="text-cyan-500" size={28} /> Marketing Arsenal
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(MARKETING_PACKAGES).map(([nicheId, niche]: [string, any]) => {
                  const Icon = niche.icon;
                  const isDiscounted = niche.basePrice === 19999;
                  const currentPrice = getDiscountedPrice(niche.basePrice);

                  return (
                    <div key={nicheId} className="group relative flex flex-col bg-[#050505]/40 backdrop-blur-md border border-white/10 overflow-hidden hover:border-cyan-500/60 transition-all duration-500 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                      <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="relative h-56 w-full overflow-hidden border-b border-white/10">
                        <video 
                          src={niche.videoSrc} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                        {isDiscounted && (
                          <div className="absolute top-4 right-4 bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.6)] flex items-center gap-1">
                            <Zap size={12} /> FLASH OVERRIDE
                          </div>
                        )}
                        <div className={cn("absolute bottom-4 left-5 p-3 rounded-xl bg-[#050505]/60 backdrop-blur-md border border-white/10 shadow-lg", niche.textColor)}>
                          <Icon size={24} />
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col relative z-10">
                        <div className="font-black text-2xl italic uppercase text-white leading-tight mb-1">{niche.label}</div>
                        <div className="text-[10px] font-mono text-cyan-500/70 uppercase mb-4 tracking-widest">{niche.category}</div>
                        <p className="text-xs font-mono text-neutral-400 mb-6 flex-1 line-clamp-2 leading-relaxed">{niche.description}</p>
                        
                        <div className="mt-auto">
                          <div className="flex items-end justify-between mb-5 px-1 border-t border-white/10 pt-4">
                            <div>
                              <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Total Valuation</div>
                              {isDiscounted ? (
                                <div className="flex items-end gap-2">
                                  <span className="text-xs font-mono text-cyan-700 line-through mb-0.5">₹{niche.basePrice.toLocaleString()}</span>
                                  <span className="text-3xl font-black italic text-cyan-400 leading-none drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">₹{currentPrice.toLocaleString()}</span>
                                </div>
                              ) : (
                                <div className="text-3xl font-black italic text-white leading-none">₹{currentPrice.toLocaleString()}</div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <TransitionLink href={`/niche/${nicheId}/demo`} className="flex items-center justify-center gap-2 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white border border-white/10 hover:border-cyan-500/50 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                              <Eye size={16} /> Data Stream
                            </TransitionLink>
                            <Button onClick={() => handleOpenCheckout(nicheId)} className="h-14 bg-cyan-600 text-black hover:bg-cyan-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                              <ShoppingCart size={16} className="mr-2" /> Acquire
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* --- CHECKOUT MODAL (CYBERPUNK OVERLAY) --- */}
      {checkoutNiche && activeNicheData && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 md:pt-24 px-4 pb-10 sm:px-6 bg-[#050505]/90 backdrop-blur-xl animate-in fade-in duration-300">
          
          <div className="w-full max-w-lg bg-[#050505]/80 border border-cyan-500/40 rounded-[2rem] flex flex-col shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden max-h-[80dvh] animate-in slide-in-from-top-8 zoom-in-95 duration-300 relative">
            
            {/* Modal Ambient Glow */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-600/20 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />

            {/* HEADER - Locked to Top */}
            <div className="p-6 md:p-8 border-b border-cyan-500/20 flex justify-between items-center bg-[#050505]/50 backdrop-blur-md shrink-0">
              <div className="font-black text-xl italic uppercase text-white flex items-center gap-3">
                 {showQR ? <QrCode className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={24} /> : <ShoppingCart className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" size={24} />}
                 <HackerText text={showQR ? "LINK UPLINK" : "SECURE CONTRACT"} />
              </div>
              <button onClick={() => setCheckoutNiche(null)} className="text-cyan-500/50 hover:text-cyan-400 p-2 transition-colors">✕</button>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10">
               {!showQR ? (
                 // --- VIEW 1: CART (Template & Addons) ---
                 <div className="space-y-8">
                   <div className="space-y-4">
                     <div className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest flex justify-between">
                       <span>Core Retainer</span>
                       {basePriceOriginal === 19999 && <span className="text-cyan-400 font-bold animate-pulse">OVERRIDE ACTIVE</span>}
                     </div>
                     <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-xl flex items-center gap-5 shadow-inner hover:border-cyan-500/30 transition-colors">
                       <div className="w-20 h-20 relative rounded-lg overflow-hidden shrink-0 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                          <video src={activeNicheData.videoSrc} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-screen" />
                       </div>
                       <div className="flex-1">
                         <div className="font-black text-xl italic text-white uppercase leading-tight">{activeNicheData.label}</div>
                       </div>
                       <div className="text-right">
                         {basePriceOriginal === 19999 && <div className="text-[10px] font-mono text-cyan-700 line-through">₹{basePriceOriginal.toLocaleString()}</div>}
                         <div className={cn("font-black text-2xl italic", basePriceOriginal === 19999 ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-white")}>
                           ₹{baseINR.toLocaleString()}
                         </div>
                       </div>
                     </div>
                   </div>

                   {activeNicheData.addons && activeNicheData.addons.length > 0 && (
                     <div className="space-y-4">
                       <div className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center justify-between">
                         <span>Available Upgrades</span>
                       </div>
                       <div className="grid grid-cols-1 gap-3">
                         {activeNicheData.addons.map((addon: any) => {
                           const selected = checkoutAddons.includes(addon.id);
                           return (
                             <div key={addon.id} onClick={() => toggleCheckoutAddon(addon.id)} className={cn("p-5 border rounded-xl cursor-pointer flex items-center justify-between transition-all backdrop-blur-md", selected ? "border-purple-500 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]" : "border-white/10 bg-white/5 hover:border-purple-500/30")}>
                               <div><div className="font-bold text-sm text-white uppercase tracking-wider">{addon.name}</div></div>
                               <div className="flex items-center gap-4">
                                 <div className="font-mono text-xs text-purple-400">+₹{addon.price.toLocaleString()}</div>
                                 <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0", selected ? "bg-purple-500 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "border-white/20 bg-[#050505]/50")}>
                                   {selected && <CheckCircle2 size={14} className="text-white" />}
                                 </div>
                               </div>
                             </div>
                           )
                         })}
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                 // --- VIEW 2: QR CODE PAYMENT ---
                 <div className="flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 relative">
                   <div className="absolute inset-0 bg-cyan-500/5 blur-3xl rounded-full" />
                   <div className="relative z-10 bg-white p-5 mx-auto w-fit mb-8 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.3)] border-4 border-cyan-500/20">
                     <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent("upi://pay?pa="+MERCHANT.vpa+"&pn="+MERCHANT.name+"&am="+totalINR+"&cu=INR&tn=LOYALTIES_DEPLOY")}`} alt="UPI QR Code" className="w-56 h-56 sm:w-64 sm:h-64" />
                   </div>
                   <div className="text-cyan-500 text-[10px] font-mono uppercase tracking-widest mb-2 relative z-10 flex items-center gap-2"><Lock size={12}/> Encrypted Escrow Transfer</div>
                   <div className="text-5xl md:text-6xl font-black italic text-white mb-6 relative z-10 drop-shadow-xl">₹{totalINR.toLocaleString()}</div>
                   <p className="text-xs text-neutral-400 text-center max-w-sm leading-relaxed font-mono relative z-10 bg-[#050505]/50 p-4 rounded-lg border border-white/5">
                     Scan using any supported Indian UPI client (GPay, PhonePe, Paytm) to finalize contract acquisition.
                   </p>
                 </div>
               )}
            </div>

            {/* FOOTER & BUTTON */}
            <div className="p-6 md:p-8 bg-[#050505]/80 backdrop-blur-xl border-t border-cyan-500/20 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] relative z-10">
               {!showQR ? (
                 <>
                   <div className="flex justify-between items-end mb-6 px-1">
                     <div className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest">Total Valuation</div>
                     <div className="text-right">
                       <div className="text-3xl sm:text-4xl font-black italic text-white leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">₹{totalINR.toLocaleString()}</div>
                     </div>
                   </div>
                   <Button onClick={handleGenerateInvoice} className="relative group w-full h-16 bg-cyan-600 text-black hover:bg-cyan-500 font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] overflow-hidden">
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
                     <span className="relative z-10">SECURE CONTRACT</span>
                   </Button>
                 </>
               ) : (
                 <Button onClick={handleConfirmPayment} className="relative group w-full h-16 bg-cyan-600 text-black hover:bg-cyan-500 font-black tracking-[0.2em] uppercase rounded-xl transition-all shadow-[0_0_40px_rgba(6,182,212,0.5)] flex items-center justify-center gap-3 overflow-hidden">
                   <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_1.5s_infinite]" />
                   <CheckCircle2 size={24} className="relative z-10" /> <span className="relative z-10">CONFIRM TRANSFER</span>
                 </Button>
               )}
            </div>
            
          </div>
        </div>
      )}

      {/* FOOTER TICKER */}
      <div className="fixed bottom-0 w-full bg-[#050505]/80 backdrop-blur-xl border-t border-cyan-500/30 py-3 overflow-hidden z-40">
        <div className="flex whitespace-nowrap animate-marquee">
            {Array(10).fill("").map((_, i) => (
                <div key={i} className="flex items-center gap-8 mx-8">
                    <span className="text-sm font-black italic text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                        HQ VERIFIED
                    </span>
                    <Zap size={16} className="text-blue-500" />
                    <span className="text-sm font-mono text-white/60">
                        ESCROW NETWORK SECURE
                    </span>
                    <Skull size={16} className="text-purple-700" />
                    <span className="text-sm font-black italic text-white uppercase tracking-widest">
                        AGENTS ON STANDBY
                    </span>
                    <Flame size={16} className="text-cyan-400" />
                </div>
            ))}
        </div>
      </div>

    </main>
  );
}