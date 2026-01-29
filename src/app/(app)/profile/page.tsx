"use client";

import { useState } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { 
  Zap, Radio, Share2, Terminal, AlertTriangle, 
  X, Check, RotateCcw, Loader2, User, Trophy, Crown, Pencil
} from "lucide-react";
import { toast } from "sonner";

// --- ZAIBATSU UI ---
import { HackerText } from "@/components/ui/hacker-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input
import { Background } from "@/components/ui/background";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
import OperativeViewer from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";

const NICHES = [
  { id: "fitness", label: "FITNESS" },
  { id: "fashion", label: "FASHION" },
  { id: "tech", label: "TECH" },
  { id: "business", label: "BUSINESS" },
  { id: "food", label: "FOOD" },
  { id: "gaming", label: "GAMING" },
  { id: "travel", label: "TRAVEL" },
  { id: "music", label: "MUSIC" },
  { id: "beauty", label: "BEAUTY" },
  { id: "art", label: "ART" }
];

export default function ProfilePage() {
  const { userData, user } = useAuth();
  const { play } = useSfx();
  const router = useRouter();
  
  // MODAL STATES
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showNameEdit, setShowNameEdit] = useState(false); // ⚡ NEW STATE
  const [selectedNiche, setSelectedNiche] = useState("");
  const [newUsername, setNewUsername] = useState(""); // ⚡ NEW STATE
  const [isSwitching, setIsSwitching] = useState(false);

  // META CONNECT HANDLER
  const handleConnectInstagram = () => {
    play("click");
    if (!userData) return;
    toast.loading("INITIATING META HANDSHAKE...");
    // ⚡ FIX: Use the correct API route
    window.location.href = `/api/auth/instagram/login?uid=${userData.uid}`;
  };

  // ⚡ NEW: USERNAME UPDATE HANDLER
  const handleNameUpdate = async () => {
     if (!newUsername.trim() || !user) return;
     setIsSwitching(true); // Reuse loading state
     play("click");

     try {
        await updateDoc(doc(db, "users", user.uid), {
            username: newUsername.trim().toUpperCase()
        });
        toast.success("CODENAME UPDATED");
        setShowNameEdit(false);
        window.location.reload(); 
     } catch (e) {
        toast.error("UPDATE FAILED");
        play("error");
     } finally {
        setIsSwitching(false);
     }
  };

  // NICHE SWITCH HANDLER
  const handleNicheSwitch = async () => {
    if (!selectedNiche || !user) return;
    play("error"); 
    setIsSwitching(true);
    
    try {
      await updateDoc(doc(db, "users", user.uid), {
        niche: selectedNiche,
        velocity: 0, 
        avatarId: `${selectedNiche}_default` 
      });

      toast.success(`IDENTITY REFORMATTED: ${selectedNiche.toUpperCase()}`);
      setShowSwitcher(false);
      window.location.reload(); 
    } catch (err) {
      toast.error("SYSTEM ERROR. REFORMAT FAILED.");
    } finally {
      setIsSwitching(false);
    }
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 relative overflow-x-hidden">
      
      {/* 1. BACKGROUND LAYERS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Background />
      </div>

      {/* --- 2. THE CHARACTER STAGE --- */}
      <div className="relative z-10 h-[55vh] w-full border-b border-white/10 overflow-hidden group">
        
        {/* Dynamic Grid Floor */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-20 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [perspective:1000px] [transform:rotateX(60deg)scale(1.5)] origin-top opacity-50" />
        
        {/* 3D VIEWER */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pt-10">
          <OperativeViewer 
            url={userData.avatarId ? `/models/${userData.avatarId}.glb` : undefined} 
            velocity={userData.velocity}
            tier={userData.tier}
          />
        </div>

        {/* OVERLAY STATS (Bottom Left) */}
        <div className="absolute bottom-8 left-6 md:left-12 z-30 space-y-2">
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold uppercase tracking-widest backdrop-blur-md">
               {userData.niche} UNIT
             </span>
             {userData.tier === "inner_circle" ? (
               <span className="px-2 py-0.5 rounded bg-red-950/50 border border-red-500/30 text-[10px] text-red-500 font-bold uppercase tracking-widest animate-pulse backdrop-blur-md flex items-center gap-1">
                 <Crown className="w-3 h-3" /> PURGE IMMUNE
               </span>
             ) : (
                <span className="px-2 py-0.5 rounded bg-gray-900/50 border border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-widest backdrop-blur-md">
                    EXPENDABLE
                </span>
             )}
          </div>
          
          <div className="flex items-center gap-3 group/name">
              <h1 className="text-5xl md:text-7xl font-black font-orbitron text-white leading-none tracking-tighter drop-shadow-2xl">
                <HackerText text={userData.username} speed={50} />
              </h1>
              {/* ⚡ NEW: EDIT BUTTON */}
              <button 
                onClick={() => { setNewUsername(userData.username); setShowNameEdit(true); play("click"); }}
                className="opacity-0 group-hover/name:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-cyan-400"
              >
                  <Pencil className="w-5 h-5" />
              </button>
          </div>
          
          <p className="text-xs font-mono text-gray-400 tracking-[0.2em] uppercase">
            UID: {userData.uid.slice(0, 8)}...
          </p>
        </div>
      </div>

      {/* --- 3. STATS & CONFIG --- */}
      <main className="relative z-10 max-w-5xl mx-auto p-4 md:p-8 space-y-8 -mt-8">
        
        {/* VITALS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MagneticWrapper>
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl text-center group hover:border-cyan-500/50 transition-colors shadow-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                    <Radio className="w-3 h-3" /> Velocity
                </p>
                <p className="text-3xl font-bold text-cyan-400 font-orbitron group-hover:scale-110 transition-transform">
                    {userData.velocity}
                </p>
            </div>
          </MagneticWrapper>

          <MagneticWrapper>
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl text-center group hover:border-yellow-500/50 transition-colors shadow-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3" /> BP (Premium)
                </p>
                <p className="text-3xl font-bold text-yellow-400 font-orbitron group-hover:scale-110 transition-transform">
                    {userData.bubblePoints}
                </p>
            </div>
          </MagneticWrapper>

          <MagneticWrapper>
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl text-center group hover:border-white/30 transition-colors shadow-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                    <Trophy className="w-3 h-3" /> PC (Free)
                </p>
                <p className="text-3xl font-bold text-white font-orbitron group-hover:scale-110 transition-transform">
                    {userData.popCoins}
                </p>
            </div>
          </MagneticWrapper>

          <MagneticWrapper>
            <div className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-6 rounded-xl text-center group hover:border-green-500/50 transition-colors shadow-lg">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                    <Check className="w-3 h-3" /> Streak
                </p>
                <p className="text-3xl font-bold text-green-500 font-orbitron group-hover:scale-110 transition-transform">
                    3 DAYS
                </p>
            </div>
          </MagneticWrapper>
        </div>

        {/* SETTINGS LIST */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold font-orbitron border-b border-white/10 pb-2 pl-2">
            <Terminal className="w-5 h-5 text-cyan-500" /> 
            OPERATIVE SETTINGS
          </div>

          <div className="bg-[#0A0A0A]/50 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 backdrop-blur-sm">
            
            {/* ITEM 1: INSTAGRAM */}
            <div className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${userData.instagramConnected ? 'bg-green-900/10 border-green-500/30 text-green-500' : 'bg-pink-900/10 border-pink-500/30 text-pink-500'}`}>
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white font-orbitron mb-1">Instagram Uplink</h4>
                  <p className="text-xs text-gray-500 font-mono tracking-wide">
                    {userData.instagramConnected ? "[STATUS: SECURE_LINK_ESTABLISHED]" : "[STATUS: NO_SIGNAL_DETECTED]"}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleConnectInstagram}
                onMouseEnter={() => play("hover")}
                disabled={!!userData.instagramConnected}
                className={`border-white/10 text-xs font-mono h-10 px-6 tracking-widest ${userData.instagramConnected ? "text-green-500 cursor-default" : "hover:text-pink-500 hover:border-pink-500 hover:bg-pink-950/20"}`}
              >
                {userData.instagramConnected ? "LINKED" : "CONNECT"}
              </Button>
            </div>

            {/* ITEM 2: NICHE SWITCHER */}
            <div className="p-6 flex items-center justify-between group hover:bg-red-950/10 transition-colors">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-cyan-900/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white font-orbitron mb-1">Identity Reformat (Niche)</h4>
                  <p className="text-xs text-gray-500 font-mono tracking-wide">Current Protocol: <span className="text-cyan-400 font-bold uppercase">{userData.niche}</span></p>
                </div>
              </div>
              
              <MagneticWrapper>
                <Button 
                    variant="outline" 
                    onClick={() => { setShowSwitcher(true); play("click"); }}
                    onMouseEnter={() => play("hover")}
                    className="border-white/10 text-xs font-mono h-10 px-6 tracking-widest hover:border-red-500 hover:text-red-500 hover:bg-red-950/20 transition-all"
                >
                    <RotateCcw className="w-3 h-3 mr-2" /> SWITCH_NICHE
                </Button>
              </MagneticWrapper>
            </div>

          </div>
        </section>

        {/* SESSION INFO */}
        <div className="pt-8 text-center opacity-30 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-gray-500 font-mono flex items-center justify-center gap-2">
            <User className="w-3 h-3" /> SESSION ID: {userData.uid}
          </p>
        </div>

      </main>

      {/* --- MODAL 1: NICHE SWITCHER --- */}
      {showSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-black border-2 border-red-600 rounded-2xl p-8 shadow-[0_0_100px_rgba(220,38,38,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            <button 
                onClick={() => { setShowSwitcher(false); play("click"); }} 
                className="absolute top-4 right-4 text-red-900 hover:text-red-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="text-center mb-8 relative z-10">
              <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-600 animate-pulse">
                 <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-3xl font-black font-orbitron text-red-500 tracking-wider">SYSTEM WARNING</h3>
              <div className="mt-4 p-4 border border-red-900/50 bg-red-950/20 rounded-lg text-left">
                <p className="text-red-400 text-sm font-mono leading-relaxed">
                  <span className="font-bold">[ALERT]</span> Initiating Identity Reformat will trigger a partial system wipe.
                </p>
                <ul className="list-disc list-inside text-xs text-gray-400 mt-2 font-mono space-y-1">
                    <li>Your 3D Avatar will be reset.</li>
                    <li><span className="text-white font-bold underline decoration-red-500">VELOCITY WILL DROP TO 0.</span></li>
                    <li>Current missions will be aborted.</li>
                </ul>
              </div>
            </div>
            <div className="relative z-10 mb-8">
                <p className="text-xs text-center text-gray-500 uppercase tracking-widest mb-4">Select New Frequency</p>
                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {NICHES.filter(n => n.id !== userData.niche).map((niche) => (
                    <button
                    key={niche.id}
                    onClick={() => { setSelectedNiche(niche.id); play("click"); }}
                    onMouseEnter={() => play("hover")}
                    className={`
                        p-4 rounded border text-xs font-bold uppercase tracking-widest transition-all font-mono
                        ${selectedNiche === niche.id 
                        ? "bg-red-600 text-black border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" 
                        : "bg-black border-white/10 text-gray-500 hover:border-white/30 hover:text-white"}
                    `}
                    >
                    {niche.label}
                    </button>
                ))}
                </div>
            </div>
            <div className="flex gap-4 relative z-10">
              <Button 
                onClick={() => { setShowSwitcher(false); play("click"); }} 
                variant="outline" 
                className="flex-1 border-white/10 text-gray-400 h-14 font-bold tracking-widest hover:bg-white/5"
              >
                ABORT
              </Button>
              <Button 
                onClick={handleNicheSwitch} 
                disabled={!selectedNiche || isSwitching}
                className="flex-[2] bg-red-600 hover:bg-red-500 text-black font-bold h-14 tracking-widest font-orbitron shadow-[0_0_30px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSwitching ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" /> PURGING...</span>
                ) : (
                  "CONFIRM REFORMAT"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: USERNAME EDIT (NEW) --- */}
      {showNameEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-md bg-black border border-cyan-500/50 rounded-2xl p-8 relative shadow-[0_0_50px_rgba(6,182,212,0.2)]">
              <button onClick={() => setShowNameEdit(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
              
              <h3 className="text-2xl font-bold font-orbitron text-white mb-6 flex items-center gap-2">
                 <Terminal className="w-6 h-6 text-cyan-400" /> EDIT CODENAME
              </h3>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mb-2 block">New Identity</label>
                    <Input 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value.toUpperCase())}
                        className="bg-black/50 border-white/20 text-xl font-bold font-orbitron text-white h-14"
                        placeholder="ENTER_NEW_ALIAS"
                    />
                    <p className="text-[10px] text-gray-600 mt-2 font-mono">* Special characters may be sanitized.</p>
                 </div>
                 
                 <Button 
                    onClick={handleNameUpdate}
                    disabled={isSwitching || !newUsername}
                    className="w-full h-12 bg-cyan-600 hover:bg-cyan-500 text-black font-bold tracking-widest"
                 >
                    {isSwitching ? "UPDATING DATABASE..." : "CONFIRM UPDATE"}
                 </Button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}