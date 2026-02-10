"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image"; 
import { useAuth, UserData } from "@/lib/context/auth-context"; // Import UserData type
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
  Send, Trophy, Diamond, Copy, Globe, Ghost, ShieldCheck
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

// Define specific type for the view
interface GuildMember extends UserData {
  id: string;
  online: boolean;
}

export default function GuildLobbyPage() {
  const { user, userData } = useAuth();
  const { play } = useSfx();
  
  // STATE
  const [activeTab, setActiveTab] = useState<"MEMBERS" | "CHAT" | "RADAR" | "BANK">("MEMBERS");
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [radarTargets, setRadarTargets] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Guild Data
  const guildName = userData?.guildName || "SHADOW_SYNDICATE";
  const guildId = userData?.guildId || user?.uid; 
  const isGuildLeader = userData?.uid === userData?.guildLeader;
  const [guildBank, setGuildBank] = useState(0);

  // Transaction State
  const [depositAmount, setDepositAmount] = useState("");
  const [transferTarget, setTransferTarget] = useState<GuildMember | null>(null);
  const [transferAmount, setTransferAmount] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const popCoins = userData?.wallet?.popCoins ?? 0;

  // --- 1. FETCH GUILD MEMBERS + REAL-TIME SYNC ---
  useEffect(() => {
    if (!userData) return;

    const q = query(
      collection(db, "users"),
      where("guildId", "==", guildId),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      // FIX: Explicitly cast doc.data() to UserData
      const members = snap.docs.map(doc => {
        const data = doc.data() as UserData;
        return {
          ...data,
          id: doc.id,
          online: true 
        };
      });
      
      // Sort by Wealth (Leaderboard) - Now TypeScript knows 'wallet' exists
      setGuildMembers(members.sort((a, b) => (b.wallet?.popCoins || 0) - (a.wallet?.popCoins || 0)));
      
      // Calculate Guild Bank - Now TypeScript knows 'guildBankContribution' exists
      const totalBank = members.reduce((sum, m) => sum + (m.guildBankContribution || 0), 0);
      setGuildBank(totalBank);
    });

    return () => unsubscribe();
  }, [userData, guildId]);

  // --- 2. REAL-TIME CHAT ---
  useEffect(() => {
    if (activeTab !== "CHAT") return;

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
        text: newMessage.trim().toUpperCase(),
        senderId: userData.uid,
        senderName: userData.username,
        timestamp: serverTimestamp()
      });
      setNewMessage("");
      play("success"); 
    } catch (e) {
      toast.error("COMMS DOWN // RETRY");
    } finally {
      setSending(false);
    }
  };

  // --- 4. RADAR SCAN (Recruiting) ---
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
        .map(doc => ({ id: doc.id, ...doc.data() } as any)) // Cast for radar targets
        .filter((u: any) => u.id !== user.uid);

      setRadarTargets(targets);
      play("success");
    } catch (e) {
      toast.error("RADAR JAMMED");
    } finally {
      setLoading(false);
    }
  };

  // --- 5. RECRUIT ACTION ---
  const handleRecruit = async (target: any) => {
    play("click");
    if (confirm(`SEND GUILD INVITE TO ${target.username}?`)) {
       try {
         await updateDoc(doc(db, "users", target.id), { guildId: guildId });
         toast.success(`${target.username} ASSIMILATED`);
         play("success");
         setRadarTargets(prev => prev.filter(u => u.id !== target.id));
       } catch(e) { toast.error("RECRUITMENT FAILED"); }
    }
  };

  // --- 6. BANK DEPOSIT ---
  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount <= 0 || amount > popCoins) return toast.error("INVALID FUNDS");

    play("kaching");
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user!.uid), {
        "wallet.popCoins": increment(-amount),
        guildBankContribution: increment(amount)
      });
      await batch.commit();
      
      toast.success(`DEPOSITED ${amount} PC`);
      setDepositAmount("");
    } catch (e) { toast.error("TRANSACTION FAILED"); }
  };

  // --- 7. PEER TRANSFER ---
  const handleTransfer = async () => {
    if (!transferTarget || !user) return;
    const amount = parseInt(transferAmount);
    if (isNaN(amount) || amount <= 0 || amount > popCoins) return toast.error("INVALID FUNDS");

    play("kaching");
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { "wallet.popCoins": increment(-amount) });
      batch.update(doc(db, "users", transferTarget.id), { "wallet.popCoins": increment(amount) });
      await batch.commit();
      
      toast.success(`SENT ${amount} PC TO ${transferTarget.username}`);
      setTransferTarget(null);
      setTransferAmount("");
    } catch (e) { toast.error("TRANSFER FAILED"); }
  };

  const getGuildLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://boyzngalz.com';
    return `${origin}/auth/signup?ref=${user?.uid}`;
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col selection:bg-cyan-900 selection:text-white">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image src="/images/referral-bg.jpg" alt="Grid" fill priority className="object-cover opacity-15 grayscale contrast-150" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay animate-pulse" />
      </div>

      <SoundPrompter />
      <Background />

      {/* TOP HUD */}
      <header className="relative z-50 flex-none border-b-4 border-cyan-900/60 bg-black/90 backdrop-blur-2xl">
        <div className="px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <TransitionLink href="/dashboard" className="flex items-center gap-4 group self-start md:self-center">
            <div className="w-12 h-12 border-2 border-cyan-600/40 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-cyan-400 transition-all rounded-lg">
              <ArrowLeft size={24} className="text-neutral-500 group-hover:text-cyan-400" />
            </div>
            <span className="text-sm font-mono text-neutral-400 uppercase tracking-widest hidden md:inline">Back to Base</span>
          </TransitionLink>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <ShieldCheck size={32} className="text-cyan-500" />
              <HackerText text={guildName} className="text-3xl md:text-4xl font-black text-cyan-400" />
            </div>
            <div className="flex items-center justify-center gap-6 text-xs font-mono text-cyan-600 uppercase">
              <span>{guildMembers.length} Operatives</span>
              <span>•</span>
              <span className="text-yellow-500">Vault: {guildBank.toLocaleString()} PC</span>
            </div>
          </div>

          <div className="flex gap-2 self-end md:self-center">
             <div className="bg-cyan-950/30 border border-cyan-500/30 px-4 py-2 rounded text-xs font-mono text-cyan-400 flex items-center gap-2">
                <Globe size={14} /> Global Rank: #42
             </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-t border-white/10 overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab("MEMBERS")} className={cn("flex-1 min-w-[100px] py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4", activeTab === "MEMBERS" ? "bg-cyan-950/40 text-cyan-400 border-cyan-500" : "text-neutral-600 border-transparent hover:text-white")}>
            <Users size={18} className="inline mr-2" /> Roster
          </button>
          <button onClick={() => setActiveTab("CHAT")} className={cn("flex-1 min-w-[100px] py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4", activeTab === "CHAT" ? "bg-green-950/40 text-green-400 border-green-500" : "text-neutral-600 border-transparent hover:text-white")}>
            <MessageCircle size={18} className="inline mr-2" /> Comms
          </button>
          <button onClick={() => { setActiveTab("RADAR"); scanRadar(); }} className={cn("flex-1 min-w-[100px] py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4", activeTab === "RADAR" ? "bg-red-950/40 text-red-400 border-red-500" : "text-neutral-600 border-transparent hover:text-white")}>
            <Radar size={18} className="inline mr-2" /> Recruit
          </button>
          <button onClick={() => setActiveTab("BANK")} className={cn("flex-1 min-w-[100px] py-4 text-sm font-black uppercase tracking-widest transition-all border-b-4", activeTab === "BANK" ? "bg-yellow-950/40 text-yellow-400 border-yellow-500" : "text-neutral-600 border-transparent hover:text-white")}>
            <Diamond size={18} className="inline mr-2" /> Vault
          </button>
        </div>
      </header>

      {/* MAIN LOBBY CONTENT */}
      <div className="relative z-40 flex-1 p-4 md:p-8 overflow-hidden flex flex-col">

        {/* 1. ROSTER TAB */}
        {activeTab === "MEMBERS" && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <HackerText text="ACTIVE_OPERATIVES" className="text-2xl font-black text-cyan-500" />
                <Button onClick={() => { play("click"); navigator.clipboard.writeText(getGuildLink()); toast.success("INVITE COPIED"); }} size="sm" className="bg-cyan-900/50 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500 hover:text-black">
                    <Copy size={16} className="mr-2" /> Invite Link
                </Button>
            </div>
            
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {guildMembers.map((member) => (
                  <div key={member.id} className="bg-neutral-900/60 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-cyan-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20">
                        <Image src={member.avatar || "/avatars/1.jpg"} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white uppercase">{member.username}</span>
                          {member.id === userData?.guildLeader && <Crown size={14} className="text-yellow-500" />}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-500 uppercase flex gap-2">
                            <span>{member.membership?.tier || "RECRUIT"}</span>
                            <span className="text-cyan-600">•</span>
                            <span>{member.wallet?.popCoins?.toLocaleString() || 0} PC</span>
                        </div>
                      </div>
                    </div>
                    
                    {member.id !== user?.uid && (
                        <Button 
                            size="sm" 
                            onClick={() => setTransferTarget(member)}
                            className="bg-black border border-white/20 hover:bg-cyan-900/50 hover:text-cyan-400 text-[10px] uppercase font-bold h-8"
                        >
                            Transfer Funds
                        </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 2. CHAT TAB */}
        {activeTab === "CHAT" && (
          <div className="h-full flex flex-col max-w-4xl mx-auto w-full bg-black/40 border border-green-900/30 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-green-900/30 bg-green-950/10 flex justify-between items-center">
                <span className="text-xs font-mono text-green-500 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Secure Channel Active
                </span>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[80%]", msg.senderId === user?.uid ? "self-end items-end" : "self-start items-start")}>
                    <span className="text-[9px] font-mono text-neutral-500 mb-1 uppercase">{msg.senderName}</span>
                    <div className={cn("px-4 py-2 rounded-lg text-sm font-mono", msg.senderId === user?.uid ? "bg-green-600 text-black" : "bg-neutral-800 text-gray-200 border border-white/10")}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-black/60 border-t border-green-900/30 flex gap-3">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="ENTER ENCRYPTED MESSAGE..."
                className="bg-transparent border-green-900/50 text-green-400 font-mono placeholder:text-green-900/50 focus:border-green-500"
                disabled={sending}
              />
              <Button onClick={sendMessage} disabled={sending} className="bg-green-600 hover:bg-green-500 text-black w-12">
                <Send size={18} />
              </Button>
            </div>
          </div>
        )}

        {/* 3. RADAR TAB */}
        {activeTab === "RADAR" && (
          <div className="h-full flex flex-col">
             <div className="text-center mb-8">
                <Radar size={48} className="text-red-500 mx-auto mb-4 animate-spin-slow" />
                <HackerText text="GLOBAL RECRUITMENT SCANNER" className="text-2xl font-black text-red-500" />
             </div>

             {loading ? (
                 <div className="flex-1 flex items-center justify-center">
                     <HackerText text="SCANNING_SECTOR_7G..." className="text-xl text-red-800 animate-pulse" />
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
                     {radarTargets.length > 0 ? radarTargets.map((target) => (
                         <div key={target.id} className="bg-red-950/10 border border-red-900/40 p-6 rounded-xl flex flex-col items-center text-center hover:bg-red-950/30 transition-all group">
                             <div className="w-16 h-16 rounded-full bg-black border-2 border-red-800 overflow-hidden mb-4 grayscale group-hover:grayscale-0 transition-all">
                                <Image src={target.avatar || "/avatars/1.jpg"} alt="" width={64} height={64} className="object-cover h-full w-full" />
                             </div>
                             <h3 className="text-lg font-black text-white uppercase mb-1">{target.username}</h3>
                             <p className="text-xs font-mono text-red-400 mb-6">Freelancer // {target.wallet?.popCoins || 0} PC</p>
                             <Button onClick={() => handleRecruit(target)} className="w-full bg-red-700 hover:bg-red-600 text-white font-black uppercase text-xs tracking-widest">
                                 Assimilate
                             </Button>
                         </div>
                     )) : (
                         <div className="col-span-3 text-center text-neutral-600 font-mono py-20">
                             NO FREE AGENTS DETECTED. RESCANNING RECOMMENDED.
                         </div>
                     )}
                 </div>
             )}
          </div>
        )}

        {/* 4. BANK TAB */}
        {activeTab === "BANK" && (
          <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
             <div className="relative mb-12">
                <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse" />
                <Diamond size={100} className="text-yellow-400 relative z-10" />
             </div>
             
             <h2 className="text-5xl font-black text-white mb-2 tabular-nums tracking-tighter">
                {guildBank.toLocaleString()} <span className="text-yellow-500">PC</span>
             </h2>
             <p className="text-sm font-mono text-neutral-400 uppercase tracking-widest mb-12">Total Syndicate Holdings</p>

             <div className="w-full bg-neutral-900/80 border border-yellow-600/30 p-8 rounded-2xl">
                <label className="block text-xs font-mono text-yellow-500 uppercase mb-4 text-center">Deposit Personal Funds</label>
                <div className="flex gap-4">
                    <Input 
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="AMOUNT"
                        className="bg-black border-2 border-white/10 focus:border-yellow-500 text-2xl font-black text-center h-16"
                    />
                    <Button onClick={handleDeposit} className="h-16 px-8 bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xl uppercase">
                        Deposit
                    </Button>
                </div>
                <div className="mt-4 text-center">
                    <span className="text-xs text-neutral-500 uppercase">Available: {popCoins.toLocaleString()} PC</span>
                </div>
             </div>
          </div>
        )}

      </div>

      {/* TRANSFER MODAL OVERLAY */}
      {transferTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm bg-neutral-900 border border-cyan-500/50 p-8 rounded-2xl shadow-2xl">
                <h3 className="text-xl font-black text-cyan-400 uppercase text-center mb-6">Wire Transfer</h3>
                
                <div className="bg-black p-4 rounded-lg border border-white/10 mb-6 text-center">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Recipient</span>
                    <div className="text-2xl font-black text-white">{transferTarget.username}</div>
                </div>

                <Input 
                    type="number" 
                    value={transferAmount} 
                    onChange={(e) => setTransferAmount(e.target.value)} 
                    placeholder="AMOUNT"
                    className="h-14 text-center text-xl font-black bg-cyan-950/20 border-cyan-900/50 focus:border-cyan-500 mb-6"
                />

                <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => setTransferTarget(null)} variant="ghost" className="uppercase font-bold text-neutral-500">Cancel</Button>
                    <Button onClick={handleTransfer} className="bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase">Send Funds</Button>
                </div>
            </div>
        </div>
      )}

    </main>
  );
}