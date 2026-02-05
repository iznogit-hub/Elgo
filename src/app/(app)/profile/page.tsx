"use client";

import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/context/auth-context";
import { 
  Terminal, Crown, Pencil, ArrowLeft, 
  LogOut, Cpu, Activity, CreditCard, Lock,
  Instagram, Save, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Background } from "@/components/ui/background";
import { TransitionLink } from "@/components/ui/transition-link";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  const router = useRouter();
  
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  
  // INSTAGRAM BINDING STATE
  const [igHandle, setIgHandle] = useState(userData?.instagramHandle || "");
  const [isBinding, setIsBinding] = useState(false);

  // SAFE ACCESSORS
  const tier = userData?.membership?.tier || (userData as any)?.tier || "recruit";
  const popCoins = userData?.wallet?.popCoins || (userData as any)?.popCoins || 0;
  const username = userData?.username || "OPERATIVE";
  const connectedHandle = userData?.instagramHandle || null;

  const handleLogout = async () => {
      play("off");
      await signOut(auth);
      router.push("/");
  };

  const handleBindInstagram = async () => {
      if (!igHandle.startsWith("@")) {
          return toast.error("HANDLE MUST START WITH @");
      }
      if (!user) return;
      
      setIsBinding(true);
      play("click");
      
      try {
          await updateDoc(doc(db, "users", user.uid), {
              instagramHandle: igHandle
          });
          toast.success("IDENTITY BOUND SUCCESSFULLY");
          play("success");
      } catch (e) {
          toast.error("BINDING FAILED");
          play("error");
      } finally {
          setIsBinding(false);
      }
  };

  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     play("click");
     try {
        await updateDoc(doc(db, "users", user.uid), {
            username: newUsername.trim().toUpperCase()
        });
        toast.success("ALIAS UPDATED");
        setShowNameEdit(false);
        window.location.reload(); 
     } catch (e) {
        toast.error("UPDATE FAILED");
     }
  };

  if (!userData) return null;

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      <VideoStage src="/video/main.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      {/* TOP HUD */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <TransitionLink 
              href="/dashboard"
              className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </TransitionLink>
        </div>
      </nav>

      {/* CENTRAL FEED */}
      <div className="relative z-40 w-full max-w-md h-screen pt-24 px-6 pb-32 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        
        {/* 1. IDENTITY CARD */}
        <div className="w-full bg-gradient-to-br from-black/80 to-gray-900/80 border border-white/10 backdrop-blur-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown size={60} className={tier === "council" ? "text-yellow-500" : "text-white"} />
            </div>

            <div className="relative z-10 space-y-4">
                <div>
                    <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Operative_Alias</span>
                    <div 
                        onClick={() => { setNewUsername(username); setShowNameEdit(true); play("click"); }}
                        className="flex items-center gap-2 cursor-pointer group/edit"
                    >
                        <h1 className="text-2xl font-black font-orbitron italic uppercase text-white tracking-tighter">
                            {username}
                        </h1>
                        <Pencil size={12} className="text-gray-600 group-hover/edit:text-cyan-500 transition-colors" />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="p-2 bg-black/40 border border-white/5 w-28">
                        <span className="block text-[7px] font-mono text-gray-500 uppercase">Clearance</span>
                        <span className="text-xs font-black uppercase tracking-wide text-cyan-500">{tier}</span>
                    </div>
                    <div className="p-2 bg-black/40 border border-white/5 w-24">
                        <span className="block text-[7px] font-mono text-gray-500 uppercase">Wealth</span>
                        <span className="text-xs font-black text-white uppercase tracking-wide">{popCoins} PC</span>
                    </div>
                </div>
            </div>
        </div>

        {/* 2. SOCIAL BINDING (New Feature) */}
        <div className="w-full bg-black/60 border border-white/10 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-black font-orbitron uppercase text-white flex items-center gap-2">
                    <Instagram size={14} className="text-pink-500" /> Identity_Link
                </h3>
                {connectedHandle && <CheckCircle2 size={14} className="text-green-500" />}
            </div>
            
            <p className="text-[9px] font-mono text-gray-400 leading-relaxed">
                Bind your primary handle to receive bounties and payouts.
            </p>

            <div className="flex gap-2">
                <Input 
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                    placeholder="@YOUR_HANDLE"
                    disabled={!!connectedHandle} // Lock if already set (Optional, can remove if you want editable)
                    className="bg-black/40 border-white/10 text-[10px] h-10 font-mono text-white focus:border-pink-500 uppercase"
                />
                {!connectedHandle && (
                    <Button 
                        onClick={handleBindInstagram}
                        disabled={isBinding || !igHandle}
                        className="h-10 bg-pink-600 hover:bg-pink-500 text-white font-black text-[9px] uppercase w-24"
                    >
                        {isBinding ? "Saving..." : "Save"}
                    </Button>
                )}
            </div>
            {connectedHandle && (
                <p className="text-[8px] font-mono text-green-500 uppercase tracking-widest text-right">
                    Verified: {connectedHandle}
                </p>
            )}
        </div>

        {/* 3. SETTINGS */}
        <div className="space-y-3 pt-4">
            <button 
                onClick={handleLogout}
                className="w-full h-12 border border-white/10 bg-black/40 text-gray-500 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/5 transition-all uppercase tracking-widest text-[9px] font-black flex items-center justify-center gap-2"
            >
                <LogOut size={14} /> Terminate_Session
            </button>
        </div>

      </div>

      {/* EDIT NAME MODAL */}
      {showNameEdit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in zoom-in duration-200">
            <div className="w-full max-w-xs bg-black border border-cyan-500/30 p-6 space-y-6">
                <h3 className="text-sm font-black font-orbitron text-white uppercase flex items-center gap-2 italic">
                    <Terminal size={14} className="text-cyan-500" /> Rewrite_Alias
                </h3>
                <Input 
                    value={newUsername} 
                    onChange={(e) => setNewUsername(e.target.value.toUpperCase())} 
                    className="bg-black/50 border-white/10 text-cyan-400 font-orbitron font-black text-lg h-12 text-center uppercase" 
                    placeholder="NEW_CODENAME" 
                />
                <div className="flex gap-2">
                    <Button onClick={handleNameUpdate} className="flex-1 bg-cyan-500 text-black font-black text-[9px] h-10 uppercase italic">
                        Confirm
                    </Button>
                    <Button onClick={() => setShowNameEdit(false)} variant="ghost" className="text-[9px] uppercase font-bold text-white/20">Cancel</Button>
                </div>
            </div>
        </div>
      )}
    </main>
  );
}