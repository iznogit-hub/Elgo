"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Zap, Radio, Share2, Terminal, AlertTriangle, 
  X, Check, Loader2, Trophy, Crown, 
  Pencil, ArrowLeft, Database, Activity, Fingerprint, Cpu
} from "lucide-react";
import { toast } from "sonner";

// 🧪 ZAIBATSU SYSTEM UI
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

const NICHES = [
  { id: "fitness", label: "FITNESS" }, { id: "fashion", label: "FASHION" },
  { id: "tech", label: "TECH" }, { id: "business", label: "BUSINESS" },
  { id: "gaming", label: "GAMING" }, { id: "music", label: "MUSIC" },
  { id: "art", label: "ART" }
];

export default function ProfilePage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);

  const handleConnectInstagram = () => {
    play("click");
    if (!userData) return;
    toast.loading("INITIATING META HANDSHAKE...");
    window.location.href = `/api/auth/instagram/login?uid=${userData.uid}`;
  };

  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     setIsSwitching(true);
     play("click");
     try {
        await updateDoc(doc(db, "users", user.uid), {
            username: newUsername.trim().toUpperCase()
        });
        toast.success("CODENAME_UPDATED");
        setShowNameEdit(false);
        window.location.reload(); 
     } catch (e) {
        toast.error("UPDATE_FAILED");
        play("error");
     } finally {
        setIsSwitching(false);
     }
  };

  const handleNicheSwitch = async () => {
    if (!selectedNiche || !user) return;
    play("error"); 
    setIsSwitching(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        niche: selectedNiche,
        velocity: 0, 
      });
      toast.success(`IDENTITY_REFORMATTED: ${selectedNiche.toUpperCase()}`);
      setShowSwitcher(false);
      window.location.reload(); 
    } catch (err) {
      toast.error("SYSTEM_ERROR: REFORMAT_FAILED");
    } finally {
      setIsSwitching(false);
    }
  };

  if (!userData) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      
      {/* 📽️ THE THEATER: Central Identity Focus */}
      <VideoStage src="/video/main.mp4" overlayOpacity={0.4} />
      <Background /> 
      <SoundPrompter />

      {/* 📱 TOP HUD NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </TransitionLink>
        </div>
        
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <Fingerprint size={10} className="text-cyan-500" />
                <span className="text-[8px] font-mono font-black tracking-widest text-cyan-500 uppercase">Auth_Session: Active</span>
            </div>
        </div>
      </nav>

      {/* 👤 IDENTITY INTERFACE: Floating Side Elements */}
      <div className="relative z-50 w-full h-screen pointer-events-none">
        
        {/* LEFT FLANK: Core Identity & Vitals */}
        <div className="absolute left-6 top-32 w-44 space-y-6 pointer-events-auto">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2 py-0.5 border text-[7px] font-black uppercase tracking-tighter backdrop-blur-md",
                        userData.tier === "inner_circle" ? "bg-red-500/20 border-red-500 text-red-500 animate-pulse" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                    )}>
                        {userData.tier === "inner_circle" ? "PURGE_IMMUNE" : "EXPENDABLE_GRADE"}
                    </span>
                </div>
                <div className="group cursor-pointer" onClick={() => { setNewUsername(userData.username); setShowNameEdit(true); play("click"); }}>
                    <h1 className="text-2xl font-black font-orbitron italic uppercase leading-none tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                        {userData.username} <Pencil size={10} className="inline ml-1 opacity-30 group-hover:opacity-100" />
                    </h1>
                    <p className="text-[7px] font-mono text-white/30 uppercase mt-1">Niche: {userData.niche}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <MiniVital label="VELOCITY" value={userData.velocity} color="text-cyan-400" />
                <MiniVital label="STREAK" value="3_DAYS" color="text-green-500" />
                <MiniVital label="BP" value={userData.bubblePoints} color="text-yellow-400" />
                <MiniVital label="PC" value={userData.popCoins} color="text-white" />
            </div>
        </div>

        {/* RIGHT FLANK: System Configuration */}
        <div className="absolute right-6 top-32 w-48 space-y-4 pointer-events-auto">
            <h3 className="text-[9px] font-black font-orbitron tracking-widest text-gray-400 uppercase flex items-center justify-end gap-2 text-right">
                Config_Control <Terminal size={10} className="text-cyan-500" />
            </h3>

            {/* Instagram Uplink Card */}
            <div className={cn(
                "p-4 bg-black/40 border-r-2 backdrop-blur-xl space-y-3",
                userData.instagramConnected ? "border-green-500/50" : "border-pink-500/50"
            )}>
                <div className="flex items-center justify-between text-[8px] font-black uppercase">
                    <span className={userData.instagramConnected ? "text-green-400" : "text-pink-400"}>Meta_Uplink</span>
                    <Share2 size={10} />
                </div>
                <button 
                    onClick={handleConnectInstagram}
                    disabled={!!userData.instagramConnected}
                    className={cn(
                        "w-full py-2 border text-[8px] font-black tracking-widest uppercase transition-all",
                        userData.instagramConnected 
                            ? "border-green-500/30 bg-green-500/10 text-green-500 cursor-default" 
                            : "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500 hover:text-white"
                    )}
                >
                    {userData.instagramConnected ? "Linked" : "Connect"}
                </button>
            </div>

            {/* Reformat Card */}
            <div className="p-4 bg-black/40 border-r-2 border-red-500/50 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between text-[8px] font-black uppercase text-red-500">
                    <span>Identity_Reformat</span>
                    <Radio size={10} />
                </div>
                <button 
                    onClick={() => { setShowSwitcher(true); play("click"); }}
                    className="w-full py-2 bg-red-900/20 border border-red-500/30 text-red-500 font-black italic tracking-widest text-[8px] hover:bg-red-600 hover:text-black transition-all uppercase"
                >
                    Initialize_Wipe
                </button>
            </div>
        </div>
      </div>

      {/* 🧪 SYSTEM FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[100] px-6 py-5 flex items-center justify-between border-t border-white/5 bg-black/80 backdrop-blur-2xl">
         <div className="flex items-center gap-4 opacity-50 text-cyan-500">
            <Cpu size={14} className="animate-pulse" />
            <span className="text-[7px] font-mono uppercase tracking-[0.2em] font-bold">Secure_ID // 0x{userData.uid.slice(0, 4)}</span>
         </div>
         <div className="text-[9px] font-bold text-white/10 uppercase tracking-[0.5em] font-mono italic">
            OPERATIVE_PROFILE // SYNC_ACTIVE
         </div>
      </footer>

      {/* --- MODALS --- */}
      {showSwitcher && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in zoom-in duration-200">
            <div className="w-full max-w-xs bg-black border border-red-600 p-6 space-y-6 shadow-[0_0_50px_rgba(220,38,38,0.2)]">
                <div className="text-center space-y-2">
                    <AlertTriangle size={24} className="text-red-600 mx-auto animate-pulse" />
                    <h3 className="text-sm font-black font-orbitron text-red-500 uppercase">System_Purge_Warning</h3>
                    <p className="text-[8px] font-mono text-red-400/50 uppercase leading-relaxed">Identity reformat will reset velocity to zero. Proceed?</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto no-scrollbar">
                    {NICHES.filter(n => n.id !== userData.niche).map(n => (
                        <button key={n.id} onClick={() => { setSelectedNiche(n.id); play("click"); }} className={cn("py-2 text-[8px] font-black uppercase border", selectedNiche === n.id ? "bg-red-600 border-red-600 text-black" : "border-white/10 text-white/40")}>
                            {n.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleNicheSwitch} disabled={!selectedNiche || isSwitching} className="flex-1 bg-red-600 text-black font-black text-[9px] h-10 uppercase italic">Confirm</Button>
                    <Button onClick={() => setShowSwitcher(false)} variant="ghost" className="text-[9px] uppercase font-bold text-white/20">Abort</Button>
                </div>
            </div>
        </div>
      )}

      {showNameEdit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in zoom-in duration-200">
            <div className="w-full max-w-xs bg-black border border-cyan-500/30 p-6 space-y-6">
                <h3 className="text-sm font-black font-orbitron text-white uppercase flex items-center gap-2 italic">
                    <Terminal size={14} className="text-cyan-500" /> Rename_Alias
                </h3>
                <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value.toUpperCase())} className="bg-black/50 border-white/10 text-cyan-400 font-orbitron font-black text-lg h-12" placeholder="NEW_ALIAS..." />
                <div className="flex gap-2">
                    <Button onClick={handleNameUpdate} disabled={isSwitching || !newUsername} className="flex-1 bg-cyan-500 text-black font-black text-[9px] h-10 uppercase italic">Update</Button>
                    <Button onClick={() => setShowNameEdit(false)} variant="ghost" className="text-[9px] uppercase font-bold text-white/20">Cancel</Button>
                </div>
            </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </main>
  );
}

function MiniVital({ label, value, color }: any) {
    return (
        <div className="p-2 bg-black/60 border border-white/5 backdrop-blur-sm space-y-0.5">
            <span className="text-[6px] font-mono text-white/20 uppercase tracking-widest block">{label}</span>
            <span className={cn("text-xs font-black font-orbitron tracking-tighter truncate block", color)}>{value}</span>
        </div>
    );
}