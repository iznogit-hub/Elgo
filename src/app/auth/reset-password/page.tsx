"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { ShieldAlert, Terminal, ArrowLeft, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import VideoStage from "@/components/canvas/video-stage";
import { useSfx } from "@/hooks/use-sfx";
import { cn } from "@/lib/utils";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { play } = useSfx(); 

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    play("click");
    
    if (!email) {
        play("error");
        return toast.error("MISSING_DATA: EMAIL REQUIRED");
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      play("success");
      setSent(true);
      toast.success("RECOVERY SIGNAL TRANSMITTED");
    } catch (error: any) {
      play("error");
      toast.error("TRANSMISSION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center">
      <VideoStage src="/video/auth.mp4" overlayOpacity={0.6} />
      <Background /> 
      <SoundPrompter />

      <nav className="fixed top-0 left-0 right-0 z-[100] p-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/auth/login" className="w-12 h-12 border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center group hover:border-cyan-500 transition-all">
              <ArrowLeft size={20} className="text-gray-400 group-hover:text-cyan-400" />
            </Link>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-1">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-full flex items-center gap-2">
                <ShieldAlert size={10} className="text-red-500" />
                <span className="text-[8px] font-mono font-black tracking-widest text-red-500 uppercase">Recovery_Protocol</span>
            </div>
        </div>
      </nav>

      <div className="relative z-50 w-full h-screen pointer-events-none flex flex-col md:flex-row items-center justify-center gap-12 px-6">
        
        {/* LEFT FLANK */}
        <div className="pointer-events-auto text-center md:text-left">
            <div className="space-y-4">
                <div className="relative inline-block">
                    <LockKeyhole className={cn(
                        "w-16 h-16 transition-colors duration-500",
                        sent ? "text-green-500" : "text-cyan-500"
                    )} />
                </div>
                <h1 className="text-3xl font-black font-orbitron italic uppercase leading-none tracking-tighter text-white">
                    <HackerText text={sent ? "SIGNAL_LOCKED" : "ACCESS_RECOVERY"} speed={40} />
                </h1>
                <p className="text-[8px] font-mono text-cyan-700 tracking-[0.3em] uppercase italic">System_Override_V2</p>
            </div>

            {sent && (
                <div className="mt-6 p-4 bg-green-500/5 border-l-2 border-green-500/50 backdrop-blur-xl animate-in slide-in-from-left-4 duration-500">
                    <p className="text-[9px] font-bold text-green-400 uppercase leading-relaxed tracking-widest">
                        Check secure comms.<br/>Link dispatched.
                    </p>
                    <div className="mt-8 animate-pulse">
                      <Link href="/auth/login" className="text-[10px] text-cyan-500 hover:text-white uppercase tracking-widest border-b border-cyan-500/30 pb-1">
                        Return_To_Gateway &gt;&gt;
                      </Link>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT FLANK */}
        <div className="pointer-events-auto w-full max-w-sm">
            {!sent ? (
                <>
                    <h3 className="text-[9px] font-black font-orbitron tracking-widest text-gray-400 uppercase flex items-center justify-end gap-2 text-right mb-4">
                        Target_Identification <Terminal size={10} className="text-cyan-500" />
                    </h3>

                    <form onSubmit={handleReset} className="p-6 bg-black/40 border-r-2 border-cyan-500/50 backdrop-blur-xl space-y-4">
                        <div className="space-y-1">
                            <label className="text-[7px] font-mono text-cyan-600 uppercase">Neural_Address (Email)</label>
                            <Input 
                                type="email" 
                                placeholder="OPERATIVE@GUILD.COM" 
                                className="bg-black/40 border-white/10 text-[9px] h-10 font-mono text-white focus:border-cyan-500 uppercase"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-10 bg-cyan-700 hover:bg-cyan-500 text-white font-black italic tracking-widest text-[8px] uppercase"
                        >
                            {loading ? "Transmitting..." : "Send_Recovery_Link"}
                        </Button>
                    </form>
                </>
            ) : null}
        </div>
      </div>
    </main>
  );
}