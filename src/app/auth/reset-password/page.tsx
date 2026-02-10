"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image"; 
import { ShieldAlert, ArrowLeft, LockKeyhole, Radio, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HackerText } from "@/components/ui/hacker-text";
import { Background } from "@/components/ui/background";
import { SoundPrompter } from "@/components/ui/sound-prompter";
import { MagneticWrapper } from "@/components/ui/magnetic-wrapper";
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
        return toast.error("MISSING DATA // EMAIL REQUIRED");
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      play("success");
      setSent(true);
      toast.success("RECOVERY SIGNAL TRANSMITTED");
    } catch (error: any) {
      play("error");
      toast.error("TRANSMISSION FAILED // TRY AGAIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-red-900 selection:text-white">
      
      {/* --- ATMOSPHERE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/auth-bg.jpg" 
          alt="Recovery Background"
          fill
          priority
          className="object-cover opacity-30 grayscale contrast-150"
        />
        {/* Noise & Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1),transparent_80%)] animate-pulse" />
      </div>

      <SoundPrompter />
      <Background />

      {/* --- NAV --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] p-8 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
            <Link href="/auth/login" onClick={() => play("hover")} className="group">
              <div className="w-16 h-16 border-4 border-red-600/40 bg-black/60 backdrop-blur-md flex items-center justify-center group-hover:border-red-400 transition-all rounded-sm">
                <ArrowLeft size={40} className="text-red-500 group-hover:text-red-300" />
              </div>
            </Link>
        </div>
        
        <div className="flex items-center gap-4 px-8 py-4 bg-red-950/80 border-4 border-red-600/60 backdrop-blur-2xl rounded-full shadow-2xl shadow-red-600/60 animate-pulse">
            <AlertTriangle size={32} className="text-red-500" />
            <span className="text-xl font-black font-mono tracking-widest text-red-400 uppercase hidden md:inline">EMERGENCY_CHANNEL</span>
        </div>
      </nav>

      {/* --- MAIN INTERFACE --- */}
      <div className="relative z-50 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT: STATUS DISPLAY */}
        <div className="text-center lg:text-left space-y-8">
            <div className="inline-block relative group">
                <div className={cn(
                    "w-32 h-32 border-8 flex items-center justify-center transition-all duration-500 mb-4 rounded-3xl",
                    sent ? "border-green-500 bg-green-950/40 shadow-[0_0_60px_rgba(34,197,94,0.4)]" : "border-red-500 bg-red-950/40 shadow-[0_0_60px_rgba(220,38,38,0.4)]"
                )}>
                    {sent ? (
                       <CheckCircle2 size={64} className="text-green-500 animate-in zoom-in duration-500" />
                    ) : (
                       <LockKeyhole size={64} className="text-red-500 animate-pulse" />
                    )}
                </div>
            </div>

            <div>
                <HackerText 
                  text={sent ? "SIGNAL_LOCKED" : "LOST_ACCESS?"} 
                  className="text-6xl md:text-8xl font-black font-sans italic text-white leading-[0.9]"
                />
                <p className="text-xl font-mono text-neutral-400 tracking-[0.2em] uppercase mt-4 max-w-md">
                   {sent ? "Recovery link deployed. Check your secure inbox immediately." : "Initiate emergency protocol to reclaim your operative status."}
                </p>
            </div>
        </div>

        {/* RIGHT: INPUT TERMINAL */}
        <div className="w-full flex justify-center lg:justify-end">
            {!sent ? (
                <div className="w-full max-w-xl bg-black/80 border-4 border-white/10 backdrop-blur-xl p-10 md:p-14 shadow-2xl relative animate-in slide-in-from-right-10 fade-in duration-700">
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500" />

                    <div className="mb-10 flex items-center justify-between border-b-2 border-white/10 pb-6">
                      <h3 className="text-lg font-black font-mono tracking-widest text-red-500 uppercase flex items-center gap-3">
                          <Radio size={24} className="animate-pulse"/> Uplink_Ready
                      </h3>
                      <div className="w-24 h-2 bg-red-900/50 overflow-hidden">
                         <div className="h-full bg-red-500 w-1/2 animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>

                    <form onSubmit={handleReset} className="space-y-10">
                        <div className="space-y-4">
                            <label className="block text-sm font-mono text-neutral-500 uppercase tracking-widest pl-1">
                                Comms_Address
                            </label>
                            <Input 
                                type="email" 
                                placeholder="OPERATIVE@GUILD.COM" 
                                className="h-20 text-2xl md:text-3xl bg-black border-4 border-white/20 focus:border-red-500 font-mono text-white uppercase placeholder:text-neutral-700 transition-all rounded-none text-center"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        
                        <MagneticWrapper>
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-20 bg-white hover:bg-neutral-200 text-black font-black italic tracking-widest text-2xl uppercase border-4 border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-red-500/40 hover:border-red-500 hover:text-red-600 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin w-8 h-8" /> : "TRANSMIT_SIGNAL"}
                            </Button>
                        </MagneticWrapper>
                    </form>
                </div>
            ) : (
                <div className="w-full max-w-md p-10 bg-green-950/20 border-4 border-green-500/50 backdrop-blur-md animate-in zoom-in duration-500 text-center">
                    <p className="text-xl font-bold text-green-400 uppercase leading-relaxed tracking-widest mb-8">
                        Transmission Successful.<br/>Secure Channel Open.
                    </p>
                    <MagneticWrapper>
                        <Link href="/auth/login">
                            <Button className="w-full py-8 text-xl font-black bg-green-600 hover:bg-green-500 text-black uppercase tracking-widest shadow-lg shadow-green-600/20">
                                RETURN TO GATEWAY
                            </Button>
                        </Link>
                    </MagneticWrapper>
                </div>
            )}
        </div>

      </div>
    </main>
  );
}