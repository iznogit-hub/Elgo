"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image"; 
import { useAuth, UserData } from "@/lib/context/auth-context"; 
import { 
  collection, query, where, getDocs, limit, orderBy,
  onSnapshot, doc, updateDoc, increment, arrayUnion, writeBatch,
  serverTimestamp, addDoc, Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { 
  Users, ArrowLeft, Crown, ArrowRightLeft, Radar, MessageCircle,
  Send, Trophy, Diamond, Copy, Globe, Ghost, ShieldCheck, Banknote, Search, Lock, Network
} from "lucide-react";
import { toast } from "sonner";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";
import { HackerText } from "@/components/ui/hacker-text";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- TYPES ---
interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Timestamp;
}

interface GuildMember extends UserData {
  id: string;
  online: boolean;
}

export default function AgencyRingPage() {
  const { user, userData } = useAuth();
  const { play } = useSfx();
  
  // STATE
  const [activeTab, setActiveTab] = useState<"ROSTER" | "COMMS" | "ACQUISITION" | "TREASURY">("ROSTER");
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [radarTargets, setRadarTargets] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Agency Ring Data
  const guildName = userData?.guildName || "SYNDICATE_RING_ALPHA";
  const guildId = userData?.guildId || user?.uid; 
  const isGuildLeader = userData?.uid === userData?.guildLeader;
  const [guildBank, setGuildBank] = useState(0);

  // Transaction State
  const [depositAmount, setDepositAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState<GuildMember | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Swapped from popCoins to the credits system from your updated context
  const popCoins = userData?.wallet?.credits ?? 0;

  // --- 1. FETCH AGENCY RING MEMBERS ---
  useEffect(() => {
    if (!userData) return;

    const q = query(
      collection(db, "users"),
      where("guildId", "==", guildId),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const members = snap.docs.map(doc => {
        const data = doc.data() as UserData;
        return {
          ...data,
          id: doc.id,
          online: true 
        };
      });
      
      setGuildMembers(members.sort((a, b) => ((b.wallet?.credits as number) || 0) - ((a.wallet?.credits as number) || 0)));
      const totalBank = members.reduce((sum, m) => sum + (m.guildBankContribution || 0), 0);
      setGuildBank(totalBank);
    });

    return () => unsubscribe();
  }, [userData, guildId]);

  // --- 2. REAL-TIME ENCRYPTED COMMS ---
  useEffect(() => {
    if (activeTab !== "COMMS") return;

    const chatQuery = query(
      collection(db, `guilds/${guildId}/messages`),
      orderBy("timestamp", "asc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(chatQuery, (snap) => {
      const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [guildId, activeTab]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // --- 3. SEND MESSAGE ---
  const sendMessage = async () => {
    if (!newMessage.trim() || !userData) return;
    setSending(true);
    play("click"); 

    try {
      await addDoc(collection(db, `guilds/${guildId}/messages`), {
        text: newMessage.trim(),
        senderId: userData.uid,
        senderName: userData.username,
        timestamp: serverTimestamp()
      });
      setNewMessage("");
      play("success"); 
    } catch (e) {
      toast.error("NETWORK INTERFERENCE // COMMS DOWN");
    } finally {
      setSending(false);
    }
  };

  // --- 4. RADAR SCAN (M&A Acquisition) ---
  const scanRadar = async () => {
    if (!user) return;
    setLoading(true);
    play("scan");
    
    try {
      const q = query(
        collection(db, "users"),
        where("guildId", "!=", guildId), 
        limit(10)
      );
      const snap = await getDocs(q);
      
      const targets = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter((u: any) => u.id !== user.uid);

      setRadarTargets(targets);
      play("success");
    } catch (e) {
      toast.error("SCANNER JAMMED // RETRY PROTOCOL");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. RECRUIT ACTION (Sub-Agency M&A) ---
  const handleRecruit = async (target: any) => {
    play("click");
    if (confirm(`INITIATE MERGER ACQUISITION FOR AGENCY ${target.username}?`)) {
       try {
         await updateDoc(doc(db, "users", target.id), { guildId: guildId });
         toast.success(`M&A COMPLETE // ${target.username} INTEGRATED INTO RING`);
         play("success");
         setRadarTargets(prev => prev.filter(u => u.id !== target.id));
       } catch(e) { toast.error("ACQUISITION FAILED"); }
    }
  };

  // --- 6. BANK DEPOSIT (Pooled Ad Spend) ---
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount <= 0 || amount > popCoins) return toast.error("INVALID FUND ALLOCATION");

    play("kaching");
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user!.uid), {
        "wallet.credits": increment(-amount),
        guildBankContribution: increment(amount)
      });
      await batch.commit();
      
      toast.success(`CAPITAL POOLED // ${amount} CREDITS DEPOSITED`);
      setDepositAmount("");
    } catch (e) { toast.error("TRANSACTION FAILED"); }
  };

  // --- 7. PEER TRANSFER (Internal Routing) ---
  const handleTransfer = async () => {
    if (!transferTarget || !user) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > popCoins) return toast.error("INVALID FUND ALLOCATION");

    play("kaching");
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { "wallet.credits": increment(-amount) });
      batch.update(doc(db, "users", transferTarget.id), { "wallet.credits": increment(amount) });
      await batch.commit();
      
      toast.success(`FUNDS CLEARED // ${amount} CREDITS TO ${transferTarget.username}`);
      setTransferTarget(null);
      setTransferAmount("");
    } catch (e) { toast.error("WIRE TRANSFER FAILED"); }
  };

  const getGuildLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://loyalties.network';
    return `${origin}/auth/signup?ref=${user?.uid}`;
  };

  return (
    <main className="relative min-h-screen bg-[#050505] text-[#f0f0f0] font-sans overflow-hidden flex flex-col selection:bg-purple-500 selection:text-white">
      
      {/* ATMOSPHERE - Cyber Agency Network */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full mix-blend-screen" />
        
        <Image src="/images/referral-bg.jpg" alt="Data Grid" fill priority className="object-cover opacity-10 grayscale contrast-150 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/95 via-[#050505]/80 to-[#050505]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <SoundPrompter />
      <Background />

      {/* TOP HUD - Cyber Grid Architecture */}
      <header className="relative z-50 flex-none border-b border-white/10 bg-[#050505]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group">
            <div className="w-12 h-12 border border-cyan-500/30 bg-white/5 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-black transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <ArrowLeft size={20} />
            </div>
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest hidden md:inline group-hover:text-cyan-400 transition-colors">
              Return to Command
            </span>
          </TransitionLink>

          <div className="text-left md:text-center">
            <div className="flex items-center justify-start md:justify-center gap-4 mb-2">
              <Network size={24} className="text-purple-500" />
              <HackerText text={guildName} className="text-2xl md:text-3xl font-medium tracking-widest uppercase text-white" />
            </div>
            <div className="flex items-center justify-start md:justify-center gap-6 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              <span>{guildMembers.length} Partner Agencies</span>
              <span>•</span>
              <span className="text-cyan-400">Pooled Escrow: {guildBank.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 border border-white/10 p-2 bg-white/5 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.05)]">
             <div className="text-right px-4">
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">Global Standing</span>
                <div className="flex items-center gap-2">
                    <Globe size={14} className="text-cyan-400/50" />
                    <span className="text-lg font-mono text-cyan-400 leading-none drop-shadow-md">Tier 1 Syndicate</span>
                </div>
             </div>
          </div>

        </div>

        {/* TABS - Agency Architecture */}
        <div className="flex border-t border-white/10 overflow-x-auto no-scrollbar bg-[#050505]">
          <button onClick={() => setActiveTab("ROSTER")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "ROSTER" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400 hover:bg-cyan-950/20")}>
            <Users size={14} className="inline mr-2 mb-0.5" /> Agency_Roster
          </button>
          <button onClick={() => setActiveTab("COMMS")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "COMMS" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400 hover:bg-cyan-950/20")}>
            <MessageCircle size={14} className="inline mr-2 mb-0.5" /> Secure_Comms
          </button>
          <button onClick={() => { setActiveTab("ACQUISITION"); scanRadar(); }} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors border-r border-white/10", activeTab === "ACQUISITION" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400 hover:bg-cyan-950/20")}>
            <Search size={14} className="inline mr-2 mb-0.5" /> M&A_Radar
          </button>
          <button onClick={() => setActiveTab("TREASURY")} className={cn("flex-1 min-w-[120px] py-4 text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] transition-colors", activeTab === "TREASURY" ? "bg-cyan-600 text-black font-bold" : "text-neutral-500 hover:text-cyan-400 hover:bg-cyan-950/20")}>
            <Banknote size={14} className="inline mr-2 mb-0.5" /> Pooled_Escrow
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-40 flex-1 overflow-hidden flex flex-col bg-[#050505]">

        {/* 1. ROSTER TAB */}
        {activeTab === "ROSTER" && (
          <div className="h-full flex flex-col p-6 md:p-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <HackerText text="Syndicate_Partners" className="text-xl font-medium tracking-widest uppercase text-white" />
                <Button 
                    onClick={() => { play("click"); navigator.clipboard.writeText(getGuildLink()); toast.success("UPLINK KEY COPIED"); }} 
                    className="bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-600 hover:text-black font-mono text-[10px] uppercase tracking-widest rounded-none h-10 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                >
                    <Copy size={14} className="mr-3" /> Copy Uplink Key
                </Button>
            </div>
            
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10 pb-20 shadow-2xl">
                {guildMembers.map((member, i) => (
                  <div key={member.id} className="bg-[#050505] p-6 flex flex-col justify-between hover:bg-cyan-950/20 transition-colors group h-48" style={{ animationDelay: `${i * 50}ms` }}>
                    
                    <div className="flex items-start gap-4">
                      <div className="relative w-12 h-12 border border-white/20 shrink-0">
                        <Image src={member.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white uppercase tracking-widest truncate text-sm">{member.username}</span>
                          {member.id === userData?.guildLeader && <Crown size={12} className="text-purple-400 shrink-0" />}
                        </div>
                        <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">
                            Class: {member.membership?.tier || "Standard Agency"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-white/10 flex items-end justify-between">
                        <div>
                            <span className="block text-[8px] font-mono text-neutral-600 uppercase tracking-widest mb-1">Liquid Ledger</span>
                            <span className="font-mono text-cyan-400">{member.wallet?.credits?.toLocaleString() || 0}</span>
                        </div>

                        {member.id !== user?.uid && (
                            <button 
                                onClick={() => setTransferTarget(member)}
                                className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 hover:text-cyan-400 flex items-center gap-2 transition-colors"
                            >
                                <ArrowRightLeft size={12} /> Route Funds
                            </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 2. COMMS TAB (Secure Chat) */}
        {activeTab === "COMMS" && (
          <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-6 md:p-10">
            <div className="flex-1 flex flex-col border border-white/10 bg-[#050505] shadow-[0_0_40px_rgba(6,182,212,0.05)]">
                
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,211,238,0.8)]" /> 
                        Encrypted Syndicate Comms
                    </span>
                    <Lock size={14} className="text-cyan-500/30" />
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-6">
                    {messages.map((msg) => (
                      <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.senderId === user?.uid ? "self-end items-end" : "self-start items-start")}>
                        <span className="text-[8px] font-mono text-neutral-500 mb-2 uppercase tracking-widest">{msg.senderName}</span>
                        <div className={cn(
                            "px-4 py-3 text-sm font-mono tracking-tight", 
                            msg.senderId === user?.uid 
                                ? "bg-cyan-900/30 text-cyan-50 border border-cyan-500/30" 
                                : "bg-transparent border border-white/10 text-neutral-300"
                        )}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="p-4 bg-white/5 border-t border-white/10 flex gap-4 shrink-0">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="ENTER TACTICAL UPDATE..."
                    className="bg-transparent border-white/20 text-cyan-50 font-mono text-xs placeholder:text-neutral-600 focus:border-cyan-500 rounded-none h-12 transition-colors"
                    disabled={sending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending} 
                    className="bg-cyan-600 hover:bg-cyan-500 text-black rounded-none h-12 px-6 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                  >
                    <Send size={16} />
                  </Button>
                </div>
            </div>
          </div>
        )}

        {/* 3. ACQUISITION TAB (M&A Radar) */}
        {activeTab === "ACQUISITION" && (
          <div className="h-full flex flex-col p-6 md:p-10">
             <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <Search size={20} className="text-cyan-400" />
                <HackerText text="M&A_Agency_Scanner" className="text-xl font-medium uppercase tracking-widest text-white" />
             </div>

             {loading ? (
                 <div className="flex-1 flex flex-col items-center justify-center border border-white/10 bg-[#050505] shadow-inner">
                     <div className="w-full max-w-xs h-1 bg-white/10 overflow-hidden mb-6">
                         <div className="h-full bg-purple-500 w-1/2 animate-[scan_1.5s_ease-in-out_infinite_alternate] shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                     </div>
                     <HackerText text="SCANNING_MARKET_COMPETITORS..." className="text-xs font-mono tracking-widest text-purple-400 uppercase" />
                 </div>
             ) : (
                 <ScrollArea className="flex-1 -mr-4 pr-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10 border border-white/10 pb-20 shadow-2xl">
                         {radarTargets.length > 0 ? radarTargets.map((target) => (
                             <div key={target.id} className="bg-[#050505] p-8 flex flex-col items-center text-center hover:bg-purple-950/20 transition-colors group">
                                 <div className="w-16 h-16 border border-white/20 overflow-hidden mb-6 grayscale group-hover:grayscale-0 group-hover:border-purple-500 transition-all shrink-0">
                                    <Image src={target.avatar || "/avatars/1.jpg"} alt="" width={64} height={64} className="object-cover h-full w-full" />
                                 </div>
                                 <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2 truncate w-full group-hover:text-purple-300 transition-colors">{target.username}</h3>
                                 <p className="text-[10px] font-mono text-neutral-500 uppercase mb-8">Estimated Value: {target.wallet?.credits || 0}</p>
                                 <Button 
                                    onClick={() => handleRecruit(target)} 
                                    className="w-full bg-transparent border border-white/20 text-white hover:bg-purple-600 hover:border-purple-600 hover:text-white font-mono uppercase text-[10px] tracking-widest rounded-none transition-colors"
                                 >
                                     Initiate Merger Offer
                                 </Button>
                             </div>
                         )) : (
                             <div className="col-span-full flex items-center justify-center h-64 bg-[#050505] text-neutral-600 font-mono text-xs uppercase tracking-widest border border-white/10">
                                 NO UNATTACHED AGENCIES DETECTED IN THIS SECTOR.
                             </div>
                         )}
                     </div>
                 </ScrollArea>
             )}
          </div>
        )}

        {/* 4. TREASURY TAB (Pooled Escrow) */}
        {activeTab === "TREASURY" && (
          <div className="h-full flex flex-col items-center justify-center p-6 md:p-10">
             
             <div className="w-full max-w-2xl bg-[#050505] border border-cyan-500/30 p-10 md:p-16 relative shadow-[0_0_60px_rgba(6,182,212,0.1)]">
                 
                 <div className="absolute top-0 left-0 p-4 border-b border-r border-cyan-500/30 bg-cyan-950/30">
                    <Banknote size={20} className="text-cyan-400" />
                 </div>

                 <div className="text-center mb-16 mt-4">
                     <p className="text-[10px] font-mono text-cyan-500/70 uppercase tracking-widest mb-4">Syndicate Pooled Escrow</p>
                     <h2 className="text-[8vw] md:text-6xl font-medium text-white leading-none tracking-tighter drop-shadow-md">
                        {guildBank.toLocaleString()}
                     </h2>
                 </div>

                 <div className="border-t border-white/10 pt-10">
                    <label className="block text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-4">
                        Capital Injection (Route Personal Funds to Pool)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Input 
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="AMOUNT"
                            className="flex-1 bg-transparent border border-white/20 focus:border-cyan-400 text-lg font-mono uppercase rounded-none h-14 transition-colors placeholder:text-neutral-700"
                        />
                        <Button 
                            onClick={handleDeposit} 
                            className="h-14 px-8 bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        >
                            Authorize Transfer
                        </Button>
                    </div>
                    <div className="mt-4 text-left">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                            Available Liquidity: <span className="text-cyan-400">{popCoins.toLocaleString()}</span>
                        </span>
                    </div>
                 </div>

             </div>
          </div>
        )}

      </div>

      {/* TRANSFER MODAL OVERLAY - Cyber Architecture */}
      {transferTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#050505]/95 backdrop-blur-md p-6">
            <div className="w-full max-w-md bg-[#050505] border border-cyan-500/40 p-10 relative shadow-[0_0_40px_rgba(6,182,212,0.2)]">
                
                <h3 className="text-lg font-medium text-cyan-400 uppercase tracking-widest mb-8 border-b border-cyan-500/20 pb-4">
                    Secure Wire Protocol
                </h3>
                
                <div className="bg-white/5 border border-white/10 p-6 mb-8 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Recipient Agency</span>
                    <div className="text-sm font-bold text-white uppercase tracking-widest">{transferTarget.username}</div>
                </div>

                <div className="space-y-3 mb-10">
                    <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                        Transfer Amount
                    </label>
                    <Input 
                        type="number" 
                        value={transferAmount} 
                        onChange={(e) => setTransferAmount(e.target.value)} 
                        placeholder="ENTER AMOUNT"
                        className="h-14 text-sm font-mono bg-transparent border border-white/20 focus:border-cyan-500 text-white uppercase rounded-none placeholder:text-neutral-700 transition-colors"
                    />
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={handleTransfer} 
                        className="flex-1 h-14 bg-cyan-600 text-black hover:bg-cyan-500 font-mono text-[10px] font-black uppercase tracking-[0.2em] rounded-none transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                    >
                        Execute
                    </Button>
                    <Button 
                        onClick={() => setTransferTarget(null)} 
                        className="flex-1 h-14 bg-transparent border border-white/20 text-neutral-400 hover:text-white hover:border-white font-mono text-[10px] uppercase tracking-[0.2em] rounded-none transition-colors"
                    >
                        Abort
                    </Button>
                </div>
            </div>
        </div>
      )}

    </main>
  );
}